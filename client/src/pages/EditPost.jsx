import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import Editor from "../Editor";

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState("");
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch(`process.env.REACT_APP_RENDER/post/${id}`).then((response) => {
            response.json().then((postInfo) => {
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
            });
        });
    }, [id]);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set("title", title);
        data.set("summary", summary);
        data.set("content", content);
        data.set("file", files?.[0]);
        data.set("id", id);

        if (files?.[0]) {
            data.set("file", files?.[0]);
        }

        const response = await fetch(`${process.env.REACT_APP_API_HOST}/post`, {
            method: "PUT",
            body: data,
            credentials: "include",
        });
        if (response.ok) {
            setRedirect(true);
        }
    }

    if (redirect) {
        return <Navigate to={`/post/${id}`} />;
    }

    return (
        <div className="create">
            <form className="create-post" onSubmit={updatePost}>
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
                <Editor onChange={setContent} value={content} />
                <button
                    style={{
                        marginTop: "14px",
                        cursor: "pointer",
                        padding: "9px",
                    }}
                >
                    Update Post
                </button>
            </form>
        </div>
    );
}
