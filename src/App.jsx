import {BrowserRouter, Route, Routes} from "react-router-dom";
import UserPage from "./routes/UserPage.jsx";
import MainPage from "./routes/MainPage.jsx";


import ProjectPage from "./routes/ProjectPage.jsx";
import {AppDashboard} from "./routes/AppDashboard.jsx";

import {EditorHandler} from "./routes/EditorHandler.jsx";
import {RegistrationPage} from "./routes/RegistrationPage.jsx";
import {LoginPage} from "./routes/LoginPage.jsx";
import {TestSecuredPage} from "./routes/TestSecuredPage.jsx";
import {CardRepeater} from "./routes/cards/CardRepeater.jsx";
import {CardAddPage} from "./routes/cards/CardAddPage.jsx";
import {Decks} from "./routes/cards/Decks.jsx";
import {CardEditPage} from "./routes/cards/CardEditPage.jsx";


import "./App.css"
import {ProfileHandler} from "./routes/profile/ProfileHandler.jsx";
import {ProjectHandler} from "./routes/project_list/ProjectHandler.jsx";
import {Storage} from "./routes/knowledgebase/Storage.jsx";
import {JavaProject} from "./routes/java_projects/JavaProject.jsx";
import {JavaProjectUnitedPage} from "./routes/java_projects/JavaProjectUnitedPage.jsx";
import {ProjectInvitePage} from "./routes/invites/ProjectInvitePage.jsx";


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

                    <Route path="/users/:user_name/projects/java/:project_name/*" element={<EditorHandler />} />
                    <Route path="/users/:user_name/projects/java/:project_name/" element={<ProjectPage />} />



                    <Route path="/users/:username" element={<ProfileHandler />} />

                    <Route path="/users/:username/projects" element={<ProjectHandler/>} />

                    <Route path="/workplace/projects/java/:project_id" element={<JavaProjectUnitedPage />} />

                    <Route path="/invite/projects/:project_type/:invite_token" element={<ProjectInvitePage/>}/>


                    <Route path="/cards/repeat" element={<CardRepeater/>} />
                    <Route path="/cards/addCard" element={<CardAddPage/>} />
                    <Route path="/cards/editCard" element={<CardEditPage/>} />
                    <Route path="/cards/decks" element={<Decks/>} />

                    <Route path="/storage" element={<Storage/>} />




                </Routes>
            </BrowserRouter>
        </>
    )

}

export default App
