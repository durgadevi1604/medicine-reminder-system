// ==================================================
// MEDICINE QR SCANNER
// CAMERA + QR SCAN + SAVE
// ==================================================


// ==================================================
// CHECK LOGIN
// ==================================================

const loggedInUser = localStorage.getItem("loggedInUser");

if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
}


// ==================================================
// GLOBAL VARIABLES
// ==================================================

let html5QrCode = null;
let scannerRunning = false;

let cameras = [];
let currentCameraIndex = 0;

let scannedMedicine = null;
let scanProcessing = false;


// ==================================================
// GET AVAILABLE CAMERAS
// ==================================================

async function getAvailableCameras() {

    try {

        cameras = await Html5Qrcode.getCameras();

        console.log("=================================");
        console.log("📷 AVAILABLE CAMERAS");
        console.log("=================================");

        if (!cameras || cameras.length === 0) {

            alert(
                "❌ No camera found.\n\n" +
                "Please check your camera permission."
            );

            return false;
        }


        cameras.forEach((camera, index) => {

            console.log(
                "Camera " + index,
                "Name:",
                camera.label,
                "ID:",
                camera.id
            );

        });


        console.log(
            "📷 Total Cameras:",
            cameras.length
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Camera detection error:",
            error
        );

        alert(
            "❌ Unable to access camera.\n\n" +
            "Please allow camera permission and refresh the page."
        );

        return false;
    }
}


// ==================================================
// START CAMERA
// ==================================================

async function startCamera(cameraId) {

    try {

        // Stop old scanner
        if (html5QrCode && scannerRunning) {

            await stopScanner();

        }


        // Create new scanner
        html5QrCode =
            new Html5Qrcode("reader");


        console.log(
            "📷 Starting camera:",
            cameraId
        );


        // ==================================================
        // START QR SCANNER
        // ==================================================

        await html5QrCode.start(

            cameraId,

            {

                fps: 15,

                qrbox: {
                    width: 300,
                    height: 300
                },

                aspectRatio: 1.0,

                disableFlip: false

            },

            onScanSuccess,

            onScanFailure

        );


        scannerRunning = true;


        console.log(
            "✅ Camera started successfully."
        );


        updateCameraStatus();

    }

    catch (error) {

        console.error(
            "❌ Camera start error:",
            error
        );

        scannerRunning = false;

        alert(
            "❌ Camera could not be started.\n\n" +
            "Please check camera permission."
        );
    }
}


// ==================================================
// START AUTOMATIC CAMERA
// ==================================================

async function startAutomaticCamera() {

    if (cameras.length === 0) {

        const success =
            await getAvailableCameras();

        if (!success) {
            return;
        }
    }


    currentCameraIndex = 0;


    await startCamera(
        cameras[currentCameraIndex].id
    );
}


// ==================================================
// FRONT CAMERA
// ==================================================

async function startFrontCamera() {

    try {

        if (cameras.length === 0) {

            const success =
                await getAvailableCameras();

            if (!success) {
                return;
            }
        }


        console.log(
            "📷 Front Camera button clicked"
        );


        // Search front/user camera
        let frontIndex =
            cameras.findIndex(
                camera =>
                    /front|user|facetime|integrated|webcam/i
                        .test(camera.label)
            );


        // If laptop has only one camera
        if (frontIndex === -1) {

            frontIndex = 0;

        }


        currentCameraIndex =
            frontIndex;


        await startCamera(
            cameras[currentCameraIndex].id
        );


    }

    catch (error) {

        console.error(
            "Front camera error:",
            error
        );

    }
}


// ==================================================
// BACK CAMERA
// ==================================================

async function startBackCamera() {

    try {

        if (cameras.length === 0) {

            const success =
                await getAvailableCameras();

            if (!success) {
                return;
            }
        }


        console.log(
            "📷 Back Camera button clicked"
        );


        // Search rear/back/environment camera
        let backIndex =
            cameras.findIndex(
                camera =>
                    /back|rear|environment/i
                        .test(camera.label)
            );


        // If no back camera exists
        if (backIndex === -1) {

            alert(
                "ℹ️ Back camera is not available on this laptop.\n\n" +
                "The available webcam will be used."
            );

            backIndex = 0;

        }


        currentCameraIndex =
            backIndex;


        await startCamera(
            cameras[currentCameraIndex].id
        );


    }

    catch (error) {

        console.error(
            "Back camera error:",
            error
        );

    }
}


// ==================================================
// SWITCH CAMERA
// ==================================================

async function switchCamera() {

    try {

        console.log(
            "🔄 Switch Camera clicked"
        );


        if (cameras.length === 0) {

            const success =
                await getAvailableCameras();

            if (!success) {
                return;
            }
        }


        // Only one camera
        if (cameras.length === 1) {

            alert(
                "ℹ️ Only one camera is available on this laptop.\n\n" +
                "The current camera is already being used."
            );

            return;
        }


        // Move to next camera
        currentCameraIndex++;


        if (
            currentCameraIndex >=
            cameras.length
        ) {

            currentCameraIndex = 0;

        }


        console.log(
            "🔄 Switching to:",
            cameras[currentCameraIndex].label
        );


        await startCamera(
            cameras[currentCameraIndex].id
        );

    }

    catch (error) {

        console.error(
            "❌ Switch camera error:",
            error
        );

        alert(
            "❌ Unable to switch camera."
        );
    }
}


// ==================================================
// CAMERA STATUS
// ==================================================

