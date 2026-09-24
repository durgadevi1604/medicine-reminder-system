// ==========================================
// SAVE MEDICINE
// ==========================================

async function saveMedicine() {

    const button = document.querySelector(
        'button[onclick="saveMedicine()"]'
    );


    // ======================================
    // GET FORM VALUES
    // ======================================

    const medicine =
        document.getElementById("medicine").value.trim();

    const dosage =
        document.getElementById("dosage").value.trim();

    const time =
        document.getElementById("time").value;

    const start =
        document.getElementById("start").value;

    let end =
        document.getElementById("end").value;

    const medicineType =
        document.getElementById("medicineType").value;


    // ======================================
    // LOGGED IN USER
    // ======================================

    const loggedInUser =
        localStorage.getItem("loggedInUser");


    if (!loggedInUser) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    // ======================================
    // VALIDATION
    // ======================================

    if (
        medicine === "" ||
        dosage === "" ||
        time === "" ||
        start === ""
    ) {

        alert(
            "Please fill all required fields."
        );

        return;
    }


    // ======================================
    // SHORT-TERM MEDICINE
    // ======================================

    if (
        medicineType === "short-term" &&
        end === ""
    ) {

        alert(
            "Please select the End Date."
        );

        return;
    }


    // ======================================
    // LIFELONG MEDICINE
    // ======================================

    if (
        medicineType === "lifelong"
    ) {

        end = "9999-12-31";

    }


    // ======================================
    // DATE VALIDATION
    // ======================================

    if (
        medicineType === "short-term" &&
        end < start
    ) {

        alert(
            "End Date cannot be before Start Date."
        );

        return;
    }


    // ======================================
    // REMINDER STATUS
    // ======================================

    const reminderStatus =
        medicineType === "lifelong"
            ? "ENABLED"
            : "NOT REQUIRED";


    // ======================================
    // DATA
    // ======================================

    const medicineData = {

        username: loggedInUser,

        medicine: medicine,

        dosage: dosage,

        time: time,

        start: start,

        end: end,

        medicineType: medicineType,

        reminderStatus: reminderStatus

    };


    console.log(
        "📤 Sending medicine:",
        medicineData
    );


    // ======================================
    // BUTTON - SAVING
    // ======================================

    if (button) {

        button.disabled = true;

        button.innerHTML =
            "⏳ Saving...";

    }


    // ======================================
    // BACKEND REQUEST
    // ======================================

    let timeoutId;


    try {

        const controller =
            new AbortController();


        timeoutId = setTimeout(
            function () {

                controller.abort();

            },
            10000
        );


        const response =
            await fetch(
                "http://127.0.0.1:5000/api/medicines",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            medicineData
                        ),

                    signal:
                        controller.signal

                }
            );


        clearTimeout(timeoutId);


        console.log(
            "📡 Backend status:",
            response.status
        );


        const result =
            await response.json();


        console.log(
            "📥 Backend response:",
            result
        );


        // ==================================
        // BACKEND ERROR
        // ==================================

        if (!response.ok) {

            throw new Error(
                result.error ||
                result.message ||
                "Failed to save medicine."
            );

        }


        // ==================================
        // LOCAL STORAGE
        // ==================================

        let medicines =
            JSON.parse(
                localStorage.getItem(
                    "medicines"
                )
            ) || [];


        medicines.push(
            medicineData
        );


        localStorage.setItem(
            "medicines",
            JSON.stringify(medicines)
        );


        localStorage.setItem(
            "medicineData",
            JSON.stringify(medicineData)
        );


        // ==================================
        // QR CODE
        // ==================================

        const qrContainer =
            document.getElementById(
                "qrcode"
            );


        if (
            qrContainer &&
            typeof QRCode !== "undefined"
        ) {

            qrContainer.innerHTML = "";


            new QRCode(
                qrContainer,
                {
                    text:
                        JSON.stringify(
                            medicineData
                        ),

                    width: 180,

                    height: 180
                }
            );

        }


        // ==================================
        // SUCCESS
        // ==================================

        alert(
            "Medicine Saved Successfully! ✅\n\n" +
            "Saved to MySQL Database ✅\n" +
            "Medicine Type: " +
            (
                medicineType === "lifelong"
                    ? "Lifelong"
                    : "Short-Term"
            ) +
            "\n" +
            "Smart Reminder: " +
            reminderStatus
        );


        // ==================================
        // BUTTON RESET
        // ==================================

        if (button) {

            button.disabled = false;

            button.innerHTML =
                "💾 Save Medicine";

        }


    }

    catch (error) {

        console.error(
            "❌ Backend Error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            alert(
                "❌ Backend response is taking too long.\n\n" +
                "Please check whether server.js is running."
            );

        }

        else {

            alert(
                "❌ Medicine could not be saved.\n\n" +
                "Error: " +
                error.message
            );

        }


        // ==================================
        // BUTTON RESET
        // ==================================

        if (button) {

            button.disabled = false;

            button.innerHTML =
                "💾 Save Medicine";

        }

    }

}