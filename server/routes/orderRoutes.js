import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// @route   POST api/orders
// @desc    Create a new order
// @access  Public (Guest or Logged in)
router.post('/', async (req, res) => {
    try {
        const { user, products, totalAmount, shippingAddress } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products in order' });
        }

        const newOrder = new Order({
            user: user || null, // Allow null for guest
            products,
            totalAmount,
            shippingAddress,
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET api/orders/user/:userId
// @desc    Get all orders for a user
// @access  Public (should be protected in real app)
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).populate('products.product');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/orders/seller/:sellerId
// @desc    Get all orders containing products from a specific seller
// @access  Public (should be protected)
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        // Import Product here or ensure it's available if needed. 
        // Better to find orders and filter or use a join-like query.
        const orders = await Order.find().populate('products.product').sort({ createdAt: -1 });

        // Filter orders that contain at least one product from this seller
        const sellerOrders = orders.filter(order =>
            order.products.some(item =>
                item.product && item.product.seller && item.product.seller.toString() === sellerId
            )
        );

        res.json(sellerOrders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
