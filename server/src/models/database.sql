CREATE DATABASE mementomori;

CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL,
    profile_picture BYTEA
);