const express = require('express');
const router = express.Router();
const {
    upload,
    uploadDesign,
    getDesigns,
    getDesignById,
    downloadDesignDocument
} = require('../controllers/designController');

const { protect, admin, optionalProtect } = require('../middleware/auth');

// Define file fields for upload
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'publicResource', maxCount: 1 },
    { name: 'privateDetails', maxCount: 1 }
]);

// Routes
router.route('/')
    .get(getDesigns)
    .post(protect, admin, uploadFields, uploadDesign);

router.get('/:id/download', optionalProtect, downloadDesignDocument);

router.route('/:id')
    .get(getDesignById)
    .delete(protect, admin, require('../controllers/designController').deleteDesign);

module.exports = router;
