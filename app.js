
const API_URL = "http://localhost:3000/api/tasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDeadline = document.getElementById("taskDeadline");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const taskFilter = document.getElementById("taskFilter");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = [];
let isLoading = false;

function normalizeTask(task) {
  return {
    ...task,
    id: String(task.id),
    priority: (task.priority || "medium").toLowerCase(),
    deadline: task.deadline || "",
    completed: Boolean(task.completed)
  };
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function formatDeadline(date) {
  if (!date) return "No deadline";

  const parts = date.split("-").map(Number);
  const parsed = new Date(parts[0], parts[1] - 1, parts[2]);

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function loadTasks() {
  isLoading = true;
  renderTasks();

  try {
    const data = await request(API_URL);
    tasks = data.map(normalizeTask);
  } catch (error) {
    console.error("Could not load tasks:", error);
    alert("Could not load tasks. Make sure the backend is running.");
  } finally {
    isLoading = false;
    renderTasks();
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const filter = taskFilter.value;

  const visibleTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  document.getElementById("totalTasks").textContent = tasks.length;

  document.getElementById("completedTasks").textContent =
    tasks.filter(task => task.completed).length;

  document.getElementById("remainingTasks").textContent =
    tasks.filter(task => !task.completed).length;

  document.getElementById("taskCount").textContent =
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  if (isLoading) {
    emptyMessage.hidden = false;
    emptyMessage.textContent = "Loading tasks...";
    return;
  }

  emptyMessage.textContent = "No tasks yet. Add your first task!";
  emptyMessage.hidden = visibleTasks.length > 0;

  visibleTasks.forEach(task => {
    const card = makeElement(
      "article",
      `task-item${task.completed ? " completed" : ""}`
    );

    const main = makeElement("div", "task-main");

    const checkbox = makeElement("input", "task-check");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);
    checkbox.dataset.action = "toggle";
    checkbox.dataset.id = task.id;

    const content = makeElement("div", "task-content");

    content.append(
      makeElement("div", "task-title", task.title)
    );

    const meta = makeElement("div", "task-meta");

    meta.append(
      makeElement("span", "tag", formatDeadline(task.deadline))
    );

    meta.append(
      makeElement(
        "span",
        `tag priority-${task.priority}`,
        `${task.priority} priority`
      )
    );

    content.append(meta);
    main.append(checkbox, content);
    card.append(main);

    const actions = makeElement("div", "task-actions");

    const editButton = makeElement(
      "button",
      "small-button",
      "Edit"
    );

    editButton.type = "button";
    editButton.dataset.action = "edit";
    editButton.dataset.id = task.id;

    const deleteButton = makeElement(
      "button",
      "small-button delete-button",
      "Delete"
    );

    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.id = task.id;

    actions.append(editButton, deleteButton);
    card.append(actions);
    taskList.append(card);
  });
}

// Add a task
taskForm.addEventListener("submit", async event => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) return;

  try {
    const created = await request(API_URL, {
      method: "POST",
      body: JSON.stringify({
        title,
        deadline: taskDeadline.value,
        priority: taskPriority.value.toLowerCase()
      })
    });

    tasks.push(normalizeTask(created));
    renderTasks();

    taskForm.reset();
    taskPriority.value = "Medium";
    taskInput.focus();
  } catch (error) {
    alert("Could not add task: " + error.message);
  }
});

// Filter tasks
taskFilter.addEventListener("change", renderTasks);

