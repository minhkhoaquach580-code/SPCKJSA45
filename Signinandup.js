const signInBox = document.getElementById("signInBox");
const signUpBox = document.getElementById("signUpBox");
function showSignUp() {
    signInBox.classList.add("hidden");
    signUpBox.classList.remove("hidden");
}
function showSignIn() {
    signUpBox.classList.add("hidden");
    signInBox.classList.remove("hidden");
}
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
    } else {
        input.type = "password";
        button.textContent = "👁";
    }
}
document
    .getElementById("signInForm")
    .addEventListener("submit", function(event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        if (email === "" || password === "") {
            alert("Please fill in all fields.");
            return;
        }
        window.location.href = "index.html";
    });
document
    .getElementById("signUpForm")
    .addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("signupName").value;
        const email = document.getElementById("signupEmail").value;
        const password =
            document.getElementById("signupPassword").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;
        if (
            name === "" ||
            email === "" ||
            password === "" ||
            confirmPassword === ""
        ) {
            alert("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }
        window.location.href = "index.html";
        showSignIn();
    });
function socialLogin(provider) {
    alert(provider + " login would be connected here.");
}