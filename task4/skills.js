// name, category, strength out of 10 (self-assessment: edit these to match you)
const S = [
  ["Java","Languages",9],["JavaScript","Languages",6],
  ["Spring Boot","Backend",8],["JDBC","Backend",8],["REST APIs","Backend",8],
  ["MySQL","Databases",8],["SQL","Databases",8],
  ["Design patterns","Concepts",8],["Data structures and algorithms","Concepts",6],
  ["RAG pipelines","AI",7],["LLM integration (Groq)","AI",7],
  ["HTML and CSS","Frontend",6],["React","Frontend",6]
];
const $ = s => document.querySelector(s);
const cat = $("#cat"), min = $("#min"), sort = $("#sort"), grid = $("#grid");
[...new Set(S.map(s => s[1]))].forEach(c => cat.add(new Option(c, c)));
const by = {
  strong: (a, b) => b[2] - a[2] || a[0].localeCompare(b[0]),   // ties fall back to name
  weak:   (a, b) => a[2] - b[2] || a[0].localeCompare(b[0]),
  name:   (a, b) => a[0].localeCompare(b[0]),
  cat:    (a, b) => a[1].localeCompare(b[1]) || b[2] - a[2]
};
function render(){
  const lowest = +min.value;
  $("#minOut").textContent = lowest + "/10 or more";
  const list = S.filter(s => (cat.value === "all" || s[1] === cat.value) && s[2] >= lowest).sort(by[sort.value]);
  $("#count").textContent = "Showing " + list.length + " of " + S.length + " skills";
  grid.innerHTML = list.length ? list.map(s =>
    '<article class="card"><h3>' + s[0] + '</h3><p class="muted">' + s[1] + '</p>' +
    '<div class="meter" role="img" aria-label="Strength ' + s[2] + ' out of 10"><div style="width:' + s[2] * 10 + '%"></div></div>' +
    '<p class="strength"><strong>' + s[2] + "</strong>/10</p></article>"
  ).join("") : '<p class="empty">No skills match. Lower the minimum strength or pick another category.</p>';
}
[cat, min, sort].forEach(el => el.addEventListener("input", render));
$("#reset").addEventListener("click", () => { cat.value = "all"; min.value = 1; sort.value = "strong"; render(); });
render();
