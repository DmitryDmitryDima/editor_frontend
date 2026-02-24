import React, {useCallback, useEffect, useRef, useState} from "react";
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
    const {auth, api, authUsername, uuid, targetUsername, targetUUID} = props;









    const [targetJavaProjects, setTargetJavaProjects] = useState([]);

    const [participantJavaProjects, setParticipantJavaProjects] = useState([]);

    // расшифровка сторонних uuid
    const [resolveMap, setResolveMap] = useState(new Map());

    const clientRef = useRef(null);








    useEffect(  () => {

        loadJavaProjects()


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








                // подписка на личную приватку

                client.subscribe("/users/activity/private/"+uuid, (message) => {

                    const update = JSON.parse(message.body);

                    if (update.type==="java_project_creation_from_template") {
                        //creationEventProcessing(update);
                    }
                    if (update.type==="java_project_removal"){
                        //removalEventProcessing(update)
                    }
                    console.log(update);

                });

                // подписка на публичный канал target пользователя
                client.subscribe("/users/activity/public/"+targetUUID, (message) => {

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

    const removalEventProcessing = useCallback((event)=>{
        let status = event.status;



        if (status==="SUCCESS"){


            loadJavaProjects()
        }


    }, [])

    const creationEventProcessing = useCallback((event) => {
        let eventData = JSON.parse(event.data);
        console.log(event)
        let status = event.status

        if (status==="SUCCESS"){


            loadJavaProjects()
        }
    }, []);



    const loadJavaProjects =  async () => {
        try {
            const response =  await api.get('/projects/java/getProjects?targetUsername='+targetUsername);

            console.log(response)

            if (response.status === 200) {

                let data  = response.data;




                data.authorProjects.forEach((project) => {
                    if (project.participants.includes(props.uuid)){
                        project.viewStatus ="PARTICIPANT"
                    }
                    else {
                        project.viewStatus ="READER"
                    }
                })

                if (data.participantProjects.length > 0) {
                    let param = "";
                    data.participantProjects.forEach((project, index) => {

                        if (project.participants.includes(props.uuid)){
                            project.viewStatus ="PARTICIPANT"
                        }
                        else {
                            project.viewStatus ="READER"
                        }

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

                    <ProjectCardComponent view = {project.viewStatus} language = "java"
                                                                                       privacyLevel={project.privacyLevel} name={project.name} id={project.id}
                                          status={project.status} author={targetUsername}></ProjectCardComponent>



                ))}
            </Stack>



            <Stack direction="column" spacing={2}>
                <Divider/>
                <Typography>Проекты с участием {targetUsername} </Typography>

                <Divider/>
                {participantJavaProjects.map(project => (

                    <ProjectCardComponent view = {project.viewStatus} language = "java"  privacyLevel={project.privacyLevel} author = {resolveMap.get(project.author)}
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