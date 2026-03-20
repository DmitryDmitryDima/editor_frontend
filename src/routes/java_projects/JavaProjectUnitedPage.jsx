import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Editor, Node, parent, Transforms} from "slate";
import SourceIcon from '@mui/icons-material/Source';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {MdOutlineDriveFileRenameOutline, MdOutlineFileUpload} from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { MdDriveFileMoveOutline } from "react-icons/md";

import {
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    ButtonGroup,
    CssBaseline,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle,
    Divider,
    Drawer,
    IconButton,
    Typography
} from "@mui/material";
import {
    drawSelection,
    dropCursor,
    EditorView,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    keymap,
    lineNumbers,
    rectangularSelection
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
import { FaBan } from "react-icons/fa";

import {GoPencil} from "react-icons/go";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from "@mui/icons-material/Create";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from '@mui/icons-material/Groups';
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {v4 as uuid_gen, v4 as uuid} from "uuid";
import {Client} from "@stomp/stompjs";
import {SimpleYesOrNotDialog} from "./SimpleYesOrNotDialog.jsx";
import {PollingDialogWithTimer} from "./PollingDialogWithTimer.jsx";
import { VscNewFile } from "react-icons/vsc";
import {IoMdAdd} from "react-icons/io";
import {AddEntityDialog} from "./AddEntityDialog.jsx";


export function JavaProjectUnitedPage() {


    const [renderId, setRenderId] = React.useState(uuid());


    const [authUsername, setAuthUsername] = useState("")
    const [authUUID, setAuthUUID] = useState("")

    const authUsernameRef = React.useRef(null);
    const authUUIDRef = React.useRef(null);

    const navigate = useNavigate();
    // api для общения с сервисами
    const api = axios.create({
        baseURL: '/',
    });







    // websocket
    const clientRef = useRef(null);

    // автор проекта - username
    const[authorUsername, setAuthorUsername] = useState("");
    const[authorUUID, setAuthorUUID] = useState(null);


    // диалоги

    const [addEntityDialogOpen, setAddEntityDialogOpen] = React.useState(false);
    const addEntityDialogOpenRef = useRef(false)
    const addEntityCorrelationIdRef = useRef(null);
    const [addEntityProcessMessage, setAddEntityProcessMessage] = useState("Запускаем процесс создания")

    const closeAddEntityDialog = ()=>{
        setAddEntityDialogOpen(false);
        addEntityDialogOpenRef.current = false;
        addEntityCorrelationIdRef.current = null;
        setAddEntityProcessMessage("Запускаем процесс создания")
    }

    const openAddEntityDialog = ()=>{
        setAddEntityDialogOpen(true);
        addEntityDialogOpenRef.current = true;
    }

    const addEntityDialogChangeCorrelationId = (corrId)=>{
        addEntityCorrelationIdRef.current = corrId;
    };



    // унифицируем диалог для yes or not операций. если нужна отдельная сложная реализация с множеством стадий - создаем отдельно

    // uuid процесса, к которому привязан текущий диалог

    // фаза диалога - preparing - пользователь делает выбор, waiting - ожидаем результата операции, success - успех, fail - ошибка
    const [simpleYesOrNotDialogPhase, setSimpleYesOrNotDialogPhase] = useState("PREPARING");
    const simpleYesOrNotDialogPhaseRef = useRef("PREPARING");
    // тело диалога - можно посылать различные сообщения о ходе процесса
    const [simpleYesOrNotDialogBody, setSimpleYesOrNotDialogBody] = useState("");
    // заголовок диалога
    const [simpleYesOrNotDialogTitle, setSimpleYesOrNotDialogTitle] = useState("");

    // correlation id для текущего yes or not диалога
    const simpleYesOrNotDialogCorrelationIdRef = useRef(null);

    const [simpleYesOrNotDialogOpen, setSimpleYesOrNotDialogOpen] = useState(false);
    const simpleYesOrNotDialogOpenRef = useRef(false);

    const simpleYesOrNotDialogActionRef = useRef(null);

    const closeSimpleYesOrNotDialog = ()=>{
        setSimpleYesOrNotDialogOpen(false);
        simpleYesOrNotDialogOpenRef.current = false;
    }
    const openSimpleYesOrNotDialog = (title, body, action)=>{
        setSimpleYesOrNotDialogPhase("PREPARING")
        simpleYesOrNotDialogPhaseRef.current = "";
        setSimpleYesOrNotDialogOpen(true);
        setSimpleYesOrNotDialogTitle(title);
        setSimpleYesOrNotDialogBody(body);
        simpleYesOrNotDialogActionRef.current = action;
        simpleYesOrNotDialogOpenRef.current = true;
    }


    // создаем отдельный диалог для polling событий, которые могут приходить от системы
    const [pollingDialogWithTimerBody, setPollingDialogWithTimerBody] = useState("");
    const [pollingDialogWithTimerTitle, setPollingDialogWithTimerTitle] = useState("");
    // todo не нужен ??? const pollingDialogWithTimerCorrelationIdRef = useRef(null);
    const [pollingDialogWithTimerOpen, setPollingDialogWithTimerOpen] = useState(false);
    const pollingDialogWithTimerOpenRef = useRef(false);

    const pollingDialogWithTimerYesActionRef = useRef(null);
    const pollingDialogWithTimerNoActionRef = useRef(null);

    const closePollingDialogWithTimer=()=>{
        setPollingDialogWithTimerOpen(false);
        pollingDialogWithTimerOpenRef.current = false;
    }

    const openPollingDialogWithTimer = (title, body, yesAction, noAction)=>{
        setPollingDialogWithTimerOpen(true);
        pollingDialogWithTimerOpenRef.current = true;
        pollingDialogWithTimerYesActionRef.current = yesAction;
        pollingDialogWithTimerNoActionRef.current = noAction;
        setPollingDialogWithTimerTitle(title);
        setPollingDialogWithTimerBody(body);

    }




    useEffect(()=>{
        /*
        let token = localStorage.getItem("accessToken");
        if (token!==null){
            const decoded = jwtDecode(token);
            console.log(decoded);
            console.log(authUsername);

            setAuthUsername(decoded.username);
            setAuthUUID(decoded.sub)

            authUsernameRef.current = decoded.username;
            authUUIDRef.current = decoded.sub;

        }

         */
        identify()

        onlineList()


    }, [])

    const identify = async () => {
        try {
            const identification = await api.get("/auth/identify")
            setAuthUsername(identification.data.username)
            setAuthUUID(identification.data.uuid)

            authUsernameRef.current = identification.data.username;
            authUUIDRef.current = identification.data.uuid;

        }
        catch (error) {
            navigate('/login');
        }
    }
















    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log(error)
            console.log("interceptor")

            // If the error status is 401 and there is no originalRequest._retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {

                    await axios.post('/auth/refresh');




                    // Retry the original request with the new token

                    return axios(originalRequest);
                } catch (error) {
                    navigate('/login');
                }
            }

            return Promise.reject(error);
        }
    );

    const {project_id} = useParams();

    const [project_name, setProjectName] = useState("");



    const isJavaFileRef = useRef(true);
    const isNoFileOpenedRef = useRef(true);

    const javaEditorRef = useRef(null);
    const javaEditorCursorRef = useRef(null);


    const treeRef = useRef(null);


    /* Drawer настройки*/
    // Структура (Structure)
    // Поиск (Search)
    // Настройки (Settings)
    const [drawerRegime, setDrawerRegime] = useState("Structure");


    const [resolveMap, setResolveMap] = useState(new Map());
    const [statusMap, setStatusMap] = useState(new Map());








    const [treeData,setTreeData] = useState( [
    ]);

    const [selectedTreeData, setSelectedTreeData] = useState( null );

    const [openedFileName, setOpenedFileName] = useState("Открыть...");
    //const [openedFileId, setOpenedFileId] = useState(null);
    const openedFileIdRef = useRef(null);

    // последние открытые файлы
    const [recentFiles, setRecentFiles] = useState([]);
    const [recentFilesDialogState, setRecentFilesDialogState] = useState(false);


    // показывается ли уведомление вверху app bar
    const [showBarNotification, setShowBarNotification] = useState(false);
    const [barNotificationContent, setBarNotificationContent] = useState("");

    useEffect(() => {
        if (showBarNotification) {
            const toRef = setTimeout(() => {
                setShowBarNotification(false);
                clearTimeout(toRef);
            }, 2000);
        }
    }, [showBarNotification]);






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
        <Box  padding={2}  minWidth={"100vw"} minHeight={"100vh"} >
            <Typography color="white">Console</Typography>
        </Box>
    )

    // chatComponent component
    const chatComponent = (
        <Box  padding={2}  minWidth={"100vw"} minHeight={"100vh"} >
            <Typography color="white">Chat</Typography>
        </Box>
    )

    const onTreeMove = ({ dragIds, parentId, index, dragNodes, parentNode }) => {

        console.log(dragNodes, parentNode)
        console.log(treeData)



        if (dragIds.length===1){
            if (dragNodes[0].data.id.startsWith("file_") && parentNode.data.id.startsWith("directory_")){
                openSimpleYesOrNotDialog("переместить файл "+dragNodes[0].data.name+" в "+parentNode.data.name+" ?", "Перемещение", ()=>{
                    moveFile(dragNodes[0].data.originalId, parentNode.data.originalId)
                });
            }

            if (dragNodes[0].data.id.startsWith("directory_") && parentNode.data.id.startsWith("directory_")){
                openSimpleYesOrNotDialog("переместить директорию "+dragNodes[0].data.name+" в "+parentNode.data.name+" ?", "Перемещение", ()=>{
                    moveDirectory(dragNodes[0].data.originalId, parentNode.data.originalId)
                });
            }



        }
    };

    // drawer component
    const drawer = (
        // todo аккуратнее с sx на родительском box
        <Box padding={1} sx={{maxHeight:"100vh", justifyContent:"space-between", display:"flex", flexDirection:"column"}} >


            <Box sx={{display:"flex",
                justifyContent:"center",
                alignItems:"center", flexWrap: "wrap"}}>

            <Typography sx={{ mt: 0, mb:1, fontWeight:"bold", fontSize:"0.75rem" }}>
                {project_name} от {resolveMap.get(authorUUID)?.username}
            </Typography>



            </Box>


            <Box sx={{
                display: "flex",        // Включаем флекс-режим
                alignItems: "center",   // Центрируем по вертикали
                width: "100%"           // Контейнер на всю ширину (важно для ml: "auto")
            }}>


            <Typography sx={{ // 2. Это прижимает кнопку вправо

                }} onClick={
                ()=>{navigate("/users/"+authUsername+"/projects");}
            }>Мои проекты </Typography>

                {authUsername!==resolveMap.get(authorUUID)?.username && <Typography sx={{ml: "auto"}} onClick={
                    ()=>{navigate("/users/"+resolveMap.get(authorUUID)?.username+"/projects");}
                }>Проекты автора</Typography>}

            </Box>





            <Divider />


            <Divider/>




            <Box sx={{
                display: 'flex',
                justifyContent: 'center',

            }}>
            <ButtonGroup     aria-label="Basic button group"
                             >

                <IconButton onClick={()=>{
                    setDrawerRegime("Structure");
                }}><SourceIcon/></IconButton>

                <IconButton
                    onClick={()=>{setDrawerRegime("Settings")}}
                ><SettingsIcon/></IconButton>

                <IconButton onClick={()=>{setDrawerRegime("Members")}}>
                    <GroupsIcon/>
                </IconButton>



            </ButtonGroup>
            </Box>

            <Divider />


            <Divider/>



            {drawerRegime === "Structure" &&
                <Box sx={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>

                    <Box sx={{display:"flex",
                        justifyContent:"center",
                        alignItems:"center", flexWrap: "wrap"}}>
                        <Typography fontWeight="bold">Структура</Typography>
                    </Box>
                <Tree data={treeData}

                      onMove={onTreeMove}

                      openByDefault={false}
                      ref={treeRef}
                      width={300}
                      height={400}
                      indent={24}
                      rowHeight={25}
                      overscanCount={1}
                      paddingTop={30}
                      paddingBottom={10}
                      padding={25 /* sets both */}








                      onToggle={(toggle)=>{
                          console.log(toggle);
                          //setSelectedTreeData( toggle );

                      }}

                >
                    {({ node, style, dragHandle }) => (
                        <div
                            className={`node-container ${node.state.isSelected ? "isSelected" : ""}`}

                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: 'space-between',


                                ...style,
                            }}
                            ref={dragHandle} onClick={() => {
                                setSelectedTreeData(node);
                                node.toggle()}}
                        >
            <span  style={{ marginRight: "8px", marginLeft: "8px", color:"#E99696" }}>
              {

                  node.data.type==="file"? <FaFile /> : <FaFolder />}

            </span>
                            <span>{node.data.name}</span>
                            <span style={{margin:"auto"}}>
                            {
                                (node.data.type==="file" && node.isSelected) &&
                                <Button color={"secondary"}><FaEye onClick={()=>loadFile(node.data.originalId)}/></Button>



                            }
                            </span>


                        </div>
                    )}
                </Tree>


                    <Box

                        sx={{
                            flexGrow: 1,
                        }}
                    >

                    </Box>



                        <Box
                            sx={{

                                position: 'sticky', // Use 'sticky' for relative sticky positioning
                                bottom: 0,          // Stick to the bottom of the parent container
                                padding: 2,         // Add some padding
                                backgroundColor: 'background.paper', // Match the background
                                zIndex: 1,          // Ensure it's above other scrolling content
                                display: 'flex',
                                justifyContent: 'center', // Align buttons to the right
                                gap: 2, // Space between buttons
                            }}
                        >

                        <ButtonGroup >
                            <IconButton size={"medium"} onClick={()=>{
                                addNewEntity()
                            }}>
                                <IoMdAdd />
                            </IconButton>
                            <IconButton size={"medium"} >
                                <MdOutlineDriveFileRenameOutline />

                            </IconButton>

                            <IconButton size={"medium"} onClick={()=>{
                                removeFromTree();
                            }}>
                                <FaTrash></FaTrash>
                            </IconButton>


                        </ButtonGroup>
                        </Box>



                </Box>}





            {drawerRegime === "Settings" &&

                <Box sx={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
                    <Typography>Настройки</Typography>
                </Box>
            }
            {drawerRegime === "Members" &&
                <Box sx={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>



                    <Box sx={{display:"flex",
                        justifyContent:"center",
                        alignItems:"center", flexWrap: "wrap"}}>
                    <Typography fontWeight="bold">Участники</Typography>
                    </Box>






                    {Array.from(resolveMap.values()).map((member)=>{
                        return <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            gap: 1

                        }}>

                            <Typography >{member.username}</Typography><Typography sx={{color:"#08C985"}}> {statusMap.get(member.uuid)==="online"?"●":""} </Typography>
                            {(authUsername==resolveMap.get(authorUUID)?.username && authUsername!=member.username) && <Button

                                sx={{
                                    color: "#000000",
                                    ml: "auto", // 2. Это прижимает кнопку вправо
                                    minWidth: 0, // Убирает стандартные отступы кнопки
                                    p: 0.5,      // Немного места вокруг иконки
                                    "&:hover": {
                                        backgroundColor: "rgba(0,0,0,0.05)" // Легкий фон при наведении
                                    }
                                }}
                            onClick={()=>{
                                removeParticipant(member.uuid, member.username);
                            }}
                            >

                                <FaBan/>

                            </Button>}




                        </Box>
                    }

                    )}

                    <Box

                        sx={{
                            flexGrow: 1,
                        }}
                    >
                    </Box>

                    <Box
                        sx={{

                            position: 'sticky', // Use 'sticky' for relative sticky positioning
                            bottom: 0,          // Stick to the bottom of the parent container
                            padding: 2,         // Add some padding
                            backgroundColor: 'background.paper', // Match the background
                            zIndex: 1,          // Ensure it's above other scrolling content
                            display: 'flex',
                            justifyContent: 'center', // Align buttons to the right
                            gap: 2, // Space between buttons
                        }}
                    >
                    {authUsername!==resolveMap.get(authorUUID)?.username && <Button sx ={{backgroundColor: "#000000", color:"#ffffff"}}onClick={()=>{
                        removeParticipant(authUUID, authUsername);
                    }}>Покинуть проект</Button>}
                    </Box>
                </Box>

                }









        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;





    // slate editor instance
    const [slateEditor] = useState(() => withReact(createEditor()))

    // позволяет различать изменения. внесенные внешним ивентом и изменения, внесенные внутренним ивентов
    const isRemote = useRef(false)



    const valueForSlateRef = useRef([
        {
            type: 'paragraph',
            children: [{ text: "hello" }],
        },
    ])
    const [valueForSlate, setValueForSlate] = useState(valueForSlateRef.current);



    // логика обновления данных для code mirror
    const javaValueRef = useRef("");
    const [valueJava, setValueJava] = useState(javaValueRef.current);

    // мы сохраняем значение в ссылке, чтобы избежать ререндера
    const onJavaEditorChange = useCallback((val, viewUpdate) => {
        //console.log('val:', val);

        console.log("autosave trigger")

        javaValueRef.current = val;

        javaEditorCursorRef.current = javaEditorRef.current.view.state.selection.ranges[0].from;


        autosave()

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

        <Box bgcolor="#282c34" padding={2}  minWidth={"100vw"} minHeight={"100%"}  >

            <Slate editor={slateEditor} initialValue={valueForSlate}
                   onChange={newValue=>{

                       valueForSlateRef.current = newValue;
                       if (isRemote.current){
                           console.log("is remote")
                           isRemote.current = false;
                       }
                       else {
                           autosave()
                       }

                       console.log("slate on change event");


                   }}
            >
                <Editable
                    style={{
                        color:"white",
                        backgroundColor: "transparent",
                        width: '100%',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                        minHeight: '100vh', // todo here is trick

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




            <CodeMirror  minHeight={"100vh"} minWidth={"100vw"} value={valueJava}
                         ref={javaEditorRef}


                         extensions={[
                             EditorView.updateListener.of((v) => {
                                 if (v.docChanged) {
                                     // The document has changed
                                     const newText = v.state.doc.toString();
                                     //console.log("Document changed:", newText);
                                     console.log("listener");

                                     javaEditorRef.current.view.dispatch({
                                         selection: {
                                             anchor: javaEditorCursorRef.current,
                                             head: javaEditorCursorRef.current,
                                         },
                                     })



                                 }
                             }),
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

    const noFileOpened = (
        <Box bgcolor="#282c34"  minWidth={"100%"} minHeight={"100%"}  >
            <Box  minHeight={"85vh"} minWidth={"100vw"}>
                <Box  padding={2}  minWidth={"100vw"} minHeight={"100vh"} >
                    <Typography color="#ffffff">Стартовый экран</Typography>
                </Box>
            </Box>


        </Box>
    )

    // переключатель между типами редакторов
    const editorContent =(
        <div>
            {isNoFileOpenedRef.current===true && noFileOpened}
            {(isJavaFileRef.current ===true && isNoFileOpenedRef.current===false) && javaEditorContent}
            { (isJavaFileRef.current===false && isNoFileOpenedRef.current===false) && slateContent}

        </div>

    )


    // bottom value
    const [bottomValue, setBottomValue] = useState(0);


    // первоначальная загрузка данных и настройка websocket

    useEffect(() => {
        console.log("initialization")
        loadStructure()


        if (!clientRef.current) {
            const client = new Client({
                brokerURL: '/ws/notifications',


                debug: function (str) {
                    //console.log(str+" debug");
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });



            client.onConnect = function (frame) {
                // Do something; all subscriptions must be done in this callback.
                // This is needed because it runs after a (re)connect.
                client.subscribe("/projects/"+project_id, (message) => {

                    const update = JSON.parse(message.body);

                    console.log(update+" received");

                    if (update.type==="project_sub" || update.type==="project_unsub"){

                        console.log("действие со статусом "+update.type)
                        onlineList()


                    }

                    if (update.type==="java_project_participant_add" || update.type==="java_project_participant_remove"){
                        participant_action_processing(update);
                    }

                    if (update.type === "java_project_file_add"){
                        file_add_processing(update)
                    }
                    if (update.type === "java_project_directory_add"){
                        directory_add_processing(update)
                    }

                    if (update.type==="java_project_removal"){
                        navigate("/users/"+authUsernameRef.current+"/projects")
                    }


                    if (update.type==="java_project_file_save") {
                        file_save_processing(update)
                    }

                    if (update.type === "java_project_file_move"){
                        file_move_processing(update)
                    }

                    if (update.type === "java_project_directory_move"){
                        directory_move_processing(update)
                    }




                    // уведомление
                    if (update.type==="java_project_file_save_system"){
                        setBarNotificationContent("данные сохранены ")
                        setShowBarNotification(true)
                    }

                    if (update.type==="java_project_file_removal") {
                        file_removal_processing(update)
                    }

                    if (update.type === "java_project_directory_removal"){
                        directory_removal_processing(update)
                    }



                    //console.log(update);

                }



                );
            };

            client.onStompError = function (frame) {
                // Invoked when the broker reports an error.
                // Bad login/passcode typically causes an error.
                // Compliant brokers set the `message` header with a brief message; the body may contain details.
                // Compliant brokers terminate the connection after any error.
                console.log('Broker reported error: ' + frame.headers['message']);
                console.log('Additional details: ' + frame.body);
            };



            client.activate();
            clientRef.current = client;
        }
        return () => {
            if (clientRef.current) {


                clientRef.current.deactivate().then(() => {
                    console.log('disconnected');
                });
                clientRef.current = null;

            }

        }




    }, []);


    const participant_action_processing = useCallback((event)=>{
        setBarNotificationContent(event.message)
        setShowBarNotification(true)
        if (event.type==="java_project_participant_remove"){
            let data = JSON.parse(event.data);

            if (data.uuid===authUUIDRef.current){
                navigate("/users/"+authUsernameRef.current+"/projects");
            }
        }
        loadStructure()

    }, [])

    const directory_add_processing = useCallback((event)=>{
        let requestCorrelationId = event.context.correlationId;
        let requestRenderId = event.context.renderId;
        if (addEntityDialogOpenRef.current === true && renderId === requestRenderId && addEntityCorrelationIdRef.current===requestCorrelationId) {
            setAddEntityProcessMessage(event.message);

        }
        if (event.status === "SUCCESS"){
            setAddEntityProcessMessage("Сущность добавлена")
            console.log("успешное добавление")
            loadStructure()
        }
    }, [])

    const file_add_processing = useCallback((event)=>{
        let requestCorrelationId = event.context.correlationId;
        let requestRenderId = event.context.renderId;
        console.log(addEntityCorrelationIdRef.current)

        console.log(requestCorrelationId)

        console.log(renderId)
        console.log(requestRenderId)

        if (addEntityDialogOpenRef.current === true && renderId === requestRenderId && addEntityCorrelationIdRef.current===requestCorrelationId) {
            setAddEntityProcessMessage(event.message);

        }
        if (event.status === "SUCCESS"){
            setAddEntityProcessMessage("Сущность добавлена")
            console.log("успешное добавление")
            loadStructure()
        }
    }, [])


    const directory_move_processing = useCallback((event)=>{

        console.log(event)
        let correlationId = event.context.correlationId;
        if (event.status==="SUCCESS"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody("Директория успешно перемещена")
                setSimpleYesOrNotDialogPhase("SUCCESS")
                simpleYesOrNotDialogPhaseRef.current = "SUCCESS"



            }

            loadStructure()

        }

        if (event.status==="PROCESSING"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message);




            }



        }

        if (event.status==="POLLING"){
            let data = JSON.parse(event.data);


            // todo тут нужен механизм принадлежности к контексту
            if(event.context.username!==authUsernameRef.current && Number(data.triggerInfo.fileId)===openedFileIdRef.current){
                console.log(event.context.username+" polling initiator username");
                console.log(authUsernameRef.current+" auth username")
                pollingAnswer(JSON.stringify({
                    decision:false, // false означает, что необходимо время на принятие решения
                    content: "No"
                }), correlationId)

                openPollingDialogWithTimer("Уведомление от пользователя", event.context.username+" собирается переместить директорию, который вы смотрите. Перемещаем?",
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // false означает, что необходимо время на принятие решения
                            content: "Yes"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    },
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // true - ответ однозначен
                            content: "No"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    }

                )
            }
        }

        if (event.status==="ERROR"){

            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message)
                setSimpleYesOrNotDialogPhase("FAIL")
                simpleYesOrNotDialogPhaseRef.current = "FAIL"



            }


        }


    }, [])



    const file_move_processing = useCallback((event)=>{

        console.log(event)
        let correlationId = event.context.correlationId;
        if (event.status==="SUCCESS"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody("Файл успешно перемещен")
                setSimpleYesOrNotDialogPhase("SUCCESS")
                simpleYesOrNotDialogPhaseRef.current = "SUCCESS"



            }

            loadStructure()

        }

        if (event.status==="PROCESSING"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message);




            }



        }

        if (event.status==="POLLING"){
            let data = JSON.parse(event.data);


            // todo тут нужен механизм принадлежности к контексту
            if(event.context.username!==authUsernameRef.current && Number(data.triggerInfo.fileId)===openedFileIdRef.current){
                console.log(event.context.username+" polling initiator username");
                console.log(authUsernameRef.current+" auth username")
                pollingAnswer(JSON.stringify({
                    decision:false, // false означает, что необходимо время на принятие решения
                    content: "No"
                }), correlationId)

                openPollingDialogWithTimer("Уведомление от пользователя", event.context.username+" собирается переместить файл, который вы смотрите. Перемещаем?",
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // false означает, что необходимо время на принятие решения
                            content: "Yes"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    },
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // true - ответ однозначен
                            content: "No"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    }

                )
            }
        }

        if (event.status==="ERROR"){

            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message)
                setSimpleYesOrNotDialogPhase("FAIL")
                simpleYesOrNotDialogPhaseRef.current = "FAIL"



            }


        }


    }, [])



    const directory_removal_processing = useCallback((event)=>{
        console.log(event)
        let correlationId = event.context.correlationId;
        if (event.status==="SUCCESS"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody("Директория успешно удалена")
                setSimpleYesOrNotDialogPhase("SUCCESS")
                simpleYesOrNotDialogPhaseRef.current = "SUCCESS"



            }

            loadStructure()

        }

        if (event.status==="PROCESSING"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message);




            }



        }



        if (event.status==="POLLING"){
            let data = JSON.parse(event.data);


            // todo тут нужен механизм принадлежности к контексту
            if(event.context.username!==authUsernameRef.current){
                console.log(event.context.username+" polling initiator username");
                console.log(authUsernameRef.current+" auth username")
                pollingAnswer(JSON.stringify({
                    decision:false, // false означает, что необходимо время на принятие решения
                    content: "No"
                }), correlationId)

                openPollingDialogWithTimer("Уведомление от пользователя", event.context.username+" собирается удалить просматриваемый вами директорию. Удаляем?",
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // false означает, что необходимо время на принятие решения
                            content: "Yes"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    },
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // true - ответ однозначен
                            content: "No"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    }

                )
            }
        }

        if (event.status==="ERROR"){

            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message)
                setSimpleYesOrNotDialogPhase("FAIL")
                simpleYesOrNotDialogPhaseRef.current = "FAIL"



            }


        }
    }, [])


    const file_removal_processing = useCallback((event)=>{
        console.log(event)
        let correlationId = event.context.correlationId;
        if (event.status==="SUCCESS"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody("Файл успешно удален")
                setSimpleYesOrNotDialogPhase("SUCCESS")
                simpleYesOrNotDialogPhaseRef.current = "SUCCESS"



            }

            loadStructure()

        }

        if (event.status==="PROCESSING"){

            console.log(correlationId,simpleYesOrNotDialogCorrelationIdRef.current, simpleYesOrNotDialogOpenRef.current );
            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message);




            }



        }

        if (event.status==="POLLING"){
            let data = JSON.parse(event.data);



            if(event.context.username!==authUsernameRef.current && Number(data.triggerInfo.fileId)===openedFileIdRef.current){
                console.log(event.context.username+" polling initiator username");
                console.log(authUsernameRef.current+" auth username")
                pollingAnswer(JSON.stringify({
                    decision:false, // false означает, что необходимо время на принятие решения
                    content: "No"
                }), correlationId)

                openPollingDialogWithTimer("Уведомление от пользователя", event.context.username+" собирается удалить просматриваемый вами файл. Удаляем?",
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // false означает, что необходимо время на принятие решения
                            content: "Yes"
                        }), correlationId)
                        closePollingDialogWithTimer()
                },
                    ()=>{
                        pollingAnswer(JSON.stringify({
                            decision:true, // true - ответ однозначен
                            content: "No"
                        }), correlationId)
                        closePollingDialogWithTimer()
                    }

                )
            }
        }

        if (event.status==="ERROR"){

            if (correlationId===simpleYesOrNotDialogCorrelationIdRef.current && simpleYesOrNotDialogOpenRef.current){
                setSimpleYesOrNotDialogBody(event.message)
                setSimpleYesOrNotDialogPhase("FAIL")
                simpleYesOrNotDialogPhaseRef.current = "FAIL"



            }


        }
    }, [])




    const file_save_processing = useCallback((event) => {
        // если ивент приходит с другого рендера и совпадает с текущим открытым файлом, мы должны обновить содержимое редактора
        //console.log(event.context.renderId, openedFileIdRef.current, event.eventData)


        console.log(event.data)
        let data = JSON.parse(event.data);
        console.log("parsed", data);


        /*
        if (event.status==="POLLING"){

            let correlationId = event.context.correlationId;

            let address = "/projects/java/"+project_id+"/actions/trigger/"+correlationId;
            let body = JSON.stringify({
                decision:true, // false означает, что необходимо время на принятие решения
                content: "Activity polling"
            })
            api.post(address, body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log("polling query");
        }

         */






        if (event.context.renderId!==renderId && openedFileIdRef.current===data.fileId){

            let notification = "";
            if (event.status==="SUCCESS"){
                notification = event.context.username+" ✍︎"
            }
            else if (event.status==="ERROR"){
                notification = "ошибка сохранения"
            }
            else {
                notification = "сохраняем..."
            }
            setBarNotificationContent(notification )
            setShowBarNotification(true)

            if (event.status==="SUCCESS"){
                let content = data.content;
                if (isJavaFileRef.current){



                    javaValueRef.current = content;
                    setValueJava(content);

                    javaEditorCursorRef.current = javaEditorRef.current.view.state.selection.ranges[0].from;





                }

                else {
                    console.log ("update slate after saving event")
                    let currentCursor = undefined
                    // пытаемся запомнить позицию курсора
                    try {
                        currentCursor = slateEditor.selection.anchor;
                    }
                    catch(err) {

                    }

                    isRemote.current  =true;

                    const editorRange = {
                        anchor: Editor.start(slateEditor, []),
                        focus: Editor.end(slateEditor, []),
                    };

                    Transforms.delete(slateEditor, { at: editorRange }); // Очищаем текущее содержимое

                    let lines = content.split('/n');

                    let nodes = lines.map(line => {
                        return {
                            type: 'paragraph',
                            children: [{ text: line }],
                        }
                    })

                    Transforms.insertNodes(
                        slateEditor,
                        nodes,
                        { at: [0] }
                    );

                    // позиция курсора
                    Transforms.select(slateEditor, currentCursor);






                }
            }



        }
    }, [])




    // при получении polling события нужно отправить activity ивент (decision = false) - так мы гарантируем, что наше мнение учтут
    const pollingAnswer = async(answer, corrId)=>{
        try {

            console.log("loadStructure")
            let way = 'api//projects/java/'+project_id+'/actions/trigger/'+corrId
            await api.post(way, answer, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": corrId}});


        } catch (error) {
            console.log(error);

        }
    }

    const onlineList = async () => {
        try {
            let statusMapNew = structuredClone(statusMap)
            console.log("online request")
            const online = await api.get("/api/observer/getProjectSubscriptions/"+project_id)
            //console.log(resolveMap)
            let onlineUUIDs = []

            online.data.forEach(onlineMember=>{
                //console.log(onlineMember.uuid, "is online")

                statusMapNew.set(onlineMember.uuid, "online")
                onlineUUIDs.push(onlineMember.uuid);

            })

            statusMapNew.forEach((value, key)=>{

                //console.log(key, onlineUUIDs, onlineUUIDs.includes(key) )
                if (!onlineUUIDs.includes(key)){
                    statusMapNew.set(key, "offline")
                }




            })

            setStatusMap(statusMapNew)


        }
        catch (error) {
            console.log("ошибка запроса онлайна "+error);
        }
    }

    const loadStructure = async () => {
        try {

            console.log("loadStructure")
            const response = await api.get('/api/projects/java/'+project_id+'/actions/read');

            if (response.status === 200) {

                console.log(response.data)

                setProjectName(response.data.name);
                setTreeData(response.data.structure);



                //await resolveAuthor(response.data.author);
                await resolveProjectMembers(response.data.author, response.data.participants);




            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }

    const resolveProjectMembers = async (author_uuid, participants)=>{
        try {
            let param = ""
            participants.forEach((participant, index) => {
                param+=participant+",";
            })

            param+=author_uuid
            const response = await api.get('/auth/resolveBatch?uuids='+param);

            if (response.status === 200) {


                let resolveMapNew = new Map()
                response.data.forEach(item => {

                    resolveMapNew.set(item.uuid, {uuid:item.uuid, username:item.username})
                    statusMap.set(item.uuid, "offline")
                })

                setResolveMap(resolveMapNew)



                setAuthorUUID(author_uuid)



            }
            else {
                console.log(response.status);
            }
            // обновляем статистику онлайна
            onlineList()
        } catch (error) {
            console.log(error);

        }
    }



    const removeParticipant = async (uuid, username)=>{
        console.log(uuid)

        let corrId = uuid_gen()
        let address = "/api/projects/java/removeParticipant"
        let body = JSON.stringify({
            projectId:project_id,
            userId:uuid,
            username:username
        })

        try {
            const response = await api.post(address, body, {headers: {'Content-Type': 'application/json', "X-Render-ID":renderId,
                    "X-Correlation-ID": corrId}});
            console.log(response);
            if (response.status === 204) {

                // todo нужно как то обновить список participants во внешнем компоненте

            }
            else {


            }
        }
        catch (error) {


        }

        console.log(body)
    }

    const loadRecentFiles = async () => {
        let address  = "/api/projects/java/"+project_id+"/actions/readRecentFiles";
        try {
            const response = await api.get(address);

            if (response.status === 200) {

                setRecentFiles(response.data);
                console.log(response.data)
                setRecentFilesDialogState(true)

            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }

    const autosave = async ()=>{
        if (openedFileIdRef.current==null){
            return;
        }

        let address = "/api/projects/java/"+project_id+"/actions/autosave";
        let content;
        if (isJavaFileRef.current){
            content = javaValueRef.current
        }
        else {

            content = slateEditor.children.map(node=>
                Node.string(node)).join('\n')
        }

        const correlationId = uuid();

        let body = JSON.stringify({
            content: content,
            fileId: openedFileIdRef.current
        })

        api.post(address, body, {headers: {'Content-Type': 'application/json',
                "X-Render-ID":renderId,
                "X-Correlation-ID": correlationId}});


    }

    const removeDirectory = async ()=>{
        let directory_id = selectedTreeData.data.originalId
        let address = "/api/projects/java/"+project_id+"/actions/removeDirectory"

        let body = JSON.stringify({
            directoryId:directory_id
        })
        const correlationId = uuid();
        console.log(correlationId, "generated")
        simpleYesOrNotDialogCorrelationIdRef.current = correlationId;

        try {
            const response = await api.post(address,body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                setSimpleYesOrNotDialogPhase("WAITING")
                setSimpleYesOrNotDialogBody("Согласуем удаление...")


            }
            else {
                // todo ошибка

                setSimpleYesOrNotDialogPhase("FAIL")
                setSimpleYesOrNotDialogBody("ошибка удаления "+response.data.message)

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error, "ошибка!!!")
            setSimpleYesOrNotDialogPhase("FAIL")
            setSimpleYesOrNotDialogBody(error.response.data.message)

        }

    }

    const moveDirectory = async (child_id, parent_id)=>{
        let address = "/api/projects/java/"+project_id+"/actions/moveDirectory"

        let body = JSON.stringify({
            directoryId:child_id,
            parentId:parent_id
        })

        const correlationId = uuid();
        console.log(correlationId, "generated")
        simpleYesOrNotDialogCorrelationIdRef.current = correlationId;

        try {
            const response = await api.post(address,body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                setSimpleYesOrNotDialogPhase("WAITING")
                setSimpleYesOrNotDialogBody("Согласуем перемещение...")


            }
            else {
                // todo ошибка

                setSimpleYesOrNotDialogPhase("FAIL")
                setSimpleYesOrNotDialogBody("ошибка перемещения "+response.data.message)

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error, "ошибка!!!")
            setSimpleYesOrNotDialogPhase("FAIL")
            setSimpleYesOrNotDialogBody(error.response.data.message)

        }




    }

    const moveFile = async (file_id, directory_id)=>{
        console.log(file_id, directory_id);

        let address = "/api/projects/java/"+project_id+"/actions/moveFile"

        let body = JSON.stringify({
            fileId:file_id,
            parentId:directory_id
        })

        const correlationId = uuid();
        console.log(correlationId, "generated")
        simpleYesOrNotDialogCorrelationIdRef.current = correlationId;

        try {
            const response = await api.post(address,body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                setSimpleYesOrNotDialogPhase("WAITING")
                setSimpleYesOrNotDialogBody("Согласуем перемещение...")


            }
            else {
                // todo ошибка

                setSimpleYesOrNotDialogPhase("FAIL")
                setSimpleYesOrNotDialogBody("ошибка перемещения "+response.data.message)

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error, "ошибка!!!")
            setSimpleYesOrNotDialogPhase("FAIL")
            setSimpleYesOrNotDialogBody(error.response.data.message)

        }


    }


    const removeFile = async ()=>{
        let file_id = selectedTreeData.data.originalId
        let address = "/api/projects/java/"+project_id+"/actions/removeFile"

        let body = JSON.stringify({
            fileId:file_id
        })
        const correlationId = uuid();
        console.log(correlationId, "generated")
        simpleYesOrNotDialogCorrelationIdRef.current = correlationId;

        try {
            const response = await api.post(address,body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                setSimpleYesOrNotDialogPhase("WAITING")
                setSimpleYesOrNotDialogBody("Согласуем удаление...")


            }
            else {
                // todo ошибка

                setSimpleYesOrNotDialogPhase("FAIL")
                setSimpleYesOrNotDialogBody("ошибка удаления "+response.data.message)

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error, "ошибка!!!")
            setSimpleYesOrNotDialogPhase("FAIL")
            setSimpleYesOrNotDialogBody(error.response.data.message)

        }

    }


    const addNewEntity = async ()=>{
        if (selectedTreeData===null || selectedTreeData.data.id.startsWith("file_")) {
            console.log("missing selected tree member");
            return;
        }
        openAddEntityDialog()
    }

    const removeFromTree = async()=>{


        console.log(selectedTreeData)
        if (selectedTreeData===null) {
            console.log("missing selected tree member");
        }

        if (selectedTreeData.data.id.startsWith("file_")){




            openSimpleYesOrNotDialog("Удаление "+selectedTreeData.data.name, "Вы собираетесь удалить данный файл", ()=>{
                removeFile()
            })



        }

        if (selectedTreeData.data.id.startsWith("directory_")){
            openSimpleYesOrNotDialog("Удаление "+selectedTreeData.data.name, "Вы собираетесь удалить данную директорию", ()=>{
                removeDirectory()
            })
        }


    }
    // создание файла или директории


    const saveFile = async ()=>{
        console.log(openedFileIdRef.current)
        if (openedFileIdRef.current==null){
            return;
        }
        let address = "/api/projects/java/"+project_id+"/actions/saveFile";

        let content;
        if (isJavaFileRef.current){
            content = javaValueRef.current
        }
        else {
            //content = valueForSlateRef.current[0].children[0].text; //todo тут нужно как то иначе
            //content = Node.string(slateEditor);

            content = slateEditor.children.map(node=>
                Node.string(node)).join('\n')


        }




        const correlationId = uuid();

        let body = JSON.stringify({
            content: content,
            fileId:openedFileIdRef.current

        })

        console.log(body)

        try {
            const response = await api.post(address, body, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания


            }
            else {
                // todo ошибка

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере


        }



    }

    const loadFile = async (id) => {
        if (id===openedFileIdRef.current) return;
        console.log(id)
        console.log(project_id)

        let address  = "/api/projects/java/"+project_id+"/actions/readFile/"+id;
        try {
            const response = await api.get(address);

            if (response.status === 200) {

                console.log(response.data)
                let extension = response.data.extension;
                if (extension === "java"){
                    setValueJava(response.data.content);
                    javaValueRef.current = response.data.content;

                    isJavaFileRef.current=true

                }
                else {

                    if (isJavaFileRef.current){
                        isJavaFileRef.current=false

                        console.log("сценарий переключения с java")

                        let slateSample = [
                            {
                                type: 'paragraph',
                                children: [{ text: response.data.content }],
                            },
                        ]












                        setValueForSlate(slateSample);
                        valueForSlateRef.current = slateSample;
                    }
                    else {
                        console.log("сценарий переключения с slate")
                        isRemote.current  =true;

                        const editorRange = {
                            anchor: Editor.start(slateEditor, []),
                            focus: Editor.end(slateEditor, []),
                        };

                        Transforms.delete(slateEditor, { at: editorRange }); // Очищаем текущее содержимое

                        let lines = response.data.content.split('/n');

                        let nodes = lines.map(line => {
                            return {
                                type: 'paragraph',
                                children: [{ text: line }],
                            }
                        })

                        Transforms.insertNodes(
                            slateEditor,
                            nodes,
                            { at: [0] }
                        );
                    }





                }

                setOpenedFileName(response.data.name+"."+response.data.extension);
                openedFileIdRef.current=id;




                isNoFileOpenedRef.current = false


            }
            else {
                console.log(response.status);
                isNoFileOpenedRef.current = true
            }
        } catch (error) {
            console.log(error);
            isNoFileOpenedRef.current = true

        }

    }






    return (
        <Box sx={{ display: 'flex', bgcolor:"#282c34",
            outline: '2px solid red'









        }}>
            <CssBaseline />
            <AppBar component="nav" sx={{
                backgroundColor: 'primary.main',
                opacity: 0.85, // Легкая полупрозрачность
                backdropFilter: 'blur(10px)', // Эффект размытия (опционально)
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

                    {showBarNotification && <Typography >{barNotificationContent}</Typography>}
                    <Box sx={{ flexGrow: 1 }} />







                    <Button color={"black"} onClick={loadRecentFiles}>{openedFileName}</Button>




                    <IconButton onClick={saveFile} color="black">
                        <SaveIcon/>
                    </IconButton>
                    <IconButton color="black">
                        <AutoAwesomeIcon/>
                    </IconButton>



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
            <Box component="main"
            sx={{
                outline: '2px solid red'

            }}
            >








                <Toolbar  variant={"dense"} />

                {pageRegime === "Editor" &&editorContent}
                {pageRegime==="Console" && consoleComponent}
                {pageRegime==="Chat" && chatComponent}




                <Dialog open={recentFilesDialogState} onClose={()=>{
                    setRecentFilesDialogState(false)
                }}>
                    <DialogTitle>Последние файлы</DialogTitle>
                    <List sx={{pt:0}}>

                        {recentFiles.map(file=>(
                            <ListItem onClick={()=>{
                                setRecentFilesDialogState(false)
                                loadFile(file.id)
                            }} key={file.id}>
                                <ListItemText> {file.name+"."+file.extension}</ListItemText>

                            </ListItem>
                        ))}

                    </List>
                </Dialog>



                <Box sx={{

                    position: 'sticky', // Use 'sticky' for relative sticky positioning
                    bottom: 0,          // Stick to the bottom of the parent container
                    //padding: 2,         // Add some padding
                    backgroundColor: 'background.paper', // Match the background
                    zIndex: 1,          // Ensure it's above other scrolling content
                    display: 'flex',
                    justifyContent: 'center', // Align buttons to the right
                    gap: 2, // Space between buttons



                }}>
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



                <PollingDialogWithTimer
                close={closePollingDialogWithTimer}
                opened = {pollingDialogWithTimerOpen}

                title={pollingDialogWithTimerTitle}
                body={pollingDialogWithTimerBody}
                onNo = {()=>{
                    pollingDialogWithTimerNoActionRef.current()
                }}

                onYes = {()=>{
                    pollingDialogWithTimerYesActionRef.current()
                }}
                >

                </PollingDialogWithTimer>

                <SimpleYesOrNotDialog

                api={api}
                opened={simpleYesOrNotDialogOpen}
                close={closeSimpleYesOrNotDialog}
                phase={simpleYesOrNotDialogPhase}
                changeCorrelationId={(value)=>{
                    simpleYesOrNotDialogCorrelationIdRef.current = value;

                }}

                changeDialogPhase={(value)=>{
                    simpleYesOrNotDialogPhaseRef.current = value;
                    setSimpleYesOrNotDialogPhase(value);

                }}

                title = {simpleYesOrNotDialogTitle}
                body = {simpleYesOrNotDialogBody}

                action={()=>{
                    simpleYesOrNotDialogActionRef.current()
                }}

                >

                </SimpleYesOrNotDialog>






                <AddEntityDialog parent={selectedTreeData}

                                 projectId={project_id}
                                 renderId={renderId}
                api={api}
                opened={addEntityDialogOpen}
                close={closeAddEntityDialog}
                                 message={addEntityProcessMessage}
                                 setMessage={setAddEntityProcessMessage}
                                 setCorrelationId={addEntityDialogChangeCorrelationId}
                ></AddEntityDialog>







            </Box>


        </Box>
    )
}