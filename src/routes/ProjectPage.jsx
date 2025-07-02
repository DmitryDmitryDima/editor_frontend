import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";
import 'react-complex-tree/lib/style-modern.css';



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










    const dataProvider = new StaticTreeDataProvider(data.flatTree, (item, newName) =>
        ({ ...item, data: newName }));





    return(
        <div>

            <p>{project_name} Project</p>





            <UncontrolledTreeEnvironment
                dataProvider={dataProvider}
                getItemTitle={item => item.data}
                canDragAndDrop={true}
                canDropOnFolder={true}
                viewState={{}}

            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>




        </div>
    )
}

export default ProjectPage;