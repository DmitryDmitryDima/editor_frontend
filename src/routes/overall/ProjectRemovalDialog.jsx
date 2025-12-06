import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, IconButton,
    Typography
} from "@mui/material";
import {v4 as uuid} from "uuid";
import CloseIcon from "@mui/icons-material/Close";

export function ProjectRemovalDialog(props) {


    const handleClose = () => {

        props.changeDialogState("PREPARING");
        props.changeCorrelationId(null);

        props.close()
    };

    const handleYes = () => {
        deleting()

    }

    const deleting = async ()=>{
        // don't forget to generate and set correlation id for dialog
        let address = "/projects/java/deleteProject"
        const correlationId = uuid();

        props.changeCorrelationId(correlationId);

        let body = JSON.stringify({
            projectId: props.projectId
        })
        console.log(body)

        try {
            const response = await props.api.post(address, body, {headers: {'Content-Type': 'application/json', "X-Correlation-ID": correlationId}});
            console.log(response);
            if (response.status === 204) {
                // todo переход в режим ожидания
                props.changeDialogState("WAITING");

            }
            else {
                console.log(response)
                // todo уведомление о том, что ошибка на сервере
                props.changeDialogState("FAIL");

            }
        }
        catch (error) {
            // todo уведомление об ошибке на сервере
            props.changeDialogState("FAIL");

        }
    }


    return (
        <Dialog open={props.opened} onClose={handleClose}>
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pr: 6  // Добавляем отступ справа для кнопки закрытия
            }}>Удаление проекта</DialogTitle>
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



                {props.state==="PREPARING" &&

                    <DialogContent dividers sx={{ paddingBottom: 0 }}>

                        <DialogContentText>Вы собираетесь удалить проект {props.projectName}</DialogContentText>

                    <DialogActions>

                    <Button onClick={handleYes}>Да</Button>
                    <Button onClick={handleClose}>Нет</Button>
                </DialogActions>
                    </DialogContent>



                }

                {props.state==="WAITING" &&

                    <DialogContent sx={{ paddingBottom: 0 }}>
                        <Box mb={3}><DialogContentText>Удаляем проект...</DialogContentText></Box>
                    </DialogContent>


                }

                {props.state==="FAIL" &&

                    <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box mb={3}><DialogContentText>Не получилось удалить, попробуйте позднее...</DialogContentText></Box>
                    </DialogContent>


                }

                {props.state==="SUCCESS" &&
                    <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box mb={3}><DialogContentText>Проект успешно стерт</DialogContentText></Box>
                        </DialogContent>
                }


        </Dialog>
    )
}