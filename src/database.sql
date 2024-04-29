CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(28) NOT NULL UNIQUE,
    passhash VARCHAR NOT NULL,
);

CREATE TABLE rooms(
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
);

CREATE TABLE user_rooms(
    user_id int REFERENCES users,
    room_id int REFERENCES rooms,
    primary key(user_id, room_id)
);

INSERT INTO users(username, passhash) values($1, $2)
