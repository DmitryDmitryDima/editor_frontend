import {Link} from "react-router-dom";

function MainPage() {
    return <div>
        <p>Registration, authorization or redirect to authorized page will be here</p>

        <Link to="/users/dima" style={{color: 'black',
            textDecoration: 'none',
            fontSize: '18px'}}>Test user page link</Link>

        <p>Tests</p>

        <Link to="/app/dashboard" style={{color: 'black',
            textDecoration: 'none',
            fontSize: '18px'}}>App Dashboard</Link>


    </div>;
}

export default MainPage;