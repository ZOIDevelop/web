const STORAGE_KEY = "zoi-matriz.tasks.v1";
const LOG_KEY = "zoi-matriz.completed.v1";
const ACCESS_KEY = "zoi-matriz.access.v1";
const SEED_KEY = "zoi-matriz.seed.zoi-tasks.v1";
const ACCESS_HASH = "aedfe4ef5b9cacc89e9f7ada947a94a5d7050e060b24a2d21e07a19a0930a826";
const WEBHOOK_URL = "https://zoidevelop.app.n8n.cloud/webhook/zoi-matriz/completadas";

const quadrants = {
  "alta:alto": "Produccion",
  "alta:bajo": "Distraccion",
  "baja:alto": "Reemplazo",
  "baja:bajo": "Delegacion",
};

const state = {
  tasks: readJson(STORAGE_KEY, []),
  completed: readJson(LOG_KEY, []),
};

const seedTasks = [
  { text: "Fresado Martin", energy: "baja", value: "alto" },
  { text: "Madebu portarelojes", energy: "alta", value: "alto" },
  { text: "Madebu logos", energy: "alta", value: "alto" },
  { text: "Madebu Banca", energy: "alta", value: "alto" },
  { text: "Retirar fresadora y brazo", energy: "baja", value: "alto" },
  { text: "Capacitacion Presencial", energy: "alta", value: "alto" },
  { text: "Revisar y empacar Quitopia", energy: "baja", value: "alto" },
  { text: "Moldes maderas Madebu", energy: "alta", value: "alto" },
  { text: "Documentos para pago", energy: "baja", value: "alto" },
  { text: "Link presentacion", energy: "baja", value: "bajo" },
  { text: "Documento de entrega de maquinaria", energy: "baja", value: "alto" },
  { text: "Formato acta entrega recepcion total", energy: "baja", value: "alto" },
];

const form = document.querySelector("#taskForm");
const template = document.querySelector("#taskTemplate");
const downloadLog = document.querySelector("#downloadLog");
const completedCount = document.querySelector("#completedCount");
const accessScreen = document.querySelector("#accessScreen");
const accessForm = document.querySelector("#accessForm");
const accessKey = document.querySelector("#accessKey");
const accessError = document.querySelector("#accessError");
const appShell = document.querySelector("#appShell");

accessForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const hash = await sha256(accessKey.value);

  if (hash !== ACCESS_HASH) {
    accessError.classList.remove("hidden");
    accessKey.select();
    return;
  }

  sessionStorage.setItem(ACCESS_KEY, "true");
  unlockApp();
});

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
  link.download = `zoi-matriz-completadas-${new Date().toISOString().slice(0, 10)}.csv`;
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

  try {
    await fetch(WEBHOOK_URL, {
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
    alert("No se pudo registrar la tarea. Revisa el webhook de n8n.");
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

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hashBuffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function unlockApp() {
  accessScreen.classList.add("access-granted");
  appShell.classList.remove("app-locked");
  seedInitialTasks();
  render();
}

function seedInitialTasks() {
  if (localStorage.getItem(SEED_KEY) === "true" || state.tasks.length > 0) return;

  state.tasks = seedTasks.map((task) => ({
    id: crypto.randomUUID(),
    ...task,
    quadrant: quadrants[`${task.energy}:${task.value}`],
    createdAt: new Date().toISOString(),
  }));
  localStorage.setItem(SEED_KEY, "true");
  persist();
}

if (sessionStorage.getItem(ACCESS_KEY) === "true") {
  unlockApp();
} else {
  accessKey.focus();
}
