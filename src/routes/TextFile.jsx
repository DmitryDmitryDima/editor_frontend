import {useNavigate, useParams} from "react-router-dom";
import {Button} from "@mui/material";
import {useEffect, useState} from "react";



export function TextFile() {

    const {
        user_name,
        project_name,
        "*":splat

    } = useParams();

    const [data, setData] = useState({
        content:"файл не загружен",
    });





    const projectLink = "/"+user_name+"/projects/"+project_name;


    // навигация
    const navigate = useNavigate();



    // запрос содержимого файла
    const fetchFileData=async ()=>{

        try {
            const response = await fetch("/api/users"+projectLink+"/"+splat);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const jsonData = await response.json();

            setData(jsonData);









            //console.log("data fetched and changed");

        } catch (err) {

        } finally {

        }

    }


    useEffect(() => {

        fetchFileData();
    }, []);






    const handleBackButtonClick = () => {
        navigate(projectLink);
    }




    return(
        <div>
            <Button onClick={handleBackButtonClick} variant="contained">К проекту {project_name}</Button>
            <p>
                {data.content}
            </p>

        </div>
    );
}