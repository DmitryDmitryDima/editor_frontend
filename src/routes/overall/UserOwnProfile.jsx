import {useState} from "react";


export function UserOwnProfile(props){

    const {username, uuid} = props;

    return (
        <p>Hello {username} it's your page</p>
    )
}