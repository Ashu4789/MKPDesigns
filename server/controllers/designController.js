const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const Design = require('../models/design');
const Transaction = require('../models/Transaction');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Set default folder
        let folder = 'mkp_designs';
        let resource_type = 'image';
        let public_id = file.originalname.split('.')[0] + '-' + Date.now();
        let allowed_formats = ['jpg', 'png', 'jpeg', 'webp'];

        // Check if it's a documentation file
        if (file.fieldname === 'publicResource' || file.fieldname === 'privateDetails') {
            folder = 'mkp_designs_docs';
            resource_type = 'raw'; // Use raw for documents (PDF, DOC, etc.)
            // For raw files, we explicitly verify the extension ourselves if needed, 
            // but we shouldn't pass allowed_formats to Cloudinary for raw resources 
            // as it attempts to convert them which fails for non-images.
            allowed_formats = undefined;

            // Append extension for raw files so they have correct type when downloaded
            const ext = path.extname(file.originalname);
            public_id += ext;
        }

        const params = {
            folder: folder,
            resource_type: resource_type,
            public_id: public_id,
            type: 'upload' // Explicitly set to public upload
        };

        if (allowed_formats) {
            params.allowed_formats = allowed_formats;
        }

        return params;
    }
});

const upload = multer({ storage: storage });

