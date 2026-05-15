// Login
var loginButton = document.getElementById("loginButton");

if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
}

function handleLogin() {
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var loginErrorBox = document.getElementById("loginError");

    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Clear previous error
    if (loginErrorBox) loginErrorBox.textContent = "";

    if (username === "" || password === "") {
        loginErrorBox.textContent = "Please enter both username and password";
        return;
    }

    var requestBody = { username, password };

    fetch("http://localhost:3000/authentication/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(result => {
        if (!result.ok) {
            loginErrorBox.textContent = result.data.message || "Login failed";
            return;
        }

        localStorage.setItem("token", result.data.token);
        window.location.href = "dashboard.html";
    })
    .catch(err => {
        console.error("Login error:", err);
        loginErrorBox.textContent = "Server error. Please try again";
    });
}

// Signup
var signupButton = document.getElementById("signupButton");

if (signupButton) {
    signupButton.addEventListener("click", handleSignup);
}

function handleSignup() {
    var usernameInput = document.getElementById("signupUsername");
    var passwordInput = document.getElementById("signupPassword");

    var signupErrorBox = document.getElementById("signupError");
    var signupSuccessBox = document.getElementById("signupSuccess");

    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Clear old messages + remove styling
    signupErrorBox.textContent = "";
    signupErrorBox.className = "";
    signupSuccessBox.textContent = "";
    signupSuccessBox.className = "";

    // Frontend validation
    if (username === "" || password === "") {
        signupErrorBox.textContent = "Please enter both username and password";
        signupErrorBox.className = "error-message fade-in";
        return;
    }

    var requestBody = { username, password };

    fetch("http://localhost:3000/authentication/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
    })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(result => {
        if (!result.ok) {
            signupErrorBox.textContent = result.data.message || "Signup failed";
            signupErrorBox.className = "error-message fade-in";
            return;
        }

        signupSuccessBox.textContent = "Account created successfully! Redirecting...";
        signupSuccessBox.className = "success-message fade-in";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    })
    .catch(err => {
        console.error("Signup error:", err);
        signupErrorBox.textContent = "Server error. Please try again";
        signupErrorBox.className = "error-message fade-in";
    });
}

// Dashboard load
var transactionDataList = [];

window.onload = function () {
    var token = localStorage.getItem("token");

    if (!token && window.location.pathname.includes("dashboard")) {
        window.location.href = "index.html";
        return;
    }

    if (window.location.pathname.includes("dashboard")) {
        loadTransactions();
    }
};

// Load transactions
function loadTransactions() {
    var storedToken = localStorage.getItem("token");

    fetch("http://localhost:3000/transactions", {
        method: "GET",
        headers: { "Authorization": "Bearer " + storedToken }
    })
    .then(response => response.json())
    .then(list => {
        transactionDataList = list;
        renderTransactionList(transactionDataList);
    })
    .catch(err => console.error("Error loading transactions:", err));
}

// Render
function renderTransactionList(list) {
    var ul = document.getElementById("transactionList");
    ul.innerHTML = "";

    list.forEach(t => {
        var li = document.createElement("li");
        li.textContent = `${t.category} - $${t.amount} (${t.date.substring(0, 10)})`;

        var del = document.createElement("button");
        del.textContent = "Delete";
        del.setAttribute("data-id", t._id);
        del.onclick = handleDeleteTransaction;

        li.appendChild(del);
        ul.appendChild(li);
    });
}

// Add transaction
var addTransactionButton = document.getElementById("addTransactionButton");

if (addTransactionButton) {
    addTransactionButton.addEventListener("click", handleAddTransaction);
}

function handleAddTransaction() {
    var amount = document.getElementById("amount").value;
    var category = document.getElementById("category").value;
    var date = document.getElementById("date").value;
    var description = document.getElementById("description").value;

    var errorBox = document.getElementById("addError");
    errorBox.textContent = "";

    if (!amount || !category || !date) {
        errorBox.textContent = "Please fill out amount, category, and date";
        return;
    }

    var storedToken = localStorage.getItem("token");

    fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + storedToken
        },
        body: JSON.stringify({ amount, category, date, description })
    })
    .then(response => response.json())
    .then(() => loadTransactions())
    .catch(err => console.error("Add transaction error:", err));
}

// Delete transaction
function handleDeleteTransaction(event) {
    var id = event.target.getAttribute("data-id");
    var storedToken = localStorage.getItem("token");

    fetch(`http://localhost:3000/transactions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + storedToken }
    })
    .then(() => loadTransactions())
    .catch(err => console.error("Delete error:", err));
}

// Sorting
var sortDropdown = document.getElementById("sortSelect");

if (sortDropdown) {
    sortDropdown.addEventListener("change", handleSortTransactions);
}

function handleSortTransactions() {
    var option = sortDropdown.value;

    if (option === "date-newest-first") {
        transactionDataList.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (option === "date-oldest-first") {
        transactionDataList.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (option === "highest-amount") {
        transactionDataList.sort((a, b) => b.amount - a.amount);
    }
    if (option === "lowest-amount") {
        transactionDataList.sort((a, b) => a.amount - b.amount);
    }

    renderTransactionList(transactionDataList);
}

// Filtering
var filterDropdown = document.getElementById("filterSelect");

if (filterDropdown) {
    filterDropdown.addEventListener("change", handleFilterTransactions);
}

function handleFilterTransactions() {
    var category = filterDropdown.value;

    if (category === "all") {
        renderTransactionList(transactionDataList);
        return;
    }

    var filtered = transactionDataList.filter(t => t.category === category);
    renderTransactionList(filtered);
}

// Logout
var logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}
