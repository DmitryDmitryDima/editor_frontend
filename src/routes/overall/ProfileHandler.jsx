import { useParams } from 'react-router-dom'
import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {UserOwnProfile} from "./UserOwnProfile.jsx";

export function ProfileHandler() {

    // определяем, чью страницу смотрят
    const {username} = useParams()
    const [authUsername, setAuthUsername] = useState("")
    const [uuid, setUuid] = useState("")

    useEffect(()=>{
        let token = localStorage.getItem("accessToken");
        if (token!==null){
            const decoded = jwtDecode(token);
            console.log(decoded);
            console.log(authUsername);

            setAuthUsername(decoded.username);
            setUuid(decoded.sub)

        }



    }, [])

    return (
        <div>
            {username===authUsername && <UserOwnProfile username={authUsername} uuid={uuid} />}
            {authUsername==="" && <p>Hello guest</p>}
            {authUsername!==username && <p>You see another user page</p>}
        </div>
    )

}