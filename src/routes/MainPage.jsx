import {Link} from "react-router-dom";

function MainPage() {
    return <div>
        <p>Registration, authorization or redirect to authorized page</p>

        <Link to="/dima" style={{color: 'black',
            textDecoration: 'none',
            fontSize: '18px'}}>Test user page link</Link>

        <p>Tests</p>

        <Link to="/files_delete_dashboard" style={{color: 'black',
            textDecoration: 'none',
            fontSize: '18px'}}>Files deleting saga dashboard</Link>


    </div>;
}

export default MainPage;