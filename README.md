# Memento Mori

## About

Memento Mori is a React Native mobile application designed for storing and sharing image files with interactions. The primary motivation behind developing this app was to create an easy-to-use platform for users to manage, share, and interact with their memories/moments (pictures) visually. The app is currently under beta testing and ready to be released soon!

## Author


Eric Chung - Project Creator

## Figma Design

![memento-mori-figma](https://github.com/user-attachments/assets/5f29e748-7705-47b6-9e56-8ddf049be372)

## Features

- User authentication with Google OAuth 2.0
- Image upload and sharing functionality
- User interactions through comments and likes (in progess)
- State management with Redux
- Session management and caching with Redis
- Docker integration for development and deployment
- Deployment on AWS EC2 instances

## Tech Stack 

- Frontend: React Native, Expo, TypeScript, Redux
- Backend: Node.js, Express
- Database: PostgreSQL, Redis
- DevOps: Docker, AWS

## Installation

1. Clone the repository

```
git clone https://github.com/eric-huychung/memento-mori.git
```

2. Set up the environment variables:

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

3. To run client, navigate to the client directory and install dependencies:

```
cd client
npx install
npx expo start
```

4. To run server, navigate to the server directory and install dependencies:

```
cd server
npm install
npm run start
```

## License

This project is licensed under the MIT License.
