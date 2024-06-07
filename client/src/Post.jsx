import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function Post({
    _id,
    title,
    summary,
    cover,
    content,
    createdAt,
    author,
}) {
    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img
                        src={`${process.env.REACT_APP_RENDER}/${cover}`}
                        alt=""
                    />
                </Link>
            </div>
            <div className="text">
                <Link to={`/post/${_id}`}>
                    <h2 className="title1">{title}</h2>
                </Link>
                <p className="info">
                    <Link className="author">{author.username}</Link>
                    <time>
                        {format(new Date(createdAt), "dd-MMM-uuuu HH:mm:ss")}
                    </time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>
    );
}
