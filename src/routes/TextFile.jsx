import {useNavigate, useParams} from "react-router-dom";
import {Button, ButtonGroup} from "@mui/material";
import {useEffect, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import { createEditor, Transforms } from 'slate'





export function TextFile() {

    const {
        user_name,
        project_name,
        "*":splat

    } = useParams();

    const [data, setData] = useState({
        content:"файл не загружен",
    });

    // slate editor integration

    const initialValue = [
        {
            type: 'paragraph',
            children: [{ text: 'Файл не загружен' }],
        },
    ]

    const [editor] = useState(() => withReact(createEditor()))









    // путь к проекту
    const projectLink = "/"+user_name+"/projects/"+project_name;
    // навигация
    const navigate = useNavigate();



    // запрос содержимого файла
    const fetchFileData=async ()=>{

        try {
            const response = await fetch("/api/users"+projectLink+"/"+splat);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();

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






    const handleBackButtonClick = () => {
        navigate(projectLink);
    }




    return(
        <div>
            <ButtonGroup>
                <Button onClick={handleBackButtonClick} variant="contained">К проекту {project_name}</Button>
                <Button variant="contained">Сохранить</Button>
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





        </div>
    );
}