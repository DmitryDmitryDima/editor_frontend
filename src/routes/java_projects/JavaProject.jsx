import {Box, Grid, Typography} from "@mui/material";
import {useParams} from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import {useCallback, useState} from "react";
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

export function JavaProject(){

    const {project_id} = useParams();

    const [value, setValue] = useState("The term \"data type\" in software programming describes the kind of value a variable possesses and the kinds of mathematical, relational, or logical operations that can be performed on it without leading to an error. Numerous programming languages, for instance, utilize the data types string, integer, and floating point to represent text, whole numbers, and values with decimal points, respectively. An interpreter or compiler can determine how a programmer plans to use a given set of data by looking up its data type.\n" +
        "\n" +
        "The data comes in different forms. Examples include:\n" +
        "\n" +
        "your name – a string of characters\n" +
        "your age – usually an integer\n" +
        "the amount of money in your pocket- usually decimal type\n" +
        "today's date - written in date time format");
    const onChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);
        setValue(val);
    }, []);



    const EditorContent = (
        <Box  minWidth={"100%"} minHeight={"100%"}>




            <CodeMirror minHeight={"100vh"} minWidth={"100vw"} value={value}

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
    return (
        <JavaProjectAppBar username={"lol"} content={EditorContent}></JavaProjectAppBar>
    )
}