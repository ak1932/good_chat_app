import express from "express";
import { Server } from "socket.io";
import helmet from "helmet";
import http from "http"
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { ExpressPeerServer } from "peer";
import pool from "./db.mjs";
dotenv.config();

import authRouter from "./routers/authRouter.mjs"

const app = express()
const server = http.createServer(app)

let rooms={}

app.use(helmet());

app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://localhost:3007",
        "http://localhost:3008",
        "http://localhost:3009",
        "http://localhost:3010",
    ],
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

app.get('/rooms', (request, response)=> {
    var room=request.query.room
    console.log(`rooms request for ${room}`)

    if(room in rooms){
        response.status(200).send(rooms[room])
    }
    else {
        response.status(404).send([])
    }
})

app.get('/logout', function (req, res) {
  res.status(200).clearCookie('connect.sid', {
    path: '/'
  });
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

app.post('/create', async (request, response) => {
    var room_name = request.query.room_name;
    var user_id = request.query.user_id;

    var room_id_query=await pool.query("INSERT INTO rooms(name) values($1) RETURNING id;", [room_name]);
    var room_id = room_id_query.rows[0].id
    await pool.query("INSERT INTO user_rooms(user_id, room_id) values($1, $2)", [user_id, room_id]);
    var room_query=await pool.query("SELECT * FROM rooms WHERE id = $1", [room_id]);
    var room = room_query.rows[0]
    response.status(200).send({room: room})
})

app.post('/join', async (request, response) => {
    var room_id = request.query.room_id;
    var user_id = parseInt(request.query.user_id);
    await pool.query("INSERT INTO user_rooms(user_id, room_id) values($1, $2)", [user_id, room_id]);
    var room_query=await pool.query("SELECT * FROM rooms WHERE id = $1", [room_id]);
    var room = room_query.rows[0]
    response.status(200).send({room: room})
})

server.listen(4000, () => {
    console.log("Server listening on port 4000");
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: "/",
    allow_discovery: true
});

peerServer.on('connection', async (connection) => {
    const username_room=connection.getId()
    const username_room_split=username_room.split(' ')
    const user_id=username_room_split[0]
    const room_id=username_room_split[1]

    console.log(`user ${user_id} joining room ${room_id}`)
    if(room_id in rooms){
        if(!username_room in rooms[room_id])
            rooms[room_id].push(username_room)
    }
    else {
        rooms[room_id]=[username_room]
    }
})

peerServer.on('disconnect', (connection) => {
    const id_room_username=connection.getId()
    const id_room_username_split=connection.getId().split()
    const username=id_room_username_split[2]
    const room_id=id_room_username_split[1]
    console.log(`disconnecting => user ${username} from room ${room_id}`)
    if(rooms[room_id]) {
        rooms[room_id] = rooms[room_id].filter(item => item !== id_room_username)
    }
})

app.use("/peerjs", peerServer);
