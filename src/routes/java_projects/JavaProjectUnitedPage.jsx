import {useParams} from "react-router-dom";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor} from "slate";
import SourceIcon from '@mui/icons-material/Source';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
    BottomNavigation, BottomNavigationAction,
    Box,
    Button,
    ButtonGroup,
    CssBaseline,
    Divider,
    Drawer,
    IconButton,
    Typography
} from "@mui/material";
import {
    drawSelection, dropCursor,
    EditorView, highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars, keymap,
    lineNumbers, rectangularSelection
} from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import {java} from "@codemirror/lang-java";
import {defaultKeymap, history, historyKeymap, indentWithTab} from "@codemirror/commands";
import {bracketMatching, foldGutter, foldKeymap, indentOnInput} from "@codemirror/language";
import {Compartment, EditorState} from "@codemirror/state";
import {autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap} from "@codemirror/autocomplete";
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search";
import {lintKeymap} from "@codemirror/lint";
import {Tree} from "react-arborist";
import {FaFile, FaFolder} from "react-icons/fa";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from "@mui/icons-material/Create";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import ChatIcon from "@mui/icons-material/Chat";

export function JavaProjectUnitedPage() {

    const {project_id} = useParams();

    // boolean для переключения между slate и code mirror
    const [isJavaFile, setIsJavaFile] = useState(true);

    const javaEditorRef = useRef(null);


    /* Drawer настройки*/
    // Структура (Structure)
    // Поиск (Search)
    // Настройки (Settings)
    const [drawerRegime, setDrawerRegime] = useState("Structure");

    const treeData  = [
        { id: "1", name: "Unread" , type:"folder"},
        { id: "2", name: "Threads", type:"folder" },
        {
            id: "3",
            name: "Chat Rooms",
            type:"folder",
            children: [
                { id: "c1", name: "General", type:"file" },
                { id: "c2", name: "Random", type:"file" },
                { id: "c3", name: "Open Source Projects", type:"folder", children:[{id:"xxx", name:"deep", type:"file"}] },
            ],
        },
        {
            id: "4",
            name: "Direct Messages",
            type: "folder",
            children: [
                { id: "d1", name: "Alice", type: "file" },
                { id: "d2", name: "Bob" , type: "file" },
                { id: "d3", name: "Charlie", type: "file" },
            ],
        },
    ];



    const drawerWidth = 300;


    const window = undefined;
    const [mobileOpen, setMobileOpen] = useState(false);

    // открытие - закрытие drawer (с сохранением состояния)
    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
        console.log("hello")
    };







    // Editor
    // Console
    // Chat
    const [pageRegime, setPageRegime] = useState("Editor");

    // компонент консоли
    const consoleComponent = (
        <Box  padding={2}  minWidth={"100vw"} minHeight={"85vh"} >
            <Typography>Console</Typography>
        </Box>
    )

    // chatComponent component
    const chatComponent = (
        <Box  padding={2}  minWidth={"100vw"} minHeight={"85vh"} >
            <Typography>Chat</Typography>
        </Box>
    )

    // drawer component
    const drawer = (
        <Box padding={1} >
            <Typography sx={{ my: 2 }}>
                Название проекта
            </Typography>
            <Typography>К проектам</Typography>
            <Divider />


            <Divider/>




            <Box sx={{
                display: 'flex',
                justifyContent: 'center',

            }}>
            <ButtonGroup     aria-label="Basic button group">
                <Button onClick={()=>{
                    setDrawerRegime("Structure");
                }}><SourceIcon/></Button>
                <Button onClick={()=>{
                    setDrawerRegime("Search");
                }}><SearchIcon/></Button>
                <Button
                    onClick={()=>{setDrawerRegime("Settings")}}
                ><SettingsIcon/></Button>


            </ButtonGroup>
            </Box>

            <Divider />


            <Divider/>



            {drawerRegime === "Structure" &&
                <Tree initialData={treeData}
                      openByDefault={false}
                      width={300}
                      height={1000}
                      indent={24}
                      rowHeight={36}
                      overscanCount={1}
                      paddingTop={30}
                      paddingBottom={10}
                      padding={25 /* sets both */}
                >
                    {({ node, style, dragHandle }) => (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                ...style,
                            }}
                            ref={dragHandle} onClick={() => node.toggle()}
                        >
            <span style={{ marginRight: "8px" }}>
              {

                  node.data.type==="file"? <FaFile /> : <FaFolder />}
            </span>
                            <span>{node.data.name}</span>
                        </div>
                    )}
                </Tree> }




            {drawerRegime === "Search" && <Typography>Поиск</Typography>}
            {drawerRegime === "Settings" &&<Typography>Настройки</Typography>}









        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;





    // slate editor instance
    const [slateEditor] = useState(() => withReact(createEditor()))


    const valueForSlateRef = useRef([
        {
            type: 'paragraph',
            children: [{ text: "hello" }],
        },
    ])
    const [valueForSlate, setValueForSlate] = useState(valueForSlateRef.current);



    // логика обновления данных для code mirror
    const javaValueRef = useRef("class Hello {}");
    const [valueJava, setValueJava] = useState(javaValueRef.current);

    // мы сохраняем значение в ссылке, чтобы избежать ререндера
    const onJavaEditorChange = useCallback((val, viewUpdate) => {
        console.log('val:', val);

        javaValueRef.current = val;

    }, []);


    // хук, срабатывающий при смене page режима
    useEffect(() => {
        // При переключении между Java и Slate редактором
        if (pageRegime!=="Editor") {
            // Если переключаемся на Java редактор, обновляем его значение
            setValueJava(javaValueRef.current);
            setValueForSlate(valueForSlateRef.current);
            console.log("switching logic");
        }
    }, [pageRegime]);


    // блок контента для slate
    const slateContent = (

        <Box padding={2}  minWidth={"100vw"} minHeight={"100%"} >

            <Slate editor={slateEditor} initialValue={valueForSlate}
                   onChange={newValue=>{
                       valueForSlateRef.current = newValue;

                   }}
            >
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








                />
            </Slate>
        </Box>
    )


    // настройки темы для code mirror
    const customTheme = EditorView.theme({
        "&": {
            fontSize: "9.5pt", // Example font size

        },
        ".cm-content": {
            fontFamily: "Menlo, Monaco, Lucida Console, monospace", // Example font family

        },
    });

    // блок контента code mirror
    const javaEditorContent = (
        <Box  minWidth={"100%"} minHeight={"100%"} >




            <CodeMirror  minHeight={"85vh"} minWidth={"100vw"} value={valueJava}
                         ref={javaEditorRef}


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

    // переключатель между типами редакторов
    const editorContent =(
        <div>
            {isJavaFile ===true && javaEditorContent} {isJavaFile ===false && slateContent}

        </div>

    )


    // bottom value
    const [bottomValue, setBottomValue] = useState(0);




    return (
        <Box sx={{ display: 'flex',





        }}>
            <CssBaseline />
            <AppBar component="nav" sx={{
                backgroundColor: 'rgba(255, 0, 0, 0.5)', // полупрозрачный белый
                backdropFilter: 'blur(10px)', // размытие фона
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // мягкая тень
                border: '1px solid rgba(255, 255, 255, 0.2)', // тонкая граница
            }}>
                <Toolbar variant={"dense"} >
                    <IconButton

                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2}}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button sx={{ color: '#fff' }} onClick={()=>{

                        setIsJavaFile(!isJavaFile);
                        console.log(javaValueRef.current);
                        setValueJava(javaValueRef.current);




                    }}>Change</Button>

                    <Button>
                        <AutoAwesomeIcon/>
                    </Button>

                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{

                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
            <Box component="main" >
                <Toolbar variant={"dense"} />

                {pageRegime === "Editor" &&editorContent}
                {pageRegime==="Console" && consoleComponent}
                {pageRegime==="Chat" && chatComponent}




                <BottomNavigation
                    showLabels
                    value={bottomValue}
                    onChange={(event, newValue) => {
                        setBottomValue(newValue);
                    }}
                >
                    <BottomNavigationAction onClick={()=>{
                        // сохраняем состояние редактора java

                        setPageRegime("Editor");
                    }} label="Редактор" icon={<CreateIcon />} />


                    <BottomNavigationAction onClick={()=>{
                        // сохраняем состояние редактора java

                        setPageRegime("Console")
                    }} label="Консоль" icon={<DoubleArrowIcon />} />


                    <BottomNavigationAction onClick={()=>{
                        // сохраняем состояние редактора java

                        setPageRegime("Chat")
                    }} label="Чат" icon={<ChatIcon />} />
                </BottomNavigation>



            </Box>
        </Box>
    )
}