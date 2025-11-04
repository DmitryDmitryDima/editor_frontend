import {Box, ListItem, ListItemButton, ListItemText, List, Typography, IconButton, Fab} from "@mui/material";
import {useEffect, useState} from "react";
import {Bar} from "../elements/Bar.jsx";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Container from "@mui/material/Container";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';

export function Decks(){

    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const [uuid, setUUID] = useState(null)

    const [decks, setDecks] = useState([])

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




    useEffect(() => {
        let token = localStorage.getItem("accessToken");
        if (token===null){
            navigate("/login");
        }
        const decoded = jwtDecode(token);
        console.log(decoded);

        setUsername(decoded.username);
        setUUID(decoded.sub)

        // запрашиваем колоды, принадлежащие юзеру
        loadDecks()


    }, []);


    const loadDecks = async () => {
        try {
            const response = await api.get('/getDecks');
            if (response.status === 200) {
                setDecks(response.data);
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);
            navigate('/login');
        }
    }

    const handleRepetitionStart = async (deck_id)=>{
        console.log(deck_id);
    }


    function handleFabClick() {
        navigate("/cards/addCard")
    }

    return(

        <Box sx={{ width: '100%'}}>

            <Bar username={username}  />

            <Container >

                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        textAlign: { xs: 'center', md: 'left' }
                    }}>
                    Ваши колоды:
                </Typography>

                <List>
                    {
                        decks.map(deck=>{
                            return (
                                <ListItem disablePadding>
                                    <ListItemButton>

                                        <ListItemText primary= {deck.deck_name} />
                                        <IconButton onClick={()=>handleRepetitionStart(deck.deck_id)}>
                                            <PlayArrowIcon/>
                                        </IconButton>
                                    </ListItemButton>
                                </ListItem>
                            )

                        })
                    }
                </List>

                <Fab color="secondary" aria-label="add" sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                }} onClick={handleFabClick}>
                    <AddIcon />
                </Fab>

            </Container>

            </Box>

    );


}