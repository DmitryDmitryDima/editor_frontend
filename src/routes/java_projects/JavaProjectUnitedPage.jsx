import {useNavigate, useParams} from "react-router-dom";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {Editable, Slate, withReact} from "slate-react";
import {createEditor, Editor, Node, Transforms} from "slate";
import SourceIcon from '@mui/icons-material/Source';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SaveIcon from '@mui/icons-material/Save';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { MdOutlineFileUpload } from "react-icons/md";
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
    Dialog,
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

import {GoPencil} from "react-icons/go";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from "@mui/icons-material/Create";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import ChatIcon from "@mui/icons-material/Chat";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import {v4 as uuid} from "uuid";
import {Client} from "@stomp/stompjs";
import {SimpleYesOrNotDialog} from "./SimpleYesOrNotDialog.jsx";
import {PollingDialogWithTimer} from "./PollingDialogWithTimer.jsx";

export function JavaProjectUnitedPage() {


    const [renderId, setRenderId] = React.useState(uuid());


    const [authUsername, setAuthUsername] = useState("")
    const [authUUID, setAuthUUID] = useState("")

    const authUsernameRef = React.useRef(null);
    const authUUIDRef = React.useRef(null);

    const navigate = useNavigate();
    // api для общения с сервисами
    const api = axios.create({
        baseURL: '/api/',
    });
    // api для общения с сервисами
    const auth = axios.create({
        baseURL: '/auth/',
    });






    // websocket
    const clientRef = useRef(null);

    // автор проекта - username
    const[authorUsername, setAuthorUsername] = useState("");


    // диалоги

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



    }, [])












    // управление токенами
    // Add a request interceptor
    api.interceptors.request.use(
        async (config) => {

            const token = localStorage.getItem('accessToken');

            const decoded = jwtDecode(token);
            const exp = decoded.exp;
            const now = Math.floor(Date.now() / 1000)
            if (token && exp>now) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            else {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);
                    config.headers.Authorization = `Bearer ${response.data.accessToken}`;

                } catch (error) {
                    throw new Error('invalid refresh');
                }
            }
            return config;
        },
        (error) => {

            Promise.reject(error)
        }
    );

    // Add a response interceptor
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            console.log(error)

            // If the error status is 401 and there is no originalRequest._retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error('invalid refreshToken');
                    }
                    const response = await axios.post('/auth/refresh', { refreshToken });


                    localStorage.setItem('accessToken', response.data.accessToken);
                    localStorage.setItem("refreshToken", response.data.refreshToken);

                    // Retry the original request with the new token
                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
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

    const javaEditorRef = useRef(null);
    const javaEditorCursorRef = useRef(null);


    const treeRef = useRef(null);


    /* Drawer настройки*/
    // Структура (Structure)
    // Поиск (Search)
    // Настройки (Settings)
    const [drawerRegime, setDrawerRegime] = useState("Structure");



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
        // todo аккуратнее с sx на родительском box
        <Box padding={1} sx={{maxHeight:"100vh", justifyContent:"space-between", display:"flex", flexDirection:"column"}} >
            <Typography sx={{ my: 2 }}>
                {project_name} by {authorUsername}
            </Typography>
            {authUsername!==authorUsername && <Typography onClick={
                ()=>{navigate("/users/"+authorUsername+"/projects");}
            }>К проектам автора</Typography>}

            <Typography onClick={
                ()=>{navigate("/users/"+authUsername+"/projects");}
            }>Мои проекты {authUsername}</Typography>





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
                <Box sx={{minHeight:"100vh", display:"flex", flexDirection:"column"}}>
                <Tree data={treeData}

                      openByDefault={false}
                      ref={treeRef}
                      width={300}
                      height={200}
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
                            <IconButton>
                                <GoPencil></GoPencil>

                            </IconButton>

                            <IconButton onClick={()=>{
                                removeFromTree();
                            }}>
                                <FaTrash></FaTrash>
                            </IconButton>

                            <IconButton><MdDriveFileMoveOutline></MdDriveFileMoveOutline></IconButton>
                        </ButtonGroup>
                        </Box>



                </Box>}




            {drawerRegime === "Search" && <Typography>Поиск</Typography>}
            {drawerRegime === "Settings" &&<Typography>Настройки</Typography>}









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

        <Box padding={2}  minWidth={"100vw"} minHeight={"100%"} >

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

    // переключатель между типами редакторов
    const editorContent =(
        <div>
            {isJavaFileRef.current ===true && javaEditorContent} { isJavaFileRef.current===false && slateContent}

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
                    console.log(str);
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


                    if (update.type==="java_project_file_save") {
                        file_save_processing(update)
                    }

                    // уведомление
                    if (update.type==="java_project_file_save_system"){
                        setBarNotificationContent("данные сохранены ")
                        setShowBarNotification(true)
                    }

                    if (update.type==="java_project_file_removal") {
                        file_removal_processing(update)
                    }



                    //console.log(update);

                });
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
            let way = '/projects/java/'+project_id+'/actions/trigger/'+corrId
            await api.post(way, answer, {headers: {'Content-Type': 'application/json',
                    "X-Render-ID":renderId,
                    "X-Correlation-ID": corrId}});


        } catch (error) {
            console.log(error);

        }
    }

    const loadStructure = async () => {
        try {

            console.log("loadStructure")
            const response = await api.get('/projects/java/'+project_id+'/actions/read');

            if (response.status === 200) {

                console.log(response.data)

                setProjectName(response.data.name);
                setTreeData(response.data.structure);

                await resolveAuthor(response.data.author);




            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }

    const resolveAuthor = async (author_uuid)=>{
        try {
            const response = await auth.get('/resolveUUID/'+author_uuid);

            if (response.status === 200) {

                console.log(response.data)

                setAuthorUsername(response.data.username);

            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }
    }

    const loadRecentFiles = async () => {
        let address  = "/projects/java/"+project_id+"/actions/readRecentFiles";
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

        let address = "/projects/java/"+project_id+"/actions/autosave/"+openedFileIdRef.current;
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
            content: content
        })

        api.post(address, body, {headers: {'Content-Type': 'application/json',
                "X-Render-ID":renderId,
                "X-Correlation-ID": correlationId}});


    }


    const removeFile = async ()=>{
        let file_id = selectedTreeData.data.originalId
        let address = "/projects/java/"+project_id+"/actions/removeFile/"+file_id;
        const correlationId = uuid();
        console.log(correlationId, "generated")
        simpleYesOrNotDialogCorrelationIdRef.current = correlationId;

        try {
            const response = await api.post(address,null, {headers: {'Content-Type': 'application/json',
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
        /*

        let address = "/projects/java/"+project_id+"/actions/removeFile/"+file_id;
        const correlationId = uuid();

        try {
            const response = await api.post(address, {headers: {'Content-Type': 'application/json',
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

         */

    }

    const saveFile = async ()=>{
        console.log(openedFileIdRef.current)
        if (openedFileIdRef.current==null){
            return;
        }
        let address = "/projects/java/"+project_id+"/actions/saveFile/"+openedFileIdRef.current;

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
            content: content
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

        let address  = "/projects/java/"+project_id+"/actions/readFile/"+id;
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







            }
            else {
                console.log(response.status);
            }
        } catch (error) {
            console.log(error);

        }

    }






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

                    {showBarNotification && <Typography >{barNotificationContent}</Typography>}
                    <Box sx={{ flexGrow: 1 }} />







                    <Button onClick={loadRecentFiles}>{openedFileName}</Button>




                    <IconButton onClick={saveFile} color="primary">
                        <SaveIcon/>
                    </IconButton>
                    <IconButton color="primary">
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
            <Box component="main" >








                <Toolbar variant={"dense"} />

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

            </Box>


        </Box>
    )
}