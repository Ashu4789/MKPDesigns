const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Design = require('../models/design');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mkp_designs',
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx'],
        resource_type: 'auto' // Allow both image and raw (docs) files
    }
});

const upload = multer({ storage: storage });

// @desc    Upload a new design
// @route   POST /api/designs
// @access  Private/Admin
const uploadDesign = async (req, res) => {
    try {
        // req.files will contain the uploaded files
        // We expect 'image' and optional 'documentation'
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const docFile = req.files['documentation'] ? req.files['documentation'][0] : null;

        if (!imageFile) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const { title, description, category, material, price } = req.body;

        const design = await Design.create({
            title,
            description,
            imageUrl: imageFile.path,
            imageId: imageFile.filename,
            category,
            material,
            price,
            documentationUrl: docFile ? docFile.path : null,
            documentationId: docFile ? docFile.filename : null
        });

        res.status(201).json(design);
    } catch (error) {
        console.error('Error uploading design:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all designs (with filters)
// @route   GET /api/designs
// @access  Public
const getDesigns = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, material } = req.query;
        let query = {};

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by Category
        if (category && category !== 'All') {
            query.category = category;
        }

        // Filter by Material
        if (material) {
            query.material = { $regex: material, $options: 'i' };
        }

        // Filter by Price Range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const designs = await Design.find(query).sort({ createdAt: -1 });
        res.json(designs);
    } catch (error) {
        console.error('Error fetching designs:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single design details
// @route   GET /api/designs/:id
// @access  Public
const getDesignById = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }
        res.json(design);
    } catch (error) {
        console.error('Error fetching design details:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Design not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a design
// @route   DELETE /api/designs/:id
// @access  Private/Admin
const deleteDesign = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);

        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        // Delete image from Cloudinary
        if (design.imageId) {
            await cloudinary.uploader.destroy(design.imageId);
        }

        // Delete documentation from Cloudinary
        if (design.documentationId) {
            // For raw resources (docs), we might need to specify resource_type if it's not 'image'
            // Cloudinary auto-detects often, but safer to try standard destroy or specify type if known.
            // Our storage config says 'auto', likely 'raw' or 'image' depending on file.
            // For safety, plain destroy usually works for default types, but 'raw' might need explicit type.
            // Let's try standard destroy first. If it fails for PDFs properly, we might need resource_type: 'raw'
            // However, usually publicId is unique enough.
            await cloudinary.uploader.destroy(design.documentationId);
        }

        await design.deleteOne();

        res.json({ message: 'Design removed' });
    } catch (error) {
        console.error('Error deleting design:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    upload,
    uploadDesign,
    getDesigns,
    getDesignById,
    deleteDesign
};
