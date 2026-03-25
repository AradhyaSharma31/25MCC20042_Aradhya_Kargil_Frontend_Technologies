let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const form = document.getElementById("task-form");
const taskContainer = document.getElementById("task-container");
const filterEl = document.getElementById("filter");
const sortEl = document.getElementById("sort");

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("task-title").value.trim();
  const priority = document.getElementById("task-priority").value;
  const deadline = document.getElementById("task-deadline").value;

  if (!title) return alert("Task cannot be empty!");

  tasks.push({
    id: Date.now(),
    title,
    priority,
    deadline,
    completed: false,
  });

  form.reset();
  saveTasks();
  debouncedRender();
});

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  debouncedRender();
}

function toggleComplete(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();
  debouncedRender();
}

const priorityOrder = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function renderTasks() {
  let filtered = [...tasks];

  const filter = filterEl.value;
  if (filter === "completed") {
    filtered = filtered.filter(t => t.completed);
  } else if (filter === "pending") {
    filtered = filtered.filter(t => !t.completed);
  }

  const sort = sortEl.value;
  if (sort === "priority") {
    filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  } else if (sort === "deadline") {
    filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  taskContainer.innerHTML = "";

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const today = new Date().toISOString().split("T")[0];
    if (task.deadline && task.deadline < today) {
      li.classList.add("border", "border-danger");
    }

    let textClass = task.completed ? "text-decoration-line-through text-muted" : "";

    let badgeClass =
      task.priority === "High"
        ? "bg-danger"
        : task.priority === "Medium"
        ? "bg-warning"
        : "bg-success";

    li.innerHTML = `
      <div>
        <span class="${textClass}">${task.title}</span>
        <span class="badge ${badgeClass} ms-2">${task.priority}</span>
        <small class="ms-2">${task.deadline || ""}</small>
      </div>

      <div>
        <button class="btn btn-sm btn-success me-2" onclick="toggleComplete(${task.id})">
          complete
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})">
          delete
        </button>
      </div>
    `;

    taskContainer.appendChild(li);
  });

  updateCounters();
}

function updateCounters() {
  document.getElementById("total-count").textContent = tasks.length;
  document.getElementById("completed-count").textContent =
    tasks.filter(t => t.completed).length;
  document.getElementById("pending-count").textContent =
    tasks.filter(t => !t.completed).length;
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const debouncedRender = debounce(renderTasks, 300);

renderTasks();