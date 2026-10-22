
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Prepare database queries
const getAllTasks = db.prepare(
    "SELECT * FROM tasks ORDER BY id DESC"
);

const getTaskById = db.prepare(
    "SELECT * FROM tasks WHERE id = ?"
);

const createTask = db.prepare(`
    INSERT INTO tasks (title, priority, deadline, completed)
    VALUES (?, ?, ?, 0)
`);

const updateTask = db.prepare(`
    UPDATE tasks
    SET title = ?, priority = ?, deadline = ?, completed = ?
    WHERE id = ?
`);

const deleteTask = db.prepare(
    "DELETE FROM tasks WHERE id = ?"
);

// Convert SQLite task format into API format
function formatTask(task) {
    if (!task) return null;

    return {
        ...task,
        completed: Boolean(task.completed)
    };
}

// 1. Check backend connection
app.get("/api/health", (req, res) => {
    res.json({
        message: "CampusOS backend is running!",
        status: "success"
    });
});

// 2. Get all tasks
app.get("/api/tasks", (req, res) => {
    const tasks = getAllTasks.all().map(formatTask);
    res.json(tasks);
});

// 3. Create a task
app.post("/api/tasks", (req, res) => {
    const { title, priority, deadline } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const result = createTask.run(
        title.trim(),
        priority || "medium",
        deadline || ""
    );

    const task = getTaskById.get(result.lastInsertRowid);

    res.status(201).json(formatTask(task));
});

// 4. Update a task
app.put("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const existing = getTaskById.get(id);

    if (!existing) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    const { title, priority, deadline, completed } = req.body;

    const updatedTitle = title === undefined
        ? existing.title
        : title;

    if (typeof updatedTitle !== "string" || !updatedTitle.trim()) {
        return res.status(400).json({
            error: "Task title cannot be empty"
        });
    }

    const updatedPriority = priority ?? existing.priority;
    const updatedDeadline = deadline ?? existing.deadline;
    const updatedCompleted = completed === undefined
        ? existing.completed
        : completed;

    if (typeof updatedCompleted !== "boolean") {
        return res.status(400).json({
            error: "Completed must be true or false"
        });
    }

    updateTask.run(
        updatedTitle.trim(),
        updatedPriority,
        updatedDeadline,
        updatedCompleted ? 1 : 0,
        id
    );

    res.json(formatTask(getTaskById.get(id)));
});

// 5. Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const existing = getTaskById.get(id);

    if (!existing) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    deleteTask.run(id);

    res.json({
        message: "Task deleted successfully",
        task: formatTask(existing)
    });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `CampusOS backend running at http://localhost:${PORT}`
    );
});
