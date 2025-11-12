import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {
    Box,
    Button,
    ButtonGroup, Checkbox,
    ClickAwayListener, FormControlLabel,
    Grow,
    MenuList,
    Paper,
    Popper,
    TextField,
    Typography
} from "@mui/material";
import {Bar} from "../elements/Bar.jsx";
import Container from "@mui/material/Container";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuItem from "@mui/material/MenuItem";

export function CardEditPage(){

    const [searchParams, setSearchParams] = useSearchParams();
    const card_id = searchParams.get("card_id");


    const formRef = useRef();
    const [username, setUsername] = useState("")
    const[uuid, setUUID] = useState("")

    const [card, setCard] = React.useState({
        front_content:"loading...",
        back_content:"loading...",
        deck_id:-1

    })

    const navigate = useNavigate();

















    useEffect(()=>{
        let token = localStorage.getItem("accessToken");
        if (token===null){
            navigate("/login");
        }
        const decoded = jwtDecode(token);
        console.log(decoded);

        setUsername(decoded.username);
        setUUID(decoded.sub)

        loadCard()






    }, [])


    // api для общения с карточным сервисом
    const api = axios.create({
        baseURL: '/api/tools/cards/',
    });

    // управление токенами
    // Add a request interceptor
    api.interceptors.request.use(
        async (config) => {

            console.log("request interception");

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

    const loadCard = async () => {
        try {
            const response = await api.get("/getCard?&card_id="+card_id);
            if (response.status === 200) {

                setCard(response.data)
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);
            navigate('/login');
        }
    }




    const handleSubmit = event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const apiPath = "/editCard";


        const body = JSON.stringify({
            front_content:formJson.front_content,
            back_content:formJson.back_content,
            card_id:card_id
        })

        console.log(body)

        const editing = async () => {
            try {
                const response = await api.post(apiPath, body, {

                    headers: {'Content-Type': 'application/json'}});


                if (!response.status === 200) {
                    // уведомление
                }




            } catch (err) {


            } finally {
                navigate("/cards/repeat?deck_id="+card.deck_id)

            }
        };

        editing();







        formRef.current.reset();


    }


    return (
        <Box sx={{ width: '100%', minHeight: '100vh' }}>
            <Bar username={username} />

            <Container maxWidth="sm" sx={{
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <Paper elevation={3} sx={{
                    p: 4,
                    width: '100%',
                    elevation: 0,
                    boxShadow: 'none',
                    border: 'none',
                    backgroundColor: 'transparent'
                }}>

                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            textAlign: 'center',
                            mb: 3
                        }}
                    >
                        Редактировать карточку
                    </Typography>


                    <Box component="form"
                         ref={formRef}
                         onSubmit={handleSubmit}
                         sx={{
                             width: '100%',
                             display: 'flex',
                             flexDirection: 'column',
                             alignItems: 'center',
                             gap: 3
                         }}
                    >






                        {/* Поля формы */}
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="front_content"
                            name="front_content"
                            label="Вопрос"
                            fullWidth
                            variant="standard"
                            multiline
                            value={card.front_content}
                            rows={5}
                        />

                        <TextField
                            required
                            margin="dense"
                            id="back_content"
                            name="back_content"
                            value={card.back_content}
                            label="Ответ"
                            fullWidth
                            variant="standard"
                            multiline
                            rows={5}
                        />



                        {/* Кнопка отправки */}
                        <Button
                            type="submit"
                            variant="contained"
                            size="medium"
                            sx={{
                                mt: 2,
                                px: 4,
                                py: 1.5
                            }}
                        >
                            Внести изменения
                        </Button>

                        <Button
                            onClick={()=>{
                                navigate("/cards/repeat?deck_id="+card.deck_id)
                            }}
                            variant="contained"
                            size="medium"
                            sx={{
                                mt: 2,
                                px: 4,
                                py: 1.5
                            }}
                        >
                            К повторению
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}