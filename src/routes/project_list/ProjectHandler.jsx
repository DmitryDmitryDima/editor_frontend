import {jwtDecode} from "jwt-decode";
import {useEffect, useRef, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {UserOwnProfile} from "../profile/UserOwnProfile.jsx";
import {UserOwnProjects} from "./UserOwnProjects.jsx";
import UserStrangerProjects from "./UserStrangerProjects.jsx";
import axios from "axios";

// эта часть может быть запривачена для некоторых лиц
export function ProjectHandler() {
    // определяем, чью страницу смотрят
    const {username} = useParams()
    const [authUsername, setAuthUsername] = useState("")
    const [uuid, setUuid] = useState(null)

    const [targetUUID, setTargetUUID] = useState(null)

    const navigate = useNavigate();


    // api для общения с сервисами
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



    useEffect(()=>{
        globalPreparation()



    }, [])

    const globalPreparation = async () => {
        await identify()
        console.log("global")


        const resolveResponse = await api.get("/auth/resolveUsername/"+username);
        setTargetUUID(resolveResponse.data)






        }


    const identify = async () => {
        try {
            const identification = await api.get("/auth/identify")
            setAuthUsername(identification.data.username)
            setUuid(identification.data.uuid)
        }
        catch (error) {
            navigate('/login');
        }
    }




    return (
        <div>
            {username===authUsername&&  <UserOwnProjects username={authUsername} uuid={uuid}
                                                         api={api} />}
            {authUsername==="" && <p>Гость смотрит чьи то проекты</p>}
            {username!==authUsername && uuid && authUsername && targetUUID && <UserStrangerProjects

                api={api}
                authUsername={authUsername}
                uuid={uuid}
                targetUsername={username} targetUUID={targetUUID} />}
        </div>
    )

}