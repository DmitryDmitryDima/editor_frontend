import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {Client} from "@stomp/stompjs";
import {Box, Divider, Fab, Grid, Stack, Typography} from "@mui/material";
import ProjectCardComponent from "./ProjectCardComponent.jsx";
import ProjectCreationDialog from "./ProjectCreationDialog.jsx";
import {ProjectRemovalDialog} from "./ProjectRemovalDialog.jsx";
import AddIcon from "@mui/icons-material/Add";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";

export default function UserStrangerProjects(props) {

    // данные аутентификации

    const authUsername = props.authUsername;
    const uuid = props.uuid;

    const targetUsername = props.targetUsername;



    const [targetJavaProjects, setTargetJavaProjects] = useState([]);

    const [participantJavaProjects, setParticipantJavaProjects] = useState([]);

    // расшифровка сторонних uuid
    const [resolveMap, setResolveMap] = useState(new Map());

    const clientRef = useRef(null);

    const navigate = useNavigate();


    // api для общения с сервисами
    const api = axios.create({
        baseURL: '/api/',
    });

    // api для общения с auth
    const auth = axios.create({
        baseURL: '/auth/',
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








    }, []);

    const loadJavaProjects = async () => {
        try {
            const response = await api.get('/projects/java/getProjects?targetUsername='+targetUsername);

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

    const content = (
        <Grid item md={3}>
            <Stack direction="column" spacing={2}>
                <Divider/>
                <Typography>Авторские проекты {targetUsername}</Typography>
                <Divider/>
                {targetJavaProjects.map(project => (
                    <ProjectCardComponent view = "OWNER" language = "java"  privacyLevel={project.privacyLevel} name={project.name} id={project.id}
                                          status={project.status} author={targetUsername}></ProjectCardComponent>
                ))}
            </Stack>



            <Stack direction="column" spacing={2}>
                <Divider/>
                <Typography>Проекты с участием {targetUsername}</Typography>
                <Divider/>
                {participantJavaProjects.map(project => (

                    <ProjectCardComponent view = "PARTICIPANT" language = "java"  privacyLevel={project.privacyLevel} author = {resolveMap.get(project.author)}
                                          name={project.name} id={project.id} status={project.status}></ProjectCardComponent>
                ))}
            </Stack>








            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16, // Adjust as needed for desired spacing from bottom
                    right: 16, // Adjust as needed for desired spacing from right
                }}
            >

            </Box>



        </Grid>
    )

    return (
        <AppBarWithDrawer username={authUsername} content={content} />


    );
}