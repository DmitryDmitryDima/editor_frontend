import { FaTrash } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import PropTypes from "prop-types";
import {
    Avatar,
    Button,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText, TextField
} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import {useParams} from "react-router-dom";


export function DeleteButton({ onClick }) {
    return (
        <button onClick={onClick} >
            <FaTrash />
        </button>
    );
}


export function RenameButton({ onClick }) {
    return (
        <button onClick={onClick} >
            <MdDriveFileRenameOutline />
        </button>
    )
}

export function CreateButton({ onClick }) {
    return (
        <button onClick={onClick} >
            <IoMdAddCircle />
        </button>
    )
}






export function SimpleDialogDelete(props){

    const {user_name} = useParams();

    const { onClose, selectedValue, open} = props;


    const handleClose = () => {
        console.log("закрытие без кнопки")

        onClose("No action");
    };

    // если мы нажимаем нет - закрываем диалог, передавая в родительский компонент значение
    const handleListItemClickNo = ()=>{
        console.log(selectedValue)
        onClose("Cancel deleting")
    }

    const handleListItemClickYes = () => {
        console.log("закрытие с кнопкой "+selectedValue)







        // api call - пробуем удалить
        const apiPath = "/api/users/"+user_name+"/deleteProject/java";

        const deleting = async () => {
            try {
                const body = JSON.stringify({
                    projectId: selectedValue
                })
                const response = await fetch(apiPath, {method:"DELETE", body: body, headers: {'Content-Type': 'application/json'}});
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                onClose("Succesfully deleted")

                //const jsonData = await response.json();
                //setData(jsonData);
            } catch (err) {
                onClose("Error while deleting")
                //setError(err);
            } finally {
                //setLoading(false);

            }
        };

        deleting();


    };



    return(
        <Dialog  open={open} onClose={handleClose}>
            <DialogTitle>Удалить проект?</DialogTitle>
            <List sx={{ pt: 0 }}>


                <ListItem disablePadding>
                    <ListItemButton
                        autoFocus
                        onClick={() => handleListItemClickYes()}
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <CheckIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Да" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        autoFocus
                        onClick={() => handleListItemClickNo()}
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <DoNotDisturbIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary="Нет" />
                    </ListItemButton>
                </ListItem>



            </List>

        </Dialog>
    );


}

SimpleDialogDelete.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.number.isRequired,
};



export function CreationDialog(props){
    const {user_name} = useParams();
    // передаем фукнции для общения с внешним компонентом
    const { onClose, open} = props;

    // закрытие диалога без совершения какого либо действия
    const handleClose = () => {


        onClose("No action");
    };

    // совершение действия
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const name = formJson.project_name;

        const apiPath = "/api/users/"+user_name+"/createProject/java";
        const body = JSON.stringify({
            projectName:name
        })
        console.log("apiPath", apiPath);
        const creating = async () => {
            try {
                const response = await fetch(apiPath, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                onClose("Создан проект "+name);

                //const jsonData = await response.json();
                //setData(jsonData);
            } catch (err) {
                onClose("Ошибка создания")
                //setError(err);
            } finally {
                //setLoading(false);

            }
        };

        creating();




    };


    return(
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Создать проект</DialogTitle>

            <DialogContent sx={{ paddingBottom: 0 }}>
                <DialogContentText>
                    Введите название проекта
                </DialogContentText>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="project_name"
                        label="Имя проекта"
                        fullWidth
                        variant="standard"
                    />
                    <DialogActions>
                        <Button onClick={handleClose}>Отмена</Button>
                        <Button type="submit">Создать!</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );


}











