import {Box, Button, Grid, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import React, {useCallback, useRef, useState} from "react";
import {java} from "@codemirror/lang-java";

import {
    drawSelection, dropCursor,
    EditorView, highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars, keymap,
    lineNumbers, rectangularSelection
} from "@codemirror/view";
import {bracketMatching, foldGutter, foldKeymap, indentOnInput} from "@codemirror/language";
import {Compartment, EditorState} from "@codemirror/state";
import {autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap} from "@codemirror/autocomplete";
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search";
import {history, defaultKeymap, historyKeymap, indentWithTab} from "@codemirror/commands";
import {lintKeymap} from "@codemirror/lint";
import {AppBarWithDrawer} from "../../elements/AppBarWithDrawer.jsx";
import {JavaProjectAppBar} from "./JavaProjectAppBar.jsx";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor} from "slate";



export function JavaProject(){

    const {project_id} = useParams();

    const [isJavaFile, setIsJavaFile] = useState(true);



    const [editor] = useState(() => withReact(createEditor()))
    const initialValueForSlate = [
        {
            type: 'paragraph',
            children: [{ text: "This is the earliest period of Roman history, " +
                    "according to tradition beginning with the legendary founding " +
                    "of Rome by Romulus. Little contemporary evidence survives from this era, and accounts were written much later during the Republic and Empire. " +
                    "The government was an elective monarchy, where a series of seven traditional kings ruled the settlement. " +
                    "This period ended with the overthrow of the last king, Tarquin the Proud, and the establishment of a new form of government in 509 BC. " }],
        },
    ]

    const [javaValue, setJavaValue] = useState("@PostMapping(\"/deleteProject\")\n" +
        "    public ResponseEntity<Void> deleteProject(@RequestHeader Map<String, String> headers, @RequestBody ProjectRemovalRequest request)  {\n" +
        "        SecurityContext securityContext = SecurityContext.generateContext(headers);\n" +
        "        RequestContext requestContext = RequestContext.generateRequestContext(headers);\n" +
        "        projectsService.deleteProject(securityContext, requestContext, request);\n" +
        "        return ResponseEntity.noContent().build();\n" +
        "    }\n" +
        "\n" +
        "    /*\n" +
        "    Возвращаем проекты пользователя. Тут в будущем нужно проверять права доступа - кому этот проект будет виден\n" +
        "     */\n" +
        "    @GetMapping(\"/getProjects\")\n" +
        "    public ResponseEntity<List<ProjectDTO>> getAllProjects(@RequestHeader Map<String, String> headers,\n" +
        "                                                           @RequestParam(\"targetUsername\") String targetUsername){\n" +
        "        SecurityContext context = SecurityContext.generateContext(headers);\n" +
        "\n" +
        "        List<ProjectDTO> projects = projectsService.getAllProjects(context, targetUsername);\n" +
        "        return ResponseEntity.ok(projects);\n" +
        "\n" +
        "\n" +
        "    }");
    const onChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);
        setJavaValue(val);
    }, []);

    const javaValueRef = useRef("class Hello {}");
    const [valueJava, setValueJava] = useState(javaValueRef.current);
    const onJavaEditorChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);
        javaValueRef.current = val; // Update ref instead of state to avoid unnessecary re-renders
    }, []);






    const slateContent = (

        <Box padding={2}  minWidth={"100vw"} minHeight={"100%"} >

        <Slate editor={editor} initialValue={initialValueForSlate}>
            <Editable
                style={{
                    width: '100%',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    minHeight: '80vh', // todo here is trick

                    outline: 'none'
                }}



                onInput={event => {
                    console.log("onInput", event);





                }}
            />
        </Slate>
        </Box>
    )

    const customTheme = EditorView.theme({
        "&": {
            fontSize: "9.5pt", // Example font size

        },
        ".cm-content": {
            fontFamily: "Menlo, Monaco, Lucida Console, monospace", // Example font family

        },
    });



    const javaEditorContent = (
        <Box  minWidth={"100%"} minHeight={"100%"} >




            <CodeMirror  minHeight={"85vh"} minWidth={"100vw"} value={valueJava}


                        extensions={[
                            customTheme,
                            java(),
                            EditorView.lineWrapping,
                            lineNumbers(),
                            highlightActiveLineGutter(),
                            highlightSpecialChars(),
                            history(),
                            foldGutter(),
                            drawSelection(),
                            dropCursor(),
                            EditorState.allowMultipleSelections.of(true),
                            new Compartment().of(EditorState.tabSize.of(4)),
                            indentOnInput(),
                            bracketMatching(),
                            closeBrackets(),
                            autocompletion(),
                            rectangularSelection(),
                            highlightActiveLine(),
                            highlightSelectionMatches(),
                            keymap.of([
                                ...closeBracketsKeymap,
                                ...defaultKeymap,
                                ...searchKeymap,
                                ...historyKeymap,
                                ...foldKeymap,
                                ...completionKeymap,
                                ...lintKeymap,
                                indentWithTab,
                            ]),




                        ]}

                        onChange={onJavaEditorChange} theme={"dark"} />


        </Box>
    )




    const editorContent =(
        <div>
        {isJavaFile ===true && javaEditorContent} {isJavaFile ===false && slateContent}

        </div>

    )
    return (
        <JavaProjectAppBar change={()=>{
            setIsJavaFile(!isJavaFile)
        }} username={"lol"} content={editorContent}></JavaProjectAppBar>


    )
}