import express, { Request, Response } from "express";
import cors from 'cors';
import Redis from 'ioredis';
import dotenv from 'dotenv';

const app = express();

// Import user routes and check routes
import userRoutes from './routes/userRoutes';
import checkRoutes from './routes/checkRoutes';
import folderRoutes from './routes/folderRoutes';
import bubbleRoutes from './routes/bubbleRoutes';
import friendRoutes from './routes/friendRoutes'
import permissionRoutes from './routes/permissionRoutes';
import authRoutes from './routes/authRoutes';

// middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8000;
// Configuration for Redis client
const redisConfig = {
    port: parseInt(process.env.REDIS_PORT), // Replace with your Redis port number
    host: process.env.REDIS_HOST,      // Replace with your Redis host if different
};

// Create the Redis client
const client = new Redis(redisConfig);

// Error handling
client.on('error', (err) => {
    console.error('Redis client error:', err);
});

client.on('connect', () => {
    console.log('Redis client connected');
});

app.listen(port, () => {
    console.log(`Server is Fire at http://localhost:${port}`);
});

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Express & TypeScript Server');
});

// User routes
app.use("/users", userRoutes);

// Check routes
app.use("/checks", checkRoutes);

// Folder routes
app.use("/folders", folderRoutes);

// Bubble routes
app.use("/bubbles", bubbleRoutes);

// Friend routes
app.use("/friends", friendRoutes);

// Permission routes
app.use("/permissions", permissionRoutes);

// Google OAuth routes
app.use("/auth", authRoutes);
/*
async function testRedis() {
    try {
        const key = 'test-email';
        const value = 'test-token';

        console.log('Setting token...');
        await client.set(key, value); // Set without expiration

        console.log('Getting token...');
        const storedValue = await client.get(key);
        console.log(`Stored value for '${key}': ${storedValue}`);

        // Do not delete the key to check if it persists
        // await client.del(key); // Comment out clean up
    } catch (error) {
        console.error('Error with Redis:', error);
    } finally {
        client.quit();
    }
}

testRedis();
*/


export { client };