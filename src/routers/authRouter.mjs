import express from 'express';
import pool from "../db.mjs";
import bcrypt from "bcrypt";
import validateForm from "../controllers/validateForm.mjs"

const router = express.Router();

router
    .route("/register")
    .get(async (req, res) => {
        if (req.session.user && req.session.user.username) {
            res.json({ user: { username: req.session.user.username, rooms: [] } });
        } else {
            res.json({status: "failed"});
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
            const newUserQuery = await pool.query("INSERT INTO users(username, passhash) values($1, $2) RETURNING username", [username, hashedPass]);
            req.session.user = {
                username: username,
                id: newUserQuery.rows[0].id,
            }
            res.json({ user: { username: req.session.user.username, rooms: [] } });
        } else {
            res.json({ status: "Username taken" });
        }
    });

router
    .route("/login")
    .get(async (req, res) => {
        if (req.session.user && req.session.user.username) {
            res.json({ user: { username: req.session.user.username, rooms: [] } });
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
                // login
                req.session.user = {
                    username: req.body.username,
                    id: potentialLogin.rows[0].id,
                }
                console.log("login good");
                res.json({ user: { username: req.body.username, rooms: [], selectedRoom: null } })
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
