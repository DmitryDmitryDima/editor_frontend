import {useNavigate, useParams, useLocation, Link} from "react-router-dom";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import {Button, ButtonGroup, IconButton, Snackbar} from "@mui/material";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import { Client } from '@stomp/stompjs';

import {
    DirectoryCreationDialog,
    DirectoryRemovalDialog,
    FileCreationDialog,
    FileRemovalDialog
} from "./ProjectPageComponents.jsx";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";



function ProjectPage(){


    const {user_name} = useParams();
    const {project_name} = useParams();

    const [data, setData] = useState({ flatTree: {} })


    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const [view, setView] = useState({});

    const [editorLink, setEditorLink] = useState(null);

    // объекты дерева
    const environment = useRef();
    const tree = useRef();
    // вебсокет клиент
    const stompClientRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();















    // для дерева
    const [focusItem, setFocusItem] = useState(null);



    // диалоговое окно создания директории
    const [directoryCreationDialog, setDirectoryCreationDialog] = useState(false);

    // диалоговое окно создания файла
    const [fileCreationDialog, setFileCreationDialog] = useState(false);

    // диалоговое окно удаления директории
    const [directoryRemovalDialog, setDirectoryRemovalDialog] = useState(false);

    // диалоговое окно удаления файла
    const [fileRemovalDialog, setFileRemovalDialog] = useState(false);



    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);






    // хуки работы с данными
    const items = useMemo(() => ({ ...data.flatTree }), [data.flatTree]);
    const dataProvider = useMemo(
        () =>
            new StaticTreeDataProvider(items, (item, data) => ({
                ...item,
                data,
            })),
        [items]
    );




    // хуки диалогового окна создания директории
    const handleDirectoryCreationDialogOpen=()=>{
        setDirectoryCreationDialog(true);
    }


    const handleDirectoryCreationDialogClose =  (value) => {

        fetchData()
        setDirectoryCreationDialog(false);
        openSnackBar(value)


    }

    // хуки диалогового окна создания файла
    const handleFileCreationDialogOpen = () => {
        setFileCreationDialog(true);
    }

    const handleFileCreationDialogClose = (value) => {
        fetchData()
        setFileCreationDialog(false);
        openSnackBar(value)
    }




    // хуки диалогового окна удаления директории
    const handleDirectoryRemovalDialogOpen = ()=>{
        setDirectoryRemovalDialog(true);
    }
    const handleDirectoryRemovalDialogClose = (value)=>{
        fetchData()
        setDirectoryRemovalDialog(false);
        openSnackBar(value)
    }

    // хуки диалогового окна удаления файла

    const handleFileRemovalDialogOpen = ()=>{
        setFileRemovalDialog(true);
    }

    const handleFileRemovalDialogClose = (value)=>{
        fetchData()
        setFileRemovalDialog(false);
        openSnackBar(value)
    }

    // хук клика по кнопке удаления - всплывают два окна
    const handleRemovalClick=()=>{
        if (focusItem.index.startsWith("file")){
            handleFileRemovalDialogOpen();
        }
        else {
            handleDirectoryRemovalDialogOpen();
        }
    }

    // хук перехода к редактору файла
    const handleFileOpenClick=()=>{
        navigate(editorLink)
    }




    // уведомления
    const snackBarHandleClose = ()=>{
        console.log("close snackbar");
        setSnackbarOpened(false);


    }

    const openSnackBar = (message) => {
        setSnackbarmessage(message);
        setSnackbarOpened(true);
    };


    // построение дерева - пересборка в случае изменения
    const treeBuild = ()=>{

        setTimeout(()=>{
            if (tree.current) {
                let expanded = view["tree-1"].expandedItems


                tree.current.expandSubsequently(expanded)

                console.log(view);



            }
        }, 100)



    }


    // функция запроса информации с сервера - в данной версии это происходит после каждого из изменений


    const apiPath = "/api/users/"+user_name+"/projects/"+project_name;



    const fetchData = async () => {


        // если речь идет об удалении. мы должны отредактировать view
        if (environment.current) {
            setView(environment.current.viewState);
        }



        try {
            const response = await fetch(apiPath);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();




            jsonData.flatTree["root"] = {
                index: 'root',
                isFolder: true,
                children: ['basic_root'],
                data: 'Root item',
            }



            setData(jsonData);


            // for correct
            setFocusItem(jsonData.flatTree.basic_root)



            console.log("data fetched and changed");
            console.log(jsonData);

            initWebSocketConnection(jsonData.id) // в случае успеха

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // инициализация вебсокета
    const initWebSocketConnection = (id) => {
        // Если соединение уже существует - не создаем новое
        // используем null check
        if (stompClientRef.current) return;

        const client = new Client({
            brokerURL: '/ws/project',
            onWebSocketClose: ()=>{
                console.log('WebSocket closed');
            },
            onConnect: () => {
                console.log('WebSocket connected, process subscribe');
                // подписка на общий канал проекта


                client.subscribe('/projects/'+id, (message) => {
                    const update = JSON.parse(message.body);
                    // Обработка входящих сообщений
                    handleWebSocketEvent(update)

                });
            },
            onStompError: (frame) => {
                console.error('WebSocket error:', frame.headers.message);
            },
            reconnectDelay: 5000,
        });

        stompClientRef.current = client;
        client.activate();
    };



    useEffect(() => {

        fetchData();



        return ()=>{
            if (stompClientRef.current) {
                console.log('disconnected');

                stompClientRef.current.deactivate();


            }
        }




    }, [location.pathname]);


    // ивенты вебсокета
    const handleWebSocketEvent = useCallback((evt) => {
        console.log(evt)
        if (evt.type === 'FILE_SAVE') {

            console.log(evt.event_id);






        }
    }, []);









    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }








    // хуки для дерева
    // тут мы конструируем путь до файла, чтобы не заниматься этим на бэке
    //todo данный алгоритм можно оптимизировать, контруируя map ребенок-родитель при запросе дерева с сервера

    const handleFocus = (focusItem)=>{
        console.log(focusItem);
        //console.log("focus");
        setFocusItem(focusItem)

        setEditorLink(null); // сброс ссылки



        if (focusItem.index.startsWith("file")){
            // редактор доступен только для файла
            let basic_way = "/"+user_name+"/projects/";
            let constructed_way = [];


            // ищем родительскую директорию
            let parent = null;



            for (const key in data.flatTree){

                let directory = data.flatTree[key];

                for (const child of directory.children){
                    //console.log(child);
                    if (child===focusItem.index){
                        parent = directory;
                        break;
                    }
                }

            }

            constructed_way.unshift(parent.data);



            let depth = 0;
            while (parent.index!=="basic_root"){
                if (depth===50) {

                    throw new Error("something wrong with tree structure")
                }
                for (const key in data.flatTree){

                    let directory = data.flatTree[key];
                    let found = false;

                    for (const child of directory.children){

                        if (child===parent.index){
                            parent = directory;
                            constructed_way.unshift(parent.data);
                            found = true;

                            break;
                        }
                    }

                    if (found){
                        break;
                    }


                }
                depth++;
            }



            for (const part of constructed_way){
                basic_way+=part+"/"
            }

            basic_way+=focusItem.data;



            if (focusItem.data.endsWith(".java")){
                basic_way+="?editor=java";
            }

            else {
                basic_way+="?editor=default";
            }




            setEditorLink(basic_way)

        }

    }










    const handleSelection = (selectedItems)=>{

    }

    const stopProject = async () => {
        try {
            //setOutput(prev => prev + " compiling code...");

            const response = await fetch("/api/tools/execution/java/stop", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    projectId: data.id,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Пытаемся получить сообщение из разных возможных мест
                const errorMessage =
                    result.message ||
                    result.error ||
                    result.details ||
                    response.statusText ||
                    `HTTP error ${response.status}`;

                throw new Error(errorMessage);
            }


        }
        catch (err) {
            console.log("Full error:", err);

        }
    }

    const runProject = async () => {
        try {
            //setOutput(prev => prev + " compiling code...");

            const response = await fetch("/api/tools/execution/java/run", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    projectId: data.id,
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Пытаемся получить сообщение из разных возможных мест
                const errorMessage =
                    result.message ||
                    result.error ||
                    result.details ||
                    response.statusText ||
                    `HTTP error ${response.status}`;

                throw new Error(errorMessage);
            }


        }
        catch (err) {
            console.log("Full error:", err);

        }
    }




















    return(
        <div>

            <Link to={`/${user_name}`} style={{color: 'black',
                textDecoration: 'none',
                fontSize: '18px'}}>back to {user_name} page </Link>

            <p>{project_name} Project</p>

            <ButtonGroup size="small">
                <IconButton onClick={handleDirectoryCreationDialogOpen} disabled={!focusItem.isFolder} size="large">
                    <CreateNewFolderIcon/>
                </IconButton>

                <IconButton onClick={handleFileCreationDialogOpen} disabled={!focusItem.isFolder} size="large">
                    <PostAddIcon/>
                </IconButton>



                <IconButton onClick={handleRemovalClick} disabled={focusItem.immutable===true} size="large" >

                    <DeleteIcon/>
                </IconButton>

                <IconButton onClick={handleFileOpenClick} disabled={focusItem.isFolder} size="large" >

                    <FileOpenIcon/>
                </IconButton>

                <IconButton onClick={runProject}>
                    <PlayArrowIcon/>
                </IconButton>

                <IconButton onClick={stopProject}>
                    <StopIcon/>
                </IconButton>






            </ButtonGroup>





            <UncontrolledTreeEnvironment

                key={JSON.stringify(data.flatTree)}
                ref={environment}
                dataProvider={dataProvider}
                getItemTitle={item => item.data}
                canDragAndDrop={true}
                canDropOnFolder={true}
                viewState={{}}
                onFocusItem={handleFocus}
                onSelectItems={handleSelection}
                canReorderItems
                onRegisterTree={treeBuild}




            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" ref={tree} />
            </UncontrolledTreeEnvironment>


            <div>
                <DirectoryCreationDialog
                    open={directoryCreationDialog}
                    onClose = {handleDirectoryCreationDialogClose}
                    parentData = {focusItem}
                />
            </div>


            <div>
                <FileCreationDialog
                    open={fileCreationDialog}
                    onClose = {handleFileCreationDialogClose}
                    parentData = {focusItem}
                />
            </div>
            <div>
                <DirectoryRemovalDialog
                    open={directoryRemovalDialog}
                    onClose = {handleDirectoryRemovalDialogClose}
                    parentData = {focusItem}

                />
            </div>

            <div>
                <FileRemovalDialog
                    open={fileRemovalDialog}
                    onClose = {handleFileRemovalDialogClose}
                    parentData = {focusItem}
                    />

            </div>


            <Snackbar
                open={snackBarOpened}
                autoHideDuration={6000}
                onClose={snackBarHandleClose}
                message={snackbarmessage}

            />







        </div>
    )
}

export default ProjectPage;