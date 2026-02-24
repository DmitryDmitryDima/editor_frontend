import {Bar} from "../../elements/Bar.jsx";
import React, {useCallback, useEffect, useRef, useState} from "react";
import Container from "@mui/material/Container";
import {Box, Divider, Fab, Grid, IconButton, Stack, styled, Typography} from "@mui/material";
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
    const {username, uuid, auth, api} = props;

    const [targetJavaProjects, setTargetJavaProjects] = useState([]);

    const [participantJavaProjects, setParticipantJavaProjects] = useState([]);

    // расшифровка сторонних uuid
    const [resolveMap, setResolveMap] = useState(new Map());

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
                client.subscribe("/users/activity/private/"+uuid, (message) => {

                    const update = JSON.parse(message.body);

                    if (update.type==="java_project_creation_from_template") {
                        creationEventProcessing(update);
                    }
                    if (update.type==="java_project_removal"){
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

            console.log(response)

            if (response.status === 200) {

                let data  = response.data;



                if (data.participantProjects.length > 0) {
                    let param = "";
                    data.participantProjects.forEach((project, index) => {
                        if (index === data.participantProjects.length - 1) {
                            param+=project.author
                        }
                        else {
                            param+=project.author+",";
                        }
                    })

                    const resolveResponse = await auth.get("/resolveBatch?uuids="+param);

                    for (let entry of resolveResponse.data) {
                        resolveMap.set(entry.uuid, entry.username)
                    }

                    console.log(resolveResponse)
                }


                setTargetJavaProjects(data.authorProjects);
                setParticipantJavaProjects(data.participantProjects)
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }


    const removalEventProcessing = useCallback((event)=>{
        let status = event.status;
        let eventData = JSON.parse(event.data);

        if (status==="ERROR"){

            if (event.context.correlationId===removalDialogCorrelationIdRef.current){
                removalDialogStateRef.current = "FAIL";
                setRemovalDialogState("FAIL");
            }
        }
        if (status==="SUCCESS"){
            console.log("here");

            if (event.context.correlationId===removalDialogCorrelationIdRef.current){
                removalDialogStateRef.current = "SUCCESS";
                setRemovalDialogState("SUCCESS");


            }

            loadJavaProjects()
        }


    }, [removalDialogCorrelationIdRef])

    const creationEventProcessing = useCallback((event) => {
        let eventData = JSON.parse(event.data);
        console.log(event)
        let status = event.status
        console.log(status);
        console.log(event.context.correlationId, "inside creation event");
        console.log(creationDialogCorrelationIdRef +" inside parent while comparison")

        // если диалог, породивший ивент, открыт, меняем его состояние
        // если закрыт - выбрасываем уведомление
        if (status==="ERROR"){
            if (event.context.correlationId===creationDialogCorrelationIdRef.current){
                setCreationDialogMessage(event.message)
                creationDialogStateRef.current = "FAIL";
                setCreationDialogState("FAIL");
            }
        }
        if (status==="SUCCESS"){
            if (event.context.correlationId===creationDialogCorrelationIdRef.current){
                creationDialogStateRef.current = "SUCCESS";
                setCreationDialogState("SUCCESS");


            }

            loadJavaProjects()
        }
    }, [creationDialogCorrelationIdRef]);








    // проект может быть иметь три формы -
    // owner (открытие, запуск, удаление, возможно последние действия в консоли),
    // participant (открытие, запуск, копия если open)
    // и reader (копия если open).
    const content = (
        <Grid item md={3}>
            <Stack direction="column" spacing={2}>
                <Divider/>
                <Typography>Авторские проекты {username}</Typography>
                <Divider/>
            {targetJavaProjects.map(project => (
                <ProjectCardComponent view = "OWNER" language = "java" openRemoveDialog = {()=>openProjectRemovalDialog(project.name,
                    project.id)} privacyLevel={project.privacyLevel} name={project.name} id={project.id} status={project.status} author={username}></ProjectCardComponent>
            ))}
            </Stack>



            <Stack direction="column" spacing={2}>
                <Divider/>
                <Typography>Проекты с участием {username}</Typography>
                <Divider/>
                {participantJavaProjects.map(project => (

                    <ProjectCardComponent view = "PARTICIPANT" language = "java" openRemoveDialog = {()=>openProjectRemovalDialog(project.name,

                        project.id)} privacyLevel={project.privacyLevel} author = {resolveMap.get(project.author)}  name={project.name} id={project.id} status={project.status}></ProjectCardComponent>
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