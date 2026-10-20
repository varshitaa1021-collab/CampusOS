
const $ = (selector) => document.querySelector(selector);

const form = $("#task-form");
const titleInput = $("#task-title");
const subjectInput = $("#task-subject");
const deadlineInput = $("#task-deadline");
const taskList = $("#task-list");

let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem("campusos-tasks") || "[]");
  if (Array.isArray(saved)) tasks = saved;
} catch {
  tasks = [];
}

let currentFilter = "all";

$("#today").textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const today = new Date();
const localToday = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

deadlineInput.min = localToday;

function saveTasks() {
  localStorage.setItem("campusos-tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const completed = tasks.filter(task => task.done).length;

  $("#total").textContent = tasks.length;
  $("#completed").textContent = completed;
  $("#remaining").textContent = tasks.length - completed;

  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.done;
    if (currentFilter === "completed") return task.done;
    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = tasks.length === 0
      ? "No assignments yet. Add your first task above!"
      : "No tasks in this filter.";
    taskList.append(empty);
    return;
  }

  visibleTasks.forEach(task => {
    const row = document.createElement("div");
    row.className = `task${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement("div");
    info.className = "task-info";

    const title = document.createElement("strong");
    title.textContent = task.title;

    const details = document.createElement("p");
    details.textContent = `${task.subject} · Due ${task.deadline}`;

    info.append(title, details);

    const remove = document.createElement("button");
    remove.className = "delete";
    remove.textContent = "Delete";
    remove.setAttribute("aria-label", `Delete ${task.title}`);

    remove.addEventListener("click", () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    row.append(checkbox, info, remove);
    taskList.append(row);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const deadline = deadlineInput.value;

  if (!title || !deadline) return;

  tasks.push({
    id: crypto.randomUUID(),
    title,
    subject: subjectInput.value,
    deadline,
    done: false
  });

  saveTasks();
  renderTasks();
  form.reset();
  deadlineInput.min = localToday;
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderTasks();
  });
});

// Focus timer

let secondsLeft = 25 * 60;
let timerInterval = null;

function updateTimer() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  $("#timer").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

$("#timer-start").addEventListener("click", () => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
    $("#timer-start").textContent = "Resume focus";
    $("#timer-status").textContent = "Session paused.";
    return;
  }

  if (secondsLeft === 0) secondsLeft = 25 * 60;

  $("#timer-start").textContent = "Pause focus";
  $("#timer-status").textContent = "Focus session in progress.";

  timerInterval = setInterval(() => {
    secondsLeft--;
    updateTimer();

    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      $("#timer-start").textContent = "Start focus";
      $("#timer-status").textContent =
        "Session complete! Take a short break.";
    }
  }, 1000);
});

$("#timer-reset").addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  secondsLeft = 25 * 60;
  updateTimer();
  $("#timer-start").textContent = "Start focus";
  $("#timer-status").textContent = "Ready when you are.";
});

updateTimer();
renderTasks();
