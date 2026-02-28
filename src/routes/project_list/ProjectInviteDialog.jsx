import {
    Box,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    InputBase,
    Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from '@mui/icons-material/Menu';
import BackHandIcon from '@mui/icons-material/BackHand';

import DirectionsIcon from '@mui/icons-material/Directions';
import {useState} from "react";
import {useLocation} from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import {v4 as uuid_gen} from "uuid";

/*
todo после расширения функционала ссылки будут зависеть от типа проекта
 */
export default function ProjectInviteDialog(props){

    const [value, setValue] = useState("");
    const [searchResult, setSearchResult] = useState([]);

    const location = useLocation();


    const handleClose = () => {



        setValue("")
        setSearchResult([])

        props.close()
    };

    const searchRequest = async (str)=>{
        if (str.length<3){
            setSearchResult([]);
            return;
        }
        let address = "/search?"+"startsWith="+str+"&number=0&size=5";
        try {
            const response = await props.auth.get(address,{headers: {'Content-Type': 'application/json'}});
            console.log(response);
            if (response.status === 200) {

                console.log("response:", response);
                console.log(props);
                setSearchResult(response.data.content.filter(item => (item.username!==props.authUsername) && (!props.participants.some(member=>member===item.uuid))))

            }
            else {


            }
        }
        catch (error) {


        }

    }

    const handleParticipantAdd = async(user_uuid, username)=>{
        let corrId = uuid_gen()
        let address = "/projects/java/addParticipant"
        let body = JSON.stringify({
            projectId:props.projectId,
            userId:user_uuid,
            username:username
        })
        console.log(body);

        try {
            const response = await props.api.post(address, body, {headers: {'Content-Type': 'application/json', "X-Render-ID":props.renderId,
                    "X-Correlation-ID": corrId}});
            console.log(response);
            if (response.status === 204) {
                await props.updateCallback()

                searchRequest(value)

                // todo нужно как то обновить список participants во внешнем компоненте

            }
            else {


            }
        }
        catch (error) {


        }


    }

    const handleLinkGenerate = async ()=>{
        console.log(props.projectId)
        let address = "/projects/java/createInviteToken"
        let body = JSON.stringify({
            projectId:props.projectId
        })



        try {
            const response = await props.api.post(address, body, {headers: {'Content-Type': 'application/json'}});
            console.log(response);
            if (response.status === 200) {

                setValue(window.location.hostname+":"+window.location.port+"/invite/projects/java/"+response.data)

            }
            else {


            }
        }
        catch (error) {


        }

    }
    return (
        <Dialog open={props.opened} onClose={handleClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 6  // Добавляем отступ справа для кнопки закрытия
            }}>Приглашение участников</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent>
                <Box mb={3}>
                <DialogContentText>

                    Создать ссылку-приглашение:
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                    >

                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            multiline={true}
                            value={value}
                            readOnly={true}
                            inputProps={{ 'aria-label': 'search google maps' }}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleLinkGenerate}>
                            <BackHandIcon />
                        </IconButton>
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

                    </Paper>



                </DialogContentText>
                </Box>


                <Box mb={3}>
                <DialogContentText>
                    Добавить пользователя в проект:
                    <Paper
                        component="form"
                        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
                    >

                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder={"имя..."}
                            onChange={(e)=>{
                                console.log("fa")
                                searchRequest(e.target.value)
                            }}

                            inputProps={{ 'aria-label': 'search google maps' }}
                        />



                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />



                    </Paper>


                </DialogContentText>


                </Box>

                <Box mb={3} sx={{minHeight: 280}}>
                    {searchResult
                        .map((item, index)=>{

                        return (
                            <Box
                                key={item.username}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1
                                }}
                            >
                                <DialogContentText sx={{ fontWeight: 500 }}>
                                    {item.username}
                                </DialogContentText>
                                <IconButton size="small" color="secondary" onClick={()=>{
                                    console.log(item)
                                    handleParticipantAdd(item.uuid, item.username);
                                }}>
                                    <AddIcon />
                                </IconButton>
                            </Box>
                        );
                    })}
                </Box>
            </DialogContent>


            </Dialog>
    )
}