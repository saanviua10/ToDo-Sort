const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Supabase PostgreSQL using your project connection string
const pool = new Pool({
    connectionString: 'postgresql://postgres:ToDoSorter2@db.zdevlbbezeazieqoxdtb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('Connected to Supabase PostgreSQL!'))
    .catch(err => console.error('Database connection error:', err));

// 1. Get all tasks (sorted by priority and due date / sort value)
app.get('/api/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY sort_value ASC');
        // Map database columns to match what your frontend (todo.js) expects
        const tasks = result.rows.map(row => ({
            _id: row.id,
            text: row.text,
            dueDate: row.due_date,
            time: row.time,
            priority: row.priority,
            checked: row.checked,
            sortValue: row.sort_value
        }));
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add a new task
app.post('/api/tasks', async (req, res) => {
    try {
        const { text, dueDate, time, priority, checked, sortValue } = req.body;
        const query = `
            INSERT INTO tasks (text, due_date, time, priority, checked, sort_value) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
        const values = [text, dueDate, time, priority, checked || false, sortValue];
        
        const result = await pool.query(query, values);
        const row = result.rows[0];
        
        res.status(201).json({
            _id: row.id,
            text: row.text,
            dueDate: row.due_date,
            time: row.time,
            priority: row.priority,
            checked: row.checked,
            sortValue: row.sort_value
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Update task checked status
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { checked } = req.body;
        const result = await pool.query(
            'UPDATE tasks SET checked = $1 WHERE id = $2 RETURNING *',
            [checked, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. Delete a single task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Clear all tasks
app.delete('/api/tasks', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks');
        res.json({ message: "All tasks cleared" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));