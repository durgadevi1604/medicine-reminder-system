function loadReminders() {

    let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

    let loggedInUser = localStorage.getItem("loggedInUser");

    let reminderList = document.getElementById("reminderList");

    reminderList.innerHTML = "";

    let userMedicines = medicines.filter(function(medicine) {
        return medicine.username === loggedInUser;
    });

    if (userMedicines.length === 0) {

        reminderList.innerHTML = `
            <div class="card">
                <h3>🔔 No Reminders</h3>
                <p>No medicine reminders found.</p>
            </div>
        `;

        return;
    }

    userMedicines.forEach(function(medicine) {

        reminderList.innerHTML += `

            <div class="card">

                <h3>💊 ${medicine.medicine}</h3>

                <p>
                    <strong>Dosage:</strong>
                    ${medicine.dosage}
                </p>

                <p>
                    <strong>⏰ Reminder Time:</strong>
                    ${medicine.time}
                </p>

                <p>
                    <strong>📅 Start:</strong>
                    ${medicine.start}
                </p>

                <p>
                    <strong>📅 End:</strong>
                    ${medicine.end}
                </p>

                <div class="medicine-status">
                    🔔 Reminder Active
                </div>

            </div>
        `;
    });
}

loadReminders();