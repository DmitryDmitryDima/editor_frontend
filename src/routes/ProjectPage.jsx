import {useParams} from "react-router-dom";
import React, {useEffect, useMemo, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';
import {Button, ButtonGroup, IconButton, Snackbar} from "@mui/material";

import {DirectoryCreationDialog} from "./ProjectPageComponents.jsx";



function ProjectPage(){


    const {user_name} = useParams();
    const {project_name} = useParams();

    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true);



    // для дерева
    const [focusItem, setFocusItem] = useState(null);

    // диалоговое окно создания директории
    const [directoryCreationDialog, setDirectoryCreationDialog] = useState(false);




    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);



    // хуки диалогового окна создания директории
    const handleDirectoryCreationDialogOpen=()=>{
        setDirectoryCreationDialog(true);
    }


    const handleDirectoryCreationDialogClose = (value) => {
        fetchData();
        setDirectoryCreationDialog(false);
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


    const apiPath = "/api/users/"+user_name+"/projects/"+project_name;

    const fetchData = async () => {
        try {
            const response = await fetch(apiPath);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();

            console.log("fetching");


            jsonData.flatTree["root"] = {
                index: 'root',
                isFolder: true,
                children: ['basic_root'],
                data: 'Root item',
            }



            setData(jsonData);
            // for correct
            setFocusItem(jsonData.flatTree.basic_root)
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










    const dataProvider = new StaticTreeDataProvider(data.flatTree,
        (item, newName) =>
        ({ ...item, data: newName }));









    return(
        <div>

            <p>{project_name} Project</p>

            <ButtonGroup size="small">
                <Button onClick={handleDirectoryCreationDialogOpen} disabled={!focusItem.isFolder}>Create</Button>
                <Button>Delete</Button>
            </ButtonGroup>





            <UncontrolledTreeEnvironment
                dataProvider={dataProvider}
                getItemTitle={item => item.data}
                canDragAndDrop={true}
                canDropOnFolder={true}
                viewState={{}}
                onFocusItem={handleFocus}
                onSelectItems={handleSelection}

            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>


            <div>
                <DirectoryCreationDialog
                    open={directoryCreationDialog}
                    onClose = {handleDirectoryCreationDialogClose}
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