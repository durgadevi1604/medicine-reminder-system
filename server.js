// ==========================================
// MEDICINE REMINDER SYSTEM - BACKEND
// ==========================================

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// MYSQL CONNECTION
// ==========================================

const db = mysql.createConnection({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    port: Number(process.env.DB_PORT) || 3306,

    dateStrings: true

});


// ==========================================
// CONNECT MYSQL
// ==========================================

db.connect((err) => {

    if (err) {

        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(err);

    } else {

        console.log(
            "✅ MySQL connected successfully!"
        );

    }

});


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Medicine Reminder Backend is Running!"

    });

});


// ==========================================
// ADD MEDICINE
// ==========================================

app.post("/api/medicines", (req, res) => {

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

            message:
                "Required medicine details are missing."

        });

    }


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
            end || "9999-12-31"
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "❌ Add medicine error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to save medicine."

                });

            }


            res.json({

                success: true,

                message:
                    "Medicine saved successfully!",

                id: result.insertId

            });

        }

    );

});


// ==========================================
// GET ALL MEDICINES
// ==========================================

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

        ORDER BY id ASC

    `;


    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "❌ Get medicines error:",
                err
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to get medicines."

            });

        }


        res.json(results);

    });

});


// ==========================================
// GET MEDICINE BY ID
// ==========================================

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

                console.error(
                    "❌ Get medicine error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to get medicine."

                });

            }


            if (results.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medicine not found."

                });

            }


            res.json(results[0]);

        }
    );

});


// ==========================================
// UPDATE MEDICINE
// ==========================================

app.put("/api/medicines/:id", (req, res) => {

    const id = req.params.id;


    const {
        medicine,
        dosage,
        time,
        start,
        end
    } = req.body;


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
            end || "9999-12-31",
            id
        ],

        (err, result) => {

            if (err) {

                console.error(
                    "❌ Update medicine error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update medicine."

                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medicine not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Medicine updated successfully!"

            });

        }

    );

});


// ==========================================
// DELETE MEDICINE
// ==========================================

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

                console.error(
                    "❌ Delete medicine error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete medicine."

                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Medicine not found."

                });

            }


            res.json({

                success: true,

                message:
                    "Medicine deleted successfully!"

            });

        }

    );

});


// ==========================================
// ADD MEDICINE HISTORY
// ==========================================

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

                console.error(
                    "❌ Add history error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to save history."

                });

            }


            res.json({

                success: true,

                message:
                    "Medicine history saved successfully!",

                id: result.insertId

            });

        }

    );

});


// ==========================================
// GET HISTORY BY USER
// ==========================================

app.get("/api/history/:username", (req, res) => {

    const username =
        req.params.username;


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

                console.error(
                    "❌ Get history error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to get history."

                });

            }


            res.json(results);

        }

    );

});


// ==========================================
// DELETE HISTORY
// ==========================================

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

                console.error(
                    "❌ Delete history error:",
                    err
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to delete history."

                });

            }


            res.json({

                success: true,

                message:
                    "History deleted successfully!"

            });

        }

    );

});


// ==========================================
// SERVER START
// ==========================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Server running on port ${PORT}`
        );

    }
);