import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db'; 

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

/**
 * Add a new friend for a user and create a reciprocal friendship.
 * 
 * @param {Request} req - The request object containing the user and friend emails in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the user or friend email is missing.
 * @throws {500} If there is an error processing the request or committing the transaction.
 */
router.post('/add', async (req: Request, res: Response) => {
    try {
      const { user, friend } = req.body;
  
      if (!user) {
        return res.status(400).json({ message: 'Missing user' });
      }
  
      if (!friend) {
        return res.status(400).json({ message: 'Missing friend' });
      }
  
      // Begin a transaction
      await pool.query('BEGIN');
  
      // Insert the initial friendship
      const result1 = await pool.query(
        'INSERT INTO friends (user_email, friend_email) VALUES ($1, $2) RETURNING *',
        [user, friend]
      );
  
      // Insert the reciprocal friendship
      const result2 = await pool.query(
        'INSERT INTO friends (user_email, friend_email) VALUES ($1, $2) RETURNING *',
        [friend, user]
      );
  
      // Commit the transaction
      await pool.query('COMMIT');
  
      return res.status(201).json({ 
        message: 'Friend added successfully', 
        data: {
          userToFriend: result1.rows[0],
          friendToUser: result2.rows[0]
        }
      });
    } catch (err) {
      // Rollback the transaction in case of an error
      await pool.query('ROLLBACK');
      console.error('Server error:', err.message);
      res.status(500).json({ message: 'Server Error' });
    }
});

  
/**
 * Delete a friend and the reciprocal friendship.
 * 
 * @param {Request} req - The request object containing the user and friend emails in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the user or friend email is missing.
 * @throws {404} If no friendship is found to delete.
 * @throws {500} If there is an error processing the request or committing the transaction.
 */
router.delete('/delete', async (req: Request, res: Response) => {
    try {
        const { user, friend } = req.body;
        console.log(`Deleting friend: ${friend} for user: ${user}`);

        if (!user) {
            console.error('Missing user');
            return res.status(400).json({ message: 'Missing user' });
        }

        if (!friend) {
            console.error('Missing friend');
            return res.status(400).json({ message: 'Missing friend' });
        }

        // Begin a transaction
        await pool.query('BEGIN');

        // Delete the initial friendship
        const result1 = await pool.query(
            'DELETE FROM friends WHERE user_email = $1 AND friend_email = $2 RETURNING *',
            [user, friend]
        );

        // Delete the reciprocal friendship
        const result2 = await pool.query(
            'DELETE FROM friends WHERE user_email = $1 AND friend_email = $2 RETURNING *',
            [friend, user]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        if (result1.rows.length === 0 && result2.rows.length === 0) {
            console.error('Friendship not found');
            return res.status(404).json({ message: 'Friendship not found' });
        }

        console.log('Friend deleted successfully');
        return res.status(200).json({ 
            message: 'Friend deleted successfully', 
            data: {
                userToFriend: result1.rows[0],
                friendToUser: result2.rows[0]
            }
        });
    } catch (err) {
        // Rollback the transaction in case of an error
        await pool.query('ROLLBACK');
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Check if a friendship exists between two users.
 * 
 * @param {Request} req - The request object containing the user and friend emails as URL parameters.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the user or friend parameter is missing or invalid.
 * @throws {500} If there is an error querying the database.
 */
router.get('/friendship/:user/:friend', async (req: Request, res: Response) => {
    try {
        const { user, friend } = req.params;

        if (!user) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        if (!friend) {
            return res.status(400).json({ message: 'Invalid friend' });
        }

        const result = await pool.query(
            'SELECT * FROM friends WHERE user_email = $1 AND friend_email = $2',
            [user, friend]
        );

        if (result.rows.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Get all friends of a user along with their profile pictures.
 * 
 * @param {Request} req - The request object containing the user email as a URL parameter.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the user parameter is missing or invalid.
 * @throws {500} If there is an error querying the database.
 */
router.get('/friends/:user', async (req: Request, res: Response) => {
    try {
        const { user } = req.params;

        if (!user) {
            return res.status(400).json({ message: 'Invalid user parameter' });
        }

        const result = await pool.query(
            `SELECT f.friend_email, u.profile_picture AS picture
             FROM friends f
             JOIN users u ON f.friend_email = u.email
             WHERE f.user_email = $1`,
            [user]
        );

        // Convert the profile_picture data to base64 with proper format
        const friends = result.rows.map(row => {
            let base64String = null;
            if (row.picture) {
                // Assuming the image is JPEG. Change to `image/png` if necessary.
                base64String = `data:image/png;base64,${row.picture.toString('base64')}`;
            }
            return { friend_email: row.friend_email, picture: base64String };
        });

        return res.status(200).json({ friends });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;