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
