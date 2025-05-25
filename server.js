const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware (add the correct origin!)
app.use(cors({
  origin: [
    'http://127.0.0.1:5502',
    'http://localhost:5500',
    'http://127.0.0.1:5503', 
    'http://localhost:5503'  
  ],
  credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'revizrlearn-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./database.files/database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Received registration:', { username, password });

    // Validate input
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 8) {
      console.log('Username too short');
      return res.status(400).json({ error: 'Username must be at least 8 characters long' });
    }

    // Password validation (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\W_]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('Password does not meet criteria');
      return res.status(400).json({ 
        error: 'Password must include uppercase, lowercase, number and special character' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed');

    // Insert user into database
    db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`, 
      [username, hashedPassword], 
      function(err) {
        if (err) {
          console.error('Database insert error:', err);
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username already exists' });
          }
          return res.status(500).json({ error: 'Error registering user' });
        }
        console.log("User registered:", username, "ID:", this.lastID);

        // Query users table to see what is in the DB
        db.all(`SELECT * FROM users`, [], (err, rows) => {
          if (err) {
            console.error('Error querying users table:', err);
          } else {
            console.log('Current users table:', rows);
          }
          return res.status(201).json({ 
            message: 'User registered successfully',
            userId: this.lastID 
          });
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login endpoint
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user exists
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error during login' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Compare passwords - use password_hash for your schema!
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      
      // Create session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      return res.status(200).json({ 
        message: 'Login successful',
        username: user.username
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Check authentication status
app.get('/api/auth-status', (req, res) => {
  if (req.session.userId) {
    return res.json({ 
      authenticated: true, 
      username: req.session.username 
    });
  } else {
    return res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error during logout' });
    }
    
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logout successful' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});