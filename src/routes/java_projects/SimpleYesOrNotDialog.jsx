import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function SimpleYesOrNotDialog(props){


    const handleClose = () => {

        // todo onClose action

        props.close()
    };

    const handleYes = () => {
        props.action()

    }

    return (
        <Dialog open={props.opened} onClose={handleClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 6  // Добавляем отступ справа для кнопки закрытия
            }}>{props.title}</DialogTitle>
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



            {props.phase==="PREPARING" &&

                <DialogContent dividers sx={{ paddingBottom: 0 }}>

                    <DialogContentText>{props.body}</DialogContentText>

                    <DialogActions>

                        <Button onClick={handleYes}>Да</Button>
                        <Button onClick={handleClose}>Нет</Button>
                    </DialogActions>
                </DialogContent>



            }

            {props.phase==="WAITING" &&

                <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box mb={3}><DialogContentText>{props.body}</DialogContentText></Box>
                </DialogContent>


            }

            {props.phase==="FAIL" &&

                <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box mb={3}><DialogContentText>Ошибка выполнения действия. Причина: {props.body}</DialogContentText></Box>
                </DialogContent>


            }

            {props.phase==="SUCCESS" &&
                <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box mb={3}><DialogContentText>Успех</DialogContentText></Box>
                </DialogContent>
            }


        </Dialog>
    )
}