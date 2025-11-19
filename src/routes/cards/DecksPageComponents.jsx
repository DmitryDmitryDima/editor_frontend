import {
    Button, Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputAdornment,
    TextField
} from "@mui/material";


export function DeckRemovalDialog(props) {
    const {onClose, open, api, deck_id, deck_name} = props;
    // закрытие диалога без совершения какого либо действия
    const handleClose = () => {


        onClose("Отмена действия");
    };

    const handleYes=()=>{
        deleting();
    }

    const deleting = async () => {
        const data = {deck_id: deck_id}
        console.log(data)
        try {
            const response = await api.post("/deleteDeck", data, {headers:{'Content-Type': 'application/json'}})

            if (response.status !== 200) {
                onClose(response.data.detail || "Неизвестная ошибка")
            }
            onClose("Колода "+deck_name+" успешно стерта")
        }
        catch (error) {
            console.log(error)
            onClose("Неизвестная ошибка")
        }

    }



    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Вы собираетесь удалить колоду {deck_name}. Доступ к карточкам будет потерян</DialogTitle>

            <DialogContent sx={{ paddingBottom: 0 }}>

                <DialogActions>
                    <Button onClick={handleYes}>Удалить</Button>
                    <Button onClick={handleClose}>Отмена</Button>
                </DialogActions>

            </DialogContent>
        </Dialog>

    )


}

export function DeckCreationDialog(props){
    const {onClose, open, api} = props;

    // закрытие диалога без совершения какого либо действия
    const handleClose = () => {


        onClose("Отмена действия");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const deck_name = formJson.deck_name;






        const createDeck = async () => {
            try {
                let body = JSON.stringify({
                    deck_name: deck_name
                })

                const response = await api.post("/addDeck", body, {headers:{'Content-Type': 'application/json'}});
                if (!response.status===200) {
                    onClose(response.data.detail || "Неизвестная ошибка")
                }

                onClose("Создана колода "+deck_name);


            } catch (err) {
                onClose(err?.response?.data?.detail|| "Неизвестная ошибка");

            } finally {


            }
        };

        createDeck();



        //onClose("Колода создана");


    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Создание новой колоды </DialogTitle>

            <DialogContent sx={{ paddingBottom: 0 }}>
                <DialogContentText>
                    Введите название колоды
                </DialogContentText>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="deck_name"
                        label="Имя колоды"
                        fullWidth
                        variant="standard"
                    />




                    <DialogActions>
                        <Button onClick={handleClose}>Отмена</Button>
                        <Button type="submit">Создать колоду!</Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    )
}