import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all recent reviews (for homepage testimonials)
router.get('/recent', async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a review
router.post('/', async (req, res) => {
    const review = new Review(req.body);
    try {
        const newReview = await review.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
