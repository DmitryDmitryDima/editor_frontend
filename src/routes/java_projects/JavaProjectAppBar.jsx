import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useState} from "react";
import {
    Box, Button,
    CssBaseline,
    Divider, Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import Link from '@mui/material/Link';

export function JavaProjectAppBar(props) {


    const username = props.username
    const content = props.content
    const navigate = useNavigate();

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

    const drawerWidth = 240;
    const navItems = ['Профиль', 'Проекты', 'Колоды', "Сообщения", "Хранилище"];

    const window = undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleDrawerChoice = (chosen)=>{
        if (chosen==="Профиль"){
            navigate("/users/"+username);
        }
        if (chosen==="Проекты"){
            navigate("/users/"+ username+"/projects")
        }
        if (chosen==="Колоды"){
            navigate("/cards/decks")
        }
        if (chosen==="Сообщения"){

        }
        if (chosen==="Хранилище"){
            navigate("/storage")
        }


    }

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Экосистема
            </Typography>
            <Divider />
            <Typography>{username}</Typography>
            <Link onClick={logout}>Выйти</Link>


            <Divider/>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item} disablePadding>
                        <ListItemButton onClick={()=>handleDrawerChoice(item)} sx={{ textAlign: 'center' }}>
                            <ListItemText primary={item} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav" sx={{
                backgroundColor: 'rgba(0, 0, 255, 0.5)', // полупрозрачный белый
                backdropFilter: 'blur(10px)', // размытие фона
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // мягкая тень
                border: '1px solid rgba(255, 255, 255, 0.2)', // тонкая граница
            }}>
                <Toolbar variant={"dense"} >
                    <IconButton

                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        Экосистема
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {navItems.map((item) => (
                            <Button key={item} sx={{ color: '#fff' }}>
                                {item}
                            </Button>
                        ))}


                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <Box component="main" sx={{ p: 1 }}>
                <Toolbar />
                {content}
            </Box>
        </Box>
    )
}