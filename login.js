function login() {

    let user =
        document.getElementById("username").value.trim();

    let pass =
        document.getElementById("password").value;


    // ==========================================
    // GET REGISTERED PATIENT ACCOUNT
    // ==========================================

    let savedUsername =
        localStorage.getItem("patientUsername");

    let savedPassword =
        localStorage.getItem("patientPassword");


    // ==========================================
    // CHECK WHETHER ACCOUNT EXISTS
    // ==========================================

    if (
        savedUsername === null ||
        savedPassword === null
    ) {

        alert(
            "No patient account found. Please register first."
        );

        return;
    }


    // ==========================================
    // CHECK USERNAME
    // ==========================================

    if (user !== savedUsername) {

        alert("Invalid Username.");

        return;
    }


    // ==========================================
    // CHECK PASSWORD
    // ==========================================

    if (pass !== savedPassword) {

        alert("Invalid Password.");

        return;
    }


    // ==========================================
    // LOGIN SUCCESSFUL
    // ==========================================

    localStorage.setItem(
        "loggedInUser",
        user
    );


    alert(
        "Patient Login Successful"
    );


    // ==========================================
    // GO TO DASHBOARD
    // ==========================================

    window.location.href =
        "index.html";
}