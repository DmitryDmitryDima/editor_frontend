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

    const validationRequest = async ()=>{
        let address = "/api/projects/java/validateInviteToken/"+invite_token
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