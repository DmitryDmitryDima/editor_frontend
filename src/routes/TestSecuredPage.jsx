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

export function TestSecuredPage(){


    const [username, setUsername] = useState(null)
    const [uuid, setUUID] = useState(null)

    const [apiContent, setApiContent] = useState(null)
    const navigate = useNavigate();

    const pages = ["Проекты", "Карточки"];
    const settings = ['Профиль', 'Выйти'];



    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        console.log(event);
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleUserMenuChoice=async (settingObj)=>{

        if (settingObj.setting==="Выйти"){

            logout()
        }
    }






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

    // logout
    const logout = async ()=>{
        let refreshToken = localStorage.getItem('refreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem("refreshToken");

        console.log("make logout")


        await axios.post("/auth/revoke", {refreshToken})

        navigate('/login');
    }









    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {/* Логотип/Название - слева на десктопе, центр на мобиле */}
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="#"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            Экосистема
                        </Typography>

                        {/* Мобильное меню */}
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {pages.map((page) => (
                                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                                        <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        {/* Логотип для мобильной версии */}
                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href="#"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                                justifyContent: 'center',
                            }}
                        >
                            Экосистема
                        </Typography>

                        {/* Десктопное меню */}
                        <Box sx={{
                            flexGrow: 1,
                            display: { xs: 'none', md: 'flex' },
                            justifyContent: { md: 'center', lg: 'flex-start' },
                            ml: { lg: 2 }
                        }}>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        mx: 1,
                                        fontSize: { md: '0.9rem', lg: '1rem' }
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>

                        {/* Профиль пользователя */}
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <Button
                                    onClick={handleOpenUserMenu}
                                    sx={{
                                        p: 1,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        minWidth: 'auto',
                                        textTransform: 'none',
                                        fontSize: { xs: '0.9rem', md: '1rem' }
                                    }}
                                >
                                    <AccountCircleIcon sx={{
                                        fontSize: { xs: 24, md: 32 }
                                    }} />
                                    <Box sx={{
                                        display: { xs: 'none', sm: 'block' },
                                        maxWidth: { xs: '80px', md: '120px' },
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>

                                    </Box>
                                </Button>
                            </Tooltip>
                            <Menu
                                sx={{
                                    mt: '45px',
                                    '& .MuiPaper-root': {
                                        minWidth: '140px'
                                    }
                                }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <Typography align={"center"}>{username}</Typography>
                                {settings.map((setting) => (
                                    <MenuItem
                                        key={setting}
                                        onClick={handleCloseUserMenu}
                                        sx={{
                                            py: 1,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <Typography onClick={()=>{handleUserMenuChoice({setting})}} sx={{ textAlign: 'center' }}>
                                            {setting}
                                        </Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* Основной контент */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
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
                        <Grid size={{xs:12, md:6}} >
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Secured API info:
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Fetched:</strong> {apiContent || 'Loading...'}
                                </Typography>

                            </Paper>
                        </Grid>



                        <Grid  size={{xs:12, md:6}} >
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