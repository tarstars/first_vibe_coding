const inputEl = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty-state");

let todos = [];

async function fetchJSON(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const message = (await res.json().catch(() => ({}))).error || res.statusText;
    throw new Error(message);
  }

  return res.status === 204 ? null : res.json();
}

function renderTodos() {
  listEl.innerHTML = "";

  if (!todos.length) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.className = "todo-checkbox";
    checkbox.addEventListener("change", () => toggleTodo(todo.id, checkbox.checked));

    const text = document.createElement("span");
    text.className = `todo-text${todo.done ? " done" : ""}`;
    text.textContent = todo.text;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.type = "button";
    delBtn.textContent = "Удалить";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, text, delBtn);
    listEl.appendChild(li);
  });
}

async function loadTodos() {
  try {
    todos = await fetchJSON("/api/todos");
    renderTodos();
  } catch (err) {
    alert(`Не удалось загрузить список: ${err.message}`);
  }
}

async function addTodo() {
  const text = inputEl.value.trim();
  if (!text) {
    inputEl.focus();
    return;
  }

  addBtn.disabled = true;
  try {
    const todo = await fetchJSON("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    todos.push(todo);
    inputEl.value = "";
    renderTodos();
  } catch (err) {
    alert(`Не удалось добавить дело: ${err.message}`);
  } finally {
    addBtn.disabled = false;
  }
}

async function toggleTodo(id, done) {
  try {
    const updated = await fetchJSON(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ done }),
    });
    todos = todos.map((item) => (item.id === id ? updated : item));
    renderTodos();
  } catch (err) {
    alert(`Не удалось обновить дело: ${err.message}`);
    // Re-render to reset checkbox to previous state
    renderTodos();
  }
}

async function deleteTodo(id) {
  try {
    await fetchJSON(`/api/todos/${id}`, { method: "DELETE" });
    todos = todos.filter((item) => item.id !== id);
    renderTodos();
  } catch (err) {
    alert(`Не удалось удалить дело: ${err.message}`);
  }
}

addBtn.addEventListener("click", addTodo);

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});

loadTodos();
