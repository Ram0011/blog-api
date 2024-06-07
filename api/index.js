const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

// Ensure the '/tmp/uploads' directory exists
const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middlewares
app.use(
    cors({
        credentials: true,
        origin: ["https://my-blog-ram.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json());
app.use(cookieParser());
const uploadMiddleware = multer({ dest: uploadDir });
app.use("/uploads", express.static(uploadDir));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Connect to database
mongoose
    .connect(process.env.CONNECT)
    .then(() => {
        console.log("Database connected");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });

// Requests
app.get("/test", (req, res) => {
    res.json("test Ok");
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (user) {
            return res
                .status(409)
                .json({ error: "Username is already taken." });
        } else {
            const userDoc = await User.create({
                username,
                password: bcrypt.hashSync(password, salt),
            });
            res.json(userDoc);
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const userDoc = await User.findOne({ username });

        if (!userDoc) {
            return res.status(401).json({ err: "User not Registered" });
        }

        const passOk = bcrypt.compareSync(password, userDoc.password);

        if (passOk) {
            jwt.sign(
                { username, id: userDoc._id },
                secret,
                {},
                (err, token) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ err: "Token generation failed" });
                    }
                    const isProduction = process.env.NODE_ENV === "production";
                    res.cookie("token", token, {
                        httpOnly: true,
                        sameSite: "None",
                        secure: isProduction,
                    }).json({
                        id: userDoc._id,
                        username,
                    });
                }
            );
        } else {
            res.status(401).json({ err: "Wrong Password!" });
        }
    } catch (err) {
        res.status(500).json({ err: "Internal Server Error" });
    }
});

app.get("/profile", (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res
            .status(401)
            .json({ error: "Unauthorized - JWT must be provided" });
    }
    jwt.verify(token, secret, (err, info) => {
        if (err) {
            return res
                .status(401)
                .json({ error: "Unauthorized - Invalid JWT" });
        }
        res.json(info);
    });
});

app.post("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    }).json({ message: "Logged out!" });
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
    const { originalname, path: filePath } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = filePath + "." + ext;
    fs.renameSync(filePath, newPath);

    const { token } = req.cookies;
    jwt.verify(token, secret, async (err, info) => {
        if (err)
            return res
                .status(401)
                .json({ error: "Unauthorized - Invalid JWT" });
        const { title, summary, content } = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });
        res.json(postDoc);
    });
});

app.put("/post", uploadMiddleware.single("file"), (req, res) => {
    let newPath = null;
    if (req.file) {
        const { originalname, path: filePath } = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        newPath = filePath + "." + ext;
        fs.renameSync(filePath, newPath);
    }

    const { token } = req.cookies;
    jwt.verify(token, secret, async (err, info) => {
        if (err)
            return res
                .status(401)
                .json({ error: "Unauthorized - Invalid JWT" });
        const { id, title, summary, content } = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = postDoc.author.toString() === info.id.toString();
        if (!isAuthor) {
            return res.status(400).json({ error: "You are not the author" });
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
    });
});

app.get("/post", async (req, res) => {
    const posts = await Post.find()
        .populate("author", ["username"])
        .sort({ createdAt: -1 })
        .limit(20);
    res.json(posts);
});

app.get("/post/:id", async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate("author", ["username"]);
    res.json(postDoc);
});

// Server running
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
