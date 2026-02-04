import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';


// Note: Ensure react-toastify is properly set up in App.js for notifications, or replace with console logs/alerts if not.

const AdminProjectUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        status: 'Ongoing',
        estimations: {
            cost: '',
            duration: '',
            area: ''
        },
        modelEmbedUrl: '',
        isFeatured: false
    });

    // File states
    const [images, setImages] = useState([]);
    const [modelFile, setModelFile] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleModelChange = (e) => {
        if (e.target.files) {
            setModelFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token'); // Assuming token is stored here
            if (!token) {
                alert('You must be logged in as admin');
                setLoading(false);
                return;
            }

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('location', formData.location);
            data.append('status', formData.status);
            data.append('estimations', JSON.stringify(formData.estimations));
            data.append('modelEmbedUrl', formData.modelEmbedUrl);
            data.append('isFeatured', formData.isFeatured);

            if (images.length > 0) {
                images.forEach(image => {
                    data.append('images', image);
                });
            }

            if (modelFile) {
                data.append('model3D', modelFile);
            }

            await axios.post('http://localhost:5000/api/projects', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            alert('Project uploaded successfully!');
            navigate('/projects');
        } catch (error) {
            console.error('Error uploading project:', error);
            alert(error.response?.data?.message || 'Error uploading project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
        <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Upload New Project</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="Proposed">Proposed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        ></textarea>
                    </div>

                    {/* Estimations */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-700">Estimations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Cost</label>
                                <input
                                    type="text"
                                    name="estimations.cost"
                                    value={formData.estimations.cost}
                                    onChange={handleChange}
                                    placeholder="₹2lakhs or TBD"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Duration</label>
                                <input
                                    type="text"
                                    name="estimations.duration"
                                    value={formData.estimations.duration}
                                    onChange={handleChange}
                                    placeholder="18 Months"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Total Area</label>
                                <input
                                    type="text"
                                    name="estimations.area"
                                    value={formData.estimations.area}
                                    onChange={handleChange}
                                    placeholder="5000 sq ft"
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Files */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">3D Model File (.glb, .gltf)</label>
                            <input
                                type="file"
                                accept=".glb,.gltf"
                                onChange={handleModelChange}
                                className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional. Upload a GLB/GLTF file.</p>
                        </div>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">3D Embed URL</label>
                            <input
                                type="text"
                                name="modelEmbedUrl"
                                value={formData.modelEmbedUrl}
                                onChange={handleChange}
                                placeholder="Paste Spline or Sketchfab embed URL here"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                            Feature this project on Dashboard
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Uploading Project...' : 'Upload Project'}
                    </button>
                </form>
            </div>
        </div>
        </DashboardLayout>
    );
};

export default AdminProjectUpload;