function updateCameraStatus() {

    const status =
        document.getElementById(
            "cameraStatus"
        );


    if (!status) {
        return;
    }


    if (
        cameras.length > 0 &&
        cameras[currentCameraIndex]
    ) {

        let label =
            cameras[currentCameraIndex].label;


        if (
            !label ||
            label.trim() === ""
        ) {

            label =
                "Camera " +
                (currentCameraIndex + 1);

        }


        status.textContent =
            label;

    }

    else {

        status.textContent =
            "Camera";

    }
}


// ==================================================
// QR SCAN SUCCESS
// ==================================================

async function onScanSuccess(decodedText, decodedResult) {

    // Prevent multiple detections
    if (scanProcessing) {
        return;
    }


    scanProcessing = true;


    console.log(
        "================================="
    );

    console.log(
        "📷 QR CODE DETECTED"
    );

    console.log(
        "QR DATA:",
        decodedText
    );

    console.log(
        "================================="
    );


    try {

        // ==================================================
        // PARSE JSON
        // ==================================================

        const data =
            JSON.parse(decodedText);


        console.log(
            "Parsed QR Data:",
            data
        );


        // ==================================================
        // CHECK MEDICINE
        // ==================================================

        if (!data.medicine) {

            throw new Error(
                "Medicine name missing"
            );

        }


        // ==================================================
        // STORE DATA
        // ==================================================

        scannedMedicine = {

            medicine:
                data.medicine || "",

            dosage:
                data.dosage || "",

            time:
                data.time || "",

            start:
                data.start || "",

            end:
                data.end || ""

        };


        console.log(
            "✅ Medicine data:",
            scannedMedicine
        );


        // ==================================================
        // DISPLAY DATA
        // ==================================================

        const medicineName =
            document.getElementById(
                "medicineName"
            );

        const medicineDose =
            document.getElementById(
                "medicineDose"
            );

        const medicineTime =
            document.getElementById(
                "medicineTime"
            );

        const medicineStart =
            document.getElementById(
                "medicineStart"
            );

        const medicineEnd =
            document.getElementById(
                "medicineEnd"
            );


        if (medicineName) {

            medicineName.textContent =
                scannedMedicine.medicine;

        }


        if (medicineDose) {

            medicineDose.textContent =
                scannedMedicine.dosage;

        }


        if (medicineTime) {

            medicineTime.textContent =
                scannedMedicine.time;

        }


        if (medicineStart) {

            medicineStart.textContent =
                scannedMedicine.start;

        }


        if (medicineEnd) {

            medicineEnd.textContent =
                scannedMedicine.end;

        }


        // ==================================================
        // STOP CAMERA
        // ==================================================

        await stopScanner();


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        alert(
            "✅ QR Code Scanned Successfully!\n\n" +
            "Medicine: " +
            scannedMedicine.medicine
        );


        console.log(
            "✅ QR scan completed."
        );

    }

    catch (error) {

        console.error(
            "❌ Invalid QR:",
            error
        );


        scannedMedicine = null;


        alert(
            "❌ Invalid Medicine QR Code!"
        );


        scanProcessing = false;
    }
}


// ==================================================
// QR SCAN FAILURE
// ==================================================

function onScanFailure(errorMessage) {

    // Do nothing.
    // This function runs continuously
    // while QR is not detected.

}


// ==================================================
// STOP SCANNER
// ==================================================

async function stopScanner() {

    if (
        html5QrCode &&
        scannerRunning
    ) {

        try {

            await html5QrCode.stop();


            console.log(
                "📷 Camera stopped."
            );

        }

        catch (error) {

            console.error(
                "Scanner stop error:",
                error
            );

        }


        scannerRunning = false;

    }
}


// ==================================================
// SAVE SCANNED MEDICINE
// ==================================================

async function saveScannedMedicine() {

    // ==================================================
    // CHECK QR SCAN
    // ==================================================

    if (!scannedMedicine) {

        alert(
            "📷 Please scan a medicine QR code first."
        );

        return;
    }


    // ==================================================
    // CHECK LOGIN
    // ==================================================

    const username =
        localStorage.getItem(
            "loggedInUser"
        );


    if (!username) {

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;
    }


    // ==================================================
    // VALIDATE DATA
    // ==================================================

    if (
        !scannedMedicine.medicine ||
        !scannedMedicine.dosage ||
        !scannedMedicine.time ||
        !scannedMedicine.start ||
        !scannedMedicine.end
    ) {

        alert(
            "❌ QR code data is incomplete."
        );

        return;
    }


    // ==================================================
    // PREPARE DATA
    // ==================================================

    const medicineData = {

        username:
            username,

        medicine:
            scannedMedicine.medicine,

        dosage:
            scannedMedicine.dosage,

        time:
            scannedMedicine.time,

        start:
            scannedMedicine.start,

        end:
            scannedMedicine.end

    };


    console.log(
        "📤 Sending medicine to backend:",
        medicineData
    );


    // ==================================================
    // SEND TO BACKEND
    // ==================================================

    try {

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
                        )

                }
            );


        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to save medicine."
            );

        }


        alert(
            "✅ Scanned Medicine Saved Successfully!"
        );


        window.location.href =
            "medicine-list.html";

    }

    catch (error) {

        console.error(
            "❌ Save medicine error:",
            error
        );


        alert(
            "❌ Failed to save scanned medicine.\n\n" +
            "Please make sure the backend server is running."
        );

    }
}


// ==================================================
// PAGE LOAD
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "💊 Medicine QR Scanner Loaded"
        );


        const success =
            await getAvailableCameras();


        if (!success) {
            return;
        }


        console.log(
            "📷 Camera permission available."
        );


        // Start first available camera
        await startAutomaticCamera();

    }
);