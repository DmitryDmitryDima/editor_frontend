import {
    Box,
    Button,
    ButtonGroup,
    Checkbox, CircularProgress,
    ClickAwayListener,
    FormControlLabel, Grid, Grow, IconButton, MenuList, Paper, Popper, Snackbar, Stack,
    TextField,
    Typography
} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {Bar} from "../../elements/Bar.jsx";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import Container from "@mui/material/Container";
import axios from "axios";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";

export function CardAddPage(){

    const formRef = useRef();
    const [username, setUsername] = useState("")
    const[uuid, setUUID] = useState("")
    const [decks, setDecks] = useState([])
    const [reverseCard, setReverseCard] = useState(false)
    const [back, setBack] = useState("");
    const [front, setFront] = useState("");
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);


    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);



    const handleClick = () => {
        console.info(`You clicked ${decks[selectedIndex].deck_name}`);
    };

    const handleMenuItemClick = (event, index) => {
        console.log(decks[selectedIndex]);
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };


    useEffect(()=>{
        let token = localStorage.getItem("accessToken");
        if (token===null){
            navigate("/login");
        }
        const decoded = jwtDecode(token);
        console.log(decoded);

        setUsername(decoded.username);
        setUUID(decoded.sub)

        // загружаем колоды для списка
        loadDecks()


    }, [])


    // api для общения с карточным сервисом
    const api = axios.create({
        baseURL: '/api',
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

    const loadDecks = async () => {
        try {
            const response = await api.get('/cards/getDecks');
            if (response.status === 200) {
                setDecks(response.data);
                console.log(response.data)
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);
            navigate('/login');
        }
    }

    const handleCheckBoxChange = (event) => {
        setReverseCard(!reverseCard)
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


    const handleSubmit = event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const apiPath = "/cards/addCard";


        const body = JSON.stringify({
            front_content:formJson.front_content,
            back_content:formJson.back_content,
            with_reversed:reverseCard, // todo bug
            deck_id:decks[selectedIndex].deck_id

        })

        console.log(body)

        const creating = async () => {
            try {
                const response = await api.post(apiPath, body, {

                    headers: {'Content-Type': 'application/json'}});


                if (!response.status === 200) {
                    // уведомление
                    openSnackBar("Ошибка! Карточка не добавлена")
                }
                else {
                    openSnackBar("Карточка добавлена")
                    setFront("")
                    setBack("")
                }




            } catch (err) {


            } finally {


            }
        };

        creating();







        formRef.current.reset();


    }


    const generateAnswer = async ()=>{
        try {

            if (front === ""){
                openSnackBar("Введите вопрос")
            }
            else {
                let body = JSON.stringify({
                    question:front
                })

                setLoading(true);

                const response = await api.post("/ai/cards/autocomplete", body, {

                    headers: {'Content-Type': 'application/json'}});


                if (!response.status === 200) {
                    // уведомление
                    openSnackBar("AI сервис недоступен, попробуйте позже")
                }
                else {
                    setBack(response.data.answer)
                }
            }






        } catch (err) {


        } finally {

            setLoading(false);
        }
    }

    const content = (
        <Grid item md={3}>
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
                    Создать карточку
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

                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Typography variant="h6" sx={{ minWidth: 80 }}>
                            Колода
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                            <ButtonGroup
                                variant="contained"
                                ref={anchorRef}
                                aria-label="Button group with a nested menu"
                                sx={{ width: '100%', maxWidth: 300 }}
                            >
                                <Button
                                    onClick={handleClick}
                                    sx={{ flexGrow: 1 }}
                                >
                                    {decks[selectedIndex] === undefined ? "Загрузка..." : decks[selectedIndex].deck_name}
                                </Button>
                                <Button
                                    size="small"
                                    aria-controls={open ? 'split-button-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-label="select merge strategy"
                                    aria-haspopup="menu"
                                    onClick={handleToggle}
                                >
                                    <ArrowDropDownIcon />
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box>


                    <Popper
                        sx={{ zIndex: 1 }}
                        open={open}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {decks.map((deck, index) => (
                                                <MenuItem
                                                    key={deck.deck_name}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                >
                                                    {deck.deck_name}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>


                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="front_content"
                        name="front_content"
                        label="Вопрос"
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        fullWidth
                        variant="standard"
                        multiline
                        rows={5}
                    />

                    <Stack direction="row" spacing={1} sx={{alignItems: 'left'}}>
                        <IconButton onClick={generateAnswer} >
                            <PlayArrowIcon/>
                            ai
                        </IconButton>

                        {loading && <CircularProgress color="secondary"/>}
                    </Stack>





                    <TextField
                        required
                        margin="dense"
                        id="back_content"
                        name="back_content"
                        label="Ответ"
                        value={back}
                        fullWidth
                        variant="standard"
                        onChange={(e) => setBack(e.target.value)}
                        multiline
                        rows={5}
                    />


                    <FormControlLabel
                        control={<Checkbox onChange={handleCheckBoxChange} />}
                        label="Создать обратную карточку"
                        name="with_reversed"
                        sx={{ alignSelf: 'flex-start' }}
                    />


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
                        Создать карточку!
                    </Button>

                    <Snackbar
                        open={snackBarOpened}
                        autoHideDuration={2000}
                        onClose={snackBarHandleClose}
                        message={snackbarmessage}

                    />
                </Box>
            </Paper>
        </Grid>
    )
    return (
        <AppBarWithDrawer username = {username} content={content}/>
    )
}