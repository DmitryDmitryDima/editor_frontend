import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import {
    Box,
    Button,
    ButtonGroup, Checkbox,
    ClickAwayListener, FormControlLabel, Grid,
    Grow,
    MenuList,
    Paper,
    Popper,
    TextField,
    Typography
} from "@mui/material";
import {Bar} from "../../elements/Bar.jsx";
import Container from "@mui/material/Container";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuItem from "@mui/material/MenuItem";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";

export function CardEditPage(){

    const [searchParams, setSearchParams] = useSearchParams();
    const card_id = searchParams.get("card_id");
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");


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
        identify()

        loadCard()






    }, [])


    // api для общения с карточным сервисом
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

    const identify = async () => {
        try {
            const identification = await api.get("/auth/identify")
            setUsername(identification.data.username)
            setUUID(identification.data.uuid)
        }
        catch (error) {
            navigate('/login');
        }
    }

    const loadCard = async () => {
        try {
            const response = await api.get("/api/cards/getCard?&card_id="+card_id);
            if (response.status === 200) {

                setCard(response.data)
                setFront(response.data.front_content)
                setBack(response.data.back_content)
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
        const apiPath = "/api/cards/editCard";


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
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        rows={5}
                    />

                    <TextField
                        required
                        margin="dense"
                        id="back_content"
                        name="back_content"
                        value={back}
                        onChange={(e) => {setBack(e.target.value)}}
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
        </Grid>
    )


    return (
        <AppBarWithDrawer username = {username} content = {content} />
    )
}