import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);
    const { setUserInfo } = useContext(UserContext);

    async function login(ev) {
        ev.preventDefault();

        try {
            const response = await fetch(
                `${process.env.REACT_APP_RENDER}/login`,
                {
                    method: "POST",
                    body: JSON.stringify({ username, password }),
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                }
            );

            if (response.ok) {
                const userInfo = await response.json();
                setUserInfo(userInfo);
                setRedirect(true);
            } else if (response.status === 401) {
                const errorResponse = await response.json();
                alert(errorResponse.err);
            } else {
                alert("Login failed. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please try again.");
        }
    }

    if (redirect) {
        return <Navigate to={"/"} />;
    }

    return (
        <form className="login" onSubmit={login}>
            <h1>Login</h1>
            <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
            />
            <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
            />
            <button>Login</button>
        </form>
    );
}
