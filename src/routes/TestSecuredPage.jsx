import {useEffect, useState} from "react";
import { jwtDecode } from "jwt-decode";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Grid, Paper} from "@mui/material";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {Bar} from "../elements/Bar.jsx";

export function TestSecuredPage(){


    const [username, setUsername] = useState(null)
    const [uuid, setUUID] = useState(null)

    const [apiContent, setApiContent] = useState(null)
    const navigate = useNavigate();








    useEffect(() => {
        let token = localStorage.getItem("accessToken");
        if (token===null){
            navigate("/login");
        }
        const decoded = jwtDecode(token);
        console.log(decoded);

        setUsername(decoded.username);
        setUUID(decoded.sub)

        accessAPI()



    }, []);

    const api = axios.create({
        baseURL: '/api/',
    });



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


    // доступ к secured api
    const accessAPI = async ()=>{
        try {
            const response = await api.get('/test/secured');
            setApiContent(response.data);
        } catch (error) {
            console.log(error);
            navigate('/login');
        }
    }











    return (
        <Box sx={{ flexGrow: 1 }}>
            <Bar username={username}  />

            {/* Основной контент */}
            <Container sx={{ py: 3 }}>
                <Box sx={{
                    p: 3,
                    backgroundColor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 1
                }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            textAlign: { xs: 'center', md: 'left' }
                        }}
                    >


                        Тестовый прототип


                    </Typography>

                    <Grid container spacing={3}>
                        <Grid size={{xs:12, md:12}} >
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Secured API info:
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Fetched:</strong> {apiContent || 'Loading...'}
                                </Typography>

                            </Paper>
                        </Grid>



                        <Grid  size={{xs:12, md:12}} >
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Действия
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Button variant="contained" color="primary" onClick={accessAPI}>
                                        Обновить информацию с api
                                    </Button>
                                    <Button variant="outlined" color="secondary">
                                        Settings
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>


                    </Grid>
                </Box>
            </Container>
        </Box>



    )
}