// ==================================================
// MEDICINE REMINDER SYSTEM
// BACKEND SERVER
// ==================================================

require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");

const app = express();


// ==================================================
// CORS - MANUAL
// ==================================================

app.use((req, res, next) => {

    const origin = req.headers.origin;

    if (origin) {

        res.setHeader(
            "Access-Control-Allow-Origin",
            origin
        );

    } else {

        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

    }

    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    res.setHeader(
        "Access-Control-Max-Age",
        "86400"
    );

    if (req.method === "OPTIONS") {

        return res
            .status(204)
            .end();

    }

    next();

});


// ==================================================
// BODY PARSER
// ==================================================

app.use(
    express.json()
);


// ==================================================
// REQUEST LOGGER
// ==================================================

app.use(
    (req, res, next) => {

        console.log(
            `📡 ${req.method} ${req.originalUrl}`
        );

        next();

    }
);


// ==================================================
// MYSQL CONNECTION POOL
// ==================================================

const db = mysql.createPool({

    host:
        process.env.DB_HOST,

    user:
        process.env.DB_USER,

    password:
        process.env.DB_PASSWORD,

    database:
        process.env.DB_NAME,

    port:
        Number(
            process.env.DB_PORT
        ) || 3306,

    dateStrings:
        true,

    waitForConnections:
        true,

    connectionLimit:
        10,

    maxIdle:
        10,

    idleTimeout:
        60000,

    enableKeepAlive:
        true,

    keepAliveInitialDelay:
        10000,

    queueLimit:
        0

});


// ==================================================
// MYSQL CONNECTION TEST
// ==================================================

db.query(
    "SELECT 1",
    (err) => {

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

    }
);


// ==================================================
// AUTO-FIX MEDICINE ID AUTO_INCREMENT
// ==================================================

db.query(
    `ALTER TABLE medicines
     MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT`,
    (err) => {

        if (err) {

            console.error(
                "❌ Medicine ID auto-increment fix failed:"
            );

            console.error(
                err.message
            );

        } else {

            console.log(
                "✅ Medicine ID AUTO_INCREMENT is ready!"
            );

        }

    }
);


// ==================================================
// CREATE USERS TABLE AUTOMATICALLY
// ==================================================

const createUsersTableSQL = `

    CREATE TABLE IF NOT EXISTS users (

        id INT AUTO_INCREMENT PRIMARY KEY,

        username VARCHAR(10) NOT NULL UNIQUE,

        password VARCHAR(255) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )

`;

db.query(
    createUsersTableSQL,
    (err) => {

        if (err) {

            console.error(
                "❌ Users table creation failed:",
                err
            );

        } else {

            console.log(
                "✅ Users table ready!"
            );

        }

    }
);


// ==================================================
// MYSQL KEEP ALIVE
// ==================================================

setInterval(
    () => {

        db.query(
            "SELECT 1",
            (err) => {

                if (err) {

                    console.error(
                        "⚠️ MySQL keep-alive failed:",
                        err.message
                    );

                } else {

                    console.log(
                        "💚 MySQL keep-alive OK"
                    );

                }

            }
        );

    },
    30000
);


// ==================================================
// TEST BACKEND
// ==================================================

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success:
                true,

            message:
                "Medicine Reminder Backend is Running!"

        });

    }
);


// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
    "/health",
    (req, res) => {

        db.query(
            "SELECT 1",
            (err) => {

                if (err) {

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            server:
                                "online",

                            database:
                                "disconnected",

                            error:
                                err.message

                        });

                }

                res
                    .status(200)
                    .json({

                        success:
                            true,

                        server:
                            "online",

                        database:
                            "connected"

                    });

            }
        );

    }
);


// ==================================================
// CREATE ACCOUNT / REGISTER
// ==================================================

app.post(
    "/api/register",
    (req, res) => {

        console.log(
            "📥 POST /api/register"
        );

        console.log(
            "📦 Register data:",
            req.body
        );

        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Username and password are required."

                });

        }


        const cleanUsername =
            String(username).trim();

        const cleanPassword =
            String(password).trim();


        if (
            cleanUsername.length < 1 ||
            cleanUsername.length > 10
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Username must be maximum 10 characters."

                });

        }


        if (
            !/^\d{5}$/.test(
                cleanPassword
            )
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Password must contain exactly 5 digits."

                });

        }


        const checkSQL = `

            SELECT id

            FROM users

            WHERE username = ?

            LIMIT 1

        `;


        db.query(

            checkSQL,

            [cleanUsername],

            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Register database error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Database error."

                        });

                }


                if (
                    results.length > 0
                ) {

                    return res
                        .status(409)
                        .json({

                            success:
                                false,

                            message:
                                "Username already exists."

                        });

                }


                const insertSQL = `

                    INSERT INTO users
                    (
                        username,
                        password
                    )

                    VALUES (?, ?)

                `;


                db.query(

                    insertSQL,

                    [
                        cleanUsername,
                        cleanPassword
                    ],

                    (err, result) => {

                        if (err) {

                            console.error(
                                "❌ Account creation failed:",
                                err
                            );

                            return res
                                .status(500)
                                .json({

                                    success:
                                        false,

                                    message:
                                        "Failed to create account.",

                                    error:
                                        err.message

                                });

                        }


                        console.log(
                            "✅ Account created:",
                            cleanUsername
                        );


                        return res
                            .status(201)
                            .json({

                                success:
                                    true,

                                message:
                                    "Account created successfully!",

                                id:
                                    result.insertId,

                                username:
                                    cleanUsername

                            });

                    }

                );

            }

        );

    }
);


