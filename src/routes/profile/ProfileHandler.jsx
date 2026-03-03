import {useNavigate, useParams} from 'react-router-dom'
import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import {UserOwnProfile} from "./UserOwnProfile.jsx";
import axios from "axios";

export function ProfileHandler() {

    // определяем, чью страницу смотрят
    const {username} = useParams()
    const [authUsername, setAuthUsername] = useState("")
    const [uuid, setUuid] = useState("")

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

        identify()


    }, [])

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
            {username===authUsername && <UserOwnProfile username={authUsername} uuid={uuid}  api={api} />}
            {authUsername==="" && <p>Hello guest</p>}
            {username!==authUsername && <p>You see another user page</p>}
        </div>
    )

}