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

/* ============ QUIZ ============ */
const questions = [
  { q: "What is the time complexity of binary search on a sorted array?",
    opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], a: 1,
    why: "Each step halves the search range, so it takes about log2(n) steps." },
  { q: "Which data structure follows last-in, first-out (LIFO)?",
    opts: ["Queue", "Stack", "Heap", "Linked list"], a: 1,
    why: "A stack removes the most recently added item first. Think of a pile of plates." },
  { q: "Which SQL clause filters groups after GROUP BY?",
    opts: ["WHERE", "ORDER BY", "HAVING", "LIMIT"], a: 2,
    why: "WHERE filters rows before grouping. HAVING filters the groups themselves." },
  { q: "Which HTTP status code means the resource was not found?",
    opts: ["200", "301", "404", "500"], a: 2,
    why: "404 means the server cannot find the requested resource. 500 is a server error." },
  { q: "What is a deadlock in an operating system?",
    opts: ["A process that runs too slowly",
           "Processes waiting on each other for resources forever",
           "A crashed disk drive",
           "A full memory page"], a: 1,
    why: "Each process holds a resource the other needs, so none can continue." }
];
const quizBox = $("#quizBox");
let qi = 0, score = 0;

function renderQuestion(){
  const item = questions[qi];
  quizBox.innerHTML = "";
  const top = document.createElement("div");
  top.className = "q-top";
  top.innerHTML = "<span>Question " + (qi + 1) + " of " + questions.length + "</span><span>Score: " + score + "</span>";
  const bar = document.createElement("div");
  bar.className = "bar";
  const fill = document.createElement("div");
  fill.style.width = (qi / questions.length * 100) + "%";
  bar.appendChild(fill);
  const text = document.createElement("h3");
  text.className = "q-text"; text.textContent = item.q;
  const ul = document.createElement("ul");
  ul.className = "opts";
  const explain = document.createElement("p");
  explain.className = "explain"; explain.hidden = true;
  const actions = document.createElement("div");
  actions.className = "q-actions";
  const next = document.createElement("button");
  next.className = "btn"; next.type = "button"; next.hidden = true;
  next.textContent = qi === questions.length - 1 ? "See results" : "Next question";
  next.addEventListener("click", () => { qi++; qi < questions.length ? renderQuestion() : renderResult(); });
  actions.appendChild(next);

  item.opts.forEach((label, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "opt"; b.type = "button"; b.textContent = label;
    b.addEventListener("click", () => {
      const buttons = ul.querySelectorAll(".opt");
      buttons.forEach(x => x.disabled = true);          // lock the answer
      buttons[item.a].classList.add("correct");
      if (i === item.a) { score++; explain.textContent = "Correct. " + item.why; }
      else { b.classList.add("wrong"); explain.textContent = "Not quite. " + item.why; }
      top.lastChild.textContent = "Score: " + score;
      fill.style.width = ((qi + 1) / questions.length * 100) + "%";
      explain.hidden = false; next.hidden = false; next.focus();
    });
    li.appendChild(b); ul.appendChild(li);
  });
  quizBox.append(top, bar, text, ul, explain, actions);
}

function renderResult(){
  const pct = Math.round(score / questions.length * 100);
  const verdict = pct === 100 ? "Perfect score." : pct >= 60 ? "Solid. Review the ones you missed." : "Keep practising. Revisit the topics above.";
  quizBox.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "q-text"; title.textContent = "Quiz complete";
  const big = document.createElement("div");
  big.className = "score-big"; big.textContent = score + " / " + questions.length;
  const p = document.createElement("p");
  p.textContent = verdict;
  const again = document.createElement("button");
  again.className = "btn"; again.type = "button"; again.textContent = "Restart quiz";
  again.addEventListener("click", () => { qi = 0; score = 0; renderQuestion(); });
  quizBox.append(title, big, p, again);
}
renderQuestion();

