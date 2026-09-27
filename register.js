// ==========================================
// CHECK USERNAME
// ==========================================

function checkUsername() {

    let username =
        document.getElementById("username").value.trim();

    let error =
        document.getElementById("usernameError");


    // Empty username
    if (username.length === 0) {

        error.textContent =
            "Please enter a username.";

        return false;
    }


    // Maximum 10 characters
    if (username.length > 10) {

        error.textContent =
            "Username must be maximum 10 characters.";

        return false;
    }


    // Must contain at least one letter
    if (!/[A-Za-z]/.test(username)) {

        error.textContent =
            "Username must contain at least one letter.";

        return false;
    }


    // Must contain at least one number
    if (!/[0-9]/.test(username)) {

        error.textContent =
            "Username must contain at least one number.";

        return false;
    }


    // Must contain at least one special character
    if (!/[^A-Za-z0-9]/.test(username)) {

        error.textContent =
            "Username must contain at least one special character.";

        return false;
    }


    error.textContent = "";

    return true;
}


// ==========================================
// CHECK PASSWORD
// ==========================================

function checkPassword() {

    let password =
        document.getElementById("password").value;

    let error =
        document.getElementById("passwordError");


    // Exactly 5 numbers
    if (!/^\d{5}$/.test(password)) {

        error.textContent =
            "Password must contain exactly 5 numbers.";

        return false;
    }


    error.textContent = "";

    return true;
}


// ==========================================
// REGISTER
// ==========================================

function register() {

    let username =
        document.getElementById("username").value.trim();

    let password =
        document.getElementById("password").value;


    // Validate username
    if (!checkUsername()) {
        return;
    }


    // Validate password
    if (!checkPassword()) {
        return;
    }


    // ======================================
    // SAVE PATIENT ACCOUNT
    // ======================================

    localStorage.setItem(
        "patientUsername",
        username
    );

    localStorage.setItem(
        "patientPassword",
        password
    );


    // ======================================
    // SUCCESS
    // ======================================

    alert(
        "Account Created Successfully!"
    );


    // Go to login
    window.location.href =
        "login.html";
}