import { useState } from "react";
import { Navigate } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import Editor from "../Editor";

export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState("");
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev) {
        const data = new FormData();
        data.set("title", title);
        data.set("summary", summary);
        data.set("content", content);
        data.set("file", files[0]);

        ev.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_RENDER}/post`, {
            method: "POST",
            body: data,
            credentials: "include",
        });
        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={"/"} />;
    }

    return (
        <div className="create">
            <form className="create-post" onSubmit={createNewPost}>
                <h1>Create a Blogpost</h1>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(ev) => setTitle(ev.target.value)}
                />
                <input
                    type="summary"
                    placeholder="Summary"
                    value={summary}
                    onChange={(ev) => setSummary(ev.target.value)}
                />
                <input
                    type="file"
                    onChange={(ev) => setFiles(ev.target.files)}
                />
                <Editor value={content} onChange={setContent} />
                <button
                    style={{
                        marginTop: "14px",
                        cursor: "pointer",
                        padding: "9px",
                    }}
                >
                    Create Post
                </button>
            </form>
        </div>
    );
}
