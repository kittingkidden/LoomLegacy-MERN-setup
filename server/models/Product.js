import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    material: {
        type: String,
    },
    image: {
        type: String, // URL to the image (can be local or cloud)
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    artisan: {
        type: String, // Name of the artisan/seller
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model('Product', productSchema);