function togglePassword(inputId, button) {
  const passwordInput = document.getElementById(inputId);

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    button.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    button.textContent = "Show";
  }
}

function showForm(formType) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const tabButtons = document.querySelectorAll(".tab-btn");

  if (formType === "login") {
    loginForm.classList.add("active-form");
    signupForm.classList.remove("active-form");

    tabButtons[0].classList.add("active");
    tabButtons[1].classList.remove("active");
  } else {
    signupForm.classList.add("active-form");
    loginForm.classList.remove("active-form");

    tabButtons[1].classList.add("active");
    tabButtons[0].classList.remove("active");
  }
}