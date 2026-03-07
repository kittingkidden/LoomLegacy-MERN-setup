import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

// Get user wishlist
router.get('/user/:userId', async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.params.userId }).populate('products');
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.params.userId, products: [] });
        }
        res.json(wishlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add/Remove from wishlist
router.post('/toggle', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [productId] });
        } else {
            const index = wishlist.products.indexOf(productId);
            if (index === -1) {
                wishlist.products.push(productId);
            } else {
                wishlist.products.splice(index, 1);
            }
        }
        await wishlist.save();
        res.json(wishlist);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
