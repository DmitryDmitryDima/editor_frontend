import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import {useState} from "react";
import { autocompletion } from "@codemirror/autocomplete";
import javaBasicCompletions from "./completions/javaBasicCompletions.js";

import javaDotCompletion from "./completions/javaDotCompletion.js";













function App() {

    // хук для создания и изменения state редактора
    const [code, setCode] = useState(
        `public class Main {
    public static void main(String[] args) {
       System.out.println("Hello, Java!");
       // Start coding here...
       
    }
}`
    )


    const [output, setOutput] = useState("");


    // функция, срабатывающая при запуске кода
    const runCode = async () => {
        try {
            // добавляем к предыдущему состояние новое - будет полезно при многоступенчатом ответе сервера
            setOutput(prev =>
                prev+" compiling code...")




            // запрашивем бэк
            const response = await fetch("/api/editor/run/", {
                method: "GET",
                headers: {'Content-Type': 'application/json'},
            })
            if (!response.ok) {
                throw new Error(response.statusText)

            }
            const result = await response.json();



            setOutput(prev => prev +
                "> Output:\n" +
                (result.answer || "No output") + "\n\n" +
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
            <h2>This is my editor</h2>



            <div className="toolbar">
                <button className="panelbutton" onClick={runCode}>Run</button>
                <button className="panelbutton">Save</button>
                <button className="panelbutton">File Tree</button>
                <button className="panelbutton">Profile</button>
            </div>

            <div className = 'editorwrapper'>
                <div className = "editor">

                    <CodeMirror
                        height="100%"
                        value={code}
                        extensions={[java(),
                            EditorView.lineWrapping,

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

export default App
