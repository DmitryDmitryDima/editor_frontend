import {BrowserRouter, Route, Routes} from "react-router-dom";
import UserPage from "./routes/UserPage.jsx";
import MainPage from "./routes/MainPage.jsx";


import ProjectPage from "./routes/ProjectPage.jsx";
import {AppDashboard} from "./routes/AppDashboard.jsx";

import {EditorHandler} from "./routes/EditorHandler.jsx";
import {RegistrationPage} from "./routes/RegistrationPage.jsx";
import {LoginPage} from "./routes/LoginPage.jsx";
import {TestSecuredPage} from "./routes/TestSecuredPage.jsx";
import {CardRepeater} from "./routes/CardRepeater.jsx";
import {CardAddPage} from "./routes/CardAddPage.jsx";


function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/app/test/dashboard" element={<AppDashboard/>} />
                    <Route path="/register" element={<RegistrationPage/>} />
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/test" element={<TestSecuredPage/>}/>


                    <Route path="/" element={<MainPage />} />
                    <Route path="/users/:user_name" element={<UserPage />} />
                    <Route path="/users/:user_name/projects/java/:project_name/*" element={<EditorHandler />} />
                    <Route path="/users/:user_name/projects/java/:project_name/" element={<ProjectPage />} />


                    <Route path="/cards/repeat" element={<CardRepeater/>} />
                    <Route path="/cards/add" element={<CardAddPage/>} />


                </Routes>
            </BrowserRouter>
        </>
    )

}

export default App
