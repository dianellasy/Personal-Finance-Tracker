// Login function


// BACKEND

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

    // Clear previousious error messages
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

    // Clear previousious messages
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


// FRONTEND

// Global state: holds all transactions loaded from the backend
// Sorting + filtering operate on this array
var allTransactions = [];

// Page load handler
window.onload = function () {
    var token = localStorage.getItem("token");

    // If there is no token, redirect to login
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    loadTransactions();
};

// Load all transactions
// GET /transactions 
function loadTransactions() {
    var storedToken = localStorage.getItem("token");

    fetch("http://localhost:3000/transactions", {
        method: "GET",
        headers: { "Authorization": "Bearer " + storedToken }
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (transactionListFromServer) {
        transactionDataList = transactionListFromServer;
        renderTransactionList(transactionDataList);
    })
    .catch(function (error) {
        console.error("Error loading transactions:", error);
    });
}

// Render transaction list into <ul>
function renderTransactionList(transactionListToDisplay) {
    var transactionListElement = document.getElementById("transactionList");
    
    // Clear previousious items
    transactionListElement.innerHTML = "";

    for (var i = 0; i < transactionListToDisplay.length; i++) {
        var transaction = transactionListToDisplay[i];

        var listItemElement = document.createElement("li");
        listItemElement.textContent = 
            transaction.category +
            " - $" +
            transaction.amount +
            " (" +
            transaction.date.substring(0, 10) +
            ")";

        // Create delete button
        var deleteButtonElement = document.createElement("button");
        deleteButtonElement.textContent = "Delete";
        deleteButtonElement.setAttribute("data-id", transaction._id);
        deleteButtonElement.onclick = handleDeleteTransaction;

        listItemElement.appendChild(deleteButtonElement);
        transactionListElement.appendChild(listItemElement);
    }
}

// Add transaction
// POST /transactions
var addTransactionButton = document.getElementById("addTransactionButton");

if (addTransactionButton) {
    addTransactionButton.addEventListener("click", handleAddTransaction);
}

function handleAddTransaction() {
    var amountInput = document.getElementById("amount").value;
    var categoryInput = document.getElementById("category").value;
    var dateInput = document.getElementById("date").value;
    var descriptionInput = document.getElementById("description").value;

    var addErrorMessage = document.getElementById("addError");
    addErrorMessage.textContent = "";

    if (!amountInput || !categoryInput || !dateInput) {
        addErrorMessage.textContent = "Please fill out amount, category, and date";
        return;
    }

    var storedToken = localStorage.getItem("token");

    fetch("http://localhost:3000/transactions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer" + storedToken
        },
        body: JSON.stringify({
            amount: amountInput,
            category: categoryInput,
            date: dateInput,
            description: descriptionInput
        })
    })
    .then(function (response) {
        return response.json();
    })
    .then(function () {
        loadTransactions();
    })
    .catch(function (error) {
        console.error("Add transaction error:", error);
    });
}

// Delete transaction
// DELETE /transactions/:id
function handleDeleteTransaction(event) {
    var transactionId = event.target.getAttribute("data-id");
    var storedToken = localStorage.getItem("token");

    fetch("http://localhost:3000/transactions/" + transactionId, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + storedToken }
    })
    .then(function () {
        loadTransactions();
    })
    .catch(function (error) {
        console.error("Delete error:", error);
    });
}

// Sorting
var sortDropdown = document.getElementById("sortSelect");

if (sortDropdown) {
    sortDropdown.addEventListener("change", handleSortTransactions);
}

function handleSortTransactions() {
    var selectedSortOption = sortDropdown.value;

    if (selectedSortOption === "date-newest-first") {
        transactionDataList.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }

    if (selectedSortOption === "date-oldest-first") {
        transactionDataList.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }

    if (selectedSortOption === "highest-amount") {
        transactionDataList.sort(function (a, b) {
            return b.amount - a.amount;
        });
    }

    if (selectedSortOption === "lowest-amount") {
        transactionDataList.sort(function (a, b) {
            return a.amount - b.amount;
        });
    }

    renderTransactionList(transactionDataList);
}

