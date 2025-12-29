import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { v4 as uuid } from 'uuid';
import {
    Box,
    Checkbox,
    DialogActions,
    DialogContent,
    DialogContentText, FormControl,
    FormControlLabel,
    Grid, InputLabel, Select,
    TextField
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProjectCreationDialog(props) {



    const [type, setType] = React.useState('Maven');



    const handleChange = (event) => {
        setType(event.target.value);
    };


    const handleClose = () => {
        props.changeDialogState("PREPARING");
        props.changeCorrelationId(null);
        props.close(true);


    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        // X-Correlation-ID
        const correlationId = uuid();

        props.changeCorrelationId(correlationId);

        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);

        let address = "/projects/java/createProject";

        let body = JSON.stringify({
            projectType: type,
            name: formJson.project_name,
            prompt: formJson.project_prompt,
            needEntryPoint:formJson.need_entry!==null

        })

        console.log(body);
        console.log(correlationId+' set inside dialog');


        try {
            const response = await props.api.post(address, body, {headers: {'Content-Type': 'application/json', "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                props.changeDialogState("WAITING");
            }
            else {
                console.log(response)
                props.setMessage(response.status)
                // todo уведомление о том, что ошибка на сервере
                props.changeDialogState("FAIL")
            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            console.log(error)
            props.setMessage(response.status)
            props.changeDialogState("FAIL")
        }






    }

    return (

            <Dialog
                fullScreen
                open={props.opened}
                onClose={handleClose}
                slots={{
                    transition: Transition,
                }}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Настройка проекта
                        </Typography>

                    </Toolbar>
                </AppBar>



                <DialogContent sx={{ paddingBottom: 0 }}>


                    {props.state === "PREPARING" &&

                        <form onSubmit={handleSubmit}>
                            <Box mb={3}>
                                <DialogContentText>
                                    Введите название проекта
                                </DialogContentText>

                                <TextField
                                    autoFocus
                                    required
                                    margin="dense"
                                    id="name"
                                    name="project_name"
                                    fullWidth
                                    variant="standard"
                                    multiline={true}
                                />

                            </Box>



                            <Box mb={3}>

                                <DialogContentText>
                                    Выберите тип проекта
                                </DialogContentText>





                                <FormControl fullWidth>

                                    <Select
                                        labelId="select_type"
                                        id="select_type"
                                        value={type}

                                        onChange={handleChange}
                                    >
                                        <MenuItem value={"Maven"}>Maven</MenuItem>
                                        <MenuItem value={"Gradle"}>Gradle</MenuItem>

                                    </Select>
                                </FormControl>

                            </Box>

                            <Box mb={3}>
                                <DialogContentText>
                                    Введите промпт
                                </DialogContentText>

                                <TextField
                                    autoFocus

                                    margin="dense"
                                    id="name"
                                    name="project_prompt"
                                    fullWidth

                                    variant="standard"
                                    multiline={true}
                                />

                            </Box>


                            <FormControlLabel control={<Checkbox defaultChecked />} label="Создать точку входа" name="need_entry" />





                            <DialogActions>
                                <Button onClick={handleClose}>Отмена</Button>
                                <Button type="submit">Создать!</Button>
                            </DialogActions>
                        </form>

                    }

                    {props.state === "WAITING" &&<Box mb={3}>

                        <Typography>Создание проекта...</Typography>
                    </Box>}


                    {props.state === "SUCCESS" &&<Box mb={3}>
                        <Typography>Проект успешно создан</Typography>
                    </Box>}

                    {props.state==="FAIL" && <Box mb={3}>
                        <Typography>Ошибка</Typography>
                        <Typography>{props.message}</Typography>
                    </Box>}









                </DialogContent>



            </Dialog>



    );
}