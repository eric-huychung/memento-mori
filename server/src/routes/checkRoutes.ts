import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db';

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

interface EmailParams {
  email: string;
}

/**
 * Check if a user exists by email.
 * 
 * @param {Request} req - The request object containing the email parameter.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.get('/email/:email', async (req: Request<EmailParams>, res: Response) => {
  try {
    const { email } = req.params;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Invalid email parameter' });
    }
    
    const user = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    res.json({ exists: user.rows.length > 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
