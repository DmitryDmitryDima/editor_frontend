import {
    Box,
    ListItem,
    ListItemButton,
    ListItemText,
    List,
    Typography,
    IconButton,
    Fab,
    Button,
    DialogTitle, DialogContent, DialogActions, Dialog, Snackbar, Grid
} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Bar} from "../../elements/Bar.jsx";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import Container from "@mui/material/Container";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddIcon from '@mui/icons-material/Add';
import {DeckCreationDialog, DeckRemovalDialog} from "./DecksPageComponents.jsx";
import DeleteIcon from '@mui/icons-material/Delete';
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";

export function Decks(){

    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const [uuid, setUUID] = useState(null)

    const [decks, setDecks] = useState([])

    const [chosenDeckId, setChosenDeckId] = useState(null)
    const[chosenDeckName, setChosenDeckName] = useState(null)

    // api для общения с карточным сервисом
    const api = axios.create({
        baseURL: '/api/cards/',
    });


    // диалоговое окно создания колоды
    const [deckCreationDialog, setDeckCreationDialog] = useState(false);

    // диалоговое окно удаления колоды
    const [deckRemovalDialog, setDeckRemovalDialog] = useState(false);



    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);




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
            console.log("fectching decks");
            if (response.status === 200) {
                console.log(response.data)
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


    // нажатие на кнопку повторения
    const handleRepetitionStart = async (deck_id)=>{
        console.log("Повторение", deck_id);
        navigate("/cards/repeat?deck_id="+deck_id)
    }

    // нажатие на кнопку удаления
    const handleDeckRemove = async (deck_id, deck_name)=>{
        setChosenDeckId(deck_id)
        setChosenDeckName(deck_name)
        handleDeckRemovalDialogOpen()
    }




    function handleFabClick() {
        navigate("/cards/addCard")
    }


    // открытие и закрытие диалога создания колоды
    const handleDeckCreationDialogOpen = () => {
        setDeckCreationDialog(true);
    }

    const handleDeckCreationDialogClose = (value) => {
        loadDecks()
        setDeckCreationDialog(false);
        openSnackBar(value)
    }

    // открытие и закрытие диалога удаления колоды
    const handleDeckRemovalDialogOpen = () => {
        setDeckRemovalDialog(true);
    }

    const handleDeckRemovalDialogClose = (value) => {
        loadDecks()
        setDeckRemovalDialog(false);
        openSnackBar(value)
    }

    // уведомления
    const snackBarHandleClose = ()=>{

        setSnackbarOpened(false);


    }

    // вызвать уведомление
    const openSnackBar = (message) => {
        setSnackbarmessage(message);
        setSnackbarOpened(true);
    };




    const content = (
        <Grid item md={3}>

            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    textAlign: { xs: 'center', md: 'left' },

                }}>
                Ваши колоды:
            </Typography>

            <List>
                {
                    decks.map(deck=>{
                        return (
                            <ListItem disablePadding>
                                <ListItemButton sx={{ display: 'flex', gap: 2 }}>

                                    <ListItemText primary= {deck.deck_name} sx={{ flex: '1 1 auto' }} />
                                    <ListItemText sx={{
                                        color: 'success.main',
                                        flex: '0 0 auto',
                                        marginRight: 2
                                    }}  primary={deck.to_study} />

                                    <ListItemText sx={{
                                        color: 'text.primary',
                                        flex: '0 0 auto',
                                        marginRight: 2
                                    }}  primary={deck.cards_amount} />

                                    <IconButton onClick={()=>handleRepetitionStart(deck.deck_id)}>
                                        <PlayArrowIcon/>
                                    </IconButton>
                                    <IconButton onClick={()=>handleDeckRemove(deck.deck_id, deck.deck_name)}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItemButton>
                            </ListItem>
                        )

                    })
                }
            </List>


            <Button onClick={handleDeckCreationDialogOpen} >Создать новую колоду</Button>



            <DeckCreationDialog
                open={deckCreationDialog}
                onClose={handleDeckCreationDialogClose}
                api={api}
            />

            <DeckRemovalDialog
                open={deckRemovalDialog}
                onClose={handleDeckRemovalDialogClose}
                api={api}
                deck_id={chosenDeckId}
                deck_name={chosenDeckName}
            />

            <Snackbar
                open={snackBarOpened}
                autoHideDuration={6000}
                onClose={snackBarHandleClose}
                message={snackbarmessage}

            />





            <Fab color="secondary" aria-label="add" sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
            }} onClick={handleFabClick}>
                <AddIcon />
            </Fab>


        </Grid>
    )


    return(

        <AppBarWithDrawer username={username} content={content} />

    );


}