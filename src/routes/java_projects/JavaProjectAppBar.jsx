import {useNavigate} from "react-router-dom";
import axios from "axios";
import {useState} from "react";
import {
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    Box, Button,
    CssBaseline,
    Divider, Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography, ButtonGroup
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import Link from '@mui/material/Link';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreateIcon from '@mui/icons-material/Create';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import ChatIcon from '@mui/icons-material/Chat';
import { Tree } from 'react-arborist';
import { FaFolder, FaFile } from 'react-icons/fa';

export function JavaProjectAppBar(props) {


    const username = props.username

    const navigate = useNavigate();
    const [value, setValue] = useState(0);

    // Структура (Structure)
    // Поиск (Search)
    // Настройки (Settings)
    const [drawerRegime, setDrawerRegime] = useState("Structure");

    // Editor
    // Console
    // Chat
    const [pageRegime, setPageRegime] = useState("Editor");


    const treeData  = [
        { id: "1", name: "Unread" , type:"folder"},
        { id: "2", name: "Threads", type:"folder" },
        {
            id: "3",
            name: "Chat Rooms",
            children: [
                { id: "c1", name: "General" },
                { id: "c2", name: "Random" },
                { id: "c3", name: "Open Source Projects" },
            ],
        },
        {
            id: "4",
            name: "Direct Messages",
            children: [
                { id: "d1", name: "Alice" },
                { id: "d2", name: "Bob" },
                { id: "d3", name: "Charlie" },
            ],
        },
    ];



    const drawerWidth = 300;


    const window = undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
        console.log("hello")
    };



    const console = (
        <Box  padding={2}  minWidth={"100vw"} minHeight={"100%"} >
            <Typography>Console</Typography>
        </Box>
    )

    const chat = (
        <Box  padding={2}  minWidth={"100vw"} minHeight={"100%"} >
            <Typography>Chat</Typography>
        </Box>
    )



    const drawer = (
        <Box padding={1} >
            <Typography sx={{ my: 2 }}>
                Название проекта
            </Typography>
            <Typography>К проектам</Typography>
            <Divider />


            <Divider/>





            <ButtonGroup   aria-label="Basic button group">
                <Button onClick={()=>{
                    setDrawerRegime("Structure");
                }}>Структ</Button>
                <Button onClick={()=>{
                    setDrawerRegime("Search");
                }}>Поиск</Button>
                <Button
                onClick={()=>{setDrawerRegime("Settings")}}
                >Настройки</Button>


            </ButtonGroup>

            <Divider />


            <Divider/>



            {drawerRegime === "Structure" &&
                <Tree initialData={treeData}
                      openByDefault={false}
                      width={300}
                      height={1000}
                      indent={24}
                      rowHeight={36}
                      overscanCount={1}
                      paddingTop={30}
                      paddingBottom={10}
                      padding={25 /* sets both */}
            >
                {({ node, style, dragHandle }) => (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            ...style,
                        }}
                        ref={dragHandle} onClick={() => node.toggle()}
                    >
            <span style={{ marginRight: "8px" }}>
              {node.isLeaf ? <FaFile /> : <FaFolder />}
            </span>
                        <span>{node.data.name}</span>
                    </div>
                )}
            </Tree> }




            {drawerRegime === "Search" && <Typography>Поиск</Typography>}
            {drawerRegime === "Settings" &&<Typography>Настройки</Typography>}









        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex',





        }}>
            <CssBaseline />
            <AppBar component="nav" sx={{
                backgroundColor: 'rgba(255, 0, 0, 0.5)', // полупрозрачный белый
                backdropFilter: 'blur(10px)', // размытие фона
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // мягкая тень
                border: '1px solid rgba(255, 255, 255, 0.2)', // тонкая граница
            }}>
                <Toolbar variant={"dense"} >
                    <IconButton

                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2}}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button sx={{ color: '#fff' }} onClick={()=>{
                        props.change()
                    }}>Change</Button>

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

                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <Box component="main" >
                <Toolbar variant={"dense"} />

                {pageRegime === "Editor" &&props.content}
                {pageRegime==="Console" && console}
                {pageRegime==="Chat" && chat}




                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                >
                    <BottomNavigationAction onClick={()=>{
                        setPageRegime("Editor");
                    }} label="Редактор" icon={<CreateIcon />} />


                    <BottomNavigationAction onClick={()=>{
                        setPageRegime("Console")
                    }} label="Консоль" icon={<DoubleArrowIcon />} />


                    <BottomNavigationAction onClick={()=>{
                        setPageRegime("Chat")
                    }} label="Чат" icon={<ChatIcon />} />
                </BottomNavigation>



            </Box>
        </Box>
    )
}