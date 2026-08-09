import {AppBarWithDrawer} from "../../../elements/AppBarWithDrawer.jsx";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import {v4 as uuid_gen, v4 as uuid} from "uuid";

export function JavaDashboard() {

    const [renderId, setRenderId] = React.useState(uuid());
    const [username, setUsername] = useState("")
    const[authUUID, setAuthUUID] = useState("")




    const [resultAvatars, setResultAvatars] = useState("result avatars")

    const [indexes, setIndexes] = useState("")

    const navigate = useNavigate();

    const api = axios.create({
        baseURL: '/',
    });

    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log(error)
            console.log("interceptor")

            // If the error status is 401 and there is no originalRequest._retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {

                    await axios.post('/auth/refresh');




                    // Retry the original request with the new token

                    return axios(originalRequest);
                } catch (error) {
                    navigate('/login');
                }
            }

            return Promise.reject(error);
        }
    );


    const click = async (event) => {
        let address = "/api/projects/java/dashboard/click"

        let body = JSON.stringify({
        })

        const correlationId = uuid();


        try {
            const response = await api.post(address,body,
                {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);

        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error, "ошибка!!!")


        }
    }




    const fetchIndexes = async () =>{

        try {


            const response
                = await api.get('/api/projects/java/dashboard/indexes');

            if (response.status === 200) {

                setIndexes(JSON.stringify(response.data));






            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }

    }

    const fetchAvatars = async () => {

        try {


            const response
                = await api.get('/api/projects/java/dashboard/avatars');

            if (response.status === 200) {

                setResultAvatars(JSON.stringify(response.data));






            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }

    const fetchAll = async ()=>{


        await fetchAvatars()
        await fetchIndexes();
    }


    const identify = async () => {
        try {
            const identification = await api.get("/auth/identify")
            setUsername(identification.data.username)
            setAuthUUID(identification.data.uuid)
        }
        catch (error) {
            navigate('/login');
        }
    }

    useEffect(()=>{

        identify()




        const id = setInterval(fetchAll, 100)

        return () => {clearInterval(id)}



    }, [])

    const content = (

        <Box>
            <Typography component="h1" variant="h5">Java service dashboard</Typography>

            <Typography component="p" variant="body2">{resultAvatars}</Typography>

            <Typography component="p" variant="body2">{indexes}</Typography>


            <Button onClick={click}>
                Test!
            </Button>


        </Box>
    )


    return (
        <AppBarWithDrawer username = {username} content={content}/>
    )
}