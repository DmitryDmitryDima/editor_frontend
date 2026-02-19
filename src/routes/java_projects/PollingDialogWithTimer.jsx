import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function PollingDialogWithTimer(props) {



    const handleClose = ()=>{
        props.close();
    }

    const handleNo = ()=>{
        props.onNo()
    }

    const handleYes = ()=>{
        props.onYes()
    }

    return (
        <Dialog open={props.opened} onClose={handleClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 6  // Добавляем отступ справа для кнопки закрытия
            }}>{props.title}
            </DialogTitle>

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

            <DialogContent dividers sx={{ paddingBottom: 0 }}>

                <DialogContentText>{props.body}</DialogContentText>

                <DialogActions>

                    <Button onClick={handleYes}>Да</Button>
                    <Button onClick={handleNo}>Нет</Button>
                </DialogActions>
            </DialogContent>




        </Dialog>


    )

}