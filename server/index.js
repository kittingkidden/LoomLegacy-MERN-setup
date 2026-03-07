import 'dotenv/config';
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
// dns.setDefaultResultOrder("ipv4first");
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

const dbURI = (process.env.MONGODB_URI || '').replace(/[^\x20-\x7E]/g, '');
console.log("DB_URI SANITIZED LENGTH:", dbURI.length);

mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.log("❌ Connection Error Name:", err.name);
        console.log("❌ Connection Error Message:", err.message);
    });

app.get('/api/status', (req, res) => {
    // Check if Mongoose is connected (1 = connected)
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌";

    res.json({
        server: "Running 🚀",
        database: dbStatus,
        project: "LoomLegacy"
    });
});

import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));