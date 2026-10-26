// TEMPORARY: skip the backend and go straight to the dashboard
// REMOVE WHEN BACKEND WORK IS DONE
document.getElementById("signUpForm").addEventListener("submit", (e) => {
  e.preventDefault();
  window.location.href = "dashboard.html";
});