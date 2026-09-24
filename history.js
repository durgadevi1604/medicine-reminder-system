// ==========================================
// MEDICINE HISTORY
// ==========================================


// ==========================================
// BACKEND URL
// ==========================================

const API_URL = "http://127.0.0.1:5000";


// ==========================================
// LOGIN CHECK
// ==========================================

const loggedInUser =
    localStorage.getItem("loggedInUser");


if (!loggedInUser) {

    alert("Please login first.");

    window.location.href = "login.html";

}


// ==========================================
// PATIENT NAME
// ==========================================

const patientName =
    document.getElementById("patientName");


if (patientName) {

    patientName.textContent = loggedInUser;

}


// ==========================================
// ELEMENTS
// ==========================================

const historyTableBody =
    document.getElementById("historyTableBody");

const emptyMessage =
    document.getElementById("emptyMessage");

const statusFilter =
    document.getElementById("statusFilter");


// ==========================================
// SUMMARY ELEMENTS
// ==========================================

const totalCount =
    document.getElementById("totalCount");

const takenCount =
    document.getElementById("takenCount");

const missedCount =
    document.getElementById("missedCount");

const snoozedCount =
    document.getElementById("snoozedCount");


// ==========================================
// HISTORY DATA
// ==========================================

let historyData = [];


// ==========================================
// LOAD HISTORY
// ==========================================

async function loadHistory() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/history/${encodeURIComponent(loggedInUser)}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load history."
            );

        }


        historyData =
            await response.json();


        updateSummary();

        displayHistory(historyData);

    }

    catch (error) {

        console.error(
            "History Error:",
            error
        );


        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    ❌ Failed to load medicine history.
                </td>
            </tr>
        `;

    }

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    const total =
        historyData.length;


    const taken =
        historyData.filter(
            item => item.status === "Taken"
        ).length;


    const missed =
        historyData.filter(
            item => item.status === "Missed"
        ).length;


    const snoozed =
        historyData.filter(
            item => item.status === "Snoozed"
        ).length;


    totalCount.textContent = total;

    takenCount.textContent = taken;

    missedCount.textContent = missed;

    snoozedCount.textContent = snoozed;

}


// ==========================================
// DISPLAY HISTORY
// ==========================================

function displayHistory(data) {

    historyTableBody.innerHTML = "";


    if (!data || data.length === 0) {

        emptyMessage.style.display = "block";

        return;

    }


    emptyMessage.style.display = "none";


    data.forEach(item => {

        const row =
            document.createElement("tr");


        const statusClass =
            item.status.toLowerCase();


        row.innerHTML = `

            <td>
                💊 ${escapeHTML(item.medicine_name)}
            </td>

            <td>
                ${escapeHTML(item.dosage)}
            </td>

            <td>
                ${formatTime(item.reminder_time)}
            </td>

            <td>
                <span class="status-badge ${statusClass}">
                    ${getStatusIcon(item.status)}
                    ${item.status}
                </span>
            </td>

            <td>
                ${formatDate(item.history_date)}
            </td>

            <td>
                ${formatTime(item.history_time)}
            </td>

            <td>

                <button
                    class="delete-history-btn"
                    onclick="deleteHistory(${item.id})">

                    🗑️ Delete

                </button>

            </td>

        `;


        historyTableBody.appendChild(row);

    });

}


// ==========================================
// FILTER
// ==========================================

statusFilter.addEventListener(
    "change",
    function () {

        const selectedStatus =
            this.value;


        if (selectedStatus === "All") {

            displayHistory(historyData);

            return;

        }


        const filtered =
            historyData.filter(
                item =>
                    item.status === selectedStatus
            );


        displayHistory(filtered);

    }
);


// ==========================================
// DELETE HISTORY
// ==========================================

async function deleteHistory(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this history?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/history/${id}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Delete failed."
            );

        }


        alert(
            "History deleted successfully!"
        );


        loadHistory();

    }

    catch (error) {

        console.error(
            "Delete History Error:",
            error
        );


        alert(
            "Failed to delete history."
        );

    }

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const parts =
        String(dateValue).split("-");


    if (parts.length === 3) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    return dateValue;

}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(timeValue) {

    if (!timeValue) {

        return "-";

    }


    const time =
        String(timeValue).substring(0, 5);


    const parts =
        time.split(":");


    if (parts.length < 2) {

        return time;

    }


    let hour =
        parseInt(parts[0], 10);

    const minute =
        parts[1];


    const period =
        hour >= 12 ? "PM" : "AM";


    hour =
        hour % 12 || 12;


    return `${hour}:${minute} ${period}`;

}


// ==========================================
// STATUS ICON
// ==========================================

function getStatusIcon(status) {

    if (status === "Taken") {

        return "✅";

    }


    if (status === "Missed") {

        return "❌";

    }


    if (status === "Snoozed") {

        return "⏳";

    }


    return "";

}


// ==========================================
// HTML SAFETY
// ==========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// ==========================================
// BACK BUTTON
// ==========================================

function goBack() {

    window.location.href =
        "index.html";

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadHistory();