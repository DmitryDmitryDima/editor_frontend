import {Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {useRef} from "react";

export function CardAddPage(){

    const formRef = useRef();


    const handleSubmit = event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const apiPath = "/api/tools/cards/add";

        const body = JSON.stringify({
            front_content:formJson.front_content,
            back_content:formJson.back_content,
            with_reversed:formJson.with_reversed!==undefined
        })

        const creating = async () => {
            try {
                const response = await fetch(apiPath, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }




            } catch (err) {


            } finally {


            }
        };

        creating();







        formRef.current.reset();


    }


    return (
        <div>

            <h2>Создание карточки</h2>
            <form ref={formRef} onSubmit={handleSubmit}>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="front_content"
                    label="Вопрос"
                    fullWidth
                    variant="standard"
                />

                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="back_content"
                    label="Ответ"
                    fullWidth
                    variant="standard"

                />

                <FormControlLabel control={<Checkbox defaultChecked />} label="Создать обратную карточку" name="with_reversed" />
                <div style={{ flex: 1 }}></div>

                <Button type="submit">Создать!</Button>



            </form>
        </div>
    )
}