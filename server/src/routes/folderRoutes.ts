import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db'; 

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

/**
 * Create a new folder for a user.
 * 
 * @param {Request} req - The request object containing the user's email and folder name in the body.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the folder name is missing.
 * @throws {500} If there is an error inserting the folder into the database.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
      const { userEmail, folderName } = req.body;

      if (!folderName) {
          return res.status(400).json({ message: 'Folder name cannot be empty' });
      }

      const newFolder = await pool.query(
          'INSERT INTO "folders" (user_email, folder_name) VALUES($1, $2) RETURNING *',
          [userEmail, folderName]
      );

      res.json(newFolder.rows[0]);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Get all folders created by a user and folders shared with the user.
 * 
 * @param {Request} req - The request object containing the user's email as a URL parameter.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the email parameter is missing or invalid.
 * @throws {500} If there is an error querying the database.
 */
router.get('/getAll/:email', async (req: Request, res: Response) => {
  const { email } = req.params;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Invalid email parameter' });
  }

  try {
      const userFolders = await pool.query(
          `SELECT * FROM folders WHERE user_email = $1`,
          [email]
      );

      const sharedFolders = await pool.query(
          `SELECT folders.* FROM folders 
          JOIN folder_permissions ON folders.folder_id = folder_permissions.folder_id 
          WHERE folder_permissions.user_email = $1`,
          [email]
      );

      res.json({ userFolders: userFolders.rows, sharedFolders: sharedFolders.rows });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

/**
 * Get the ID of a folder by its name.
 * 
 * @param {Request} req - The request object containing the folder name as a URL parameter.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {400} If the folder name parameter is missing or invalid.
 * @throws {500} If there is an error querying the database.
 */
router.get('/getId/:folder', async (req: Request, res: Response) => {
    const { folder } = req.params;

    if (!folder || typeof folder !== 'string') {
      return res.status(400).json({ message: 'Invalid folder parameter' });
    }
  
    try {
      const folderId = await pool.query('SELECT folder_id FROM folders WHERE folder_name = $1', [folder]);
      res.json(folderId.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Delete a folder by its ID.
 * 
 * @param {Request} req - The request object containing the folder ID as a URL parameter.
 * @param {Response} res - The response object to send the result back to the client.
 * 
 * @throws {404} If no folder is found with the provided ID.
 * @throws {500} If there is an error deleting the folder from the database.
 */
router.delete('/delete/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid folder ID parameter' });
    }

    try {
      const deleteFolder = await pool.query('DELETE FROM "folders" WHERE folder_id = $1', [id]);
      if (deleteFolder.rowCount === 0) {
        return res.status(404).json({ message: 'No folder found with this id' });
      }
      res.json({ message: 'Folder deleted successfully', deletedFolder: deleteFolder.rows[0] });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

export default router;

  