/* ============ FETCH DATA FROM AN API (JokeAPI) ============ */
const jokeBox = document.querySelector(".joke");
const jokeText = $("#jokeText"), jokePunch = $("#jokePunch");
const jokeBtn = $("#jokeBtn"), punchBtn = $("#punchBtn");
const JOKE_URL = "https://v2.jokeapi.dev/joke/Programming?safe-mode&blacklistFlags=nsfw,religious,political,racist,sexist,explicit";

async function loadJoke(){
  jokeBox.classList.remove("error");
  jokeBtn.disabled = true;
  jokeBtn.textContent = "Loading...";
  jokeText.textContent = "Fetching a joke...";
  jokePunch.hidden = true; punchBtn.hidden = true;
  try {
    const res = await fetch(JOKE_URL);
    if (!res.ok) throw new Error("Server responded with status " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.message || "The API returned an error.");
    if (data.type === "twopart") {
      jokeText.textContent = data.setup;
      jokePunch.textContent = data.delivery;
      punchBtn.hidden = false;                 // reveal punchline on demand
    } else {
      jokeText.textContent = data.joke;
    }
    jokeBtn.textContent = "Get another joke";
  } catch (err) {
    jokeBox.classList.add("error");
    jokeText.textContent = "Could not load a joke. Check your internet connection and try again.";
    jokeBtn.textContent = "Try again";
    console.error(err);
  } finally {
    jokeBtn.disabled = false;
  }
}
jokeBtn.addEventListener("click", loadJoke);
punchBtn.addEventListener("click", () => { jokePunch.hidden = false; punchBtn.hidden = true; });

/* ============ CALENDAR WITH DATE PLANS ============ */
const calGrid = $("#calGrid"), calTitle = $("#calTitle");
const planList = $("#planList"), planInput = $("#planInput"), planMsg = $("#planMsg");
let plans = {};                                   // { "2026-10-04": [{id, text}] }
try { plans = JSON.parse(store.get("hub-plans")) || {}; } catch (e) { plans = {}; }
const dateKey = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const now = new Date();
let viewYear = now.getFullYear(), viewMonth = now.getMonth();
let selectedKey = dateKey(now);

function renderCalendar(){
  calTitle.textContent = new Date(viewYear, viewMonth, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
  calGrid.innerHTML = "";
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();       // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();   // day 0 of next month = last day of this one
  for (let i = 0; i < firstWeekday; i++) calGrid.appendChild(document.createElement("span"));
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(viewYear, viewMonth, day), k = dateKey(d);
    const b = document.createElement("button");
    b.type = "button"; b.className = "day"; b.textContent = day;
    b.setAttribute("aria-label", d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    b.setAttribute("aria-pressed", k === selectedKey);
    if (k === dateKey(now)) { b.classList.add("today"); b.setAttribute("aria-current", "date"); }
    if (plans[k] && plans[k].length) b.classList.add("has-plan");
    b.addEventListener("click", () => { selectedKey = k; renderCalendar(); renderPlans(); });
    calGrid.appendChild(b);
  }
}
function changeMonth(step){
  const d = new Date(viewYear, viewMonth + step, 1);   // Date handles year rollover for us
  viewYear = d.getFullYear(); viewMonth = d.getMonth();
  renderCalendar();
}
function renderPlans(){
  const [y, m, d] = selectedKey.split("-").map(Number);
  $("#planTitle").textContent = "Plan for " + new Date(y, m - 1, d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  planList.innerHTML = "";
  const items = plans[selectedKey] || [];
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "empty"; li.textContent = "Nothing planned for this day yet.";
    planList.appendChild(li);
  }
  items.forEach(item => {
    const li = document.createElement("li");
    li.className = "task";
    const span = document.createElement("span");
    span.textContent = item.text;
    const del = document.createElement("button");
    del.className = "del"; del.type = "button"; del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete plan: " + item.text);
    del.addEventListener("click", () => {
      plans[selectedKey] = items.filter(x => x.id !== item.id);
      if (!plans[selectedKey].length) delete plans[selectedKey];
      store.set("hub-plans", JSON.stringify(plans));
      renderCalendar(); renderPlans();
    });
    li.append(span, del);
    planList.appendChild(li);
  });
}
function addPlan(){
  const text = planInput.value.trim();
  if (!text) { planMsg.textContent = "Type a plan before adding it."; return; }
  (plans[selectedKey] = plans[selectedKey] || []).push({ id: Date.now(), text });
  store.set("hub-plans", JSON.stringify(plans));
  planInput.value = ""; planMsg.textContent = "";
  renderCalendar(); renderPlans(); planInput.focus();
}
$("#calPrev").addEventListener("click", () => changeMonth(-1));
$("#calNext").addEventListener("click", () => changeMonth(1));
$("#calToday").addEventListener("click", () => {
  viewYear = now.getFullYear(); viewMonth = now.getMonth(); selectedKey = dateKey(now);
  renderCalendar(); renderPlans();
});
$("#planAdd").addEventListener("click", addPlan);
planInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addPlan(); });
planInput.addEventListener("input", () => planMsg.textContent = "");
renderCalendar(); renderPlans();

