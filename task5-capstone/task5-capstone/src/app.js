/* Capstone: advanced portfolio. Vanilla JS, no dependencies. */
const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));
const store = {
  get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },   // Safari private mode can throw
  set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
};
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ---------- Theme ---------- */
const root = document.documentElement, themeBtn = q("#themeBtn");
const isDark = () => { const t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; };
const syncTheme = () => { themeBtn.textContent = isDark() ? "Light mode" : "Dark mode"; };
themeBtn.addEventListener("click", () => {
  const next = isDark() ? "light" : "dark";
  root.setAttribute("data-theme", next); store.set("cap-theme", next); syncTheme();
});
syncTheme();

/* ---------- Mobile menu, scroll spy, back to top ---------- */
const menuBtn = q("#menuBtn"), navList = q("#nav"), links = qa("#nav a");
menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", navList.classList.toggle("open")));
links.forEach(a => a.addEventListener("click", () => { navList.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
if ("IntersectionObserver" in window) {            // older browsers simply skip the highlight
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-40% 0px -55% 0px" });
  links.forEach(a => { const s = q(a.getAttribute("href")); if (s) io.observe(s); });
}
const toTop = q("#toTop");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 600), { passive: true });
q("#yr").textContent = new Date().getFullYear();

/* ---------- Projects: tag filter + search ---------- */
const PROJECTS = [
  { n: "Google Search Engine", d: "Ranks pages with TF-IDF and uses Groq LLaMA for AI-generated answers.", t: ["Spring Boot", "AI"], i: "search" },
  { n: "SQL Query Builder", d: "A Java library that builds SQL with the Builder pattern, JDBC and SOLID principles.", t: ["Java", "Library"], i: "sql" },
  { n: "Hospital Management System", d: "A Spring Boot app being upgraded from basic CRUD with advanced patterns.", t: ["Spring Boot", "MySQL"], i: "hms" },
  { n: "Java RAG Library", d: "A retrieval-augmented generation pipeline that ingests PDFs, web pages and Drive files.", t: ["Java", "AI", "Library"], i: "rag" },
  { n: "Quora-style API", d: "A questions-and-answers backend with a recommendation feature in progress.", t: ["Spring Boot", "API"], i: "api" }
];
let activeTag = "All";
const tagBox = q("#tagChips"), pSearch = q("#pSearch"), pGrid = q("#pGrid");
["All", ...new Set(PROJECTS.flatMap(p => p.t))].forEach(t => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = t; b.setAttribute("aria-pressed", t === "All");
  b.addEventListener("click", () => {
    activeTag = t; qa("#tagChips button").forEach(x => x.setAttribute("aria-pressed", x === b)); renderProjects();
  });
  tagBox.appendChild(b);
});
function renderProjects(){
  const term = pSearch.value.trim().toLowerCase();
  const list = PROJECTS.filter(p => (activeTag === "All" || p.t.includes(activeTag)) && (p.n + " " + p.d).toLowerCase().includes(term));
  pGrid.innerHTML = list.length ? list.map(p =>
    '<article class="card pcard"><img class="pimg" src="img/' + p.i + '.svg" alt="' + p.n + ' cover" width="640" height="360" loading="lazy" decoding="async">' +
    '<div class="pbody"><h3>' + p.n + '</h3><p class="muted">' + p.d + "</p>" +
    p.t.map(t => '<span class="tag">' + t + "</span>").join("") + "</div></article>"
  ).join("") : '<p class="empty">No projects match. Try another tag or clear the search.</p>';
}
pSearch.addEventListener("input", debounce(renderProjects, 150));
renderProjects();

/* ---------- Skills: category + minimum strength + sort ---------- */
const SKILLS = [   // name, category, strength out of 10, logo file in img/
  ["Java","Languages",9,"java"],["JavaScript","Languages",6,"javascript"],["Spring Boot","Backend",8,"springboot"],
  ["JDBC","Backend",8,"jdbc"],["REST APIs","Backend",8,"rest"],["MySQL","Databases",8,"mysql"],["SQL","Databases",8,"sql"],
  ["Design patterns","Concepts",8,"patterns"],["Data structures and algorithms","Concepts",6,"dsa"],
  ["RAG pipelines","AI",7,"rag"],["LLM integration (Groq)","AI",7,"llm"],["HTML and CSS","Frontend",6,"html"],["React","Frontend",6,"react"]
];
const sCat = q("#sCat"), sMin = q("#sMin"), sSort = q("#sSort"), sGrid = q("#sGrid");
[...new Set(SKILLS.map(s => s[1]))].forEach(c => sCat.add(new Option(c, c)));
const by = {
  strong: (a, b) => b[2] - a[2] || a[0].localeCompare(b[0]), weak: (a, b) => a[2] - b[2] || a[0].localeCompare(b[0]),
  name: (a, b) => a[0].localeCompare(b[0]), cat: (a, b) => a[1].localeCompare(b[1]) || b[2] - a[2]
};
function renderSkills(){
  const low = +sMin.value;
  q("#sMinOut").textContent = low + "/10 or more";
  const list = SKILLS.filter(s => (sCat.value === "all" || s[1] === sCat.value) && s[2] >= low).sort(by[sSort.value]);
  q("#sCount").textContent = "Showing " + list.length + " of " + SKILLS.length + " skills";
  sGrid.innerHTML = list.length ? list.map(s =>
    '<article class="card"><div class="shead"><img class="slogo" src="img/skill-' + s[3] + '.svg" alt="" width="40" height="40" loading="lazy" decoding="async">' +
    '<div><h3>' + s[0] + '</h3><p class="muted">' + s[1] + '</p></div></div><div class="meter" role="img" aria-label="Strength ' + s[2] +
    ' out of 10"><div style="width:' + s[2] * 10 + '%"></div></div><p class="strength"><strong>' + s[2] + "</strong>/10</p></article>"
  ).join("") : '<p class="empty">No skills match. Lower the minimum strength or pick another category.</p>';
}
[sCat, sMin, sSort].forEach(el => el.addEventListener("input", renderSkills));
q("#sReset").addEventListener("click", () => { sCat.value = "all"; sMin.value = 1; sSort.value = "strong"; renderSkills(); });
renderSkills();

