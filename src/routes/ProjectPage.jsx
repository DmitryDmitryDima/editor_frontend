import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {StaticTreeDataProvider, Tree, UncontrolledTreeEnvironment} from "react-complex-tree";



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



    const items = {
        root: {
            index: 'root',
            canMove: true,
            isFolder: true,
            children: ['child1', 'child2'],
            data: 'Root item',
            canRename: true,
        },
        child1: {
            index: 'child1',
            canMove: true,
            isFolder: false,
            children: [],
            data: 'Child item 1',
            canRename: true,
        },
        child2: {
            index: 'child2',
            canMove: true,
            isFolder: false,
            children: ["child3"],
            data: 'Child item 2',
            canRename: true,
        },


    };

    const dataProvider = new StaticTreeDataProvider(items, (item, newName) =>
        ({ ...item, data: newName }));





    return(
        <div>

            <p>{user_name} ! Your project {data.name} has opened!</p>

            <p>{JSON.stringify(data.root)}</p>

            <UncontrolledTreeEnvironment
                dataProvider={dataProvider}
                getItemTitle={item => item.data}
                viewState={{}}
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
            </UncontrolledTreeEnvironment>




        </div>
    )
}

export default ProjectPage;