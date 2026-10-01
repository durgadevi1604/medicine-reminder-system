// ==========================================
// EDIT MEDICINE
// MEDICINE REMINDER SYSTEM
// ==========================================


// ==========================================
// GET MEDICINE ID FROM URL
// ==========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const medicineId =
    params.get("id");


// ==========================================
// RAILWAY BACKEND URL
// ==========================================

const API_URL =
    "https://medicine-reminder-system-production-3a18.up.railway.app";


// ==========================================
// LOAD MEDICINE
// ==========================================

async function loadMedicine() {

    console.log(
        "💊 Medicine ID:",
        medicineId
    );


    if (!medicineId) {

        alert(
            "Medicine ID not found!"
        );

        window.location.href =
            "medicine-list.html";

        return;
    }


    try {

        // ==================================
        // GET ALL MEDICINES
        // ==================================

        const response =
            await fetch(
                `${API_URL}/api/medicines`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load medicines"
            );
        }


        const medicines =
            await response.json();


        console.log(
            "📥 All medicines:",
            medicines
        );


        // ==================================
        // FIND SELECTED MEDICINE
        // ==================================

        const medicine =
            medicines.find(
                item =>
                    String(item.id) ===
                    String(medicineId)
            );


        if (!medicine) {

            alert(
                "Medicine not found!"
            );

            window.location.href =
                "medicine-list.html";

            return;
        }


        console.log(
            "✅ Selected medicine:",
            medicine
        );


        // ==================================
        // MEDICINE NAME
        // ==================================

        const medicineField =
            document.getElementById(
                "medicine"
            );

        if (medicineField) {

            medicineField.value =
                medicine.medicine_name || "";

        }


        // ==================================
        // DOSAGE
        // ==================================

        const dosageField =
            document.getElementById(
                "dosage"
            );

        if (dosageField) {

            dosageField.value =
                medicine.dosage || "";

        }


        // ==================================
        // TIME
        // ==================================

        const timeField =
            document.getElementById(
                "time"
            );

        if (timeField) {

            timeField.value =
                String(
                    medicine.reminder_time || ""
                ).substring(
                    0,
                    5
                );

        }


        // ==================================
        // START DATE
        // ==================================

        const startField =
            document.getElementById(
                "start"
            );

        if (startField) {

            startField.value =
                formatDate(
                    medicine.start_date
                );

        }


        // ==================================
        // END DATE
        // ==================================

        const endField =
            document.getElementById(
                "end"
            );

        if (endField) {

            endField.value =
                formatDate(
                    medicine.end_date
                );

        }


        console.log(
            "✅ Medicine details loaded successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Backend connection error:",
            error
        );

        alert(
            "Unable to connect to backend!\n\n" +
            "Please check Railway backend."
        );

    }

}


// ==========================================
// DATE FORMAT
// ==========================================

function formatDate(date) {

    if (!date) {

        return "";

    }


    let value =
        String(date);


    // Remove time if present

    if (
        value.includes("T")
    ) {

        value =
            value.substring(
                0,
                10
            );

    }


    return value.substring(
        0,
        10
    );

}


// ==========================================
// UPDATE MEDICINE
// ==========================================

async function updateMedicine() {

    if (!medicineId) {

        alert(
            "Medicine ID not found!"
        );

        return;
    }


    // ==================================
    // GET FORM VALUES
    // ==================================

    const medicineField =
        document.getElementById(
            "medicine"
        );

    const dosageField =
        document.getElementById(
            "dosage"
        );

    const timeField =
        document.getElementById(
            "time"
        );

    const startField =
        document.getElementById(
            "start"
        );

    const endField =
        document.getElementById(
            "end"
        );


    if (
        !medicineField ||
        !dosageField ||
        !timeField ||
        !startField ||
        !endField
    ) {

        alert(
            "Form fields not found!"
        );

        return;
    }


    const medicine =
        medicineField.value.trim();

    const dosage =
        dosageField.value.trim();

    const time =
        timeField.value;

    const start =
        startField.value;

    let end =
        endField.value;


    // ==================================
    // VALIDATION
    // ==================================

    if (
        !medicine ||
        !dosage ||
        !time ||
        !start
    ) {

        alert(
            "Please fill all required fields!"
        );

        return;
    }


    // ==================================
    // LIFELONG MEDICINE
    // ==================================

    if (
        end === "9999-12-31"
    ) {

        // Keep lifelong date

    }


    // ==================================
    // END DATE REQUIRED
    // ==================================

    else if (!end) {

        alert(
            "Please select the End Date!"
        );

        return;
    }


    // ==================================
    // DATE VALIDATION
    // ==================================

    if (
        end !== "9999-12-31" &&
        end < start
    ) {

        alert(
            "End date cannot be before start date!"
        );

        return;
    }


    // ==================================
    // UPDATE DATA
    // ==================================

    const updateData = {

        medicine_name:
            medicine,

        dosage:
            dosage,

        reminder_time:
            time,

        start_date:
            start,

        end_date:
            end

    };


    console.log(
        "📤 Updating medicine:",
        medicineId
    );

    console.log(
        "📦 Sending:",
        updateData
    );


    // ==================================
    // DISABLE UPDATE BUTTON
    // ==================================

    const button =
        document.querySelector(
            'button[onclick="updateMedicine()"]'
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            "⏳ Updating...";

    }


    // ==================================
    // SEND UPDATE REQUEST
    // ==================================

    try {

        const response =
            await fetch(
                `${API_URL}/api/medicines/${medicineId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            updateData
                        )
                }
            );


        const result =
            await response.json();


        console.log(
            "📥 Backend response:",
            result
        );


        // ==================================
        // SUCCESS
        // ==================================

        if (response.ok) {

            alert(
                "Medicine updated successfully! 💊"
            );


            window.location.href =
                "medicine-list.html";

        }


        // ==================================
        // BACKEND ERROR
        // ==================================

        else {

            alert(
                result.message ||
                result.error ||
                "Update failed!"
            );


            if (button) {

                button.disabled =
                    false;

                button.innerHTML =
                    "💾 Update Medicine";

            }

        }

    }

    catch (error) {

        console.error(
            "❌ Update error:",
            error
        );


        alert(
            "Unable to connect to backend!\n\n" +
            "Error: " +
            error.message
        );


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "💾 Update Medicine";

        }

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    loadMedicine
);