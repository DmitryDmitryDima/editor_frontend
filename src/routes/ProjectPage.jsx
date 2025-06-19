import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";


function ProjectPage(){

    const {user_name} = useParams();
    const {project_name} = useParams();

    const [data, setData] = useState(null)

    const [error, setError] = useState(null)

    const [loading, setLoading] = useState(true);

    const apiPath = "/api/users/"+user_name+"/"+project_name;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(apiPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    // data manipulation



    return(
        <div>

            <p>{user_name} ! Your project {data.name} has opened!</p>


        </div>
    )
}

export default ProjectPage;