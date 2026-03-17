import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Public (Should be protected for Admin only)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password, // In a real app, hash this!
            role: role || 'customer'
        });

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   POST api/users/login
// @desc    Authenticate user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && user.password === password) { // In a real app, compare hashed passwords!
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE api/users/:id
// @desc    Delete a user
// @access  Public (Should be protected)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH api/users/:id/role
// @desc    Update user role
// @access  Public (Should be protected)
router.patch('/:id/role', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.role = req.body.role;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET api/users/:id/addresses
// @desc    Get user addresses
// @access  Public
router.get('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST api/users/:id/addresses
// @desc    Add a new address to user
// @access  Public (Should be protected in real app)
router.post('/:id/addresses', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses.push(req.body);
        await user.save();

        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE api/users/:id/addresses/:addressId
// @desc    Remove an address from user
// @access  Public (Should be protected in real app)
router.delete('/:id/addresses/:addressId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = user.addresses.filter(
            (addr) => addr._id.toString() !== req.params.addressId
        );
        await user.save();

        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
