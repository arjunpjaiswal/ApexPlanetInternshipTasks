/* ============ HELPERS ============ */
const $ = (s) => document.querySelector(s);
const store = {
  get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
};

/* ============ THEME TOGGLE ============ */
const root = document.documentElement;
const savedTheme = store.get("hub-theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
$("#themeBtn").addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark" ||
    (!root.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  store.set("hub-theme", next);
});

/* ============ MOBILE MENU ============ */
const menu = $("#menu"), menuBtn = $("#menuBtn");
menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
});

/* ============ TO-DO LIST ============ */
let tasks = [];
let filter = "all";
try { tasks = JSON.parse(store.get("hub-tasks")) || []; } catch(e) { tasks = []; }
if (!tasks.length && !store.get("hub-tasks")) {
  tasks = [
    { id: 1, text: "Solve 2 LeetCode problems", done: false },
    { id: 2, text: "Revise DBMS normalization", done: false }
  ];
}
const list = $("#taskList"), input = $("#taskInput"), taskMsg = $("#taskMsg");

function save(){ store.set("hub-tasks", JSON.stringify(tasks)); }

function render(){
  list.innerHTML = "";
  const shown = tasks.filter(t => filter === "all" || (filter === "done" ? t.done : !t.done));
  if (!shown.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = tasks.length ? "Nothing here for this filter." : "No tasks yet. Add your first one above.";
    list.appendChild(li);
  }
  shown.forEach(t => {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " done" : "");
    const label = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = t.done;
    cb.addEventListener("change", () => { t.done = cb.checked; save(); render(); });
    const span = document.createElement("span");
    span.textContent = t.text;           // textContent keeps user input safe from HTML injection
    label.append(cb, span);
    const del = document.createElement("button");
    del.className = "del"; del.type = "button"; del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task: " + t.text);
    del.addEventListener("click", () => { tasks = tasks.filter(x => x.id !== t.id); save(); render(); });
    li.append(label, del);
    list.appendChild(li);
  });
  const doneCount = tasks.filter(t => t.done).length;
  $("#counter").textContent = doneCount + " of " + tasks.length + " completed";
}

function addTask(){
  const text = input.value.trim();
  if (!text) { taskMsg.textContent = "Type a task before adding it."; return; }
  if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) {
    taskMsg.textContent = "That task is already on your list."; return;
  }
  tasks.push({ id: Date.now(), text, done: false });
  taskMsg.textContent = ""; input.value = "";
  save(); render(); input.focus();
}
$("#addBtn").addEventListener("click", addTask);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });
input.addEventListener("input", () => taskMsg.textContent = "");
document.querySelectorAll(".filters button").forEach(b => b.addEventListener("click", () => {
  filter = b.dataset.filter;
  document.querySelectorAll(".filters button").forEach(x => x.setAttribute("aria-pressed", x === b));
  render();
}));
render();

/* ============ CONTACT FORM VALIDATION ============ */
const form = $("#contactForm");
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const rules = {
  name:    v => !v ? "Enter your name." : v.length < 2 ? "Name must be at least 2 characters." : "",
  email:   v => !v ? "Enter your email." : !emailRe.test(v) ? "Enter a valid email, like name@example.com." : "",
  message: v => !v ? "Enter a message." : v.length < 10 ? "Message must be at least 10 characters." : ""
};
function check(id){
  const el = $("#" + id), err = rules[id](el.value.trim());
  $("#" + id + "Err").textContent = err;
  el.closest(".field").classList.toggle("invalid", !!err);
  el.setAttribute("aria-invalid", !!err);
  return !err;
}
Object.keys(rules).forEach(id => $("#" + id).addEventListener("blur", () => check(id)));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const results = Object.keys(rules).map(check);   // run all so every error shows at once
  const ok = results.every(Boolean);
  $("#success").classList.toggle("show", ok);
  if (ok) form.reset();
  else $(".invalid input, .invalid textarea").focus();
});
