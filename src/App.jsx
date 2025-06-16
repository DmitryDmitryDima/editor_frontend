import {BrowserRouter, Route, Routes} from "react-router-dom";
import UserPage from "./routes/UserPage.jsx";
import MainPage from "./routes/MainPage.jsx";
import File from "./routes/File.jsx";


function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/:user_name" element={<UserPage />} />
                    <Route path="/:user_name/:project_name/:file_name" element={<File />} />


                </Routes>
            </BrowserRouter>
        </>
    )

}

export default App
