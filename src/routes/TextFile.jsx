import {useNavigate, useParams} from "react-router-dom";
import {Button, ButtonGroup, Snackbar} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import { createEditor, Transforms, Node } from 'slate'





export function TextFile() {

    // параметры, необходимые для начального fetch
    const {
        user_name,
        project_name,
        "*":splat

    } = useParams();

    // фронтенд время - обновляется из сервера при успешном сохранении, вебсокет ивентах, чтении файла
    // предназначено для того, чтобы случайно не сохранить старое состояние редактора (в ситуации, когда редактирование происходит параллельно)
    // если отправленное фронтенд время старше, чем последнее изменение в файле, сохранение не происходит
    const[frontendTime, setfrontendTime] = useState(null);


    // данные, полученные от сервера при первоначальном запросе
    const [data, setData] = useState({
        content:"файл не загружен",
        file_id:null,
        project_id:null
    });


    // snackbar options
    // состояния snackbar
    const [snackbarmessage, setSnackbarmessage] = useState(null);
    const [snackBarOpened, setSnackbarOpened] = useState(false);






    // slate editor integration
    const initialValue = [
        {
            type: 'paragraph',
            children: [{ text: 'Файл не загружен' }],
        },
    ]

    const [editor] = useState(() => withReact(createEditor()))



    // уведомления
    const snackBarHandleClose = ()=>{
        console.log("close snackbar");
        setSnackbarOpened(false);
    }

    const openSnackBar = (message) => {
        setSnackbarmessage(message);
        setSnackbarOpened(true);
    };












    // путь к проекту
    const projectLink = "/"+user_name+"/projects/"+project_name;
    // навигация
    const navigate = useNavigate();



    // запрос содержимого файла
    const fetchFileData=async ()=>{

        try {
            const api = "/api/tools/editor/readAndCache"
            const body = JSON.stringify({
                projectname:project_name,
                username:user_name,
                fullPath:splat

            })

            const response = await fetch(api, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();
            setfrontendTime(jsonData.updatedAt);
            console.log(jsonData);

            setData(jsonData);


            // Правильное обновление содержимого через API Slate
            Transforms.delete(editor, { at: [0] }); // Очищаем текущее содержимое
            Transforms.insertNodes(
                editor,
                {
                    type: 'paragraph',
                    children: [{ text: jsonData.content }],
                },
                { at: [0] }
            );

















            //console.log("data fetched and changed");

        } catch (err) {

        } finally {

        }

    }


    useEffect(() => {

        fetchFileData();
    }, []);





    // нажимаем на кнопку "назад" к проекту
    const handleBackButtonClick = () => {
        navigate(projectLink);
    }

    // кнопка ручного сохранения (логика сохранения также существует в автоматическом варианте)
    const handleSaveButtonClick = ()=>{
        saveFileData()
    }

    // сохранение файла через пост запрос
    const saveFileData=async ()=>{
        try {
            const api = "/api/tools/editor/save"
            const body = JSON.stringify({
                content: Node.string(editor),
                file_id:data.file_id,
                project_id:data.project_id,
                full_path:splat,
                clientTime:frontendTime
            })

            const response = await fetch(api, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
            if (!response.ok) {
                const jsonData = await response.json();
                throw new Error(jsonData.message);
            }

            const jsonData = await response.json();

            setfrontendTime(jsonData.updatedAt)
            openSnackBar("Сохранено")


        }
        catch (error) {
            // snackbar action


            openSnackBar(error)
            fetchFileData()
        }

    }






    return(
        <div>
            <ButtonGroup>
                <Button onClick={handleBackButtonClick} variant="contained">К проекту {project_name}</Button>
                <Button onClick={handleSaveButtonClick}  variant="contained">Сохранить</Button>
            </ButtonGroup>



            <Slate editor={editor} initialValue={initialValue}>
                <Editable



                    onInput={event => {
                        console.log("onInput", event);

                        // для автоматического сохранения будет обновляться таймер
                        //console.log(editor.children);

                        editor.children.forEach((item) => {
                            item.children.forEach((child) => {
                                console.log(child.text);
                            })
                        })

                    }}
                />
            </Slate>

            <Snackbar
                open={snackBarOpened}
                autoHideDuration={2000}
                onClose={snackBarHandleClose}
                message={snackbarmessage}

            />





        </div>
    );
}