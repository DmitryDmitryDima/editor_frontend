import {Link, useParams} from "react-router-dom";
import React, { useState, useEffect } from 'react';
import {CreateButton, CreationDialog, DeleteButton, RenameButton, SimpleDialogDelete} from "./UserPageComponents.jsx";
import {Button, Snackbar, Typography} from "@mui/material";

function UserPage(){

    const {user_name} = useParams();

    // data - то, что предзагружаем из сервера
    const [data, setData] = useState(null)

    const [error, setError] = useState(null)

    const [loading, setLoading] = useState(true);

    // диалоговое окно удаления
    const [openDialogDelete, setOpenDialogDelete] = useState(false);
    const [selectedValueDelete, setSelectedValueDelete] = useState(-1);

    // диалоговое окно создания проекта
    const [creationDialog, setCreationDialog] = useState(false);

    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);


    const apiPath = "/api/users/"+user_name;
    const fetchData = async () => {
        try {
            const response = await fetch(apiPath);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();
            setData(jsonData);
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


    console.log(data);



    //диалоговые окна
    //--------удаление
    const handleClickOpenDelete = () => {
        setOpenDialogDelete(true);
    };

    // функция, срабатывающая, когда закрывается диалоговое окно - значение возвращается из компонента
    const handleCloseDelete = (value) => {
        // обновляем список
        fetchData()
        setOpenDialogDelete(false);
        openSnackBar(value)
        setSelectedValueDelete(-1);
    };






    // ------- создание проекта
    const handleCreationDialogClose = (value) => {
        fetchData()
        setCreationDialog(false);
        openSnackBar(value)

    }

    const handleCreationDialogOpen=()=>{
        setCreationDialog(true);
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






    return <div>
        <h1>User {user_name}</h1>


        {

            data.projects.map(project => {



                return (

                    <div key={project.id} >
                        <div style={{
                            border:"1px solid black"
                        }}>
                        <Link to={"/"+user_name+"/"+project.name} style={{color: 'black',
                            textDecoration: 'underline',
                            fontSize: '18px'
                        }}>{project.name}</Link>

                        <DeleteButton onClick={() => {
                                setSelectedValueDelete(project.id);
                                handleClickOpenDelete();

                        }
                        } />
                        <RenameButton onClick={()=>console.log("редактирование")}/>
                        </div>




                    </div>



                )
            })
        }

        <div style={{marginTop:"10px"}}>

            <CreateButton onClick={handleCreationDialogOpen}/>
        </div>


        <div>
            <Typography variant="subtitle1" component="div">
                Selected: {selectedValueDelete}
            </Typography>
            <br />
            <SimpleDialogDelete
                selectedValue={selectedValueDelete}
                open={openDialogDelete}
                onClose={handleCloseDelete}
            />
        </div>

        <div>
            <CreationDialog
                open={creationDialog}
                onClose = {handleCreationDialogClose}
            />
        </div>

        <Snackbar
            open={snackBarOpened}
            autoHideDuration={6000}
            onClose={snackBarHandleClose}
            message={snackbarmessage}

        />


    </div>

}

export default UserPage;