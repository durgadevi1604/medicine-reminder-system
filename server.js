const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_MYSQL_PASSWORD",
    database: "medicine_reminder"
});

db.connect((err) => {
    if (err) {
        console.log("❌ MySQL connection failed:", err.message);
    } else {
        console.log("✅ MySQL connected successfully!");
    }
});

app.get("/", (req, res) => {
    res.send("Medicine Reminder Backend is Running!");
});

app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});