import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

export function  ProjectInvitePage(){

    const {project_type} = useParams();
    const {invite_token} = useParams();

    const [validationStatus, setValidationStatus] = useState("Валидируем токен...")

    const navigate = useNavigate();
    // api для общения с сервисами
    const api = axios.create({
        baseURL: '/api/',
    });
    // api для общения с сервисами
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

    const validationRequest = async ()=>{
        let address = "/projects/java/validateInviteToken/"+invite_token
        console.log(address)
        try {
            const response = await api.post(address, null, {headers: {'Content-Type': 'application/json'}});
            console.log(response);
            if (response.status === 200) {

                navigate("/workplace/projects/java/"+response.data.projectId)

            }
            else {
                setValidationStatus("Ошибка валидации")

            }
        }
        catch (error) {

            setValidationStatus("ошибка валидации")

        }
    }

    useEffect(() => {

        validationRequest();


    }, [])





    return (
        <p>{validationStatus}</p>
    )
}