// Mark a task completed or active
taskList.addEventListener("change", async event => {
  const checkbox = event.target.closest('[data-action="toggle"]');

  if (!checkbox) return;

  const task = tasks.find(item => item.id === checkbox.dataset.id);

  if (!task) return;

  const previous = task.completed;
  task.completed = checkbox.checked;
  renderTasks();

  try {
    const updated = await request(`${API_URL}/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({
        completed: task.completed
      })
    });

    Object.assign(task, normalizeTask(updated));
    renderTasks();
  } catch (error) {
    task.completed = previous;
    renderTasks();

    alert("Could not update task: " + error.message);
  }
});

// Edit or delete a task
taskList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const { action, id } = button.dataset;
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  if (action === "delete") {
    if (!confirm(`Delete "${task.title}"?`)) return;

    try {
      await request(`${API_URL}/${task.id}`, {
        method: "DELETE"
      });

      tasks = tasks.filter(item => item.id !== id);
      renderTasks();
    } catch (error) {
      alert("Could not delete task: " + error.message);
    }

    return;
  }

  if (action === "edit") {
    const newTitle = prompt("Edit task name:", task.title);

    if (newTitle === null) return;

    const cleanedTitle = newTitle.trim();

    if (!cleanedTitle) {
      alert("Task name cannot be empty.");
      return;
    }

    const newDeadline = prompt(
      "Deadline (YYYY-MM-DD), or leave blank for none:",
      task.deadline
    );

    if (newDeadline === null) return;

    if (newDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(newDeadline)) {
      alert("Enter the deadline in YYYY-MM-DD format.");
      return;
    }

    if (newDeadline) {
      const [year, month, day] = newDeadline.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        alert("That date is not valid.");
        return;
      }
    }

    const newPriority = prompt(
      "Priority: Low, Medium, or High",
      task.priority
    );

    if (newPriority === null) return;

    const priority = newPriority.trim().toLowerCase();

    if (!["low", "medium", "high"].includes(priority)) {
      alert("Priority must be Low, Medium, or High.");
      return;
    }

    try {
      const updated = await request(`${API_URL}/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: cleanedTitle,
          deadline: newDeadline,
          priority,
          completed: Boolean(task.completed)
        })
      });

      Object.assign(task, normalizeTask(updated));
      renderTasks();
    } catch (error) {
      alert("Could not edit task: " + error.message);
    }
  }
});

// Focus timer
const timerDisplay = document.getElementById("timerDisplay");
const startButton = document.getElementById("startTimer");
const resetButton = document.getElementById("resetTimer");
const timerStatus = document.getElementById("timerStatus");

const FOCUS_SECONDS = 25 * 60;
let timeLeft = FOCUS_SECONDS;
let timerInterval = null;

function displayTime() {
  timerDisplay.textContent =
    `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:` +
    `${String(timeLeft % 60).padStart(2, "0")}`;
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

startButton.addEventListener("click", () => {
  if (timerInterval !== null) {
    stopTimer();
    startButton.textContent = "Resume";
    timerStatus.textContent = "Timer paused. Resume when ready.";
    return;
  }

  if (timeLeft === 0) {
    timeLeft = FOCUS_SECONDS;
    displayTime();
  }

  startButton.textContent = "Pause";
  timerStatus.textContent = "Focus session in progress.";

  timerInterval = setInterval(() => {
    timeLeft--;
    displayTime();

    if (timeLeft <= 0) {
      stopTimer();
      timeLeft = 0;
      displayTime();

      startButton.textContent = "Start again";
      timerStatus.textContent =
        "Focus session complete. Take a short break!";
    }
  }, 1000);
});

resetButton.addEventListener("click", () => {
  stopTimer();
  timeLeft = FOCUS_SECONDS;
  displayTime();

  startButton.textContent = "Start";
  timerStatus.textContent = "Ready for a 25-minute focus session.";
});

displayTime();

// Check backend connection
async function checkBackend() {
  const status = document.getElementById("backend-status");

  if (!status) return;

  status.textContent = "Connecting to backend...";

  try {
    const response = await fetch("http://localhost:3000/api/health");

    if (!response.ok) {
      throw new Error("Server returned an error");
    }

    const data = await response.json();
    status.textContent = data.message;
  } catch (error) {
    status.textContent =
      "Cannot connect. Check whether the backend is running.";

    console.error("Backend error:", error);
  }
}

const checkButton = document.getElementById("check-backend");

if (checkButton) {
  checkButton.addEventListener("click", checkBackend);
}

checkBackend();
loadTasks();
