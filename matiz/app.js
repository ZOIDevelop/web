const STORAGE_KEY = "matiz.tasks.v1";
const LOG_KEY = "matiz.completed.v1";
const SETTINGS_KEY = "matiz.settings.v1";

const quadrants = {
  "alta:alto": "Produccion",
  "alta:bajo": "Distraccion",
  "baja:alto": "Reemplazo",
  "baja:bajo": "Delegacion",
};

const state = {
  tasks: readJson(STORAGE_KEY, []),
  completed: readJson(LOG_KEY, []),
  settings: readJson(SETTINGS_KEY, { webhookUrl: "" }),
};

const form = document.querySelector("#taskForm");
const template = document.querySelector("#taskTemplate");
const settingsButton = document.querySelector("#settingsButton");
const settingsPanel = document.querySelector("#settingsPanel");
const webhookUrl = document.querySelector("#webhookUrl");
const saveSettings = document.querySelector("#saveSettings");
const downloadLog = document.querySelector("#downloadLog");
const completedCount = document.querySelector("#completedCount");

webhookUrl.value = state.settings.webhookUrl || "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const text = String(data.get("taskText") || "").trim();
  const energy = String(data.get("energy"));
  const value = String(data.get("value"));

  if (!text) return;

  state.tasks.unshift({
    id: crypto.randomUUID(),
    text,
    energy,
    value,
    quadrant: quadrants[`${energy}:${value}`],
    createdAt: new Date().toISOString(),
  });

  persist();
  form.reset();
  render();
});

settingsButton.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

saveSettings.addEventListener("click", () => {
  state.settings.webhookUrl = webhookUrl.value.trim();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  settingsPanel.classList.add("hidden");
});

downloadLog.addEventListener("click", () => {
  const rows = [
    ["id", "text", "quadrant", "energy", "value", "createdAt", "completedAt"],
    ...state.completed.map((item) => [
      item.id,
      item.text,
      item.quadrant,
      item.energy,
      item.value,
      item.createdAt,
      item.completedAt,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `matiz-completadas-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

function render() {
  for (const quadrant of Object.values(quadrants)) {
    document.querySelector(`#${quadrant}`).innerHTML = "";
  }

  for (const task of state.tasks) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.querySelector(".task-copy").textContent = task.text;
    card.querySelector(".task-meta").textContent = `${label(task.energy)} energia · ${label(task.value)} valor`;
    card.querySelector(".done-button").addEventListener("click", () => completeTask(task.id));
    card.querySelector(".move-button").addEventListener("click", () => moveTask(task.id));
    document.querySelector(`#${task.quadrant}`).append(card);
  }

  completedCount.textContent = `${state.completed.length} registradas`;
}

function moveTask(id) {
  const order = ["Produccion", "Distraccion", "Reemplazo", "Delegacion"];
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  const nextQuadrant = order[(order.indexOf(task.quadrant) + 1) % order.length];
  task.quadrant = nextQuadrant;
  task.energy = nextQuadrant === "Produccion" || nextQuadrant === "Distraccion" ? "alta" : "baja";
  task.value = nextQuadrant === "Produccion" || nextQuadrant === "Reemplazo" ? "alto" : "bajo";
  persist();
  render();
}

async function completeTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  const completed = {
    ...task,
    completedAt: new Date().toISOString(),
  };

  state.tasks = state.tasks.filter((item) => item.id !== id);
  state.completed.unshift(completed);
  persist();
  render();

  if (state.settings.webhookUrl) {
    try {
      await fetch(state.settings.webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completed),
      });
    } catch {
      state.tasks.unshift(task);
      state.completed = state.completed.filter((item) => item.id !== id);
      persist();
      render();
      alert("No se pudo registrar la tarea. Revisa la URL webhook de n8n.");
    }
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  localStorage.setItem(LOG_KEY, JSON.stringify(state.completed));
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function label(value) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

render();
