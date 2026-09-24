function login() {

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value;

    // Get registered patient account
    let savedUsername = localStorage.getItem("patientUsername");
    let savedPassword = localStorage.getItem("patientPassword");

    // Check whether account exists
    if (savedUsername === null || savedPassword === null) {
        alert("No patient account found. Please register first.");
        return;
    }

    // Check username
    if (user !== savedUsername) {
        alert("Invalid Username.");
        return;
    }

    // Check password
    if (pass !== savedPassword) {
        alert("Invalid Password.");
        return;
    }

    // Login successful
    alert("Patient Login Successful");

    window.location.href = "index.html";
}