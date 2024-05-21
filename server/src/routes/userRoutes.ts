import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db'; // Adjust the path based on your project structure

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

// Define the types for request bodies
interface CreateUserRequest {
  username: string;
  email: string;
}

interface DeleteUserRequest {
  id: string;
}

/**
 * Create a new user.
 * Inserts a new user record into the database with the provided username and email.
 * 
 * @param {Request} req - The request object containing the user data in the body.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.post('/', async (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
  try {
    const { username, email } = req.body;
    const newUser = await pool.query(
      'INSERT INTO "users" (username, email) VALUES($1, $2) RETURNING *',
      [username, email]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Delete a user.
 * Deletes the user record with the specified ID from the database.
 * 
 * @param {Request} req - The request object containing the user ID in the URL parameters.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.delete('/delete/:id', async (req: Request<DeleteUserRequest>, res: Response) => {
  try {
    const { id } = req.params;
    const deleteUser = await pool.query('DELETE FROM "users" WHERE user_id = $1', [id]);
    if (deleteUser.rowCount === 0) {
      return res.status(404).json({ message: 'No user found with this id' });
    }
    res.json({ message: 'User deleted successfully', deletedUser: deleteUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
