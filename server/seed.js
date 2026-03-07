import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import Product from './models/Product.js';

const MOCK_PRODUCTS = [
    {
        name: "Kutch Handwoven Cotton Saree",
        category: "Saree",
        price: 4500,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
        artisan: "Ravi Bhai",
        material: "Organic Cotton",
        description: "A beautiful handwoven cotton saree from the Kutch region of Gujarat, featuring traditional motifs."
    },
    {
        name: "Banarasi Silk Handloom Saree",
        category: "Saree",
        price: 12000,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
        artisan: "Weavers of Varanasi",
        material: "Pure Silk",
        description: "Exquisite handloom silk saree from Varanasi, known for its intricate gold and silver brocade."
    },
    {
        name: "Sambalpuri Ikat Cotton Saree",
        category: "Saree",
        price: 5600,
        image: "https://images.unsplash.com/photo-1583391733958-dcf3be546131?q=80&w=1000&auto=format&fit=crop",
        artisan: "Ananya Devi",
        material: "Cotton Ikat",
        description: "Traditional Ikat saree from Odisha, handwoven with unique geometric patterns."
    },
    {
        name: "Kashmiri Handwoven Wool Shawl",
        category: "Shawl",
        price: 15000,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
        artisan: "Bashir Ahmed",
        material: "Pashmina Wool",
        description: "Luxurious Pashmina wool shawl from Kashmir, handwoven for exceptional warmth and softness."
    },
    {
        name: "Handloom Cotton Kurta",
        category: "Apparel",
        price: 2100,
        image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1000&auto=format&fit=crop",
        artisan: "FabIndia Co-op",
        material: "Cotton",
        description: "Comfortable and stylish handloom cotton kurta, perfect for daily wear."
    },
    {
        name: "Ikat Cushion Cover",
        category: "Home Decor",
        price: 850,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=1000&auto=format&fit=crop",
        artisan: "Pocchampally Weavers",
        material: "Cotton",
        description: "Vibrant Ikat pattern cushion cover to add a touch of tradition to your home."
    }
];

const seedDB = async () => {
    try {
        const dbURI = (process.env.MONGODB_URI || '').replace(/[^\x20-\x7E]/g, '');
        await mongoose.connect(dbURI);
        console.log("CONNECTED TO MONGODB FOR SEEDING...");

        // Clear existing products
        await Product.deleteMany({});
        console.log("CLEARED OLD PRODUCTS.");

        // Insert mock products
        await Product.insertMany(MOCK_PRODUCTS);
        console.log("DATABASE SEEDED SUCCESSFULLY!");

        mongoose.connection.close();
    } catch (err) {
        console.error("SEEDING ERROR:", err);
        process.exit(1);
    }
};

seedDB();
