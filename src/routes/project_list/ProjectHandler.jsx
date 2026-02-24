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
        baseURL: '/api/',
    });

    // api для общения с auth
    const auth = axios.create({
        baseURL: '/auth/',
    });

    // управление токенами
    // Add a request interceptor
    api.interceptors.request.use(
        async (config) => {

            const token = localStorage.getItem('accessToken');

            const decoded = jwtDecode(token);
            const exp = decoded.exp;
            const now = Math.floor(Date.now() / 1000)
            if (token && exp>now) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            else {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                    config.headers.Authorization = `Bearer ${response.data.accessToken}`;

                } catch (error) {
                    throw new Error('invalid refresh');
                }
            }
            return config;
        },
        (error) => {

            Promise.reject(error)
        }
    );

    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log(error)

            // If the error status is 401 and there is no originalRequest._retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
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
        let token = localStorage.getItem("accessToken");
        if (token!==null){
            const decoded = jwtDecode(token);
            console.log(decoded);
            console.log(authUsername);

            setAuthUsername(decoded.username);
            console.log(decoded.sub, "suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuub")
            setUuid(decoded.sub)

            const resolveResponse = await auth.get("/resolveUsername/"+username);
            setTargetUUID(resolveResponse.data)






        }
    }




    return (
        <div>
            {username===authUsername&&  <UserOwnProjects username={authUsername} uuid={uuid} auth={auth}
                                                         api={api} />}
            {authUsername==="" && <p>Гость смотрит чьи то проекты</p>}
            {username!==authUsername && uuid && authUsername && targetUUID && <UserStrangerProjects
                auth={auth}
                api={api}
                authUsername={authUsername}
                uuid={uuid}
                targetUsername={username} targetUUID={targetUUID} />}
        </div>
    )

}