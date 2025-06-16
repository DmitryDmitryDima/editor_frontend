import {useParams} from "react-router-dom";
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

    return <div>
        <h1>User {user_name}</h1>
        <h1>{JSON.stringify(data)}</h1>
    </div>

}

export default UserPage;