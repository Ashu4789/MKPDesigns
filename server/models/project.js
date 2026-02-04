const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    estimations: {
        cost: {
            type: String,
            default: 'TBD'
        },
        duration: {
            type: String,
            default: 'TBD'
        },
        area: {
            type: String,
            default: 'TBD'
        }
    },
    status: {
        type: String,
        enum: ['Proposed', 'Ongoing', 'Completed'],
        default: 'Ongoing'
    },
    images: [{
        url: String,
        publicId: String
    }],
    model3D: {
        url: String,     // Cloudinary URL for .glb/.gltf
        publicId: String
    },
    modelEmbedUrl: {
        type: String,    // For Spline, Sketchfab, etc.
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);
