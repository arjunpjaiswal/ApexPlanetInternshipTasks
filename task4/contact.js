const form = document.getElementById("contactForm");
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const rules = {
  name: v => !v ? "Enter your name." : v.length < 2 ? "Name must be at least 2 characters." : "",
  email: v => !v ? "Enter your email." : !emailRe.test(v) ? "Enter a valid email, like name@example.com." : "",
  message: v => !v ? "Enter a message." : v.length < 10 ? "Message must be at least 10 characters." : ""
};
function check(id){
  const el = document.getElementById(id), msg = rules[id](el.value.trim());
  document.getElementById(id + "Err").textContent = msg;
  el.closest(".field").classList.toggle("invalid", !!msg);
  return !msg;
}
Object.keys(rules).forEach(id => document.getElementById(id).addEventListener("blur", () => check(id)));
form.addEventListener("submit", e => {
  e.preventDefault();
  const ok = Object.keys(rules).map(check).every(Boolean);   // validate all so every error shows
  document.getElementById("ok").classList.toggle("show", ok);
  if (ok) form.reset();
});
