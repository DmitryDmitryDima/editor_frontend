import {useSearchParams} from "react-router-dom";
import {TextFile} from "./TextFile.jsx";
import JavaFile from "./JavaFile.jsx";

export function EditorHandler() {
    const [searchParams, setSearchParams] = useSearchParams();

    const editor = searchParams.get("editor");

    return (
        <div>
            {editor==="java" && <JavaFile/>}
            {editor==="default" && <TextFile/>}
        </div>
    )
}