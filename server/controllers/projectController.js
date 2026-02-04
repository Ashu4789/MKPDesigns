const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Project = require('../models/project');

// Configure Cloudinary (inherits config from designController or server.js if already set globally, but good to ensure)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mkp_projects',
        allowed_formats: ['jpg', 'png', 'jpeg', 'glb', 'gltf'], // Added 3D model formats
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get top featured projects
// @route   GET /api/projects/top
// @access  Public
const getTopProjects = async (req, res) => {
    try {
        const topProjects = await Project.find({ isFeatured: true }).limit(5);
        res.json(topProjects);
    } catch (error) {
        console.error('Error fetching top projects:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
    try {
        // req.files will contain: 'images' (array), 'model3D' (single)
        const imageFiles = req.files['images'] || [];
        const model3DFile = req.files['model3D'] ? req.files['model3D'][0] : null;

        const { title, description, location, status, estimations, modelEmbedUrl, isFeatured } = req.body;

        const images = imageFiles.map(file => ({
            url: file.path,
            publicId: file.filename
        }));

        const model3D = model3DFile ? {
            url: model3DFile.path,
            publicId: model3DFile.filename
        } : null;

        // Parse estimations if sent as JSON string (common with FormData)
        let parsedEstimations = estimations;
        if (typeof estimations === 'string') {
            try {
                parsedEstimations = JSON.parse(estimations);
            } catch (e) {
                // If not JSON, it might be individual fields or just keep as is if schema allows (Schema defines structured object)
                // For simplicity, let's assume client sends stringified JSON or backend validates structure later.
                // If it fails, it will rely on defaults.
                console.warn('Could not parse estimations JSON:', e);
            }
        }

        const project = await Project.create({
            title,
            description,
            location,
            status,
            estimations: parsedEstimations,
            images,
            model3D,
            modelEmbedUrl,
            isFeatured: isFeatured === 'true' || isFeatured === true
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Delete images from Cloudinary
        if (project.images && project.images.length > 0) {
            for (const img of project.images) {
                if (img.publicId) {
                    await cloudinary.uploader.destroy(img.publicId);
                }
            }
        }

        // Delete 3D model from Cloudinary
        if (project.model3D && project.model3D.publicId) {
            await cloudinary.uploader.destroy(project.model3D.publicId);
        }

        await project.deleteOne();

        res.json({ message: 'Project removed' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    upload,
    getProjects,
    getTopProjects,
    getProjectById,
    createProject,
    deleteProject
};
