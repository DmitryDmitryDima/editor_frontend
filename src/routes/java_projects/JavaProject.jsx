import {Box, Button, Grid, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import React, {useCallback, useState} from "react";
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
            children: [{ text: "The term \"data type\" in software programming describes the kind of javaValue a variable possesses and the kinds of mathematical, relational, or logical operations that can be performed on it without leading to an error. Numerous programming languages, for instance, utilize the data types string, integer, and floating point to represent text, whole numbers, and values with decimal points, respectively. An interpreter or compiler can determine how a programmer plans to use a given set of data by looking up its data type.\n" +
                    "\n" +
                    "The data comes in different forms. Examples include:\n" +
                    "\n" +
                    "your name – a string of characters\n" +
                    "your age – usually an integer\n" +
                    "the amount of money in your pocket- usually decimal type\n" +
                    "today's date - written in date time format"+"The term \"data type\" in software programming describes the kind of javaValue a variable possesses and the kinds of mathematical, relational, or logical operations that can be performed on it without leading to an error. Numerous programming languages, for instance, utilize the data types string, integer, and floating point to represent text, whole numbers, and values with decimal points, respectively. An interpreter or compiler can determine how a programmer plans to use a given set of data by looking up its data type.\n" +
                    "\n" +
                    "The data comes in different forms. Examples include:\n" +
                    "\n" +
                    "your name – a string of characters\n" +
                    "your age – usually an integer\n" +
                    "the amount of money in your pocket- usually decimal type\n" +
                    "today's date - written in date time format" }],
        },
    ]

    const [javaValue, setJavaValue] = useState("The term \"data type\" in software programming describes the kind of javaValue a variable possesses and the kinds of mathematical, relational, or logical operations that can be performed on it without leading to an error. Numerous programming languages, for instance, utilize the data types string, integer, and floating point to represent text, whole numbers, and values with decimal points, respectively. An interpreter or compiler can determine how a programmer plans to use a given set of data by looking up its data type.\n" +
        "\n" +
        "The data comes in different forms. Examples include:\n" +
        "\n" +
        "your name – a string of characters\n" +
        "your age – usually an integer\n" +
        "the amount of money in your pocket- usually decimal type\n" +
        "today's date - written in date time format");
    const onChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);
        setJavaValue(val);
    }, []);






    const slateContent = (

        <Box  minWidth={"100%"} minHeight={"100%"}>

        <Slate editor={editor} initialValue={initialValueForSlate}>
            <Editable
                style={{
                    width: '100%',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                    minHeight: '100px',
                    outline: 'none'
                }}



                onInput={event => {
                    console.log("onInput", event);





                }}
            />
        </Slate>
        </Box>
    )



    const javaEditorContent = (
        <Box  minWidth={"100%"} minHeight={"100%"}>




            <CodeMirror minHeight={"100vh"} minWidth={"100vw"} value={javaValue}

                        extensions={[
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

                        onChange={onChange} theme={"dark"} />


        </Box>
    )




    const editorContent =(
        <div>
        {isJavaFile ===true && javaEditorContent} {isJavaFile ===false && slateContent}

        </div>

    )
    return (
        <JavaProjectAppBar username={"lol"} content={editorContent}></JavaProjectAppBar>


    )
}