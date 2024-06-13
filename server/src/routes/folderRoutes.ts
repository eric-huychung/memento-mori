import express, { Request, Response } from 'express';
import cors from 'cors';
import pool from '../models/db'; 

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
      const { userEmail, folderName } = req.body;
      const newFolder = await pool.query(
        'INSERT INTO "folders" (user_email, folder_name) VALUES($1, $2) RETURNING *',
        [userEmail, folderName]
      );
      res.json(newFolder.rows[0]);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/getAll/:email', async (req: Request, res: Response) => {
    try {
      const { email } = req.params;
      const allFolders = await pool.query('SELECT folder_name FROM folders WHERE user_email = $1', [email]);
      res.json(allFolders.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });

router.get('/getId/:folder', async (req: Request, res: Response) => {
    try {
      const { folder } = req.params;
      const folderId = await pool.query('SELECT folder_id FROM folders WHERE folder_name = $1', [folder]);
      res.json(folderId.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
});

router.delete('/delete/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
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

  