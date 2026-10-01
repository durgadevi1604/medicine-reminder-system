// ==========================================
// MEDICINE REMINDER SYSTEM
// SAVE MEDICINE
// RAILWAY BACKEND
// ==========================================


// ==========================================
// BACKEND URL
// ==========================================

const API_URL =
    "https://medicine-reminder-system-production-3a18.up.railway.app";


// ==========================================
// SAVE MEDICINE
// ==========================================

async function saveMedicine() {

    const button =
        document.querySelector(
            'button[onclick="saveMedicine()"]'
        );


    // ======================================
    // GET FORM VALUES
    // ======================================

    const medicineElement =
        document.getElementById("medicine");

    const dosageElement =
        document.getElementById("dosage");

    const timeElement =
        document.getElementById("time");

    const startElement =
        document.getElementById("start");

    const endElement =
        document.getElementById("end");

    const medicineTypeElement =
        document.getElementById("medicineType");


    // ======================================
    // CHECK FORM ELEMENTS
    // ======================================

    if (
        !medicineElement ||
        !dosageElement ||
        !timeElement ||
        !startElement ||
        !endElement ||
        !medicineTypeElement
    ) {

        alert(
            "❌ Form fields not found.\n\n" +
            "Please check add-medicine.html."
        );

        return;
    }


    // ======================================
    // GET VALUES
    // ======================================

    const medicine =
        medicineElement.value.trim();

    const dosage =
        dosageElement.value.trim();

    const time =
        timeElement.value;

    const start =
        startElement.value;

    let end =
        endElement.value;

    const medicineType =
        medicineTypeElement.value;


    // ======================================
    // LOGIN CHECK
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
    // REQUIRED VALIDATION
    // ======================================

    if (
        medicine === "" ||
        dosage === "" ||
        time === "" ||
        start === "" ||
        medicineType === ""
    ) {

        alert(
            "Please fill all required fields."
        );

        return;
    }


    // ======================================
    // SHORT TERM
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
    // LIFELONG
    // ======================================

    if (
        medicineType === "lifelong"
    ) {

        end =
            "9999-12-31";

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
    // REMINDER RULE
    // ======================================
    // MORE THAN 7 DAYS = REMINDER
    // 7 DAYS OR LESS = NO REMINDER
    // LIFELONG = REMINDER
    // ======================================

    let reminderStatus =
        "NOT REQUIRED";


    if (
        medicineType === "lifelong"
    ) {

        reminderStatus =
            "ENABLED";

    }

    else {

        const startDate =
            new Date(start);

        const endDate =
            new Date(end);

        const difference =
            endDate - startDate;

        const totalDays =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        if (totalDays > 7) {

            reminderStatus =
                "ENABLED";

        }

        else {

            reminderStatus =
                "NOT REQUIRED";

        }

    }


    // ======================================
    // MEDICINE DATA
    // ======================================

    const medicineData = {

        username:
            loggedInUser,

        medicine:
            medicine,

        dosage:
            dosage,

        time:
            time,

        start:
            start,

        end:
            end,

        medicineType:
            medicineType,

        reminderStatus:
            reminderStatus

    };


    console.log(
        "📤 Sending medicine:",
        medicineData
    );


    // ======================================
    // DISABLE BUTTON
    // ======================================

    if (button) {

        button.disabled =
            true;

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


        timeoutId =
            setTimeout(
                () => {

                    controller.abort();

                },
                15000
            );


        const response =
            await fetch(
                `${API_URL}/api/medicines`,
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


        // ==================================
        // READ RESPONSE
        // ==================================

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

        let medicines = [];


        try {

            medicines =
                JSON.parse(
                    localStorage.getItem(
                        "medicines"
                    )
                ) || [];

        }

        catch {

            medicines = [];

        }


        medicines.push(
            medicineData
        );


        localStorage.setItem(
            "medicines",
            JSON.stringify(
                medicines
            )
        );


        localStorage.setItem(
            "medicineData",
            JSON.stringify(
                medicineData
            )
        );


        // ==================================
        // GENERATE QR CODE
        // ==================================

        const qrContainer =
            document.getElementById(
                "qrcode"
            );


        if (
            qrContainer &&
            typeof QRCode !== "undefined"
        ) {

            qrContainer.innerHTML =
                "";


            new QRCode(
                qrContainer,
                {

                    text:
                        JSON.stringify(
                            medicineData
                        ),

                    width:
                        180,

                    height:
                        180

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
            "Reminder: " +
            reminderStatus
        );


        // ==================================
        // RESET BUTTON
        // ==================================

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "💾 Save Medicine";

        }

    }

    catch (error) {

        clearTimeout(timeoutId);


        console.error(
            "❌ Backend Error:",
            error
        );


        // ==================================
        // TIMEOUT
        // ==================================

        if (
            error.name ===
            "AbortError"
        ) {

            alert(
                "❌ Backend response is taking too long.\n\n" +
                "Please check Railway backend."
            );

        }

        // ==================================
        // FETCH / CORS ERROR
        // ==================================

        else if (
            error instanceof TypeError
        ) {

            alert(
                "❌ Failed to connect to Railway backend.\n\n" +
                "Backend URL:\n" +
                API_URL +
                "\n\n" +
                "Please refresh the page and try again."
            );

        }

        // ==================================
        // OTHER ERROR
        // ==================================

        else {

            alert(
                "❌ Medicine could not be saved.\n\n" +
                "Error: " +
                error.message
            );

        }


        // ==================================
        // RESET BUTTON
        // ==================================

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "💾 Save Medicine";

        }

    }

}