const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke database MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || '34.101.42.151',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'notes_db',
    port: process.env.DB_PORT || 3306
});

// Coba koneksi database
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // Hentikan server jika koneksi gagal
    }
    console.log("Database Connected...");

    // Buat tabel 'notes' jika belum ada
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error("Gagal membuat tabel:", err);
        } else {
            console.log("Tabel 'notes' siap digunakan atau sudah ada.");
        }
    });
});

// Endpoint untuk mendapatkan semua catatan
app.get('/notes', (req, res) => {
    const sql = "SELECT * FROM notes ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Gagal mengambil data notes" });
        }
        res.json(results);
    });
});

app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "Judul dan konten harus diisi" });
    }

    const sql = "INSERT INTO notes (title, content) VALUES (?, ?)";
    db.query(sql, [title, content], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Gagal menambahkan catatan" });
        }
        res.json({ message: "Catatan berhasil ditambahkan", id: result.insertId });
    });
});

// Endpoint untuk mengedit catatan
app.put('/notes/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Judul dan konten harus diisi" });
    }

    const sql = "UPDATE notes SET title = ?, content = ? WHERE id = ?";
    db.query(sql, [title, content, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Gagal memperbarui catatan" });
        }
        res.json({ message: "Catatan berhasil diperbarui" });
    });
});

app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM notes WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Gagal menghapus catatan" });
        }
        res.json({ message: "Catatan berhasil dihapus" });
    });
});

// Jalankan server di Cloud Run dengan PORT=8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
