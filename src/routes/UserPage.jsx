import {useParams} from "react-router-dom";

function UserPage(){

    const {user_id} = useParams();
    return <div>
        <h1>User {user_id}</h1>
    </div>

}

export default UserPage;