import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer'; // image upload
import pool from '../models/db'; 

const app = express();
app.use(express.json());
app.use(cors());
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Upload route
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

    // Assuming 'picture' is a base64-encoded string
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

// Check if description is unique
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

// Create
router.post('/', async (req: Request, res: Response) => {
    try {
      const { id, picture, description } = req.body;
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

// get all bubbles image and description
router.get('/getBubbles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryResult = await pool.query('SELECT bubble_picture, bubble_description FROM bubbles WHERE folder_id = $1', [id]);
    
    if (queryResult.rowCount === 0) {
      return res.status(404).json({ message: 'No bubbles found for this folder id' });
    }
    
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



// get all bubbles description
router.get('/getDescriptions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const allBubbles = await pool.query('SELECT bubble_description FROM bubbles WHERE folder_id = $1', [id]);
    res.json(allBubbles.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});


// IMPORTANT NEED TO UPDATE LATER
// get bubble id 
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

// NOT USED MIGHT DELETED LATER
// Delete
router.delete('/delete/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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



// Delete bubble by description
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