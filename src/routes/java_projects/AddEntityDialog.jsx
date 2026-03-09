import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton, TextField,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useState} from "react";
import * as React from "react";
// api, close, parentId, setCorrelationId, dialogMessage
export function AddEntityDialog(props) {
    const handleClose = () => {


        setPhase("choice")
        setTitle(null)
        props.close()
    };
    const api = props.api;
    const [title, setTitle] = useState(null);

    const [phase, setPhase] = useState("choice");



    const createDirectory = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
    }

    const createFile = (e)=>{
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
    }

    const resolveTitle = () =>{
        if (title===null){
            return props.parent===null?"":"Добавить к "+props.parent.data.name
        }
        else return title;}


    return (
        <Dialog open={props.opened} onClose={handleClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 6  // Добавляем отступ справа для кнопки закрытия
            }}>{resolveTitle()}</DialogTitle>
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
                {phase==="choice" && <div>
                    <DialogContentText>
                        Что хотите создать?
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={()=>{
                            setPhase("file");
                            setTitle("Выберите имя и расширение")
                        }}>Файл</Button>
                        <Button onClick={()=>{setPhase("directory"); setTitle("Выберите имя")}}>Директория</Button>
                    </DialogActions>


                </div>}

                {phase==="directory" &&
                    <form onSubmit={createDirectory}>
                    <Box mb={3}>

                        <DialogContentText>
                            Название папки
                        </DialogContentText>

                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="directory_name"
                            name="directory_name"
                            fullWidth
                            variant="standard"
                            multiline={true}
                        />
                        <DialogActions>
                            <Button onClick={handleClose}>Отмена</Button>
                            <Button type="submit">Создать</Button>
                        </DialogActions>



                    </Box>
                    </form>}


                {phase==="file"&&

                    <form onSubmit={createFile}>
                    <Box mb={3}>
                        <DialogContentText>
                            Название файла
                        </DialogContentText>

                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="file_name"
                            name="file_name"
                            fullWidth
                            variant="standard"

                        />
                        <DialogContentText>
                            Раcширение файла
                        </DialogContentText>

                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="file_extension"
                            name="file_extension"
                            fullWidth
                            variant="standard"

                        />

                        <DialogActions>
                            <Button onClick={handleClose}>Отмена</Button>
                            <Button type="submit">Создать</Button>
                        </DialogActions>
                    </Box>
                    </form>
                }


            </DialogContent>
            </Dialog>
    )
}