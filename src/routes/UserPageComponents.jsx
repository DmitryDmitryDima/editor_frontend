import { FaTrash } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import PropTypes from "prop-types";
import {Avatar, Dialog, List, ListItem, ListItemAvatar, ListItemButton, ListItemText} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';


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






export function SimpleDialog(props){
    const { onClose, selectedValue, open} = props;

    const handleClose = () => {
        console.log("закрытие без кнопки")

        onClose("No action");
    };

    const handleListItemClickNo = ()=>{
        onClose("Cancel deleting")
    }

    const handleListItemClickYes = () => {
        console.log("закрытие с кнопкой "+selectedValue)





        // api call - пробуем удалить
        const apiPath = "api/users/actions/deleteProject/"+selectedValue;

        const deleting = async () => {
            try {
                const response = await fetch(apiPath, {method:"POST"});
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                //const jsonData = await response.json();
                //setData(jsonData);
            } catch (err) {
                onClose("Error while deleting")
                //setError(err);
            } finally {
                //setLoading(false);
                onClose("Succesfully deleted")
            }
        };

        deleting();


    };



    return(
        <Dialog  open={open} onClose={handleClose}>
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

SimpleDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.number.isRequired,
};











