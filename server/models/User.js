import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'buyer', 'seller', 'admin'],
        default: 'customer',
    },
    addresses: [{
        type: { type: String, default: 'Home' },
        name: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        phone: String,
        isDefault: { type: Boolean, default: false }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('User', userSchema);
