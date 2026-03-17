import 'dotenv/config';
import dns from "dns";
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Category from './models/Category.js';
import Review from './models/Review.js';
import Wishlist from './models/Wishlist.js';

const dbURI = (process.env.MONGODB_URI || '').replace(/[^\x20-\x7E]/g, '');

const seedData = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log("🌱 Connected to MongoDB for exhaustive seeding...");

        // --- 1. CLEAR COLLECTIONS ---
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Category.deleteMany({});
        await Review.deleteMany({});
        await Wishlist.deleteMany({});
        console.log("🗑️ Cleared existing shop data for fresh seed");

        // --- 2. USERS (Preserve or Create) ---
        let artisan = await User.findOne({ email: 'artisan@loomlegacy.com' });
        if (!artisan) {
            artisan = await User.create({ name: 'Ravi Bhai', email: 'artisan@loomlegacy.com', password: 'demo123', role: 'seller' });
        }
        let artisan2 = await User.findOne({ email: 'artisan2@loomlegacy.com' });
        if (!artisan2) {
            artisan2 = await User.create({ name: 'Pronob Das', email: 'artisan2@loomlegacy.com', password: 'demo123', role: 'seller' });
        }

        let buyer = await User.findOne({ email: 'buyer@example.com' });
        if (!buyer) {
            buyer = await User.create({
                name: 'Tanmay Sharma', email: 'buyer@example.com', password: 'demo123', role: 'buyer',
                addresses: [
                    { type: 'Home', name: 'Tanmay Sharma', street: '123 Silk Road, Handloom Nagar', city: 'Varanasi', state: 'Uttar Pradesh', zip: '221001', phone: '+91 98765 43210', isDefault: true },
                    { type: 'Work', name: 'Tanmay Sharma', street: '45 Corporate Park', city: 'Lucknow', state: 'Uttar Pradesh', zip: '226010', phone: '+91 98765 43210', isDefault: false }
                ]
            });
        }
        let admin = await User.findOne({ email: 'admin@loomlegacy.com' });
        if (!admin) {
            admin = await User.create({ name: 'Loom Admin', email: 'admin@loomlegacy.com', password: 'admin', role: 'admin' });
        }
        console.log("👤 Verified/Created Demo Users (including Admin)");

        // --- 3. CATEGORIES ---
        const mockCategories = [
            { name: "Saree", description: "Six yards of sheer elegance, woven with stories of culture and grace." },
            { name: "Shawl", description: "Warmth wrapped in heritage. The finest wools from the valleys of Kashmir." },
            { name: "Apparel", description: "Contemporary silhouettes, timeless fabric. Wear the legacy." },
            { name: "Home Decor", description: "Bring the soul of India into your living space." },
            { name: "Accessories", description: "Small pieces of art to carry with you everyday." }
        ];
        const insertedCategories = await Category.insertMany(mockCategories);
        console.log(`📁 Seeded ${insertedCategories.length} Categories`);

        // --- 4. PRODUCTS (15 Products) ---
        const mockProducts = [
            // Sarees
            { name: "Kutch Handwoven Cotton Saree", category: "Saree", price: 4500, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop", artisan: "Ravi Bhai", material: "Organic Cotton", seller: artisan._id, stock: 10, region: "Gujarat", description: "Authentic handwoven piece." },
            { name: "Banarasi Silk Handloom Saree", category: "Saree", price: 12000, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop", artisan: "Weavers of Varanasi", material: "Pure Silk", seller: artisan._id, stock: 5, region: "Varanasi", description: "Authentic handwoven piece." },
            { name: "Sambalpuri Ikat Cotton Saree", category: "Saree", price: 5600, image: "https://images.unsplash.com/photo-1583391733958-dcf3be546131?q=80&w=1000&auto=format&fit=crop", artisan: "Ananya Devi", material: "Cotton Ikat", seller: artisan._id, stock: 12, region: "Odisha", description: "Authentic handwoven piece." },
            { name: "Bengal Jamdani Muslin Saree", category: "Saree", price: 8500, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop", artisan: "Pronob Das", material: "Muslin", seller: artisan2._id, stock: 8, region: "Bengal", description: "Authentic handwoven piece." },

            // Shawls
            { name: "Kashmiri Handwoven Wool Shawl", category: "Shawl", price: 15000, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop", artisan: "Bashir Ahmed", material: "Pashmina Wool", seller: artisan._id, stock: 3, region: "Kashmir", description: "Authentic handwoven piece." },
            { name: "Bhujodi Wool Stole", category: "Shawl", price: 3200, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=1000&auto=format&fit=crop", artisan: "Vankar Community", material: "Wool", seller: artisan._id, stock: 20, region: "Gujarat", description: "Authentic handwoven piece." },

            // Apparel
            { name: "Handloom Cotton Kurta", category: "Apparel", price: 2100, image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1000&auto=format&fit=crop", artisan: "FabIndia Co-op", material: "Cotton", seller: artisan._id, stock: 50, region: "Jaipur", description: "Authentic handwoven piece." },
            { name: "Ikat Patterned Kurta", category: "Apparel", price: 2800, image: "https://images.unsplash.com/photo-1589810635657-232948472d98?q=80&w=1000&auto=format&fit=crop", artisan: "Suresh Rao", material: "Ikat Cotton", seller: artisan._id, stock: 15, region: "Telangana", description: "Authentic handwoven piece." },
            { name: "Khadi Co-ord Set", category: "Apparel", price: 3500, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop", artisan: "EcoWeave", material: "Khadi", seller: artisan._id, stock: 10, region: "Maharashtra", description: "Authentic handwoven piece." },

            // Home Decor
            { name: "Ikat Cushion Cover", category: "Home Decor", price: 850, image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=1000&auto=format&fit=crop", artisan: "Pocchampally Weavers", material: "Cotton", seller: artisan._id, stock: 100, region: "Telangana", description: "Authentic handwoven piece." },
            { name: "Handwoven Bed Throw", category: "Home Decor", price: 4200, image: "https://images.unsplash.com/photo-1522771753035-7a58875b2fa1?q=80&w=1000&auto=format&fit=crop", artisan: "Himalayan Looms", material: "Wool Blend", seller: artisan._id, stock: 25, region: "Himachal", description: "Authentic handwoven piece." },
            { name: "Woolen Floor Rug", category: "Home Decor", price: 6500, image: "https://images.unsplash.com/photo-1575407001460-6a1bd793315c?q=80&w=1000&auto=format&fit=crop", artisan: "Mirzapur Weavers", material: "Wool", seller: artisan._id, stock: 5, region: "UP", description: "Authentic handwoven piece." },

            // Accessories
            { name: "Handloom Tote Bag", category: "Accessories", price: 1200, image: "https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?q=80&w=1000&auto=format&fit=crop", artisan: "Women of Kutch", material: "Cotton Canvas", seller: artisan._id, stock: 40, region: "Gujarat", description: "Authentic handwoven piece." },
            { name: "Ikat Sling Bag", category: "Accessories", price: 1500, image: "https://images.unsplash.com/photo-1554316650-6f03408a0d4c?q=80&w=1000&auto=format&fit=crop", artisan: "Pochampally", material: "Ikat", seller: artisan._id, stock: 35, region: "Telangana", description: "Authentic handwoven piece." },

            // Limited Drops
            { name: "Monsoon Loom Saree", category: "Saree", price: 18000, image: "https://images.unsplash.com/photo-1610189012906-4783382c5e61?q=80&w=1000&auto=format&fit=crop", artisan: "Master Weaver Ali", material: "Fine Silk", seller: artisan._id, stock: 2, region: "Bengal", description: "Authentic handwoven piece." }
        ];

        const insertedProducts = await Product.insertMany(mockProducts);
        console.log(`📦 Seeded ${insertedProducts.length} Products`);

        // --- 5. ORDERS (Past 6 Months for Charts) ---
        const orderDates = [
            new Date(new Date().setMonth(new Date().getMonth() - 5)), // 5 months ago
            new Date(new Date().setMonth(new Date().getMonth() - 4)),
            new Date(new Date().setMonth(new Date().getMonth() - 3)),
            new Date(new Date().setMonth(new Date().getMonth() - 2)),
            new Date(new Date().setMonth(new Date().getMonth() - 1)), // last month
            new Date(), // this month
            new Date()  // another this month
        ];

        const mockOrders = orderDates.map((date, idx) => ({
            user: buyer._id,
            products: [{ product: insertedProducts[idx]._id, quantity: 1, price: insertedProducts[idx].price }],
            totalAmount: insertedProducts[idx].price,
            shippingAddress: "123 Silk Road, Handloom Nagar, Varanasi - 221001",
            status: idx < 4 ? 'delivered' : 'shipped',
            createdAt: date
        }));
        await Order.insertMany(mockOrders);
        console.log(`🛒 Seeded ${mockOrders.length} Orders across 6 months`);

        // --- 6. REVIEWS & TESTIMONIALS ---
        const mockReviews = [
            {
                user: buyer._id,
                product: insertedProducts[0]._id,
                rating: 5,
                comment: "The craftsmanship is unparalleled. You can feel the hours of dedication in every thread. I wear this saree with immense pride knowing it supported a weaving cluster in Kutch."
            },
            {
                user: buyer._id,
                product: insertedProducts[4]._id,
                rating: 5,
                comment: "Unbelievably warm and light. The Pashmina weave is exactly as described. Buying directly from the artisan makes the piece feel that much more special."
            }
        ];
        await Review.insertMany(mockReviews);
        console.log(`⭐ Seeded ${mockReviews.length} Reviews (Testimonials)`);

        // --- 7. WISHLIST ---
        const wishlistObj = new Wishlist({
            user: buyer._id,
            products: [insertedProducts[1]._id, insertedProducts[3]._id]
        });
        await wishlistObj.save();
        console.log(`❤️ Seeded 1 Wishlist with 2 items for buyer`);

        console.log("✨ All mock data migrated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
