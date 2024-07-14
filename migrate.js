const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: 'vishnu-13072',
    host: 'localhost',
    database: 'user_auth',
    password: '',
    port: 5432,
});

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir);

        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');
            await client.query(sql);
            console.log(`Applied migration: ${file}`);
        }
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
    }
};

runMigrations().then(() => {
    console.log('All migrations applied.');
    pool.end();
}).catch(err => {
    console.error('Error applying migrations:', err);
    pool.end();
});
