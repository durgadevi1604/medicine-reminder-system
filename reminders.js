// ==========================================
// MEDICINE REMINDERS
// RAILWAY BACKEND VERSION
// ==========================================

const API_URL =
    "https://medicine-reminder-system-production.up.railway.app";


// ==========================================
// LOAD REMINDERS
// ==========================================

async function loadReminders() {

    const reminderList =
        document.getElementById("reminderList");

    const loggedInUser =
        localStorage.getItem("loggedInUser");


    // Check login
    if (!loggedInUser) {

        reminderList.innerHTML = `
            <div class="card">
                <h3>🔐 Login Required</h3>
                <p>Please login first.</p>
            </div>
        `;

        return;
    }


    // Loading message
    reminderList.innerHTML = `
        <div class="card">
            <h3>⏳ Loading Reminders...</h3>
            <p>Please wait.</p>
        </div>
    `;


    try {

        // Get medicines from Railway backend
        const response =
            await fetch(`${API_URL}/api/medicines`);


        if (!response.ok) {
            throw new Error("Failed to load medicines");
        }


        const result = await response.json();


        // Backend response
        const medicines =
            Array.isArray(result)
                ? result
                : result.medicines || [];


        // Filter logged-in user's medicines
        const userMedicines =
            medicines.filter(function (medicine) {

                return medicine.username === loggedInUser;

            });


        // No medicines
        if (userMedicines.length === 0) {

            reminderList.innerHTML = `
                <div class="card">
                    <h3>🔔 No Reminders</h3>
                    <p>No medicine reminders found.</p>
                </div>
            `;

            return;
        }


        // Clear old content
        reminderList.innerHTML = "";


        // Display medicines
        userMedicines.forEach(function (medicine) {

            const medicineName =
                medicine.medicine_name || "Medicine";

            const dosage =
                medicine.dosage || "-";

            const reminderTime =
                medicine.reminder_time || "-";

            const startDate =
                medicine.start_date || "-";

            const endDate =
                medicine.end_date || "-";


            let endDisplay = endDate;

            // Lifelong medicine
            if (endDate === "9999-12-31") {
                endDisplay = "Lifelong";
            }


            reminderList.innerHTML += `

                <div class="card">

                    <h3>
                        💊 ${escapeHTML(medicineName)}
                    </h3>

                    <p>
                        <strong>Dosage:</strong>
                        ${escapeHTML(dosage)}
                    </p>

                    <p>
                        <strong>⏰ Reminder Time:</strong>
                        ${escapeHTML(reminderTime)}
                    </p>

                    <p>
                        <strong>📅 Start:</strong>
                        ${escapeHTML(startDate)}
                    </p>

                    <p>
                        <strong>📅 End:</strong>
                        ${escapeHTML(endDisplay)}
                    </p>

                    <div class="medicine-status">
                        🔔 Reminder Active
                    </div>

                </div>
            `;
        });


    } catch (error) {

        console.error(
            "Error loading reminders:",
            error
        );


        reminderList.innerHTML = `
            <div class="card">

                <h3>❌ Error</h3>

                <p>
                    Unable to load reminders.
                </p>

                <p>
                    Please make sure the backend
                    is running.
                </p>

            </div>
        `;
    }
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// LOAD WHEN PAGE OPENS
// ==========================================

loadReminders();