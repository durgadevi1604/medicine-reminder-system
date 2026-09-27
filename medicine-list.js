// =====================================
// MEDICINE LIST + AUTOMATIC REMINDER
// REMINDER FOR MEDICINES MORE THAN 1 WEEK
// LIFELONG MEDICINES ALSO INCLUDED
// HIGH VOLUME ALARM VERSION
// DATE SHIFT FIXED
// =====================================

let alarmAudioContext = null;
let alarmTimer = null;
let alarmStopTimer = null;

let lastReminderKey = "";
let isCheckingReminder = false;
let reminderInterval = null;
let audioUnlocked = false;


// =====================================
// RAILWAY BACKEND URL
// =====================================

const API_URL =
    "https://medicine-reminder-system-production.up.railway.app";


// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(str) {

    if (str === null || str === undefined) {
        return "";
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", async function () {

    const username = localStorage.getItem("loggedInUser");

    if (!username) {

        alert("Please login first!");

        window.location.href = "login.html";

        return;
    }

    console.log("💊 Medicine List Loaded");

    await loadMedicines();

    requestNotificationPermission();

    startReminderChecker();

    document.addEventListener(
        "click",
        unlockAlarmAudio,
        {
            once: true
        }
    );
});


// =====================================
// LOAD MEDICINES
// =====================================

async function loadMedicines() {

    const medicineContainer =
        document.getElementById("medicineList") ||
        document.getElementById("medicinesContainer");

    if (!medicineContainer) {

        console.error("Medicine container not found!");

        return;
    }

    medicineContainer.innerHTML =
        "<p>Loading medicines...</p>";

    try {

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

        const loggedInUser =
            localStorage.getItem("loggedInUser");

        const userMedicines =
            medicines.filter(
                medicine =>
                    String(medicine.username).trim() ===
                    String(loggedInUser).trim()
            );

        if (userMedicines.length === 0) {

            medicineContainer.innerHTML = `
                <div class="no-medicine">
                    <h3>💊 No Medicines Found</h3>
                    <p>Please add a medicine reminder.</p>
                </div>
            `;

            return;
        }

        medicineContainer.innerHTML = "";

        userMedicines.forEach(medicine => {

            const medicineCard =
                document.createElement("div");

            medicineCard.className =
                "medicine-card";

            medicineCard.innerHTML = `

                <h3>
                    💊
                    ${escapeHTML(
                        medicine.medicine_name
                    )}
                </h3>

                <p>
                    <strong>Dosage:</strong>
                    ${escapeHTML(
                        medicine.dosage
                    )}
                </p>

                <p>
                    <strong>
                        Reminder Time:
                    </strong>
                    ${formatTime(
                        medicine.reminder_time
                    )}
                </p>

                <p>
                    <strong>
                        Start Date:
                    </strong>
                    ${formatDate(
                        medicine.start_date
                    )}
                </p>

                <p>
                    <strong>
                        End Date:
                    </strong>
                    ${formatDate(
                        medicine.end_date
                    )}
                </p>

                <div class="medicine-buttons">

                    <button
                        type="button"
                        onclick="editMedicine(${Number(
                            medicine.id
                        )})">
                        ✏️ Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteMedicine(${Number(
                            medicine.id
                        )})">
                        🗑️ Delete
                    </button>

                </div>
            `;

            medicineContainer.appendChild(
                medicineCard
            );
        });

    }

    catch (error) {

        console.error(
            "Medicine loading error:",
            error
        );

        medicineContainer.innerHTML = `
            <p style="color:red;">
                ❌ Unable to load medicines.
            </p>
        `;
    }
}


// =====================================
// DATE FORMAT
// NO new Date()
// PREVENTS DATE SHIFT
// =====================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const dateString =
        String(dateValue).substring(0, 10);

    const parts =
        dateString.split("-");

    if (parts.length === 3) {

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
}


// =====================================
// DATE ONLY
// =====================================

function getDateOnly(dateValue) {

    if (!dateValue) {
        return "";
    }

    return String(dateValue).substring(0, 10);
}


// =====================================
// CONVERT YYYY-MM-DD TO NUMBER
// =====================================

function dateToNumber(dateString) {

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {

        return null;
    }

    const parts =
        dateString.split("-");

    const year =
        parseInt(parts[0], 10);

    const month =
        parseInt(parts[1], 10);

    const day =
        parseInt(parts[2], 10);

    return Math.floor(
        Date.UTC(
            year,
            month - 1,
            day
        ) / 86400000
    );
}


// =====================================
// GET MEDICINE DURATION
// =====================================

