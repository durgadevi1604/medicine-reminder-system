require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors());
app.use(express.json());

// ==================================================
// MYSQL CONNECTION POOL
// ==================================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,

    dateStrings: true,

    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,

    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,

    queueLimit: 0
});

// ==================================================
// MYSQL CONNECTION TEST
// ==================================================

db.query("SELECT 1", (err) => {

    if (err) {
        console.error("❌ MySQL connection failed:");
        console.error(err);
    } else {
        console.log("✅ MySQL connected successfully!");
    }

});

// ==================================================
// KEEP MYSQL CONNECTION ALIVE
// ==================================================

setInterval(() => {

    db.query("SELECT 1", (err) => {

        if (err) {
            console.error("⚠️ MySQL keep-alive failed:", err.message);
        } else {
            console.log("💚 MySQL keep-alive OK");
        }

    });

}, 30000);

// ==================================================
// TEST BACKEND
// ==================================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Medicine Reminder Backend is Running!"
    });

});

// ==================================================
// MEDICINE APIs
// ==================================================

// ==================================================
// SAVE MEDICINE
// ==================================================

app.post("/api/medicines", (req, res) => {

    console.log("📥 Medicine received:", req.body);

    const {
        username,
        medicine,
        dosage,
        time,
        start,
        end
    } = req.body;

    if (
        !username ||
        !medicine ||
        !dosage ||
        !time ||
        !start
    ) {

        return res.status(400).json({
            success: false,
            message: "Required medicine data is missing."
        });

    }

    const finalEndDate = end || "9999-12-31";

    const sql = `
        INSERT INTO medicines
        (
            username,
            medicine_name,
            dosage,
            reminder_time,
            start_date,
            end_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            username,
            medicine,
            dosage,
            time,
            start,
            finalEndDate
        ],
        (err, result) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save medicine.",
                    error: err.message
                });

            }

            console.log("✅ Medicine saved to MySQL!");

            return res.status(200).json({
                success: true,
                message: "Medicine saved successfully!",
                id: result.insertId
            });

        }
    );

});

// ==================================================
// GET ALL MEDICINES
// ==================================================

app.get("/api/medicines", (req, res) => {

    const sql = `
        SELECT
            id,
            username,
            medicine_name,
            dosage,
            reminder_time,
            start_date,
            end_date
        FROM medicines
        ORDER BY id DESC
    `;

    db.query(
        sql,
        (err, results) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch medicines.",
                    error: err.message
                });

            }

            return res.status(200).json(results);

        }
    );

});

// ==================================================
// GET SINGLE MEDICINE
// ==================================================

app.get("/api/medicines/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            id,
            username,
            medicine_name,
            dosage,
            reminder_time,
            start_date,
            end_date
        FROM medicines
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, results) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch medicine.",
                    error: err.message
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Medicine not found."
                });

            }

            return res.status(200).json(results[0]);

        }
    );

});

// ==================================================
// UPDATE MEDICINE
// ==================================================

app.put("/api/medicines/:id", (req, res) => {

    const id = req.params.id;

    const medicine =
        req.body.medicine ||
        req.body.medicine_name;

    const dosage =
        req.body.dosage;

    const time =
        req.body.time ||
        req.body.reminder_time;

    const start =
        req.body.start ||
        req.body.start_date;

    const end =
        req.body.end ||
        req.body.end_date ||
        "9999-12-31";

    if (
        !medicine ||
        !dosage ||
        !time ||
        !start
    ) {

        return res.status(400).json({
            success: false,
            message: "Required update data is missing."
        });

    }

    const sql = `
        UPDATE medicines
        SET
            medicine_name = ?,
            dosage = ?,
            reminder_time = ?,
            start_date = ?,
            end_date = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            medicine,
            dosage,
            time,
            start,
            end,
            id
        ],
        (err, result) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to update medicine.",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Medicine not found."
                });

            }

            return res.status(200).json({
                success: true,
                message: "Medicine updated successfully!"
            });

        }
    );

});

// ==================================================
// DELETE MEDICINE
// ==================================================

app.delete("/api/medicines/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM medicines
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete medicine.",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Medicine not found."
                });

            }

            return res.status(200).json({
                success: true,
                message: "Medicine deleted successfully!"
            });

        }
    );

});

// ==================================================
// MEDICINE HISTORY APIs
// ==================================================

// ==================================================
// SAVE HISTORY
// ==================================================

app.post("/api/history", (req, res) => {

    const {
        username,
        medicine_id,
        medicine_name,
        dosage,
        reminder_time,
        status,
        history_date,
        history_time
    } = req.body;

    if (
        !username ||
        !medicine_id ||
        !medicine_name ||
        !dosage ||
        !reminder_time ||
        !status ||
        !history_date ||
        !history_time
    ) {

        return res.status(400).json({
            success: false,
            message: "Required history data is missing."
        });

    }

    const allowedStatuses = [
        "Taken",
        "Missed",
        "Snoozed"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            success: false,
            message: "Invalid history status."
        });

    }

    const sql = `
        INSERT INTO medicine_history
        (
            username,
            medicine_id,
            medicine_name,
            dosage,
            reminder_time,
            status,
            history_date,
            history_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            username,
            medicine_id,
            medicine_name,
            dosage,
            reminder_time,
            status,
            history_date,
            history_time
        ],
        (err, result) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save medicine history.",
                    error: err.message
                });

            }

            return res.status(200).json({
                success: true,
                message: "Medicine history saved successfully!",
                id: result.insertId
            });

        }
    );

});

// ==================================================
// GET USER HISTORY
// ==================================================

app.get("/api/history/:username", (req, res) => {

    const username = req.params.username;

    const sql = `
        SELECT
            id,
            username,
            medicine_id,
            medicine_name,
            dosage,
            reminder_time,
            status,
            history_date,
            history_time,
            created_at
        FROM medicine_history
        WHERE username = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [username],
        (err, results) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch medicine history.",
                    error: err.message
                });

            }

            return res.status(200).json(results);

        }
    );

});

// ==================================================
// DELETE HISTORY
// ==================================================

app.delete("/api/history/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM medicine_history
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.error("❌ Database Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Failed to delete history.",
                    error: err.message
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "History record not found."
                });

            }

            return res.status(200).json({
                success: true,
                message: "History deleted successfully!"
            });

        }
    );

});

// ==================================================
// START SERVER
// ==================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🚀 Server running on port ${PORT}`
    );

});