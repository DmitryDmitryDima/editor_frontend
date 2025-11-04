import {useNavigate} from "react-router-dom";
import {useState} from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AppBar from "@mui/material/AppBar";


export function Bar(props){

    const pages = ["Проекты", "Карточки"];
    const settings = ['Профиль', 'Выйти'];

    const username = props.username;
    const navigate = useNavigate();


    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        console.log(event);
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (choice) => {
        if (choice==="Карточки"){
            navigate("/cards/decks")
        }
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

    // logout
    const logout = async ()=>{

        try {
            let refreshToken = localStorage.getItem('refreshToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem("refreshToken");

            console.log("make logout")


            await axios.post("/auth/revoke", {refreshToken})
        }
        catch (error) {
            console.log(error);
        }
        finally {
            navigate('/login');
        }




    }


    return (
        <AppBar >
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
                                <MenuItem key={page} onClick={()=>handleCloseNavMenu(page)}>
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
                                onClick={()=>handleCloseNavMenu(page)}
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
    );





}