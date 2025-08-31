import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import {useCallback, useEffect, useRef, useState} from "react";
import { autocompletion , CompletionContext} from "@codemirror/autocomplete";
import javaBasicCompletions from "../completions/javaBasicCompletions.js";


import javaDotCompletions from "../completions/javaDotCompletions.js";
import {ghostTextExtension} from "../completions/ghostArgs.js";
import {useLocation, useNavigate, useParams} from "react-router-dom";

import { Client } from '@stomp/stompjs';
import { v4 as uuid } from 'uuid';

function JavaFile(){

    // параметры, необходимые для начального fetch
    const {
        user_name,
        project_name,
        "*":splat

    } = useParams();

    // данные, полученные от сервера при первоначальном запросе
    const [data, setData] = useState({
        content:"//файл не загружен",
        file_id:null,
        project_id:null
    });




    // содержимое консоли
    const [output, setOutput] = useState("");




    // путь к проекту
    const projectLink = "/"+user_name+"/projects/"+project_name;



    // вебсокет клиент
    const stompClientRef = useRef(null);

    // фронтенд время - обновляется из сервера при успешном сохранении, вебсокет ивентах, чтении файла
    // предназначено для того, чтобы случайно не сохранить старое состояние редактора (в ситуации, когда редактирование происходит параллельно)
    // если отправленное фронтенд время старше, чем последнее изменение в файле, сохранение не происходит
    const frontendTimeRef = useRef(null);


    const file_save_event_id = useRef(null)


    // навигация
    const navigate = useNavigate();
    // location
    const location = useLocation();


    // мгновенное обновление frontend time
    const updateFrontendTime = useCallback((newTime) => {
        frontendTimeRef.current = newTime;

    }, []);

    // мгновенное обновление file_save_event_id
    const update_file_save_event_id = useCallback((new_file_save_event_id) => {
        file_save_event_id.current = new_file_save_event_id;
    }, [])

    // организация доступа к данным главного компонента для basic completions
    const basicCompletionsCallback = useCallback(
        (context) => javaBasicCompletions(context, data, splat),
        [data] // Зависимость от data
    );

    // организация доступа к данным главного компонента для dot completions
    const dotCompletionsCallback = useCallback(
        (context) => javaDotCompletions(context, data),[data]
    )



    // запрос содержимого файла
    const fetchFileData=async ()=>{

        try {
            const api = "/api/tools/editor/load"
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

            updateFrontendTime(jsonData.updatedAt);
            console.log(jsonData);

            setData(jsonData);





            initWebSocketConnection(jsonData.project_id, jsonData.file_id)

















            //console.log("data fetched and changed");

        } catch (err) {

        } finally {

        }

    }

    // инициализация вебсокета
    const initWebSocketConnection = (project_id, file_id) => {
        // Если соединение уже существует - не создаем новое
        // используем null check
        if (stompClientRef.current) return;

        const client = new Client({
            // old 'ws://localhost:8080/ws/project'
            brokerURL: '/ws/project',
            onWebSocketClose: ()=>{
                console.log('WebSocket closed');
            },
            onConnect: () => {
                console.log('WebSocket connected, process subscribe');
                // подписка на общий канал проекта


                client.subscribe('/projects/'+project_id+'/'+file_id, (message) => {

                    const update = JSON.parse(message.body);
                    console.log(update);
                    handleWebSocketEvent(update);
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

        fetchFileData();

        return ()=>{
            if (stompClientRef.current) {
                console.log('disconnected');

                stompClientRef.current.deactivate();

            }
        }
    }, [location.pathname]);







    // ивенты вебсокета
    const handleWebSocketEvent = useCallback((evt) => {
        if (evt.type === 'FILE_SAVE') {

            console.log(evt.event_id);
            console.log(file_save_event_id.current);
            if (evt.file_id!==file_save_event_id.current){
                fetchFileData()

            }



        }
    }, [file_save_event_id]);




    // сохранение файла через пост запрос
    const saveFileData=async ()=>{
        try {

            const event_id = uuid();
            update_file_save_event_id(event_id);



            const api = "/api/tools/editor/save"
            const body = JSON.stringify({
                content: data.content,
                file_id:data.file_id,
                project_id:data.project_id,
                full_path:splat,
                clientTime:frontendTimeRef.current,
                event_id:event_id,
            })

            const response = await fetch(api, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
            if (!response.ok) {
                const jsonData = await response.json();
                throw new Error(jsonData.message);
            }

            const jsonData = await response.json();

            updateFrontendTime(jsonData.updatedAt);



        }
        catch (error) {
            // snackbar action
            console.log(error.message);


            await fetchFileData()
        }

    }

    // нажимаем на кнопку "назад" к проекту
    const handleProjectButtonClick = () => {
        navigate(projectLink);
    }















    // функция, срабатывающая при запросе импортов
    const importRequest = async () => {
        // запрашивем бэк
        const response = await fetch("/api/editor/suggest/import", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({

                code: data.content,


            })
        })

        if (!response.ok) {
            throw new Error(response.statusText)

        }
        const result = await response.json();
        console.log(result);


        let portion = "";
        result.imports.forEach((item) => {
            portion+=item+"\n";
        })

        setData(prevData => ({
            ...prevData,
            content: portion+prevData.content
        }));



    }


    // функция, срабатывающая при запуске кода
    const runCode = async () => {
        try {
            // добавляем к предыдущему состояние новое - будет полезно при многоступенчатом ответе сервера
            setOutput(prev =>
                prev+" compiling code...")




            // запрашивем бэк
            const response = await fetch("/api/editor/run", {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({

                    code: data.content,
                    screenWidth: window.innerWidth


                })
            })
            if (!response.ok) {
                throw new Error(response.statusText)

            }
            const result = await response.json();



            setOutput(prev => prev +
                "> Output:\n" +
                (result.message || "No output") + "\n\n" +
                (result.error ? "> Errors:\n" + result.error + "\n" : "") +
                "> Process finished.\n\n"
            );
        }
        catch (err) {
            console.log(err)

            setOutput(prev => prev +
                "> Error occurred:\n" +
                err.message + "\n\n"
            );
        }


    };

    const clearOutput = () => {
        setOutput("");
    };






    return (

        <div className="container">
            <h2> {project_name} project</h2>



            <div className="toolbar">
                <button className="panelbutton" onClick={runCode}>Run</button>
                <button className="panelbutton" onClick={saveFileData}>Save</button>
                <button className="panelbutton" onClick={importRequest}>Import</button>
                <button className="panelbutton" onClick={handleProjectButtonClick}>Project</button>
            </div>

            <div className = 'editorwrapper'>
                <div className = "editor">

                    <CodeMirror
                        height="100%"
                        value={data.content}
                        extensions={[java(),
                            //EditorView.lineWrapping,
                            ghostTextExtension,




                            // ТУТ ВСТАВЛЯЕМ ПАРАМЕТРЫ ПОДСКАЗОК - ИЗ ОТДЕЛЬНЫХ ФАЙЛОВ
                            // ФУНКЦИЙ ПОДСКАЗОК МОЖЕТ СКОЛЬКО УГОДНО
                            autocompletion({override:[basicCompletionsCallback,

                                    dotCompletionsCallback],

                                activateOnTyping: true,
                                defaultKeymap:true

                            })]}
                        theme={oneDark}
                        onChange={(value) => setData(prev => ({...prev, content: value}))}
                    />
                </div>
            </div>

            <div className="output-panel">
                <div className="output-header">
                    <h2>Output</h2>
                    <button className="clear-button" onClick={clearOutput}>Clear</button>
                </div>
                <pre className="output-content">{output || "No output yet. Click 'Run' to execute your code."}</pre>
            </div>



        </div>
    );
}

export default JavaFile