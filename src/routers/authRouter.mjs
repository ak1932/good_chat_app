import express from 'express';
import pool from "../db.mjs";
import bcrypt from "bcrypt";
import validateForm from "../controllers/validateForm.mjs"

const router = express.Router();

router
    .route("/register")
    .get(async (req, res) => {
        if (req.session.user && req.session.user.username) {
            res.json({ user: { username: req.session.user.username, rooms: req.session.user.rooms, id: req.session.user.id } });
        } else {
            res.json({ status: "failed" });
        }
    })
    .post(async (req, res) => {
        validateForm(req, res);
        // some status changed in validateform at 11 min 6th vid
        const username = req.body.username
        const password = req.body.password

        const existingUser = await pool.query("SELECT username from users WHERE username=$1", [username]);

        if (existingUser.rowCount === 0) {
            //register
            const hashedPass = await bcrypt.hash(password, 10); // 10 is time required for hashing
            const newUserQuery = await pool.query("INSERT INTO users(username, passhash) values($1, $2) RETURNING username, id", [username, hashedPass]);
            req.session.user = {
                username: username,
                id: newUserQuery.rows[0].id,
                rooms: []
            }
            console.log(`new user registered => ${JSON.stringify(req.session.user)}`)
            res.json({ user: { username: req.session.user.username, rooms: req.session.user.rooms, id: req.session.user.id } });
        } else {
            res.json({ status: "Username taken" });
        }
    });

router
    .route("/login")
    .get(async (req, res) => {
        if (req.session.user && req.session.user.username) {
            res.json({ user: { username: req.session.user.username, rooms: req.session.user.rooms, id: req.session.user.id } });
        } else {
            res.json({ status: "failed" });
        }
    })
    .post(async (req, res) => {
        validateForm(req, res);
        const potentialLogin = await pool.query("SELECT id, username, passhash FROM users u WHERE u.username=$1", [req.body.username]);

        if (potentialLogin.rowCount > 0) {
            const isSamePass = await bcrypt.compare(req.body.password, potentialLogin.rows[0].passhash);

            if (isSamePass) {
                const userID = potentialLogin.rows[0].id;

                const room_query = await pool.query("SELECT r.id as id, r.name as name from user_rooms ur join user u on ur.user_id = $1 join rooms r on r.id = ur.room_id;", [userID])

                const rooms = room_query.rows;
                console.log(`rooms=>${JSON.stringify(rooms)}`)
                // login
                req.session.user = {
                    username: req.body.username,
                    id: userID,
                    rooms: rooms
                }
                console.log("login good");
                res.json({ user: { username: req.body.username, rooms: req.session.user.rooms, id: req.session.user.id } })
            } else {
                // not good login
                console.log("Wrong username or password");
                res.json({ status: "Wrong username or password" });
            }
        } else {
            console.log("Wrong username or password");
            res.json({ status: "Wrong username or password" });
        }
    });

export default router;
