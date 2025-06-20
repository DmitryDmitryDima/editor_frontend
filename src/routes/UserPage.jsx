import {Link, useParams} from "react-router-dom";
import React, { useState, useEffect } from 'react';

function UserPage(){

    const {user_name} = useParams();

    // data - то, что предзагружаем из сервера
    const [data, setData] = useState(null)

    const [error, setError] = useState(null)

    const [loading, setLoading] = useState(true);

    const apiPath = "/api/users/"+user_name;

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


    console.log(data);



    return <div>
        <h1>User {user_name}</h1>


        {

            data.projects.map(project => {



                return (

                    <div key={project.id}>
                        <Link to={"/"+user_name+"/"+project.name} style={{color: 'black',
                            textDecoration: 'underline',
                            fontSize: '18px'}}>{project.name}</Link>
                    </div>



                )
            })
        }
    </div>

}

export default UserPage;