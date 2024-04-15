import express from "express";
import { Server } from "socket.io";
import helmet from "helmet";
import http from "http"
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { ExpressPeerServer } from "peer";
dotenv.config();

import authRouter from "./routers/authRouter.mjs"

const app = express()
const server = http.createServer(app)

const io = new Server(server);

io.on("connection", socket => {
    console.log("socket connected")
    socket.on("join", data => {
        console.log(`joining ${JSON.stringify(data)}`)
        const peerServer = ExpressPeerServer(server, {
            debug: true,
            path: "/",
            key: data,
            allow_discovery: true
        });
        app.use(`/${data}`, peerServer)
    });
})


app.use(helmet());

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}
));

app.use(express.json());

app.use(session({
    secret: process.env.COOKIE_SECRET,
    credentials: true,
    name: "sid", // standing for session id
    resave: false, // no extra work
    saveUninitialized: false, // don't save unless logged in
    cookie: {
        secure: process.env.environment === "production" ? "true" : "auto", // use https only if in production environment
        httpOnly: true,
        sameSite: process.env.environment === "production" ? "none" : "lax",
        expires: 1000 * 60 * 60 * 24 * 7, // week
    }
}))
app.use("/auth", authRouter);

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: "/",
    key: "PICT",
    allow_discovery: true
});

// peerServer.on('connection', (connection) => {
//     console.log(JSON.stringify(connection, null, 4))
// })

// peerServer.on('message', (message) => {
//     console.log(JSON.stringify(message, null, 4))
// })


app.use("/peerjs", peerServer);
