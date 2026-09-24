// ==========================================
// EDIT MEDICINE
// ==========================================

const params = new URLSearchParams(window.location.search);
const medicineId = params.get("id");

const API_URL = "http://127.0.0.1:5000";


// ==========================================
// LOAD MEDICINE
// ==========================================

async function loadMedicine() {

    console.log("Medicine ID:", medicineId);

    if (!medicineId) {
        alert("Medicine ID not found!");
        window.location.href = "medicine-list.html";
        return;
    }

    try {

        // Get ALL medicines
        const response = await fetch(
            `${API_URL}/api/medicines`
        );

        if (!response.ok) {
            throw new Error("Failed to load medicines");
        }

        const medicines = await response.json();

        console.log("All medicines:", medicines);

        // Find selected medicine
        const medicine = medicines.find(
            item => String(item.id) === String(medicineId)
        );

        if (!medicine) {

            alert("Medicine not found!");

            window.location.href =
                "medicine-list.html";

            return;
        }

        console.log("Selected medicine:", medicine);


        // Fill Medicine Name
        document.getElementById("medicine").value =
            medicine.medicine_name || "";


        // Fill Dosage
        document.getElementById("dosage").value =
            medicine.dosage || "";


        // Fill Time
        document.getElementById("time").value =
            String(medicine.reminder_time || "")
                .substring(0, 5);


        // Fill Start Date
        document.getElementById("start").value =
            formatDate(medicine.start_date);


        // Fill End Date
        document.getElementById("end").value =
            formatDate(medicine.end_date);

    }

    catch (error) {

        console.error(
            "❌ Backend connection error:",
            error
        );

        alert(
            "Unable to connect to backend!"
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

    let value = String(date);

    if (value.includes("T")) {
        value = value.substring(0, 10);
    }

    return value.substring(0, 10);
}


// ==========================================
// UPDATE MEDICINE
// ==========================================

async function updateMedicine() {

    if (!medicineId) {

        alert("Medicine ID not found!");

        return;
    }


    const medicine =
        document.getElementById("medicine").value.trim();

    const dosage =
        document.getElementById("dosage").value.trim();

    const time =
        document.getElementById("time").value;

    const start =
        document.getElementById("start").value;

    const end =
        document.getElementById("end").value;


    // Validation

    if (
        !medicine ||
        !dosage ||
        !time ||
        !start ||
        !end
    ) {

        alert("Please fill all fields!");

        return;
    }


    if (end < start) {

        alert(
            "End date cannot be before start date!"
        );

        return;
    }


    const updateData = {

        medicine_name: medicine,

        dosage: dosage,

        reminder_time: time,

        start_date: start,

        end_date: end

    };


    console.log(
        "Updating medicine:",
        medicineId
    );

    console.log(
        "Sending:",
        updateData
    );


    try {

        const response = await fetch(
            `${API_URL}/api/medicines/${medicineId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updateData)
            }
        );


        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        if (response.ok) {

            alert(
                "Medicine updated successfully! 💊"
            );

            window.location.href =
                "medicine-list.html";

        } else {

            alert(
                result.message ||
                "Update failed!"
            );

        }

    }

    catch (error) {

        console.error(
            "Update error:",
            error
        );

        alert(
            "Unable to connect to backend!"
        );

    }

}


// ==========================================
// PAGE LOAD
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    loadMedicine
);