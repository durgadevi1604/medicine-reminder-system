// ==========================================
// MEDICINE REMINDER SYSTEM - MAIN SCRIPT
// RAILWAY BACKEND VERSION
// ==========================================

// Railway Backend URL
const API_URL =
    "https://medicine-reminder-system-production.up.railway.app";


// ==========================================
// QR SCAN DEMO
// ==========================================

function scanQR() {

    const name = document.getElementById("name");
    const dose = document.getElementById("dose");
    const time = document.getElementById("time");

    if (name) {
        name.innerHTML = "Paracetamol";
    }

    if (dose) {
        dose.innerHTML = "500 mg";
    }

    if (time) {
        time.innerHTML = "08:00";
    }

    alert("QR Code Scanned Successfully!");
}


// ==========================================
// SAVE REMINDER
// ==========================================

function saveReminder() {

    alert("Medicine Reminder Saved!");

}


// ==========================================
// LOAD MEDICINES FROM RAILWAY
// ==========================================

async function loadMedicines() {

    try {

        const response =
            await fetch(`${API_URL}/api/medicines`);

        if (!response.ok) {

            throw new Error(
                "Unable to load medicines"
            );

        }

        const result =
            await response.json();

        const medicines =
            Array.isArray(result)
                ? result
                : result.medicines || [];


        // ======================================
        // CHECK LOGIN
        // ======================================

        const loggedInUser =
            localStorage.getItem("loggedInUser");

        if (!loggedInUser) {

            window.location.href =
                "login.html";

            return;
        }


        // ======================================
        // ONLY LOGGED-IN USER MEDICINES
        // ======================================

        const patientMedicines =
            medicines.filter(function (item) {

                return item.username ===
                    loggedInUser;

            });


        // ======================================
        // NO MEDICINES
        // ======================================

        if (patientMedicines.length === 0) {

            const name =
                document.getElementById("name");

            const dose =
                document.getElementById("dose");

            const time =
                document.getElementById("time");


            if (name) {
                name.innerHTML = "-";
            }

            if (dose) {
                dose.innerHTML = "-";
            }

            if (time) {
                time.innerHTML = "-";
            }

            return;
        }


        // ======================================
        // SHOW LATEST MEDICINE
        // ======================================

        const latestMedicine =
            patientMedicines[
                patientMedicines.length - 1
            ];


        const name =
            document.getElementById("name");

        const dose =
            document.getElementById("dose");

        const time =
            document.getElementById("time");


        if (name) {

            name.innerHTML =
                latestMedicine.medicine_name ||
                "-";

        }


        if (dose) {

            dose.innerHTML =
                latestMedicine.dosage ||
                "-";

        }


        if (time) {

            time.innerHTML =
                latestMedicine.reminder_time ||
                "-";

        }


        // ======================================
        // START REMINDERS
        // ======================================

        startAllReminders(
            patientMedicines
        );


    } catch (error) {

        console.error(
            "Medicine loading error:",
            error
        );

    }

}


// ==========================================
// START ALL MEDICINE REMINDERS
// ==========================================

function startAllReminders(medicines) {


    // ======================================
    // REQUEST NOTIFICATION PERMISSION
    // ======================================

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        Notification.requestPermission();

    }


    // ======================================
    // CHECK EVERY SECOND
    // ======================================

    setInterval(function () {


        const now =
            new Date();


        const currentDate =
            now.toISOString()
                .split("T")[0];


        const currentHour =
            String(
                now.getHours()
            ).padStart(2, "0");


        const currentMinute =
            String(
                now.getMinutes()
            ).padStart(2, "0");


        const currentTime =
            currentHour +
            ":" +
            currentMinute;


        // ==================================
        // CHECK EACH MEDICINE
        // ==================================

        medicines.forEach(
            function (medicine, index) {


                const startDate =
                    medicine.start_date;


                const endDate =
                    medicine.end_date;


                // ==================================
                // CHECK DATE RANGE
                // ==================================

                let dateAllowed = true;


                if (
                    startDate &&
                    currentDate < startDate
                ) {

                    dateAllowed = false;

                }


                if (
                    endDate &&
                    endDate !== "9999-12-31" &&
                    currentDate > endDate
                ) {

                    dateAllowed = false;

                }


                if (!dateAllowed) {

                    return;

                }


                // ==================================
                // CHECK REMINDER TIME
                // ==================================

                const reminderTime =
                    medicine.reminder_time;


                if (
                    currentTime === reminderTime
                ) {


                    const medicineId =
                        medicine.id ||
                        index;


                    const reminderKey =
                        "reminder_" +
                        medicineId +
                        "_" +
                        currentDate;


                    const alreadyShown =
                        localStorage.getItem(
                            reminderKey
                        );


                    // ==================================
                    // DON'T SHOW TWICE
                    // ==================================

                    if (!alreadyShown) {


                        // ==================================
                        // BROWSER NOTIFICATION
                        // ==================================

                        if (
                            "Notification" in window &&
                            Notification.permission ===
                                "granted"
                        ) {


                            new Notification(
                                "Medicine Reminder 💊",
                                {

                                    body:
                                        "Medicine: " +
                                        (
                                            medicine.medicine_name ||
                                            "Medicine"
                                        ) +
                                        "\nDosage: " +
                                        (
                                            medicine.dosage ||
                                            "-"
                                        ) +
                                        "\nTime: " +
                                        (
                                            medicine.reminder_time ||
                                            "-"
                                        )

                                }
                            );


                        } else {


                            // ==================================
                            // ALERT FALLBACK
                            // ==================================

                            alert(
                                "Medicine Reminder!\n\n" +

                                "Medicine: " +
                                (
                                    medicine.medicine_name ||
                                    "Medicine"
                                ) +

                                "\nDosage: " +
                                (
                                    medicine.dosage ||
                                    "-"
                                ) +

                                "\nTime: " +
                                (
                                    medicine.reminder_time ||
                                    "-"
                                )
                            );

                        }


                        // ==================================
                        // MARK AS SHOWN
                        // ==================================

                        localStorage.setItem(
                            reminderKey,
                            "shown"
                        );

                    }

                }

            }
        );


    }, 1000);

}


// ==========================================
// PAGE LOAD
// ==========================================

window.onload = function () {


    const loggedInUser =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!loggedInUser) {

        window.location.href =
            "login.html";

        return;

    }


    loadMedicines();

};