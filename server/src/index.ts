import express, { Request, Response } from "express";
import cors from 'cors';

const app = express();

// Import user routes and check routes
import userRoutes from './routes/userRoutes';
import checkRoutes from './routes/checkRoutes';

// middleware
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8000;

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