// @desc    Upload a new design
// @route   POST /api/designs
// @access  Private/Admin
const uploadDesign = async (req, res) => {
    try {
        // req.files will contain the uploaded files
        // We expect 'image', 'publicResource', 'privateDetails'
        const imageFile = req.files['image'] ? req.files['image'][0] : null;
        const publicFile = req.files['publicResource'] ? req.files['publicResource'][0] : null;
        const privateFile = req.files['privateDetails'] ? req.files['privateDetails'][0] : null;

        console.log('Upload Debug - Image:', imageFile ? imageFile.path : 'None');
        console.log('Upload Debug - Public:', publicFile ? publicFile.path : 'None');
        console.log('Upload Debug - Private:', privateFile ? privateFile.path : 'None');


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
            publicUrl: publicFile ? publicFile.path : null,
            publicId: publicFile ? publicFile.filename : null,
            privateUrl: privateFile ? privateFile.path : null,
            privateId: privateFile ? privateFile.filename : null,
            // Keep legacy fields consistent if needed or just null
            documentationUrl: privateFile ? privateFile.path : null,
            documentationId: privateFile ? privateFile.filename : null
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
        const { search, category, minPrice, maxPrice, material, page = 1, limit = 12 } = req.query;
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

        // Pagination Logic
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 12;
        const skip = (pageNumber - 1) * limitNumber;

        const count = await Design.countDocuments(query);
        const designs = await Design.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNumber)
            .skip(skip);

        res.json({
            designs,
            page: pageNumber,
            pages: Math.ceil(count / limitNumber),
            total: count
        });
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
            // For raw resources (docs), we MUST specify resource_type: 'raw'
            // otherwise Cloudinary looks for an image with that ID and fails silently or returns 'not found'.
            await cloudinary.uploader.destroy(design.documentationId, {
                resource_type: 'raw'
            });
        }

        await design.deleteOne();

        res.json({ message: 'Design removed' });
    } catch (error) {
        console.error('Error deleting design:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Download design document/proxy
// @route   GET /api/designs/:id/download
// @access  Public
const downloadDesignDocument = async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) {
            return res.status(404).json({ message: 'Design not found' });
        }

        const { type } = req.query; // 'public' or 'private'
        let fileUrl, fileId;

        if (type === 'private') {
            // For private details, user must be admin OR have purchased it
            // Note: This route is public in router, so we check headers/user manually or assume middleware populates req.user if token present.
            // However, if strict auth is needed, frontend should send token.
            // Assuming common middleware 'protect' is NOT on this route, we might need to manually verify.
            // Actually, let's assume valid token is passed and we can verify purchase.
            // But if no user is attached to req, we can't verify.

            // If request has no user (not logged in), reject private download
            // We might need to handle this by making the route protected or checking here.
            // Since we can't easily add middleware conditionally, we'll check req.user (if populated by optional allow-fail middleware)
            // OR we check if a token is in headers.

            // IMPORTANT: If 'protect' middleware is not on the route, req.user will be undefined.
            // We will assume for now that we will make a SEPARATE authenticated route for private downloads 
            // OR we just check the purchase status assuming the user IS logged in (fetching strictly).

            // But wait, the previous code uses `design.documentationUrl`.
            // I'll stick to: check if `req.user` exists. If not, 401.
            // If user exists, check role/transaction.

            // Since I can't guarantee middleware stack here without seeing `server/index.js`, 
            // I'll rely on the existing pattern.

            // For now, I'll implement logic assuming `req.user` is available if provided. 
            // I will update the route to use `protect` (optional?) later or just use `protect` for specific path.

            // Let's implement the logic assuming req.user IS present (we'll fix route next).

            /* 
               Access Control Logic:
               1. Admin -> OK
               2. User w/ Transaction -> OK
               3. Others -> Forbidden
            */

            // TODO: Ensure route is protected or middleware attaches user!
            // I will simply use design.privateUrl for now and add a TODO comment if I can't verify user.

            const userId = req.user ? req.user._id : null;
            const userRole = req.user ? req.user.role : null;
            console.log('User ID:', userId);
            console.log('User Role:', userRole);
            if (!userId) {
                return res.status(401).json({ message: 'Login required for private details' });
            }

            if (userRole !== 'admin') {
                const transaction = await Transaction.findOne({
                    user: userId,
                    design: req.params.id,
                    status: 'completed'
                });

                if (!transaction) {
                    return res.status(403).json({ message: 'License required' });
                }
            }

            fileUrl = design.privateUrl || design.documentationUrl; // Fallback
            fileId = design.privateId || design.documentationId;

        } else {
            // Public Resource
            fileUrl = design.publicUrl;
            fileId = design.publicId;
        }

        if (!fileUrl) {
            return res.status(404).json({ message: 'Review document not available' });
        }

        // Helper function to try fetching with signed URL
        const tryFetch = async (url) => {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });
                return response;
            } catch (error) {
                console.error('Fetch error:', error.message);
                return null;
            }
        };

        // Strategy 1: Direct URL (Public)
        let response = await tryFetch(fileUrl);

        // Strategies if direct fetch fails (401/403)
        if (!response || !response.ok) {
            console.log(`Direct fetch failed (${response ? response.status : 'Error'}). Attempting fallbacks...`);

            const typesToTry = ['upload', 'authenticated', 'private'];

            for (const type of typesToTry) {
                if (!fileId) continue;

                console.log(`Attempting fallback with type: ${type}`);

                // Construct signed URL
                // Note: resource_type must be 'raw' for these documents as per our upload logic
                const signedUrl = cloudinary.url(fileId, {
                    resource_type: 'raw',
                    type: type,
                    sign_url: true,
                    secure: true,
                    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
                });

                const fallbackResponse = await tryFetch(signedUrl);

                if (fallbackResponse && fallbackResponse.ok) {
                    console.log(`Fallback successful with type: ${type}`);
                    response = fallbackResponse;
                    break; // Success!
                }
            }
        }

        if (!response || !response.ok) {
            console.error('All download strategies failed.');
            // Provide debug info only in development or if specifically requested, 
            // otherwise return standard error.
            return res.status(404).json({
                message: 'Failed to fetch document from storage. Please contact support.',
                // debug: { url: design.documentationUrl, id: design.documentationId } 
            });
        }

        // Determine filename
        let filename = type === 'private' ? 'project-details' : 'public-resource';
        if (fileId) {
            const publicId = fileId.split('/').pop();
            filename = publicId;
            if (!filename.includes('.')) {
                filename += '.pdf';
            }
        }

        // Stream response
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

        const { Readable } = require('stream');
        if (response.body) {
            Readable.fromWeb(response.body).pipe(res);
        } else {
            res.end(await response.arrayBuffer());
        }

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Could not download file' });
    }
};

module.exports = {
    upload,
    uploadDesign,
    getDesigns,
    getDesignById,
    deleteDesign,
    downloadDesignDocument
};
