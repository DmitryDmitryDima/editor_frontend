import {BrowserRouter, Route, Routes} from "react-router-dom";
import UserPage from "./routes/UserPage.jsx";
import MainPage from "./routes/MainPage.jsx";

import ProjectPage from "./routes/ProjectPage.jsx";
import {AppDashboard} from "./routes/AppDashboard.jsx";

import {EditorHandler} from "./routes/EditorHandler.jsx";


function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/app/dashboard" element={<AppDashboard/>} />
                    <Route path="/" element={<MainPage />} />
                    <Route path="/users/:user_name" element={<UserPage />} />
                    <Route path="/users/:user_name/projects/java/:project_name/*" element={<EditorHandler />} />

                    <Route path="/users/:user_name/projects/java/:project_name/" element={<ProjectPage />} />


                </Routes>
            </BrowserRouter>
        </>
    )

}

export default App
