import {Bar} from "../../elements/Bar.jsx";
import React from "react";
import Container from "@mui/material/Container";
import {Typography} from "@mui/material";

export function UserOwnProjects(props) {
    // auth context - для собственной страницы не нужно дополнительно сравнивать username
    const {username, uuid} = props;

    return (
        <Container sx={{ width: '100%',
            display:"flex",
            justifyContent:"center",
            alignItems:"center",


        }}>

            <Bar username={username}  />

            <Typography variant="h5" component="div">list of projects for {uuid}</Typography>

        </Container>


    );
}