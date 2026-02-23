import {jwtDecode} from "jwt-decode";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {UserOwnProfile} from "../profile/UserOwnProfile.jsx";
import {UserOwnProjects} from "./UserOwnProjects.jsx";
import UserStrangerProjects from "./UserStrangerProjects.jsx";

// эта часть может быть запривачена для некоторых лиц
export function ProjectHandler() {
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
            {username===authUsername&&  <UserOwnProjects username={authUsername} uuid={uuid} />}
            {authUsername==="" && <p>Гость смотрит чьи то проекты</p>}
            {username!==authUsername && <UserStrangerProjects authUsername={authUsername} uuid={uuid} targetUsername={username} />}
        </div>
    )

}