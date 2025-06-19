import {Link} from "react-router-dom";

function MainPage() {
    return <div>
        <p>Registration, authorization or redirect</p>

        <Link to="/dima" style={{color: 'black',
            textDecoration: 'none',
            fontSize: '18px'}}>Test user page link</Link>


    </div>;
}

export default MainPage;