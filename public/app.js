// Login
var loginButton = document.getElementById("loginButton");

if (loginButton) {
    loginButton.addEventListener("click", handleLogin);
}

function formatDateMMDDYYYY(dateString) {
    const d = new Date(dateString);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}-${day}-${year}`;
}


function handleLogin() {
    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");

    var loginErrorBox = document.getElementById("loginError");
    var loginSuccessBox = document.getElementById("loginSuccess");

    var username = usernameInput.value.trim();
    var password = passwordInput.value.trim();

    // Clear previous messages + remove styling
    loginErrorBox.textContent = "";
    loginErrorBox.className = "";
    loginSuccessBox.textContent = "";
    loginSuccessBox.className = "";

    if (username === "" || password === "") {
        loginErrorBox.textContent = "Please enter both username and password";
        loginErrorBox.className = "error-message fade-in";
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
            loginErrorBox.textContent = result.data.message || "Invalid credentials";
            loginErrorBox.className = "error-message fade-in";
            return;
        }

        // Success
        loginSuccessBox.textContent = "Login successful! Redirecting...";
        loginSuccessBox.className = "success-message fade-in";

        // Save token + redirect
        localStorage.setItem("token", result.data.token);

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1200);
    })
    .catch(err => {
        console.error("Login error:", err);
        loginErrorBox.textContent = "Server error. Please try again";
        loginErrorBox.className = "error-message fade-in";
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
        applySortAndFilter();
    })
    .catch(err => console.error("Error loading transactions:", err));
}

// Render
function renderTransactionList(list) {
    var ul = document.getElementById("transactionList");
    ul.innerHTML = "";

    list.forEach(t => {
        var li = document.createElement("li");

        var icon = {
            Food: "🍔",
            Bills: "💡",
            Shopping: "🛍️",
            Entertainment: "🎮",
            Other: "📝"
        }[t.category];

        var badgeClass = {
            Food: "badge-food",
            Bills: "badge-bills",
            Shopping: "badge-shopping",
            Entertainment: "badge-entertainment",
            Other: "badge-other"
        }[t.category];

        li.innerHTML = `
            <div class="transaction-left">
                <div class="transaction-main">
                    <span class="badge ${badgeClass}">${t.category}</span>
                    ${icon} $${t.amount} (${formatDateMMDDYYYY(t.date)})
                </div>

                ${t.description ? `<div class="transaction-desc">${t.description}</div>` : ""}
            </div>
        `;


        var del = document.createElement("button");
        del.textContent = "Delete";
        del.setAttribute("data-id", t._id);
        del.onclick = handleDeleteTransaction;

        li.appendChild(del);
        ul.appendChild(li);
    });

    updateMonthlyTotal(list);
}

function updateMonthlyTotal(list) {
    var now = new Date();
    var month = now.getMonth();
    var year = now.getFullYear();

    var total = list
        .filter(t => {
            var d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

    document.getElementById("monthlyTotal").textContent = "$" + total.toLocaleString();
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
    var successBox = document.getElementById("addSuccess");

    // Clear old messages + remove styling
    errorBox.textContent = "";
    errorBox.className = "";
    if (successBox) {
        successBox.textContent = "";
        successBox.className = "";
    }

    if (!amount || !category || !date) {
        errorBox.textContent = "Please fill out amount, category, and date";
        errorBox.className = "error-message fade-in";
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
    .then(() => {
        // SUCCESS
        if (successBox) {
            successBox.textContent = "Transaction added!";
            successBox.className = "success-message fade-in";
        }

        // Reload list
        loadTransactions();

        // Clear inputs
        document.getElementById("amount").value = "";
        document.getElementById("category").value = "";
        document.getElementById("date").value = "";
        document.getElementById("description").value = "";
    })
    .catch(err => {
        console.error("Add transaction error:", err);
        errorBox.textContent = "Server error. Please try again";
        errorBox.className = "error-message fade-in";
    });
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

function applySortAndFilter() {
    let sorted = [...transactionDataList];

    // Sort
    const sortValue = document.getElementById("sortSelect").value;

    if (sortValue === "date-newest-first") {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortValue === "date-oldest-first") {
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === "highest-amount") {
        sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === "lowest-amount") {
        sorted.sort((a, b) => a.amount - b.amount);
    }

    // Filter
    const filterValue = document.getElementById("filterSelect").value;
    if (filterValue !== "all") {
        sorted = sorted.filter(t => t.category === filterValue);
    }

    renderTransactionList(sorted);
}

// Sorting
var sortDropdown = document.getElementById("sortSelect");

if (sortDropdown) {
    sortDropdown.addEventListener("change", applySortAndFilter);
}

// Filtering
var filterDropdown = document.getElementById("filterSelect");

if (filterDropdown) {
    filterDropdown.addEventListener("change", applySortAndFilter);
}

// Logout
var logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}
