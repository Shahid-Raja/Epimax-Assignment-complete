const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Initialize SQLite database
const db = new sqlite3.Database(":memory:"); // In-memory database for demonstration purposes

// Create Tasks table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            status TEXT,
            assignee_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// POST /tasks - Create a new task
app.post("/tasks", (req, res) => {
  const { title, description, status, assignee_id } = req.body;
  db.run(
    `INSERT INTO Tasks (title, description, status, assignee_id) VALUES (?, ?, ?, ?)`,
    [title, description, status, assignee_id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// GET /tasks - Retrieve all tasks
app.get("/tasks", (req, res) => {
  db.all(`SELECT * FROM Tasks`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /tasks/:id - Retrieve a specific task by ID
app.get("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM Tasks WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(row);
  });
});

// PUT /tasks/:id - Update a specific task by ID
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, status, assignee_id } = req.body;
  db.run(
    `UPDATE Tasks SET title = ?, description = ?, status = ?, assignee_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [title, description, status, assignee_id, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json({ message: "Task updated successfully" });
    }
  );
});

// DELETE /tasks/:id - Delete a specific task by ID
app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM Tasks WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
