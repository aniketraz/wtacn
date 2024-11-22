const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "webuser",
    password: "password123",
    database: "user_auth"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL connected.");
});

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Register Endpoint
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, hashedPassword], (err) => {
        if (err) {
            res.status(500).json({ message: "User registration failed." });
        } else {
            res.json({ message: "User registered successfully." });
        }
    });
});

// Login Endpoint
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err || results.length === 0) {
            res.status(401).json({ message: "Invalid username or password." });
        } else {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ message: "Login successful." });
            } else {
                res.status(401).json({ message: "Invalid username or password." });
            }
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
