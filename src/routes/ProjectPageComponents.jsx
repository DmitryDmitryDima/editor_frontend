import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {useParams} from "react-router-dom";



// делаю отдельные диалоги для директории и файла - вдруг логика будет кардинально отличаться?
export function DirectoryRemovalDialog(props) {
    const {onClose, open, parentData} = props;
    const {project_name} = useParams();

    const {user_name} = useParams();

    // закрытие диалога без совершения какого либо действия
    const handleClose = () => {


        onClose("No action");
    };

    const handleYes=()=>{
        deleting();
    }




    const deleting = async () => {

        const parentIndex = parentData.index;
        const apiPath = `/api/users/${user_name}/projects/${project_name}/removeDirectory/${parentIndex}`
        
        try {
            const response = await fetch(apiPath, {method:"POST"});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            onClose("Директория успешно стерта")

            //const jsonData = await response.json();
            //setData(jsonData);
        } catch (err) {
            onClose("Удаление завершилось фейлом")
            //setError(err);
        } finally {
            //setLoading(false);

        }
    };




    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Удалить всю директорию {parentData.data} ?</DialogTitle>

            <DialogContent sx={{ paddingBottom: 0 }}>

                    <DialogActions>
                        <Button onClick={handleYes}>Да</Button>
                        <Button onClick={handleClose}>Нет!</Button>
                    </DialogActions>

            </DialogContent>
        </Dialog>
    );

}


export function DirectoryCreationDialog(props){
    const {onClose, open, parentData} = props;

    const {project_name} = useParams();

    const {user_name} = useParams();



    // закрытие диалога без совершения какого либо действия
    const handleClose = () => {


        onClose("No action");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const suggestion = formJson.directory_name;

        // в api посылаем id родительской папки и название предлагаемой директории
        const parentIndex = parentData.index;


        const apiPath = `/api/users/${user_name}/projects/${project_name}/createDirectory/${parentIndex}/${suggestion}`;

        const createDirectory = async () => {
            try {
                const response = await fetch(apiPath, {method:"POST"});
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                onClose("Создана директория "+suggestion);


            } catch (err) {
                onClose("Ошибка создания")
                //setError(err);
            } finally {
                //setLoading(false);

            }
        };

        createDirectory();



        onClose("Directory Created");


    }


    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Создать директорию для {parentData.data} </DialogTitle>

            <DialogContent sx={{ paddingBottom: 0 }}>
                <DialogContentText>
                    Введите название директории
                </DialogContentText>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="directory_name"
                        label="Имя директории"
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