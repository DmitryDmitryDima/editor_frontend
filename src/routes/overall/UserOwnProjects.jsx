import {Bar} from "../../elements/Bar.jsx";
import React, {useCallback, useEffect, useRef, useState} from "react";
import Container from "@mui/material/Container";
import {Box, Fab, Grid, IconButton, Stack, styled, Typography} from "@mui/material";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";
import { Client } from '@stomp/stompjs';
import {useLocation, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import ProjectCardComponent from "./ProjectCardComponent.jsx";
import ProjectCreationDialog from "./ProjectCreationDialog.jsx";
import AddIcon from "@mui/icons-material/Add";
import {ProjectRemovalDialog} from "./ProjectRemovalDialog.jsx";

export function UserOwnProjects(props) {
    // auth context - для собственной страницы не нужно дополнительно сравнивать username
    const {username, uuid} = props;

    const [javaProjects, setJavaProjects] = useState([]);

    const clientRef = useRef(null);

    const navigate = useNavigate();


    /*

    ----! Параметры диалога создания проекта !----

     */
    // PREPARING, WAITING, SUCCESS, FAIL
    const [creationDialogState, setCreationDialogState] = useState("PREPARING");
    const [creationDialogMessage, setCreationDialogMessage] = useState("");
    const creationDialogStateRef = useRef("PREPARING");
    const creationDialogCorrelationIdRef = useRef(null);

    const [projectCreationDialogOpen, setProjectCreationDialogOpen] = useState(false);
    const[creationDialogCorrelationId, setCreationDialogCorrelationId] = useState("");

    const closeProjectCreationDialog=()=> {
        setProjectCreationDialogOpen(false);


        console.log("creation dialog closed");
    };

    const openProjectCreationDialog = ()=> {setProjectCreationDialogOpen(true);
        console.log("open dialog open");
    };


    /*

    ----! Параметры диалога удаления проекта !----

     */

    // PREPARING, WAITING, SUCCESS, FAIL
    const [removalDialogState, setRemovalDialogState] = useState("PREPARING");
    const [removalDialogProjectName, setRemovalDialogProjectName] = useState("");
    const [removalDialogProjectId, setRemovalDialogProjectId] = useState(null);
    const removalDialogStateRef = useRef("PREPARING");
    const removalDialogCorrelationIdRef = useRef(null);

    const [projectRemovalDialogOpen, setProjectRemovalDialogOpen] = useState(false);
    const[removalDialogCorrelationId, setRemovalDialogCorrelationId] = useState("");

    const closeProjectRemovalDialog=()=> {
        setProjectRemovalDialogOpen(false);


        console.log("removal dialog closed");
    };

    const openProjectRemovalDialog = (project_name, project_id)=> {
        setRemovalDialogProjectName(project_name);
        setRemovalDialogProjectId(project_id);
        setProjectRemovalDialogOpen(true);
        console.log("removal dialog open for", project_id);
    };







    // api для общения с сервисами
    const api = axios.create({
        baseURL: '/api/',
    });

    // управление токенами
    // Add a request interceptor
    api.interceptors.request.use(
        async (config) => {

            const token = localStorage.getItem('accessToken');

            const decoded = jwtDecode(token);
            const exp = decoded.exp;
            const now = Math.floor(Date.now() / 1000)
            if (token && exp>now) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            else {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                    config.headers.Authorization = `Bearer ${response.data.accessToken}`;

                } catch (error) {
                    throw new Error('invalid refresh');
                }
            }
            return config;
        },
        (error) => {

            Promise.reject(error)
        }
    );

    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log(error)

            // If the error status is 401 and there is no originalRequest._retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return axios(originalRequest);
                } catch (error) {
                    navigate('/login');
                }
            }

            return Promise.reject(error);
        }
    );







    useEffect(() => {

        loadJavaProjects();

        if (!clientRef.current) {
            const client = new Client({
                brokerURL: '/ws/notifications',

                debug: function (str) {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = function (frame) {
                // Do something; all subscriptions must be done in this callback.
                // This is needed because it runs after a (re)connect.
                client.subscribe("/users/activity/"+uuid, (message) => {

                    const update = JSON.parse(message.body);

                    if (update.event_type==="java_project_creation") {
                        creationEventProcessing(update);
                    }
                    if (update.event_type==="java_project_removal"){
                        removalEventProcessing(update)
                    }
                    console.log(update);

                });
            };

            client.onStompError = function (frame) {
                // Invoked when the broker reports an error.
                // Bad login/passcode typically causes an error.
                // Compliant brokers set the `message` header with a brief message; the body may contain details.
                // Compliant brokers terminate the connection after any error.
                console.log('Broker reported error: ' + frame.headers['message']);
                console.log('Additional details: ' + frame.body);
            };

            client.activate();
            clientRef.current = client;
        }

        return () => {
            if (clientRef.current) {


                clientRef.current.deactivate().then(() => {
                    console.log('disconnected');
                });
                clientRef.current = null;

            }

        }




    }, []);


    const loadJavaProjects = async () => {
        try {
            const response = await api.get('/projects/java/getProjects?targetUsername='+username);

            if (response.status === 200) {

                setJavaProjects(response.data);
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }


    const removalEventProcessing = useCallback((data)=>{
        let status = data.eventData.status;

        if (status==="FAIL"){

            if (data.context.correlationId===removalDialogCorrelationIdRef.current){
                removalDialogStateRef.current = "FAIL";
                setRemovalDialogState("FAIL");
            }
        }
        if (status==="SUCCESS"){
            console.log("here");

            if (data.context.correlationId===removalDialogCorrelationIdRef.current){
                removalDialogStateRef.current = "SUCCESS";
                setRemovalDialogState("SUCCESS");


            }

            loadJavaProjects()
        }


    }, [removalDialogCorrelationIdRef])

    const creationEventProcessing = useCallback((data) => {
        let status = data.eventData.status;
        console.log(status);
        console.log(data.context.correlationId, "inside creation event");
        console.log(creationDialogCorrelationIdRef +" inside parent while comparison")

        // если диалог, породивший ивент, открыт, меняем его состояние
        // если закрыт - выбрасываем уведомление
        if (status==="FAIL"){
            if (data.context.correlationId===creationDialogCorrelationIdRef.current){
                setCreationDialogMessage(data.message)
                creationDialogStateRef.current = "FAIL";
                setCreationDialogState("FAIL");
            }
        }
        if (status==="SUCCESS"){
            if (data.context.correlationId===creationDialogCorrelationIdRef.current){
                creationDialogStateRef.current = "SUCCESS";
                setCreationDialogState("SUCCESS");


            }

            loadJavaProjects()
        }
    }, [creationDialogCorrelationIdRef]);









    const content = (
        <Grid item md={3}>
            <Stack direction="column" spacing={2}>
            {javaProjects.map(project => (
                <ProjectCardComponent language = "java" openRemoveDialog = {()=>openProjectRemovalDialog(project.name,
                    project.id)}  name={project.name} id={project.id} status={project.status}></ProjectCardComponent>
            ))}
            </Stack>

            <ProjectCreationDialog api = {api} opened={projectCreationDialogOpen} close={closeProjectCreationDialog}

                                   state={creationDialogState}

                                   changeCorrelationId={(value)=>{
                                       creationDialogCorrelationIdRef.current = value;
                                       setCreationDialogCorrelationId(value)
                                   }}

                                   changeDialogState={(value)=>{
                                       creationDialogStateRef.current = value;
                                       setCreationDialogState(value)

                                   }}
                                   message = {creationDialogMessage}
                                   setMessage={setCreationDialogMessage}

            >

            </ProjectCreationDialog>

            <ProjectRemovalDialog api={api} opened={projectRemovalDialogOpen} close={closeProjectRemovalDialog}
                                  state={removalDialogState}
                                  changeCorrelationId={(value)=>{
                                      removalDialogCorrelationIdRef.current = value;
                                      setRemovalDialogCorrelationId(value)
                                  }}

                                  changeDialogState={(value)=>{
                                      removalDialogStateRef.current = value;
                                      setRemovalDialogState(value)

                                  }}

                                  projectId={removalDialogProjectId}
                                  projectName={removalDialogProjectName}

                                  >

            </ProjectRemovalDialog>


            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16, // Adjust as needed for desired spacing from bottom
                    right: 16, // Adjust as needed for desired spacing from right
                }}
            >
                <Fab onClick={openProjectCreationDialog} color="secondary" aria-label="add">
                    <AddIcon />
                </Fab>
            </Box>



        </Grid>
    )

    return (
        <AppBarWithDrawer username={username} content={content} />


    );
}