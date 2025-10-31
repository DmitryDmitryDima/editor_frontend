import {useEffect, useState} from "react";
import { jwtDecode } from "jwt-decode";

export function TestSecuredPage(){


    const [username, setUsername] = useState(null)
    const [uuid, setUUID] = useState(null)




    useEffect(() => {
        let token = localStorage.getItem("accessToken");
        const decoded = jwtDecode(token);

        setUsername(decoded.username);
        setUUID(decoded.sub)




    }, []);


    return (
        <div>
            Авторизован как {username} с id {uuid}
        </div>
    )
}