import React, {useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";
import Container from "@mui/material/Container";
import {Bar} from "../../elements/Bar.jsx";
import {Avatar, Grid, Typography} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Card from "@mui/material/Card";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";



// https://codesandbox.io/p/sandbox/profile-page-ooh16?file=%2Fsrc%2Fcomponents%2FProfileCard.tsx%3A7%2C1-8%2C43
export function UserOwnProfile(props){

    // auth context - для собственной страницы не нужно дополнительно сравнивать username
    const {username, uuid} = props;

    const [userProperties, setUserProperties] = useState({about:"", avatarLink:""});

    // цифры
    const [decks, setDecks] = useState([]);

    const styles = {
        details: {
            padding: "1rem",
            borderTop: "1px solid #e1e1e1"
        },
        value: {
            padding: "1rem 2rem",
            borderTop: "1px solid #e1e1e1",
            color: "#899499"
        }
    };



    const navigate = useNavigate();





    useEffect(() => {
        // api calls async
        loadUser()
        loadDecks()





    }, [])

    const loadUser = async () => {
        try {
            const response = await props.api.get('/api/users/getUserByUsername?targetUsername='+username);

            if (response.status === 200) {

                setUserProperties(response.data);
            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }


    const loadDecks = async () => {
        try {
            const response = await props.api.get('/api/cards/getDecks');
            console.log("fectching decks");
            if (response.status === 200) {

                setDecks(response.data);

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
            <Card variant="outlined" sx={{ mx: 'auto' }}>
                <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    {/* CARD HEADER START */}
                    <Grid item sx={{ p: "1.5rem 0rem", textAlign: "center" }}>
                        {/* PROFILE PHOTO */}
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                                <PhotoCameraIcon
                                    sx={{
                                        border: "5px solid white",
                                        backgroundColor: "#ff558f",
                                        borderRadius: "50%",
                                        padding: ".2rem",
                                        width: 35,
                                        height: 35
                                    }}
                                ></PhotoCameraIcon>
                            }
                        >
                            <Avatar
                                sx={{ width: 100, height: 100, mb: 1.5 }}

                            ></Avatar>
                        </Badge>

                        {/* DESCRIPTION */}
                        <Typography variant="h6">{username}</Typography>
                        <Typography color="text.secondary">Some words...{userProperties.about}</Typography>
                    </Grid>
                    {/* CARD HEADER END */}

                    {/* DETAILS */}
                    <Grid container>
                        <Grid item xs={6}>
                            <Typography style={styles.details}>Сообщения</Typography>
                            <Typography onClick={()=>{
                                navigate("/cards/decks")
                            }} style={styles.details}>Колоды</Typography>
                            <Typography onClick={()=>{
                                navigate("/users/"+username+"/projects")
                            }} style={styles.details}>Проекты</Typography>
                            <Typography style={styles.details}>Хранилище</Typography>
                        </Grid>
                        {/* VALUES */}
                        <Grid item xs={6} sx={{ textAlign: "end" }}>
                            <Typography style={styles.value}>0</Typography>
                            <Typography style={styles.value}>{decks.length}</Typography>
                            <Typography style={styles.value}>0</Typography>
                            <Typography style={styles.value}>0</Typography>
                        </Grid>
                    </Grid>

                    {/* BUTTON */}
                    <Grid item style={styles.details} sx={{ width: "100%" }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ width: "99%", p: 1, my: 2 }}
                        >
                            Редактировать профиль
                        </Button>

                    </Grid>
                </Grid>
            </Card>

        </Grid>

    )









    return (
        <AppBarWithDrawer username={username} content = {content} />

    )
}