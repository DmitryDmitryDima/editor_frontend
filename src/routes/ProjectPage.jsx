import {useParams} from "react-router-dom";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import {Button, ButtonGroup, IconButton, Snackbar} from "@mui/material";
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';
import PostAddIcon from '@mui/icons-material/PostAdd';
import DeleteIcon from '@mui/icons-material/Delete';

import {
    DirectoryCreationDialog,
    DirectoryRemovalDialog,
    FileCreationDialog,
    FileRemovalDialog
} from "./ProjectPageComponents.jsx";



function ProjectPage(){


    const {user_name} = useParams();
    const {project_name} = useParams();

    const [data, setData] = useState({ flatTree: {} })


    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);

    const [view, setView] = useState({});

    const environment = useRef();
    const tree = useRef();











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

        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchData();
    }, []);






    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }





    // хуки для дерева

    const handleFocus = (focusItem)=>{
        console.log(focusItem);
        //console.log("focus");
        setFocusItem(focusItem)
    }

    const handleSelection = (selectedItems)=>{

    }




















    return(
        <div>

            <p>{project_name} Project</p>

            <ButtonGroup size="small">
                <IconButton onClick={handleDirectoryCreationDialogOpen} disabled={!focusItem.isFolder} size="large">
                    <CreateNewFolderIcon/>
                </IconButton>

                <IconButton onClick={handleFileCreationDialogOpen} disabled={!focusItem.isFolder} size="large">
                    <PostAddIcon/>
                </IconButton>



                <IconButton onClick={handleRemovalClick} disabled={focusItem.index === "basic_root"} size="large" >

                    <DeleteIcon/>
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