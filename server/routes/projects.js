const express = require('express');
const router = express.Router();
const {
    getProjects,
    getTopProjects,
    getProjectById,
    createProject,
    deleteProject,
    upload
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getProjects);
router.get('/top', getTopProjects);
router.get('/:id', getProjectById);

// Protect and Admin routes
router.post('/', protect, admin, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'model3D', maxCount: 1 }
]), createProject);

router.delete('/:id', protect, admin, deleteProject);

module.exports = router;
