const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    upload,
    uploadDesign,
    getDesigns,
    getDesignById
} = require('../controllers/designController');

// Define file fields for upload
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'documentation', maxCount: 1 }
]);

// Routes
router.route('/')
    .get(getDesigns)
    .post(protect, admin, uploadFields, uploadDesign);

router.route('/:id')
    .get(getDesignById);

module.exports = router;
