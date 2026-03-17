import express from 'express';
import Pincode from '../models/Pincode.js';

const router = express.Router();

// GET /api/pincodes/validate/:pincode
router.get('/validate/:pincode', async (req, res) => {
    try {
        const { pincode } = req.params;

        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
            return res.status(400).json({ message: 'Invalid pincode format' });
        }

        const foundPincode = await Pincode.findOne({ pincode });

        if (!foundPincode) {
            return res.status(404).json({ message: 'Pincode not found' });
        }

        return res.json({
            pincode: foundPincode.pincode,
            city: foundPincode.city,
            state: foundPincode.state
        });
    } catch (error) {
        console.error("Pincode Validation Error:", error);
        res.status(500).json({ message: 'Server error during validation' });
    }
});

export default router;
