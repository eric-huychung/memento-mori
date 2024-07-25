import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer'; 
import pool from '../models/db'; 

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


/**
 * Upload a bubble image.
 * 
 * @param {Request} req - The request object containing the image file (base64-encoded string) and bubble details in the body.
 * @param {Response} res - The response object to send the result back to the client.
 */
router.post('/upload', upload.single('picture'), async (req: Request, res: Response) => {
  try {
    console.log('Received file upload request:', req.body);
    console.log('File:', req.file);

    const { id, description, picture } = req.body;

    if (!id) {
      console.log('Missing id');
      return res.status(400).json({ message: 'Missing id' });
    }

    if (!description) {
      console.log('Missing description');
      return res.status(400).json({ message: 'Missing description' });
    }

    if (!picture) {
      console.log('Missing picture');
      return res.status(400).json({ message: 'Missing picture' });
    }

    // Decode base64 to binary data
    const pictureBuffer = Buffer.from(picture, 'base64');

    const newBubble = await pool.query(
      'INSERT INTO "bubbles" (folder_id, bubble_picture, bubble_description) VALUES($1, $2, $3) RETURNING *',
      [id, pictureBuffer, description]
    );

    res.json(newBubble.rows[0]);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Check if a bubble description is unique.
 * 
 * @param {Request} req - The request object containing the description in the body.
 * @param {Response} res - The response object to send the uniqueness result back to the client.
 */
router.post('/check-description', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: 'Missing description' });
    }

    const result = await pool.query(
      'SELECT * FROM "bubbles" WHERE bubble_description = $1',
      [description]
    );

    if (result.rows.length > 0) {
      return res.status(200).json({ unique: false });
    } else {
      return res.status(200).json({ unique: true });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Create a new bubble.
 * 
 * @param {Request} req - The request object containing bubble details in the body.
 * @param {Response} res - The response object to send the newly created bubble back to the client.
 */
router.post('/', async (req: Request, res: Response) => {
    try {
      const { id, picture, description } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Missing id' });
      }
  
      if (!picture) {
        return res.status(400).json({ message: 'Missing picture' });
      }
  
      if (!description) {
        return res.status(400).json({ message: 'Missing description' });
      }

      const buffer = Buffer.from(picture, 'base64'); // Decode the Base64 string
      const newBubble = await pool.query(
        'INSERT INTO "bubbles" (folder_id, bubble_picture, bubble_description) VALUES($1, $2, $3) RETURNING *',
        [id, buffer, description]
      );
      res.json(newBubble.rows[0]);
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * Get all bubbles with images and descriptions by folder id.
 * 
 * @param {Request} req - The request object containing the folder id in the params.
 * @param {Response} res - The response object to send the bubbles data back to the client.
 */
router.get('/getBubbles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Missing folder id' });
    }

    const queryResult = await pool.query('SELECT bubble_picture, bubble_description FROM bubbles WHERE folder_id = $1', [id]);
    
    if (queryResult.rowCount === 0) {
      return res.status(404).json({ message: 'No bubbles found for this folder id' });
    }

    // Map query results to the response format
    const bubbles = queryResult.rows.map(row => ({
      image: `data:image/jpeg;base64,${row.bubble_picture.toString('base64')}`,
      description: row.bubble_description,
    }));
    res.json(bubbles);
  } catch (err) {
    console.error('Error fetching bubbles:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Get all bubble descriptions by folder id.
 * 
 * @param {Request} req - The request object containing the folder id in the params.
 * @param {Response} res - The response object to send the bubble descriptions back to the client.
 */
router.get('/getDescriptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Missing folder id' });
    }

    const allBubbles = await pool.query('SELECT bubble_description FROM bubbles WHERE folder_id = $1', [id]);
    res.json(allBubbles.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Get bubble id by folder name.
 * 
 * @param {Request} req - The request object containing the folder name in the params.
 * @param {Response} res - The response object to send the folder id back to the client.
 * 
 * @note This route needs to be updated later.
 */
router.get('/getId/:folder', async (req: Request, res: Response) => {
  try {
    const { folder } = req.params;

    if (!folder) {
      return res.status(400).json({ message: 'Missing folder name' });
    }

    const folderId = await pool.query('SELECT folder_id FROM folders WHERE folder_name = $1', [folder]);
    res.json(folderId.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Delete a bubble by id.
 * 
 * @param {Request} req - The request object containing the bubble id in the params.
 * @param {Response} res - The response object to confirm deletion and return the deleted bubble data.
 * 
 * @note This route might be deleted later.
 */
router.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
      .status(400).json({ message: 'Missing bubble id' });
    }
    const deleteBubble = await pool.query('DELETE FROM "bubbles" WHERE bubble_id = $1', [id]);
    if (deleteBubble.rowCount === 0) {
      return res.status(404).json({ message: 'No bubble found with this id' });
    }
    res.json({ message: 'Bubble deleted successfully', deletedBubble: deleteBubble.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * Delete a bubble by description.
 * 
 * @param {Request} req - The request object containing the description in the body.
 * @param {Response} res - The response object to confirm deletion and return the deleted bubble data.
 */
router.delete('/delete-by-description', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Missing description' });
    }

    const deleteBubble = await pool.query('DELETE FROM "bubbles" WHERE bubble_description = $1 RETURNING *', [description]);
    if (deleteBubble.rowCount === 0) {
      return res.status(404).json({ message: 'No bubble found with this description' });
    }
    res.json({ message: 'Bubble deleted successfully', deletedBubble: deleteBubble.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


export default router;