/* ============ TECH QUOTES: API FIRST, SAVED QUOTES AS BACKUP ============ */
// No public API is dedicated to tech leaders. Quote Garden is a general quotes API
// that can filter by exact author name, so we ask it for each person.
const QUOTE_API = "https://quote-garden.onrender.com/api/v3/quotes/random";
const SAVED_QUOTES = {
  "Steve Jobs": [
    "Stay hungry. Stay foolish.",
    "Your time is limited, so don't waste it living someone else's life.",
    "The only way to do great work is to love what you do."
  ],
  "Linus Torvalds": [
    "Talk is cheap. Show me the code.",
    "Most good programmers do programming not because they expect to get paid or get adulation by the public, but because it is fun to program."
  ],
  "Sundar Pichai": [
    "AI is one of the most important things humanity is working on. It is more profound than electricity or fire.",
    "Wear your failure as a badge of honor."
  ]
};
const quoteText = $("#quoteText"), quoteBy = $("#quoteBy"), quoteSrc = $("#quoteSrc");

async function fetchLiveQuote(author){
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);   // free hosting can be slow to wake up
  try {
    const res = await fetch(QUOTE_API + "?author=" + encodeURIComponent(author) + "&count=1", { signal: ctrl.signal });
    if (!res.ok) throw new Error("Status " + res.status);
    const json = await res.json();
    const item = json.data && json.data[0];
    return item ? { text: item.quoteText.trim(), author: item.quoteAuthor } : null;   // null = API has no quote for this person
  } finally {
    clearTimeout(timer);
  }
}
function savedQuote(author){
  const list = SAVED_QUOTES[author];
  return { text: list[Math.floor(Math.random() * list.length)], author };
}
async function showQuote(choice){
  const names = Object.keys(SAVED_QUOTES);
  const author = choice === "any" ? names[Math.floor(Math.random() * names.length)] : choice;
  quoteText.textContent = "Fetching a quote from " + author + "... (the server can take a few seconds to wake up)";
  quoteBy.textContent = ""; quoteSrc.hidden = true;
  let quote, source;
  try {
    quote = await fetchLiveQuote(author);
    source = "Live from Quote Garden API";
  } catch (err) {
    console.error(err);
    quote = null;
  }
  if (!quote) { quote = savedQuote(author); source = "Saved quote (API unavailable or has none for this person)"; }
  quoteText.textContent = "\u201C" + quote.text + "\u201D";
  quoteBy.textContent = "\u2014 " + quote.author;
  quoteSrc.textContent = source; quoteSrc.hidden = false;
}
document.querySelectorAll("#authorBtns button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#authorBtns button").forEach(x => x.setAttribute("aria-pressed", x === b));
  showQuote(b.dataset.author);
}));
