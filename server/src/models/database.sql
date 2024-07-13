CREATE DATABASE mementomori;

-- Create the users table
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    profile_picture BYTEA
);

-- Create the folders table
CREATE TABLE folders(
    folder_id SERIAL PRIMARY KEY,
    user_email VARCHAR(50) NOT NULL,
    folder_name VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email)
);

-- Create the bubbles table
CREATE TABLE bubbles(
    bubble_id SERIAL PRIMARY KEY,
    folder_id INT NOT NULL,
    bubble_picture BYTEA,
    bubble_description VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id)
);

-- Create the friends table
CREATE TABLE friends(
    friend_id SERIAL PRIMARY KEY,
    user_email VARCHAR(50) NOT NULL,
    friend_email VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email),
    FOREIGN KEY (friend_email) REFERENCES users(email)
);

-- Create the folder_permissions table
CREATE TABLE folder_permissions(
    permission_id SERIAL PRIMARY KEY,
    folder_id INT NOT NULL,
    user_email VARCHAR(50) NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Folder Permission
-- https://chatgpt.com/share/7de640d4-daf2-41a4-9ced-aef7c8bc6a68

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS folders;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS bubbles;



-- Test check folder name 
SELECT folder_name FROM folders WHERE user_email = 'eric.huychung@gmail.com';


-- Test check all folders per user
SELECT * FROM folders WHERE user_email = 'eric.huychung@gmail.com';

-- Test check all bubbles per folder

SELECT * FROM bubbles WHERE folder_id = 3;

-- Test check all friends per user
SELECT * FROM friends where user_email = 'eric.huychung@gmail.com';





--JPEG IMAGE ONLY
