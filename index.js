const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
dotenv.config();

const app = express();
const port = 3008;

app.use(cors({
    origin: "http://localhost:5173", // must match exactly
    credentials: true
}));
app.use(cookieParser());
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
        return res.status(200).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const newUser = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
        [email, hashedPassword]
    );
    const userDetails = newUser.rows[0]

    const token = jwt.sign(
        { userId: userDetails.id, email: userDetails.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
    
    res.status(201).json({token:token});
});
app.get('/users', async (req, res) => {
    const users = await pool.query('SELECT * FROM users');
    res.status(201).json(users.rows);
});


app.get("/auth/me", (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.send(401)
    jwt.verify(token, process.env.JWT_SECRET,(err, user)=> {
    if(user) {
        res.json({ tokenExists: true });
    }
})
    
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Check if the user already exists
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hashedPassword", hashedPassword)
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        return res.status(404).send('User not found');
      }  
      
    const user = result.rows[0]
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
       res.status(200).json({ message: 'Logged in Successfully' ,user:user, token:token});
    } else {
       res.status(200).json({ message: 'Invalid User' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
