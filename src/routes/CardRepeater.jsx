import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from 'react-router-dom';
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {Bar} from "../elements/Bar.jsx";
import {Box, Button, ButtonGroup, Typography} from "@mui/material";
import Container from "@mui/material/Container";



export function CardRepeater() {


    const [username, setUsername] = useState('');
    const [uuid, setUUID] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams(); // why undefined
    const navigate = useNavigate();
    const deck_id = searchParams.get("deck_id");
    console.log(deck_id)




    const [card, setCard] = React.useState({
        front_content:"loading...",
        back_content:"loading...",
        card_id:1
    })

    const [isFront, setIsFront] = useState(true)

    // ситуация. когда карточек для изучения нет
    const [isEmpty, setIsEmpty] = useState(false)

    // api для общения с карточным сервисом
    const api = axios.create({
        baseURL: '/api/tools/cards/',
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


    const fetchCard = async () => {
        let apiPath = deck_id===null?"/next":"/next/"+deck_id;

        const response = await api.get(apiPath)

        if (response.status!==200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }


        setIsFront(true)
        if (response.data.card_id===null) {
            setIsEmpty(true)

        }

        else{

            setCard(response.data);

        }










    }


    useEffect(() => {
        let token = localStorage.getItem("accessToken");
        if (token===null){
            navigate("/login");
        }
        const decoded = jwtDecode(token);
        console.log(decoded);

        setUsername(decoded.username);
        setUUID(decoded.sub)
        fetchCard()
    }, [])




    const sendCardToServer = async (rating)=>{


        let apiPath = "/repetition"

        const body = JSON.stringify({
            card_id:card.card_id,
            rating:rating
        });

        try {
            const response = await api.post(apiPath, body, {headers:{'Content-Type': 'application/json'}})
            if (!response.status ===200) {

            }
        }
        catch (error) {
            // уведомление
        }
        finally {
            // при любом сценарии пытаемся запросить новую карту
            await fetchCard()
        }









    }



    return (

        <Box sx={{ width: '100%'}}>
            <Bar username={username}  />
            <Container >

                {isEmpty?(
                    <Box>
                        <Typography>Карточек для изучения нет</Typography>
                    </Box>

                ):(
                    <Box>
                        <Typography sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            textAlign: { xs: 'center', md: 'left' }
                        }}>{isFront ? card.front_content : card.back_content}</Typography>
                        {isFront && <Button  onClick={() => setIsFront(!isFront)} variant="contained">Показать ответ</Button>}

                        {!isFront && <Typography >Как тяжело было вспомнить?</Typography>}

                        {!isFront &&
                            <ButtonGroup  variant="contained" size="small">
                                <Button onClick={()=>{sendCardToServer("Again");}}>Оч сложно</Button>
                                <Button onClick={()=>{sendCardToServer("Hard");}}>Сложно</Button>
                                <Button onClick={()=>{sendCardToServer("Good");}}>Норм</Button>
                                <Button onClick={()=>{sendCardToServer("Easy");}}>Изи</Button>


                            </ButtonGroup>
                        }







                    </Box>



                )}






        </Container>

         </Box>
    );



}