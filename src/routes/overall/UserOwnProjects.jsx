import {Bar} from "../../elements/Bar.jsx";
import React from "react";
import Container from "@mui/material/Container";
import {Grid, Typography} from "@mui/material";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";

export function UserOwnProjects(props) {
    // auth context - для собственной страницы не нужно дополнительно сравнивать username
    const {username, uuid} = props;

    const content = (
        <Grid item md={3}>
            <Typography>project for {uuid}</Typography>
        </Grid>
    )

    return (
        <AppBarWithDrawer username={username} content={content} />


    );
}