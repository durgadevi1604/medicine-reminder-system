function scanQR() {

    document.getElementById("name").innerHTML = "Paracetamol";
    document.getElementById("dose").innerHTML = "500 mg";
    document.getElementById("time").innerHTML = "08:00";

    alert("QR Code Scanned Successfully!");
}


function saveReminder() {
    alert("Medicine Reminder Saved!");
}


window.onload = function () {

    let loggedInUser = localStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }

    let medicines =
        JSON.parse(localStorage.getItem("medicines")) || [];

    let patientMedicines = medicines.filter(function (item) {
        return item.username === loggedInUser;
    });

    if (patientMedicines.length === 0) {

        document.getElementById("name").innerHTML = "-";
        document.getElementById("dose").innerHTML = "-";
        document.getElementById("time").innerHTML = "-";

        return;
    }

    // Show latest medicine
    let latestMedicine =
        patientMedicines[patientMedicines.length - 1];

    document.getElementById("name").innerHTML =
        latestMedicine.medicine;

    document.getElementById("dose").innerHTML =
        latestMedicine.dosage;

    document.getElementById("time").innerHTML =
        latestMedicine.time;

    startAllReminders(patientMedicines);
};


function startAllReminders(medicines) {

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {
        Notification.requestPermission();
    }

    setInterval(function () {

        let now = new Date();

        let currentDate =
            now.toISOString().split("T")[0];

        let currentHour =
            String(now.getHours()).padStart(2, "0");

        let currentMinute =
            String(now.getMinutes()).padStart(2, "0");

        let currentTime =
            currentHour + ":" + currentMinute;


        medicines.forEach(function (medicine, index) {

            // Check date range
            let startDate = medicine.start;
            let endDate = medicine.end;

            let dateAllowed = true;

            if (startDate && currentDate < startDate) {
                dateAllowed = false;
            }

            if (endDate && currentDate > endDate) {
                dateAllowed = false;
            }

            if (!dateAllowed) {
                return;
            }


            // Check reminder time
            if (currentTime === medicine.time) {

                let reminderKey =
                    "reminder_" +
                    index +
                    "_" +
                    currentDate;

                let alreadyShown =
                    localStorage.getItem(reminderKey);


                if (!alreadyShown) {

                    if (
                        "Notification" in window &&
                        Notification.permission === "granted"
                    ) {

                        new Notification(
                            "Medicine Reminder 💊",
                            {
                                body:
                                    "Medicine: " +
                                    medicine.medicine +
                                    "\nDosage: " +
                                    medicine.dosage +
                                    "\nTime: " +
                                    medicine.time
                            }
                        );

                    } else {

                        alert(
                            "Medicine Reminder!\n\n" +
                            "Medicine: " +
                            medicine.medicine +
                            "\nDosage: " +
                            medicine.dosage +
                            "\nTime: " +
                            medicine.time
                        );
                    }

                    localStorage.setItem(
                        reminderKey,
                        "shown"
                    );
                }
            }

        });

    }, 1000);
}