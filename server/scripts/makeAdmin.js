import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Fix for Windows DNS resolution SRV bugs against MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const email = process.argv[2];

if (!email) {
    console.error('Usage: node makeAdmin.js <user_email>');
    process.exit(1);
}

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loomlegacy');
        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email "${email}" not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Success! User "${email}" has been upgraded to an Admin.`);
        console.log(`They can now access the Admin Control Dashboard at /admin`);
        process.exit(0);
    } catch (error) {
        console.error('Error upgrading user to admin:', error);
        process.exit(1);
    }
};

makeAdmin();
