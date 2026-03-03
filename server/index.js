require('dotenv').config(); // Load the .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ LOCAL DATABASE CONNECTED!"))
    .catch(err => console.log("❌ Local Error:", err.message));

app.get('/api/status', (req, res) => {
    // Check if Mongoose is connected (1 = connected)
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌";

    res.json({
        server: "Running 🚀",
        database: dbStatus,
        project: "LoomLegacy"
    });
});

// Add this near your other routes in server/index.js
app.get('/api/health-check', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: "Disconnected ❌",
        1: "Connected ✅ (Local MongoDB)",
        2: "Connecting ⏳",
        3: "Disconnecting ⚠️"
    };

    res.json({
        server: "Online 🚀",
        database: states[dbState] || "Unknown ❓",
        timestamp: new Date().toLocaleTimeString()
    });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));