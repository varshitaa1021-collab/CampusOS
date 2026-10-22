# CampusOS
# 🎓 CampusOS

### Your personal command center for college life.

CampusOS is a student productivity dashboard designed to help students organize academic tasks, manage deadlines, track priorities, and stay focused while studying.

Instead of juggling assignments, deadlines, and study sessions across different apps, CampusOS brings essential productivity tools together in one place.

## ✨ Features

### 📋 Task Management
- Create tasks with titles, deadlines, and priorities.
- Edit existing tasks.
- Delete tasks when they're no longer needed.
- Mark tasks as completed or active.
- Filter tasks by status.

### ⏱️ Focus Timer
- Use a 25-minute focus session.
- Start, pause, resume, and reset the timer.
- Get a completion message when a focus session ends.

### 📊 Task Overview
- View the total number of tasks.
- Track completed tasks.
- See how many tasks remain unfinished.

### 💾 Persistent Storage
- Store tasks in an SQLite database.
- Keep tasks saved even after restarting the backend server.

### 🔌 Frontend–Backend Integration
- Connect the frontend to a REST API.
- Perform task creation, retrieval, updating, and deletion through backend endpoints.
- Display backend connection status.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and layout |
| JavaScript | Frontend functionality |
| Node.js | JavaScript runtime |
| Express.js | Backend server and REST API |
| SQLite | Persistent task storage |
| Git | Version control |
| GitHub | Source code hosting |

## 📁 Project Structure

```text
CampusOS/
├── index.html
├── style.css
├── app.js
├── .gitignore
└── backened/
    ├── server.js
    ├── database.js
    ├── package.json
    └── package-lock.json
```

## 🚀 Getting Started

Follow these steps to run CampusOS locally.

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)

### 1. Clone the repository

```bash
git clone https://github.com/varshitaa1021-collab/CampusOS.git
```

### 2. Open the project folder

```bash
cd CampusOS
```

### 3. Install backend dependencies

```bash
cd backened
npm install
```

### 4. Start the backend server

```bash
node server.js
```

The backend should start at:

`http://localhost:3000`

### 5. Check the backend connection

Open the following URL in your browser:

`http://localhost:3000/api/health`

A successful response confirms that the backend is running.

### 6. Open the frontend

Open `index.html` in your browser, or use the Live Server extension in VS Code.

Keep the backend terminal running while using the application.

## 🔗 API Endpoints

The backend exposes the following task-management endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/tasks` | Retrieve all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

## 🎯 Project Goals

CampusOS aims to make student life more organized by combining everyday academic planning and focused study sessions into a single application.

The project also serves as a hands-on exploration of frontend development, REST APIs, backend programming, database integration, and version control.

## 🗺️ Future Improvements

Planned enhancements include:

- 📅 Calendar and deadline management
- 🚨 Overdue task alerts
- 📈 Productivity analytics
- 🧠 Intelligent study planning
- 🏫 Class timetable and attendance tracking
- 📝 Subject-wise notes and assignment management
- ☁️ Online deployment and access across devices

These are planned features and are not yet part of the current implementation.

## 💡 What I'm Learning

Through CampusOS, I'm developing practical skills in:

- Building interactive web applications
- Designing and using REST APIs
- Connecting frontend interfaces to backend services
- Storing and retrieving data using SQLite
- Debugging and testing application functionality
- Managing code with Git and GitHub

## 👩‍💻 Author

**CampusOS Developer**

Built as a hands-on student project focused on learning, productivity, and practical software development.

---

⭐ If you find this project interesting, consider starring the repository!

*CampusOS: Organize your academics. Focus on your goals.*
