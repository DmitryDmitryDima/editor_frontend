import {Bar} from "../../elements/Bar.jsx";
import React, {useEffect, useRef} from "react";
import Container from "@mui/material/Container";
import {Grid, Typography} from "@mui/material";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";
import { Client } from '@stomp/stompjs';
import {useLocation} from "react-router-dom";

export function UserOwnProjects(props) {
    // auth context - для собственной страницы не нужно дополнительно сравнивать username
    const {username, uuid} = props;


    const location = useLocation();

    const client = new Client({
        brokerURL: 'ws://localhost:8080/notifications',

        debug: function (str) {
            console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
        // Do something; all subscriptions must be done in this callback.
        // This is needed because it runs after a (re)connect.
        client.subscribe("/users/activity/"+uuid, (message) => {

            const update = JSON.parse(message.body);
            console.log(update);

        });
    };

    client.onStompError = function (frame) {
        // Invoked when the broker reports an error.
        // Bad login/passcode typically causes an error.
        // Compliant brokers set the `message` header with a brief message; the body may contain details.
        // Compliant brokers terminate the connection after any error.
        console.log('Broker reported error: ' + frame.headers['message']);
        console.log('Additional details: ' + frame.body);
    };

    client.activate();







    const content = (
        <Grid item md={3}>
            <Typography>project for {uuid}</Typography>
        </Grid>
    )

    return (
        <AppBarWithDrawer username={username} content={content} />


    );
}