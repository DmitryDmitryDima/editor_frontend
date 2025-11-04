import React, {useEffect, useState} from "react";



export function CardRepeater() {





    const [card, setCard] = React.useState({
        front_content:"",
        back_content:"",
        card_id:1
    })

    const [isFront, setIsFront] = useState(true)

    // ситуация. когда карточек для изучения нет
    const [isEmpty, setIsEmpty] = useState(false)


    const fetchCard = async () => {
        let api = "/api/tools/cards/next"

        const response = await fetch(api)

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();

        setIsFront(true)
        if (jsonData.card_id===null) {
            setIsEmpty(true)

        }

        else{

            setCard(jsonData)

        }










    }

    useEffect(() => {
        fetchCard()
    }, [])




    const sendCardToServer = async (rating)=>{


        let api = "/api/tools/cards/repetition"

        const body = JSON.stringify({
            card_id:card.card_id,
            rating:rating
        });

        try {
            const response = await fetch(api, {method:"POST", body: body, headers: {'Content-Type': 'application/json'}});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
        catch (error) {
            // уведомление
        }
        finally {
            // при любом сценарии пытаемся запросить новую карту
            await fetchCard()
        }









    }



    return (

        <div>

            {isEmpty?
                (<div>
                        <p>Карточек для изучения нет</p>
                    </div>
                ):(

                    <div>


                        <div style={{color:'blue'}} >
                            <p>{isFront ? card.front_content : card.back_content}</p>
                        </div>

                        <button hidden={!isFront} onClick={() => setIsFront(!isFront)}>Показать ответ</button>

                        <p hidden={isFront}>Как тяжело было вспомнить?</p>

                        <div hidden={isFront} className="button-group">
                            <button onClick={()=>{
                                sendCardToServer("Again");
                            }} type="button">Оч сложно</button>


                            <button onClick={()=>{
                                sendCardToServer("Hard");
                            }}type="button">Сложно</button>


                            <button onClick={()=>{
                                sendCardToServer("Good");
                            }} type="button">Норм</button>


                            <button onClick={()=>{
                                sendCardToServer("Easy");
                            }}type="button">Изи</button>


                        </div>



                    </div>

                )










            }

        </div>
    );



}