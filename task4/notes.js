const KEY = "portfolio-notes";
let notes = load(), editingId = null;
const $ = s => document.querySelector(s);
function load(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function save(){ try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch (e) {} }

function render(){
  const q = $("#search").value.trim().toLowerCase();
  const shown = notes.filter(n => (n.title + " " + n.body).toLowerCase().includes(q));
  $("#count").textContent = shown.length + " of " + notes.length + " notes";
  const box = $("#list"); box.innerHTML = "";
  if (!shown.length) {
    box.innerHTML = '<p class="empty">' + (notes.length ? "No notes match your search." : "No notes yet. Write your first one above.") + "</p>";
    return;
  }
  shown.forEach(n => {
    const el = document.createElement("article"); el.className = "card note";
    const h = document.createElement("h3"); h.textContent = n.title;
    const p = document.createElement("p"); p.textContent = n.body;      // textContent blocks HTML injection
    const s = document.createElement("small"); s.textContent = new Date(n.id).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const row = document.createElement("div");
    const edit = document.createElement("button"); edit.className = "mini"; edit.textContent = "Edit";
    edit.addEventListener("click", () => { editingId = n.id; $("#title").value = n.title; $("#body").value = n.body; $("#saveBtn").textContent = "Update note"; $("#title").focus(); });
    const del = document.createElement("button"); del.className = "mini del"; del.textContent = "Delete";
    del.addEventListener("click", () => { notes = notes.filter(x => x.id !== n.id); save(); render(); });
    row.append(edit, del); el.append(h, p, s, row); box.appendChild(el);
  });
}
$("#noteForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = $("#title").value.trim(), body = $("#body").value.trim();
  if (!title || !body) { $("#msg").textContent = "Add both a title and some text."; return; }
  if (editingId) {
    const n = notes.find(x => x.id === editingId); n.title = title; n.body = body;
    editingId = null; $("#saveBtn").textContent = "Save note";
  } else notes.unshift({ id: Date.now(), title, body });               // newest first
  $("#noteForm").reset(); $("#msg").textContent = "";
  save(); render();
});
$("#title").addEventListener("input", () => $("#msg").textContent = "");
$("#search").addEventListener("input", render);
render();