/* ---------- Notes (localStorage) ---------- */
const NKEY = "cap-notes";
let notes = [], editingId = null;
try { notes = JSON.parse(store.get(NKEY)) || []; } catch (e) { notes = []; }
const saveNotes = () => store.set(NKEY, JSON.stringify(notes));
function renderNotes(){
  const term = q("#nSearch").value.trim().toLowerCase();
  const shown = notes.filter(n => (n.title + " " + n.body).toLowerCase().includes(term));
  q("#nCount").textContent = shown.length + " of " + notes.length + " notes";
  const box = q("#nList"); box.innerHTML = "";
  if (!shown.length) { box.innerHTML = '<p class="empty">' + (notes.length ? "No notes match your search." : "No notes yet. Write your first one above.") + "</p>"; return; }
  shown.forEach(n => {
    const el = document.createElement("article"); el.className = "card note";
    const h = document.createElement("h3"); h.textContent = n.title;
    const p = document.createElement("p"); p.textContent = n.body;           // textContent blocks HTML injection
    const s = document.createElement("small"); s.textContent = new Date(n.id).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    const row = document.createElement("div");
    const ed = document.createElement("button"); ed.className = "mini"; ed.type = "button"; ed.textContent = "Edit";
    ed.addEventListener("click", () => { editingId = n.id; q("#nTitle").value = n.title; q("#nBody").value = n.body; q("#nSave").textContent = "Update note"; q("#nTitle").focus(); });
    const del = document.createElement("button"); del.className = "mini del"; del.type = "button"; del.textContent = "Delete";
    del.addEventListener("click", () => { notes = notes.filter(x => x.id !== n.id); saveNotes(); renderNotes(); });
    row.append(ed, del); el.append(h, p, s, row); box.appendChild(el);
  });
}
q("#noteForm").addEventListener("submit", e => {
  e.preventDefault();
  const title = q("#nTitle").value.trim(), body = q("#nBody").value.trim();
  if (!title || !body) { q("#nMsg").textContent = "Add both a title and some text."; return; }
  if (editingId) { const n = notes.find(x => x.id === editingId); n.title = title; n.body = body; editingId = null; q("#nSave").textContent = "Save note"; }
  else notes.unshift({ id: Date.now(), title, body });
  q("#noteForm").reset(); q("#nMsg").textContent = ""; saveNotes(); renderNotes();
});
q("#nTitle").addEventListener("input", () => q("#nMsg").textContent = "");
q("#nSearch").addEventListener("input", debounce(renderNotes, 150));
renderNotes();

/* ---------- Contact form validation ---------- */
const form = q("#contactForm"), emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const rules = {
  name: v => !v ? "Enter your name." : v.length < 2 ? "Name must be at least 2 characters." : "",
  email: v => !v ? "Enter your email." : !emailRe.test(v) ? "Enter a valid email, like name@example.com." : "",
  message: v => !v ? "Enter a message." : v.length < 10 ? "Message must be at least 10 characters." : ""
};
function check(id){
  const el = q("#" + id), msg = rules[id](el.value.trim());
  q("#" + id + "Err").textContent = msg;
  el.parentNode.classList.toggle("invalid", !!msg);
  el.setAttribute("aria-invalid", !!msg);
  return !msg;
}
Object.keys(rules).forEach(id => q("#" + id).addEventListener("blur", () => check(id)));
/* ---- Where messages go (edit these two lines) ----
   CONTACT_EMAIL: your real address.
   FORM_ENDPOINT: optional. Paste a free Formspree/Web3Forms URL to get messages in your inbox without any backend.
   If it is empty, the form opens the visitor's own email app with the message filled in. */
const CONTACT_EMAIL = "jaiswalap_3@rknec.edu";
const FORM_ENDPOINT = "https://formspree.io/f/mljgrgwr";
const mailLink = q("#mailLink"); mailLink.href = "mailto:" + CONTACT_EMAIL; mailLink.textContent = CONTACT_EMAIL;
const okBox = q("#ok"), sendBtn = q("#sendBtn");
const say = (text, bad) => { okBox.textContent = text; okBox.classList.toggle("bad", !!bad); okBox.classList.add("show"); };
form.addEventListener("submit", e => {
  e.preventDefault();
  okBox.classList.remove("show");
  if (!Object.keys(rules).map(check).every(Boolean)) return;                  // check all so every error shows
  const data = { name: q("#name").value.trim(), email: q("#email").value.trim(), message: q("#message").value.trim() };
  if (!FORM_ENDPOINT) {
    location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Portfolio message from " + data.name) +
      "&body=" + encodeURIComponent(data.message + "\n\n" + data.name + " (" + data.email + ")");
    say("Opening your email app with your message filled in. Press send there to finish.");
    form.reset(); return;
  }
  sendBtn.disabled = true; sendBtn.textContent = "Sending...";
  fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
    .then(r => { if (!r.ok) throw new Error("Status " + r.status); say("Message sent. Thanks for reaching out!"); form.reset(); })
    .catch(() => say("Could not send your message. Please email me at " + CONTACT_EMAIL + " instead.", true))
    .finally(() => { sendBtn.disabled = false; sendBtn.textContent = "Send message"; });
});
