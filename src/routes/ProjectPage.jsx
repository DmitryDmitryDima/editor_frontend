import {useParams} from "react-router-dom";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import {Button, ButtonGroup, IconButton, Snackbar} from "@mui/material";

import {DirectoryCreationDialog, DirectoryRemovalDialog} from "./ProjectPageComponents.jsx";



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

    // диалоговое окно удаления директории
    const [directoryRemovalDialog, setDirectoryRemovalDialog] = useState(false);




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




    // хуки диалогового окна удаления директории
    const handleDirectoryRemovalDialogOpen = ()=>{
        setDirectoryRemovalDialog(true);
    }
    const handleDirectoryRemovalDialogClose = (value)=>{
        fetchData()
        setDirectoryRemovalDialog(false);
        openSnackBar(value)
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
        //console.log(focusItem);
        //console.log("focus");
        setFocusItem(focusItem)
    }

    const handleSelection = (selectedItems)=>{

    }




















    return(
        <div>

            <p>{project_name} Project</p>

            <ButtonGroup size="small">
                <Button onClick={handleDirectoryCreationDialogOpen} disabled={!focusItem.isFolder}>Create</Button>
                <Button onClick={handleDirectoryRemovalDialogOpen} disabled={focusItem.index === "basic_root"}>Delete</Button>
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
                <DirectoryRemovalDialog
                    open={directoryRemovalDialog}
                    onClose = {handleDirectoryRemovalDialogClose}
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