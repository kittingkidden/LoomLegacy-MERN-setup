import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import Pincode from '../models/Pincode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CSV_FILE_PATH = path.join(__dirname, '5c2f62fe-5afa-4119-a499-fec9d604d5bd.csv');

const importPincodes = async () => {
    try {
        const dbURI = (process.env.MONGODB_URI || '').replace(/[^\x20-\x7E]/g, '');
        await mongoose.connect(dbURI);
        console.log("CONNECTED TO MONGODB FOR PINCODE IMPORT...");

        const pincodesToInsert = new Map(); // Use a Map to ensure distinct pincodes
        let rowCount = 0;

        console.log("Reading CSV file...");

        await new Promise((resolve, reject) => {
            fs.createReadStream(CSV_FILE_PATH)
                .pipe(csv())
                .on('data', (row) => {
                    rowCount++;
                    const pincode = String(row.pincode).trim();
                    const district = String(row.district).trim();
                    const statename = String(row.statename).trim();
                    
                    if (pincode && pincode !== 'NA' && /^[1-9][0-9]{5}$/.test(pincode)) {
                       pincodesToInsert.set(pincode, {
                           pincode,
                           city: district,
                           state: statename
                       });
                    }
                })
                .on('end', () => {
                    console.log(`Finished reading ${rowCount} rows.`);
                    resolve();
                })
                .on('error', reject);
        });

        console.log(`Found ${pincodesToInsert.size} unique valid pincodes. Preparing bulk insert/upsert...`);

        const operations = Array.from(pincodesToInsert.values()).map(doc => ({
            updateOne: {
                filter: { pincode: doc.pincode },
                update: { $set: doc },
                upsert: true
            }
        }));

        // Insert in batches of 1000
        const batchSize = 1000;
        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            await Pincode.bulkWrite(batch);
            console.log(`Processed batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(operations.length / batchSize)}`);
        }

        console.log("PINCODES IMPORTED SUCCESSFULLY!");
        mongoose.connection.close();
        process.exit(0);

    } catch (err) {
        console.error("IMPORT ERROR:", err);
        mongoose.connection.close();
        process.exit(1);
    }
};

importPincodes();