// Filtering
var filterDropdown = document.getElementById("filterSelect");

if (filterDropdown) {
    filterDropdown.addEventListener("change", handleFilterTransactions);
}

function handleFilterTransactions() {
    var selectedCategory = filterDropdown.value;

    if (selectedCategory === "all") {
        renderTransactionList(transactionDataList);
        return;
    }

    var filteredTransactionList = [];

    for (var i = 0; i < transactionDataList.length; i++) {
        if (transactionDataList[i].category === selectedCategory) {
            filteredTransactionList.push(transactionDataList[i]);
        }
    }

    renderTransactionList(filteredTransactionList);
}

// Logout function
var logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
}

function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}


// Calendar view

// Tracks which month is shown
var currentCalendarDate = new Date();


// Show calendar view / list view toggle 
var calendarViewButton = document.getElementById("calendarViewButton");
var listViewButton = document.getElementById("listViewButton");
var calendarSection = document.getElementById("calendarSection");
var dashboardMainSection = document.querySelector(".dashboard-main");

if (calendarViewButton) {
    calendarViewButton.addEventListener("click", function () {
        dashboardMainSection.style.display = "none";
        calendarSection.style.display = "block";
        calendarViewButton.style.display = "none";
        listViewButton.style.display = "inline-block";
        renderCalendarMonth();
    });
}

if (listViewButton) {
    listViewButton.addEventListener("click", function () {
        dashboardMainSection.style.display = "flex";
        calendarSection.style.display = "none";
        listViewButton.style.display = "none";
        calendarViewButton.style.display = "inline-block";
    });
}


// Render calendar month grid
function renderCalendarMonth() {
    var monthLabel = document.getElementById("calendarMonthLabel");
    var calendarGrid = document.getElementById("calendarGrid");

    var year = currentCalendarDate.getFullYear();
    var month = currentCalendarDate.getMonth();

    // Set month label
    monthLabel.textContent = currentCalendarDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });

    // Clear previousious grid
    calendarGrid.innerHTML = "";

    // Determine first day of month + number of days
    var firstDayOfMonth = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add blank cells for alignment
    for (var i = 0; i < firstDayOfMonth; i++) {
        var emptyCell = document.createElement("div");
        calendarGrid.appendChild(emptyCell);
    }

    // Add each day cell
    for (var day = 1; day <= daysInMonth; day++) {
        var dayCell = document.createElement("div");
        dayCell.classList.add("calendar-day");
        dayCell.textContent = day;

        var dateString = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");

        // Check if this day has transactions
        var dayTransactions = transactionDataList.filter(function (t) {
            return t.date.substring(0, 10) === dateString;
        });

        if (dayTransactions.length > 0) {
            dayCell.classList.add("has-transactions");
        }

        // Click handler to show details
        dayCell.setAttribute("data-date", dateString);
        dayCell.onclick = showCalendarDayDetails;

        calendarGrid.appendChild(dayCell);
    }
}

// Show transactions for a selected day
function showCalendarDayDetails(event) {
    var selectedDate = event.target.getAttribute("data-date");
    var detailsBox = document.getElementById("calendarDayDetails");

    var dayTransactions = transactionDataList.filter(function (t) {
        return t.date.substring(0, 10) === selectedDate;
    });

    var html = "<h3>Transactions for " + selectedDate + "</h3>";

    if (dayTransactions.length === 0) {
        html += "<p>No transactions on this day.</p>";
    } else {
        html += "<ul>";
        for (var i = 0; i < dayTransactions.length; i++) {
            html += "<li>" +
                dayTransactions[i].category +
                " - $" +
                dayTransactions[i].amount +
                "</li>";
        }
        html += "</ul>";
    }

    detailsBox.innerHTML = html;
}

// Month navivation buttons
var previousMonthButton = document.getElementById("previousMonthButton");
var nextMonthButton = document.getElementById("nextMonthButton");

if (previousMonthButton) {
    previousMonthButton.addEventListener("click", function () {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendarMonth();
    });
}

if (nextMonthButton) {
    nextMonthButton.addEventListener("click", function () {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendarMonth();
    });
}