// ==================================================
// LOGIN
// ==================================================

app.post(
    "/api/login",
    (req, res) => {

        console.log(
            "📥 POST /api/login"
        );

        console.log(
            "📦 Login data:",
            {
                username:
                    req.body.username
            }
        );


        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Username and password are required."

                });

        }


        const cleanUsername =
            String(username).trim();

        const cleanPassword =
            String(password).trim();


        const sql = `

            SELECT
                id,
                username,
                password

            FROM users

            WHERE username = ?

            LIMIT 1

        `;


        db.query(

            sql,

            [cleanUsername],

            (err, results) => {

                if (err) {

                    console.error(
                        "❌ Login database error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Database error."

                        });

                }


                if (
                    results.length === 0
                ) {

                    return res
                        .status(401)
                        .json({

                            success:
                                false,

                            message:
                                "Invalid username or password."

                        });

                }


                const user =
                    results[0];


                if (
                    String(user.password) !==
                    cleanPassword
                ) {

                    return res
                        .status(401)
                        .json({

                            success:
                                false,

                            message:
                                "Invalid username or password."

                        });

                }


                console.log(
                    "✅ Login successful:",
                    cleanUsername
                );


                return res
                    .status(200)
                    .json({

                        success:
                            true,

                        message:
                            "Login successful!",

                        user: {

                            id:
                                user.id,

                            username:
                                user.username

                        }

                    });

            }

        );

    }
);


// ==================================================
// SAVE MEDICINE
// ==================================================

app.post(
    "/api/medicines",
    (req, res) => {

        console.log(
            "📥 POST /api/medicines"
        );

        console.log(
            "📦 Medicine received:",
            req.body
        );


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

            console.log(
                "❌ Required medicine data missing"
            );

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Required medicine data is missing."

                });

        }


        const finalEndDate =
            end ||
            "9999-12-31";


        // IMPORTANT:
        // id is NOT inserted here.
        // MySQL AUTO_INCREMENT creates it.

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

                    console.error(
                        "❌ Medicine Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to save medicine.",

                            error:
                                err.message

                        });

                }


                console.log(
                    "✅ Medicine saved to MySQL!"
                );

                console.log(
                    "🆔 Medicine ID:",
                    result.insertId
                );


                return res
                    .status(200)
                    .json({

                        success:
                            true,

                        message:
                            "Medicine saved successfully!",

                        id:
                            result.insertId

                    });

            }

        );

    }
);


// ==================================================
// GET ALL MEDICINES
// ==================================================

app.get(
    "/api/medicines",
    (req, res) => {

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

                    console.error(
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to fetch medicines.",

                            error:
                                err.message

                        });

                }


                return res
                    .status(200)
                    .json(
                        results
                    );

            }

        );

    }
);


// ==================================================
// GET SINGLE MEDICINE
// ==================================================

app.get(
    "/api/medicines/:id",
    (req, res) => {

        const id =
            req.params.id;


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
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to fetch medicine.",

                            error:
                                err.message

                        });

                }


                if (
                    results.length === 0
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Medicine not found."

                        });

                }


                return res
                    .status(200)
                    .json(
                        results[0]
                    );

            }

        );

    }
);


// ==================================================
// UPDATE MEDICINE
// ==================================================

app.put(
    "/api/medicines/:id",
    (req, res) => {

        const id =
            req.params.id;


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

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Required update data is missing."

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

                    console.error(
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to update medicine.",

                            error:
                                err.message

                        });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Medicine not found."

                        });

                }


                return res
                    .status(200)
                    .json({

                        success:
                            true,

                        message:
                            "Medicine updated successfully!"

                    });

            }

        );

    }
);


// ==================================================
// DELETE MEDICINE
// ==================================================

