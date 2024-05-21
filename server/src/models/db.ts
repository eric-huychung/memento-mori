import { Pool } from 'pg';

// Create a new pool instance with PostgreSQL connection configuration
const pool = new Pool({
  user: 'postgres',
  password: 'stlp',
  host: 'localhost',
  port: 5432,
  database: 'mementomori',
});

export default pool;
