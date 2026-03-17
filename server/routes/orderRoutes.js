import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// @route   POST api/orders
// @desc    Create a new order
// @access  Public (Guest or Logged in)
router.post('/', async (req, res) => {
    try {
        const { user, products, totalAmount, shippingAddress, paymentMethod, paymentStatus } = req.body;

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No products in order' });
        }

        const newOrder = new Order({
            user: user || null, // Allow null for guest
            products,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentStatus || 'pending',
            status: 'pending'
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   GET api/orders
// @desc    Get all orders (Admin only ideally)
// @access  Public (should be protected in real app)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email role')
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Public (should verify ownership in real app)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email role')
            .populate('products.product');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/orders/user/:userId
// @desc    Get all orders for a user
// @access  Public (should be protected in real app)
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .populate('products.product')
            .sort({ createdAt: -1 });
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
        // AND map the order to ONLY include those specific products to ensure data privacy
        const sellerOrders = orders.reduce((acc, order) => {
            const sellerProducts = order.products.filter(item =>
                item.product && item.product.seller && item.product.seller.toString() === sellerId
            );

            if (sellerProducts.length > 0) {
                // Return a modified order object specific to this seller
                const sellerSpecificOrder = order.toObject();
                sellerSpecificOrder.products = sellerProducts;
                // Recalculate total amount for just this seller's products
                sellerSpecificOrder.totalAmount = sellerProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                acc.push(sellerSpecificOrder);
            }
            return acc;
        }, []);

        res.json(sellerOrders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH api/orders/:id/dispatch
// @desc    Update order status to dispatched and subdocument delivery details
// @access  Public (Seller ideally)
router.patch('/:id/dispatch', async (req, res) => {
    try {
        const { partnerName, partnerPhone, partnerPaymentDetails, pickupDate, distanceKm } = req.body;

        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Calculate delivery cost (40 INR per KM)
        const parsedDistance = parseFloat(distanceKm) || 0;
        const deliveryCost = parsedDistance * 40;

        order.status = 'dispatched';
        order.delivery = {
            partnerName,
            partnerPhone,
            partnerPaymentDetails,
            pickupDate: new Date(pickupDate),
            distanceKm: parsedDistance,
            deliveryCost
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (error) {
        console.error('Error dispatching order:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

export default router;
