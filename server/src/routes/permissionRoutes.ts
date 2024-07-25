import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db';

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

/**
 * Add a permission for a user to access a folder.
 * 
 * @param {Request} req - The request object containing `folderId` and `userEmail` in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If `folderId` or `userEmail` is missing in the request body.
 * @throws {500} If there is an error processing the request.
 */
router.post('/add', async (req: Request, res: Response) => {
    try {
        const { folderId, userEmail } = req.body;

        if (!folderId) {
            return res.status(400).json({ message: 'Missing folderId' });
        }

        if (!userEmail) {
            return res.status(400).json({ message: 'Missing userEmail' });
        }

        const result = await pool.query(
            'INSERT INTO folder_permissions (folder_id, user_email) VALUES ($1, $2) RETURNING *',
            [folderId, userEmail]
        );

        return res.status(201).json({ message: 'Permission added successfully', data: result.rows[0] });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Retrieve all permissions for a specific folder.
 * 
 * @param {Request} req - The request object containing `folderId` as a URL parameter.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {404} If no permissions are found for the given `folderId`.
 * @throws {500} If there is an error querying the database.
 */
router.get('/get/:folderId', async (req: Request, res: Response) => {
    try {
        const { folderId } = req.params;

        if (!folderId) {
            return res.status(400).json({ message: 'Missing folderId' });
        }

        const result = await pool.query(
            'SELECT user_email FROM folder_permissions WHERE folder_id = $1',
            [folderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No permissions found' });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Check if a permission exists for a user on a specific folder.
 * 
 * @param {Request} req - The request object containing `folderId` and `userEmail` in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If `folderId` or `userEmail` is missing in the request body.
 * @throws {500} If there is an error querying the database.
 */
router.post('/check', async (req: Request, res: Response) => {
    try {
        const { folderId, userEmail } = req.body;

        if (!folderId) {
            return res.status(400).json({ message: 'Missing folderId' });
        }

        if (!userEmail) {
            return res.status(400).json({ message: 'Missing userEmail' });
        }

        const result = await pool.query(
            'SELECT * FROM folder_permissions WHERE folder_id = $1 AND user_email = $2',
            [folderId, userEmail]
        );

        if (result.rows.length > 0) {
            return res.status(409).json({ message: 'Permission already exists' });
        }

        return res.status(200).json({ message: 'Permission does not exist' });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Delete a permission for a user on a specific folder.
 * 
 * @param {Request} req - The request object containing `folderId` and `userEmail` in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If `folderId` or `userEmail` is missing in the request body.
 * @throws {404} If the permission to delete is not found.
 * @throws {500} If there is an error querying the database.
 */
router.delete('/delete', async (req: Request, res: Response) => {
    try {
        const { folderId, userEmail } = req.body;

        if (!folderId) {
            return res.status(400).json({ message: 'Missing folderId' });
        }

        if (!userEmail) {
            return res.status(400).json({ message: 'Missing userEmail' });
        }

        const result = await pool.query(
            'DELETE FROM folder_permissions WHERE folder_id = $1 AND user_email = $2 RETURNING *',
            [folderId, userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Permission not found' });
        }

        return res.status(200).json({ message: 'Permission deleted successfully', data: result.rows[0] });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Check if a user is authorized for a specific folder.
 * 
 * @param {Request} req - The request object containing `folderId` and `userEmail` as query parameters.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If `folderId` or `userEmail` is missing in the query parameters.
 * @throws {403} If the user is not authorized for the folder.
 * @throws {500} If there is an error querying the database.
 */
router.get('/check', async (req: Request, res: Response) => {
    try {
        const { folderId, userEmail } = req.query;

        if (!folderId) {
            return res.status(400).json({ message: 'Missing folderId' });
        }

        if (!userEmail) {
            return res.status(400).json({ message: 'Missing userEmail' });
        }

        const result = await pool.query(
            'SELECT * FROM folder_permissions WHERE folder_id = $1 AND user_email = $2',
            [folderId, userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({ message: 'User is not authorized' });
        }

        return res.status(200).json({ message: 'User is authorized', data: result.rows[0] });
    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
