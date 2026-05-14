// Login function

const { use } = require("react");

// Attach event listener only if login button exists on this page
var loginButton = document.getElementById("loginButton");

if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
}

// handleLogin() called when the user clicks the Login button
// Reads input values, validates them, and sends a POST request to /auth/login
function handleLogin() {
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var loginErrorBox = document.getElementById("loginError")

    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Clear previous error messages
    loginButton.textContent = "";

    // If the user didn't input username or password
    if (username === "" || password === "") {
        loginErrorBox.textContent = "Please enter both username and password.";
        return;
    }

    // Build request body
    var requestBody = {
        username: username,
        password: password
    };

    // Send login request
    fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "applications/json" },
        body: JSON.stringify(requestBody)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        if (!result.ok) {
            loginErrorBox.textContent = result.data.message || "Login failed";
            return;
        }

        // Save token
        localStorage.setItem("token", result.data.token);

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    })
    .catch(function(error) {
        console.error("Login error:", error);
        loginErrorBox.textContent = "Server error. Please try again";
    });


    var signupButton = document.getElementById("signupButton");

    if (signupButton) {
        signupButton.addEventListener("click", handleSignup);
    }
}

// handleSignup() called when the user clicks the Sign Up button
// Validates input, sends POST request to /auth/signup, and displays success/error messages
function handleSignup() {
    var usernameInput = document.getElementById("signupUsername");
    var passwordInput = document.getElementById("signupPassword");

    var signupErrorBox = document.getElementById("signupError");
    var signupSuccessBox = document.getElementById("signupSuccess");

    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Clear previous messages
    signupErrorBox.textContent = "";
    signupSuccessBox.textContent = "";

    // If the user didn't input username or password
    if (username === "" || password === "") {
        loginErrorBox.textContent = "Please enter both username and password.";
        return;
    }

    // Build request body
    var requestBody = {
        username: username,
        password: password
    };

    // Send signup request
    fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "applications/json" },
        body: JSON.stringify(requestBody)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        if (!result.ok) {
            loginErrorBox.textContent = result.data.message || "Signup failed";
            return;
        }

        // Show success message
        signupSuccessBox.textContent = "Account created successfully! Redirecting...";

        // Redirect to login after short delay
        setTimeout(function() {
            window.location.href = "index.html";
        }, 1500);
    })
    .catch(function(error) {
        console.error("Signup error:", error);
        loginErrorBox.textContent = "Server error. Please try again";
    });
}