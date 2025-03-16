const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'notes_db'
});

db.connect(err => {
    if (err) throw err;
    console.log("Database Connected...");
});

// Route untuk cek server
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Jalankan server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});

// Get all notes
app.get("/notes", (req, res) => {
    db.query("SELECT * FROM notes", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get a single note by ID
app.get("/notes/:id", (req, res) => {
    db.query("SELECT * FROM notes WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

// Create a new note
app.post("/notes", (req, res) => {
    const { title, content } = req.body;
    db.query("INSERT INTO notes (title, content) VALUES (?, ?)", [title, content], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId, title, content });
    });
});

// Update a note
app.put("/notes/:id", (req, res) => {
    const { title, content } = req.body;
    db.query("UPDATE notes SET title = ?, content = ? WHERE id = ?", [title, content, req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Note updated" });
    });
});

// Delete a note
app.delete("/notes/:id", (req, res) => {
    db.query("DELETE FROM notes WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Note deleted" });
    });
});
