// Mobile menu toggle (used on every page)
const menuBtn = document.getElementById("menuBtn"), navList = document.getElementById("nav");
menuBtn.addEventListener("click", () => {
  const open = navList.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});
