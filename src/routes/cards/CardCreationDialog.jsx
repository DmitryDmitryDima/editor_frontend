import * as React from "react";
import Slide from "@mui/material/Slide";
import {useState} from "react";
import {
    Box, Checkbox, CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    FormControl, FormControlLabel,
    Select, Stack,
    TextField
} from "@mui/material";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
export default function CardCreationDialog(props) {


    const [reverseCard, setReverseCard] = useState(false)
    const [back, setBack] = useState("");
    const [front, setFront] = useState("");


    // анимация ожидания ai ответа
    const [loading, setLoading] = useState(false);
    const [needReverse, setNeedReverse] = useState(false);

    const [deck, setDeck] = useState(0);

    const handleChange = (event) => {
        setDeck(event.target.value);
    };


    const handleClose = () => {
        setFront("")
        setBack("")
        props.close(true)
    }

    const handleSubmit=async (event)=>{
        event.preventDefault();


        const apiPath = "/cards/addCard";


        const body = JSON.stringify({
            front_content:front,
            back_content:back,
            with_reversed:needReverse,
            deck_id:props.decks[deck].deck_id

        })

        const creating = async () => {
            try {
                const response = await props.api.post(apiPath, body, {

                    headers: {'Content-Type': 'application/json'}});


                if (!response.status === 200) {
                    // уведомление
                    props.openSnackBar("Ошибка! Карточка не добавлена")
                }
                else {
                    props.openSnackBar("Карточка добавлена")
                    setFront("")
                    setBack("")
                }




            } catch (err) {


            } finally {


            }
        };

        creating();


    }

    const generateAnswer = async ()=>{

        if (loading) {
            props.openSnackBar("Запрос выполняется...")
            return
        }
        try {

            if (front === ""){
                props.openSnackBar("Введите вопрос")
            }
            else {
                let body = JSON.stringify({
                    question:front
                })

                setLoading(true);

                const response = await props.api.post("/ai/cards/autocomplete", body, {

                    headers: {'Content-Type': 'application/json'}});


                if (!response.status === 200) {
                    // уведомление
                    props.openSnackBar("AI сервис недоступен, попробуйте позже")
                }
                else {
                    setBack(response.data.answer)
                }
            }






        } catch (err) {


        } finally {

            setLoading(false);
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
                        Добавить новую карточку
                    </Typography>



                </Toolbar>
            </AppBar>


            <DialogContent sx={{ paddingBottom: 0 }}>
                <form onSubmit={handleSubmit}>

                <Box mb={3}>

                    <DialogContentText>
                        Выберите колоду
                    </DialogContentText>

                <FormControl fullWidth>

                    <Select
                        labelId="select_type"
                        id="select_type"
                        value={deck}

                        onChange={handleChange}
                    >

                        {props.decks.map((deck, index)=> { return (
                            <MenuItem value={index}>{deck.deck_name}</MenuItem>
                        )})
                        }

                    </Select>
                </FormControl>

                </Box>


                    <Box mb={3}>
                        <DialogContentText>
                            Фронтальная сторона
                        </DialogContentText>

                        <TextField
                            autoFocus

                            value={front}
                            onChange={(e)=>{
                                setFront(e.target.value);
                            }}
                            margin="dense"
                            id="front"
                            name="front"
                            fullWidth

                            variant="standard"
                            multiline={true}
                        />

                    </Box>

                    <Box mb={3}>
                        <DialogContentText>
                            Обратная сторона
                        </DialogContentText>


                        <TextField
                            autoFocus

                            value={loading?"Генерируем...":back}
                            onChange={(e)=>{
                                setBack(e.target.value);
                            }}

                            margin="dense"
                            id="back"
                            name="back"
                            fullWidth

                            variant="standard"
                            multiline={true}
                        />

                    </Box>
                    <Box mb={3}>


                        <Stack direction="row" spacing={1} sx={{alignItems: 'left'}}>

                            <IconButton onClick={generateAnswer} color="primary">
                                <AutoAwesomeIcon/>
                            </IconButton>

                        </Stack>



                    </Box>

                    <FormControlLabel control={<Checkbox checked={needReverse}
                                                         onChange={event => setNeedReverse(event.target.checked)} />}
                                      label="Создать зеркальную пару" name="need_reverse" />

                    <DialogActions>
                        <Button onClick={handleClose}>Отмена</Button>
                        <Button type="submit">Создать!</Button>
                    </DialogActions>

                </form>
            </DialogContent>

        </Dialog>




    );

}