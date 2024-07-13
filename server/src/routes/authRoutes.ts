import express, { Request, Response } from 'express';
import { client } from '../index'; 

const router = express.Router();

/**
 * Store Google OAuth token in Redis with an expiration time.
 * 
 * @param {Request} req - The request object containing the token and email in the body.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.post('/store-token', async (req: Request, res: Response) => {
    try {
        const { token, email } = req.body;

        if (!token || !email) {
            return res.status(400).json({ message: 'Token and email are required' });
        }

        const tokenExpiration = 60 * 60 * 24 * 7; // 7 days in seconds

        console.log(`Storing token for email: ${email}`);
        console.log(`Token to store: ${token}`);

        await client.setex(email, tokenExpiration, token);

        // Retrieve the token to confirm storage
        const storedToken = await client.get(email);
        console.log(`Token stored in Redis for email: ${email} - ${storedToken}`);

        res.status(200).json({ message: 'Token stored successfully' });
    } catch (err) {
        console.error('Error storing token:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Retrieve Google OAuth token from Redis.
 * 
 * @param {Request} req - The request object containing the email in the query parameters.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.get('/retrieve-token', async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email is required and must be a string' });
        }
        
        // Retrieve token from Redis
        const token = await client.get(email);
        
        console.log(`Retrieved token for email: ${email}`);
        
        if (token) {
            res.status(200).json({ token });
        } else {
            console.log(`Token not found for email: ${email}`);
            res.status(404).json({ message: 'Token not found' });
        }
    } catch (err) {
        console.error('Error retrieving token:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
