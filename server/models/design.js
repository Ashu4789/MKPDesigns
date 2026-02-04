const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image']
    },
    imageId: {
        type: String,
        required: true // Cloudinary public_id
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Residential', 'Commercial', 'Industrial', 'Landscape', 'Interior', 'Other'],
        default: 'Other'
    },
    material: {
        type: String,
        required: [true, 'Please specify the primary material'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    documentationUrl: {
        type: String,
        // Not required, but good to have if applicable
    },
    documentationId: {
        type: String
        // Cloudinary public_id for the document
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Design', designSchema);
