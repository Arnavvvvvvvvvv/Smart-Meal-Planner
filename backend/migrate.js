import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import pkg from 'pg';

dotenv.config();
const {Pool} = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, 
});

async function runMigrations() {
    const client = await pool.connect();
    try {
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schema);
        console.log('Migrations ran successfully');
    } catch (err) {
        console.error('Error running migrations:', err);
    } finally {
        client.release();
        await pool.end();
    }   
}
runMigrations();