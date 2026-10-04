// Placement Prep Hub - Task 1 JavaScript
// Shows a random preparation tip in an alert box when the button is clicked.

const tips = [
  "Solve 2 DSA problems today. Consistency beats cramming.",
  "Pick one project and be able to explain every design decision in it.",
  "Revise one core subject today: OS, DBMS, CN or OOP. Write 5 short notes.",
  "Practice saying 'tell me about yourself' out loud in under 90 seconds.",
  "Do one timed aptitude set. Speed matters as much as accuracy.",
  "Read one company's interview experiences and note the common questions.",
  "Review your resume. Every line should be something you can defend.",
  "Explain a concept to a friend. If you can't, you haven't learned it yet."
];

const tipButton = document.getElementById("tip-btn");

tipButton.addEventListener("click", function () {
  const randomIndex = Math.floor(Math.random() * tips.length);
  alert("Today's tip:\n\n" + tips[randomIndex]);
});