app.delete(
    "/api/medicines/:id",
    (req, res) => {

        const id =
            req.params.id;


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
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to delete medicine.",

                            error:
                                err.message

                        });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Medicine not found."

                        });

                }


                return res
                    .status(200)
                    .json({

                        success:
                            true,

                        message:
                            "Medicine deleted successfully!"

                    });

            }

        );

    }
);


// ==================================================
// SAVE MEDICINE HISTORY
// ==================================================

app.post(
    "/api/history",
    (req, res) => {

        console.log(
            "📥 POST /api/history"
        );

        console.log(
            "📦 History received:",
            req.body
        );


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


        const missingFields = [];


        if (
            !username ||
            String(username).trim() === ""
        ) {

            missingFields.push(
                "username"
            );

        }


        if (
            medicine_id === undefined ||
            medicine_id === null ||
            String(medicine_id).trim() === ""
        ) {

            missingFields.push(
                "medicine_id"
            );

        }


        if (
            !medicine_name ||
            String(medicine_name).trim() === ""
        ) {

            missingFields.push(
                "medicine_name"
            );

        }


        if (
            dosage === undefined ||
            dosage === null ||
            String(dosage).trim() === ""
        ) {

            missingFields.push(
                "dosage"
            );

        }


        if (
            !reminder_time ||
            String(reminder_time).trim() === ""
        ) {

            missingFields.push(
                "reminder_time"
            );

        }


        if (
            !status ||
            String(status).trim() === ""
        ) {

            missingFields.push(
                "status"
            );

        }


        if (
            !history_date ||
            String(history_date).trim() === ""
        ) {

            missingFields.push(
                "history_date"
            );

        }


        if (
            !history_time ||
            String(history_time).trim() === ""
        ) {

            missingFields.push(
                "history_time"
            );

        }


        if (
            missingFields.length > 0
        ) {

            console.log(
                "❌ Missing history fields:",
                missingFields
            );


            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Required history data is missing.",

                    missingFields:
                        missingFields

                });

        }


        const numericMedicineId =
            Number(
                medicine_id
            );


        if (
            !Number.isInteger(
                numericMedicineId
            ) ||
            numericMedicineId <= 0
        ) {

            console.log(
                "❌ Invalid medicine ID:",
                medicine_id
            );


            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Invalid medicine_id.",

                    received:
                        medicine_id

                });

        }


        const allowedStatuses = [

            "Taken",

            "Missed",

            "Snoozed"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Invalid history status.",

                    allowedStatuses:
                        allowedStatuses,

                    received:
                        status

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


        const values = [

            String(
                username
            ).trim(),

            numericMedicineId,

            String(
                medicine_name
            ).trim(),

            String(
                dosage
            ).trim(),

            String(
                reminder_time
            ).substring(
                0,
                8
            ),

            status,

            String(
                history_date
            ).substring(
                0,
                10
            ),

            String(
                history_time
            ).substring(
                0,
                8
            )

        ];


        console.log(
            "📤 History SQL values:",
            values
        );


        db.query(

            sql,

            values,

            (err, result) => {

                if (err) {

                    console.error(
                        "❌ History Database Error:",
                        err
                    );


                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to save medicine history.",

                            error:
                                err.message

                        });

                }


                console.log(
                    "✅ History saved to MySQL!"
                );


                console.log(
                    "🆔 History ID:",
                    result.insertId
                );


                return res
                    .status(201)
                    .json({

                        success:
                            true,

                        message:
                            "Medicine history saved successfully!",

                        id:
                            result.insertId

                    });

            }

        );

    }
);


// ==================================================
// GET USER HISTORY
// ==================================================

app.get(
    "/api/history/:username",
    (req, res) => {

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
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to fetch medicine history.",

                            error:
                                err.message

                        });

                }


                return res
                    .status(200)
                    .json(
                        results
                    );

            }

        );

    }
);


// ==================================================
// DELETE HISTORY
// ==================================================

app.delete(
    "/api/history/:id",
    (req, res) => {

        const id =
            req.params.id;


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
                        "❌ Database Error:",
                        err
                    );

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Failed to delete history.",

                            error:
                                err.message

                        });

                }


                if (
                    result.affectedRows === 0
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "History record not found."

                        });

                }


                return res
                    .status(200)
                    .json({

                        success:
                            true,

                        message:
                            "History deleted successfully!"

                    });

            }

        );

    }
);


// ==================================================
// 404 HANDLER
// ==================================================

app.use(
    (req, res) => {

        res
            .status(404)
            .json({

                success:
                    false,

                message:
                    "API route not found."

            });

    }
);


// ==================================================
// SERVER START
// ==================================================

const PORT =
    process.env.PORT ||
    5000;


app.listen(

    PORT,

    "0.0.0.0",

    () => {

        console.log(
            `🚀 Server running on port ${PORT}`
        );

    }

);