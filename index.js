const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require("bcryptjs");

const app = express();
const port = 3008;

app.use(bodyParser.json());

const pool = new Pool({
    user: 'vishnu-13072',
    host: 'localhost',
    database: 'user_auth',
    password: '',
    port: 5432,
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if the user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
        [email, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