function getMedicineDurationDays(
    startDate,
    endDate
) {

    if (endDate === "9999-12-31") {

        return Infinity;
    }

    const startNumber =
        dateToNumber(startDate);

    const endNumber =
        dateToNumber(endDate);

    if (
        startNumber === null ||
        endNumber === null
    ) {

        return 0;
    }

    return (
        endNumber -
        startNumber +
        1
    );
}


// =====================================
// FORMAT TIME
// =====================================

function formatTime(timeValue) {

    if (!timeValue) {
        return "-";
    }

    const timeString =
        String(timeValue);

    const parts =
        timeString.split(":");

    if (parts.length < 2) {
        return timeString;
    }

    let hour =
        parseInt(parts[0], 10);

    const minute =
        parts[1];

    const ampm =
        hour >= 12
            ? "PM"
            : "AM";

    hour =
        hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${String(hour).padStart(2, "0")}:${minute} ${ampm}`;
}


// =====================================
// NOTIFICATION PERMISSION
// =====================================

function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.log(
            "Browser notification not supported."
        );

        return;
    }

    console.log(
        "Notification permission:",
        Notification.permission
    );
}


// =====================================
// UNLOCK AUDIO
// =====================================

async function unlockAlarmAudio() {

    try {

        if (audioUnlocked) {
            return;
        }

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        const testContext =
            new AudioContext();

        if (testContext.state === "suspended") {

            await testContext.resume();
        }

        await testContext.close();

        audioUnlocked = true;

        console.log(
            "🔊 Alarm audio unlocked."
        );

    }

    catch (error) {

        console.error(
            "Audio unlock error:",
            error
        );
    }
}


// =====================================
// START REMINDER CHECKER
// =====================================

function startReminderChecker() {

    if (reminderInterval) {

        clearInterval(reminderInterval);
    }

    checkMedicineReminder();

    reminderInterval =
        setInterval(
            checkMedicineReminder,
            2000
        );

    console.log(
        "⏰ Automatic reminder checker started."
    );
}


// =====================================
// CHECK MEDICINE REMINDER
//
// RULE:
// MORE THAN 7 DAYS = REMINDER
// 7 DAYS OR LESS = NO REMINDER
// LIFELONG = REMINDER
// =====================================

async function checkMedicineReminder() {

    if (isCheckingReminder) {
        return;
    }

    isCheckingReminder = true;

    try {

        const username =
            localStorage.getItem("loggedInUser");

        if (!username) {
            return;
        }

        const response =
            await fetch(
                `${API_URL}/api/medicines`
            );

        if (!response.ok) {
            return;
        }

        const medicines =
            await response.json();

        const now =
            new Date();

        const currentDate =
            `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-${String(
                now.getDate()
            ).padStart(2, "0")}`;

        const currentHours =
            String(
                now.getHours()
            ).padStart(2, "0");

        const currentMinutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");

        const currentTime =
            `${currentHours}:${currentMinutes}`;

        console.log(
            "⏰ Current:",
            currentDate,
            currentTime
        );

        const userMedicines =
            medicines.filter(
                medicine =>
                    String(
                        medicine.username
                    ).trim() ===
                    String(
                        username
                    ).trim()
            );

        for (
            const medicine of userMedicines
        ) {

            const startDate =
                getDateOnly(
                    medicine.start_date
                );

            const endDate =
                getDateOnly(
                    medicine.end_date
                );

            const durationDays =
                getMedicineDurationDays(
                    startDate,
                    endDate
                );

            console.log(
                `💊 ${medicine.medicine_name} duration:`,
                durationDays === Infinity
                    ? "LIFELONG"
                    : durationDays + " days"
            );

            if (durationDays <= 7) {

                console.log(
                    "⏭️ Reminder skipped - 1 week or less:",
                    medicine.medicine_name
                );

                continue;
            }

            if (
                startDate &&
                currentDate < startDate
            ) {

                console.log(
                    "⏭️ Medicine has not started yet:",
                    medicine.medicine_name
                );

                continue;
            }

            if (
                endDate !== "9999-12-31" &&
                currentDate > endDate
            ) {

                console.log(
                    "⏭️ Medicine period ended:",
                    medicine.medicine_name
                );

                continue;
            }

            const reminderTime =
                String(
                    medicine.reminder_time || ""
                ).substring(0, 5);

            if (
                !/^\d{2}:\d{2}$/.test(
                    reminderTime
                )
            ) {

                console.log(
                    "❌ Invalid reminder time:",
                    reminderTime
                );

                continue;
            }

            if (
                currentTime !==
                reminderTime
            ) {

                continue;
            }

            const reminderKey =
                `${medicine.id}_${currentDate}_${reminderTime}`;

            if (
                lastReminderKey ===
                reminderKey
            ) {

                continue;
            }

            lastReminderKey =
                reminderKey;

            console.log(
                "🔔 AUTOMATIC REMINDER TRIGGERED!",
                medicine.medicine_name,
                reminderTime
            );

            showMedicineReminder(
                medicine
            );
        }

    }

    catch (error) {

        console.error(
            "Reminder check error:",
            error
        );

    }

    finally {

        isCheckingReminder = false;
    }
}


// =====================================
// SHOW MEDICINE REMINDER
// =====================================

function showMedicineReminder(
    medicine
) {

    const medicineName =
        escapeHTML(
            medicine.medicine_name
        );

    const dosage =
        escapeHTML(
            medicine.dosage
        );

    sendNotification(
        "💊 Medicine Reminder",
        `Please take ${
            medicine.medicine_name
        } ${
            medicine.dosage || ""
        } now.`
    );

    let alarmBox =
        document.getElementById(
            "medicineAlarmBox"
        );

    if (!alarmBox) {

        alarmBox =
            document.createElement(
                "div"
            );

        alarmBox.id =
            "medicineAlarmBox";

        alarmBox.style.position =
            "fixed";

        alarmBox.style.left =
            "50%";

        alarmBox.style.top =
            "50%";

        alarmBox.style.transform =
            "translate(-50%, -50%)";

        alarmBox.style.zIndex =
            "99999";

        alarmBox.style.background =
            "#ffffff";

        alarmBox.style.padding =
            "25px";

        alarmBox.style.borderRadius =
            "20px";

        alarmBox.style.textAlign =
            "center";

        alarmBox.style.boxShadow =
            "0 10px 40px rgba(0,0,0,0.3)";

        alarmBox.style.minWidth =
            "280px";

        document.body.appendChild(
            alarmBox
        );
    }

    alarmBox.innerHTML = `

        <div style="font-size:45px;">
            💊
        </div>

        <h2>
            Medicine Reminder
        </h2>

        <p style="font-size:18px;">
            Please take your medicine now.
        </p>

        <p>
            <strong>
                ${medicineName}
            </strong>

            ${
                dosage
                    ? ` - ${dosage}`
                    : ""
            }
        </p>

        <button
            onclick="stopAlarm()"
            style="
                margin-top:15px;
                padding:12px 25px;
                border:none;
                border-radius:10px;
                background:#d63384;
                color:white;
                font-size:16px;
                cursor:pointer;
            "
        >
            🔕 Stop Alarm
        </button>
    `;

    alarmBox.style.display =
        "block";

    playAlarm();
}


// =====================================
// SEND NOTIFICATION
// =====================================

function sendNotification(
    title,
    message
) {

    if (!("Notification" in window)) {
        return;
    }

    if (
        Notification.permission ===
        "granted"
    ) {

        new Notification(
            title,
            {
                body: message,
                requireInteraction: true
            }
        );

        return;
    }

    if (
        Notification.permission !==
        "denied"
    ) {

        Notification.requestPermission()
            .then(permission => {

                if (
                    permission ===
                    "granted"
                ) {

                    new Notification(
                        title,
                        {
                            body: message,
                            requireInteraction: true
                        }
                    );
                }
            })
            .catch(error => {

                console.error(
                    "Notification error:",
                    error
                );
            });
    }
}


// =====================================
// PLAY HIGH VOLUME ALARM
// =====================================

function playAlarm() {

    stopAlarm(false);

    if (
        "speechSynthesis" in window
    ) {

        try {

            window.speechSynthesis.cancel();

            const speakReminder =
                () => {

                    const speech =
                        new SpeechSynthesisUtterance(
                            "Please take your medicine now."
                        );

                    speech.lang =
                        "en-US";

                    speech.rate =
                        0.82;

                    speech.pitch =
                        1.15;

                    speech.volume =
                        1.0;

                    const voices =
                        window
                            .speechSynthesis
                            .getVoices();

                    const femaleVoice =
                        voices.find(
                            voice => {

                                const name =
                                    voice.name.toLowerCase();

                                return (
                                    name.includes("female") ||
                                    name.includes("zira") ||
                                    name.includes("samantha") ||
                                    name.includes("susan") ||
                                    name.includes("karen") ||
                                    name.includes("victoria") ||
                                    name.includes("aria") ||
                                    name.includes("jenny")
                                );
                            }
                        );

                    if (femaleVoice) {

                        speech.voice =
                            femaleVoice;
                    }

                    window
                        .speechSynthesis
                        .speak(
                            speech
                        );
                };

            if (
                window
                    .speechSynthesis
                    .getVoices()
                    .length > 0
            ) {

                speakReminder();

            } else {

                window
                    .speechSynthesis
                    .onvoiceschanged =
                    speakReminder;
            }

        }

        catch (error) {

            console.error(
                "Voice alarm error:",
                error
            );
        }
    }


    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return;
        }

        alarmAudioContext =
            new AudioContext();

        const ctx =
            alarmAudioContext;

        if (
            ctx.state ===
            "suspended"
        ) {

            ctx.resume()
                .catch(error =>
                    console.error(
                        "Audio resume error:",
                        error
                    )
                );
        }

        const masterGain =
            ctx.createGain();

        masterGain.gain.value =
            0.85;

        masterGain.connect(
            ctx.destination
        );

        function playNote(
            frequency,
            startTime,
            duration
        ) {

            const oscillator =
                ctx.createOscillator();

            const gain =
                ctx.createGain();

            oscillator.type =
                "sine";

            oscillator.frequency.value =
                frequency;

            gain.gain.setValueAtTime(
                0.30,
                startTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                startTime + duration
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                masterGain
            );

            oscillator.start(
                startTime
            );

            oscillator.stop(
                startTime + duration
            );
        }

        function playChime(
            frequency,
            startTime
        ) {

            const oscillator =
                ctx.createOscillator();

            const gain =
                ctx.createGain();

            oscillator.type =
                "triangle";

            oscillator.frequency.value =
                frequency;

            gain.gain.setValueAtTime(
                0.24,
                startTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                startTime + 1.2
            );

            oscillator.connect(
                gain
            );

            gain.connect(
                masterGain
            );

            oscillator.start(
                startTime
            );

            oscillator.stop(
                startTime + 1.2
            );
        }

        function playMelody() {

            if (!alarmAudioContext) {
                return;
            }

            const currentTime =
                ctx.currentTime;

            playNote(
                659.25,
                currentTime,
                0.7
            );

            playNote(
                783.99,
                currentTime + 0.25,
                0.7
            );

            playNote(
                987.77,
                currentTime + 0.50,
                0.9
            );

            playNote(
                783.99,
                currentTime + 0.95,
                0.7
            );

            playNote(
                659.25,
                currentTime + 1.20,
                0.9
            );

            playChime(
                1046.50,
                currentTime + 1.65
            );

            playChime(
                1318.51,
                currentTime + 2.00
            );

            playChime(
                1567.98,
                currentTime + 2.35
            );
        }

        playMelody();

        alarmTimer =
            setInterval(
                () => {

                    if (
                        alarmAudioContext &&
                        alarmAudioContext.state !==
                        "closed"
                    ) {

                        playMelody();
                    }

                },
                4000
            );

        alarmStopTimer =
            setTimeout(
                () => {

                    stopAlarm();

                },
                30000
            );

    }

    catch (error) {

        console.error(
            "Alarm audio error:",
            error
        );
    }
}


// =====================================
// TEST ALARM
// =====================================

async function testAlarm() {

    await unlockAlarmAudio();

    lastReminderKey = "";

    playAlarm();

    const alarmBox =
        document.getElementById(
            "medicineAlarmBox"
        );

    if (alarmBox) {

        alarmBox.style.display =
            "block";
    }
}


// =====================================
// STOP ALARM
// =====================================

function stopAlarm(
    hideBox = true
) {

    if (alarmTimer) {

        clearInterval(
            alarmTimer
        );

        alarmTimer = null;
    }

    if (alarmStopTimer) {

        clearTimeout(
            alarmStopTimer
        );

        alarmStopTimer = null;
    }

    if (
        "speechSynthesis" in window
    ) {

        window
            .speechSynthesis
            .cancel();

        window
            .speechSynthesis
            .onvoiceschanged =
            null;
    }

    if (alarmAudioContext) {

        try {

            if (
                alarmAudioContext.state !==
                "closed"
            ) {

                alarmAudioContext.close();
            }

        }

        catch (error) {

            console.error(
                "Audio close error:",
                error
            );
        }

        alarmAudioContext =
            null;
    }

    if (hideBox) {

        const alarmBox =
            document.getElementById(
                "medicineAlarmBox"
            );

        if (alarmBox) {

            alarmBox.style.display =
                "none";
        }
    }
}


// =====================================
// EDIT MEDICINE
// =====================================

function editMedicine(id) {

    if (!id) {

        alert(
            "Medicine ID not found!"
        );

        return;
    }

    window.location.href =
        `edit-medicine.html?id=${encodeURIComponent(
            id
        )}`;
}


// =====================================
// DELETE MEDICINE
// =====================================

async function deleteMedicine(id) {

    if (!id) {

        alert(
            "Medicine ID not found!"
        );

        return;
    }

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this medicine?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/medicines/${id}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Delete failed"
            );
        }

        alert(
            "Medicine deleted successfully! 🗑️"
        );

        await loadMedicines();

    }

    catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Unable to delete medicine."
        );
    }
}