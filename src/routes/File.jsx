import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import {useState} from "react";
import { autocompletion } from "@codemirror/autocomplete";
import javaBasicCompletions from "../completions/javaBasicCompletions.js";

import javaDotCompletion from "../completions/javaDotCompletion.js";
import {ghostTextExtension} from "../completions/ghostArgs.js";
import {useParams} from "react-router-dom";

function File(){

    const {user_name, project_name, file_name} = useParams();


    // хук для создания и изменения state редактора
    const [code, setCode] = useState(
        `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Java!");
  }
}`
    )


    const [output, setOutput] = useState("");


    // функция, срабатывающая при запросе импортов
    const importRequest = async () => {
        // запрашивем бэк
        const response = await fetch("/api/editor/suggest/import", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({

                code: code,


            })
        })

        if (!response.ok) {
            throw new Error(response.statusText)

        }
        const result = await response.json();
        console.log(result);
        setCode(prevState => {
            let portion = "";
            result.imports.forEach((item) => {
                portion+=item+"\n";
            })
            return portion+prevState;
        })
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

                    code: code,
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
            <h2> {project_name} project: {file_name}</h2>



            <div className="toolbar">
                <button className="panelbutton" onClick={runCode}>Run</button>
                <button className="panelbutton">Save</button>
                <button className="panelbutton" onClick={importRequest}>Import</button>
                <button className="panelbutton">Project</button>
            </div>

            <div className = 'editorwrapper'>
                <div className = "editor">

                    <CodeMirror
                        height="100%"
                        value={code}
                        extensions={[java(),
                            EditorView.lineWrapping,
                            ghostTextExtension,


                            // ТУТ ВСТАВЛЯЕМ ПАРАМЕТРЫ ПОДСКАЗОК - ИЗ ОТДЕЛЬНЫХ ФАЙЛОВ
                            // ФУНКЦИЙ ПОДСКАЗОК МОЖЕТ СКОЛЬКО УГОДНО
                            autocompletion({override:[javaBasicCompletions,
                                    //snippetCompletions,
                                    javaDotCompletion],

                                activateOnTyping: true,
                                defaultKeymap:true

                            })]}
                        theme={oneDark}
                        onChange={setCode}
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

export default File