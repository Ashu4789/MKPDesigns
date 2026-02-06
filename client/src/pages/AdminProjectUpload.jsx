import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadProject } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, MapPin, Layers, DollarSign, Calendar, Maximize, Image as ImageIcon, Box, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
            const data = new FormData();
            // Append simple fields
            Object.keys(formData).forEach(key => {
                if (key === 'estimations') {
                    data.append('estimations', JSON.stringify(formData.estimations));
                } else if (key === 'isFeatured') {
                    data.append('isFeatured', formData.isFeatured);
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append images
            images.forEach(image => {
                data.append('images', image);
            });

            if (modelFile) {
                data.append('model3D', modelFile);
            }

            await uploadProject(data);

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
            <div className="min-h-screen bg-background relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute inset-0 bg-muted/30">
                    <div className="absolute inset-0 bg-grid-black/5 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
                </div>

                <div className="relative z-10 pt-24 pb-10 px-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                                Upload New <span className="text-primary">Project</span>
                            </h1>
                            <p className="text-muted-foreground">Add a new architectural project to your portfolio</p>
                        </div>

                        <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Project Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Modern Villa in Kerala"
                                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    Location
                                                </div>
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 text-primary" />
                                                    Status
                                                </div>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none"
                                                >
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Proposed">Proposed</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-y"
                                            placeholder="Detailed description of the project..."
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Estimations */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-primary" />
                                        Project Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1 uppercase tracking-wider">Cost</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    name="estimations.cost"
                                                    value={formData.estimations.cost}
                                                    onChange={handleChange}
                                                    placeholder="20 Lakhs"
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1 uppercase tracking-wider">Duration</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    name="estimations.duration"
                                                    value={formData.estimations.duration}
                                                    onChange={handleChange}
                                                    placeholder="18 Months"
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs font-medium text-muted-foreground mb-1 ml-1 uppercase tracking-wider">Total Area</label>
                                            <div className="relative">
                                                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    name="estimations.area"
                                                    value={formData.estimations.area}
                                                    onChange={handleChange}
                                                    placeholder="5000 sq ft"
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Files */}
                                <div className="space-y-6 pt-4 border-t border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="h-4 w-4 text-primary" />
                                                Project Images
                                            </div>
                                        </label>
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                                <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-muted-foreground">{images.length > 0 ? `${images.length} files selected` : "SVG, PNG, JPG or GIF"}</p>
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            <div className="flex items-center gap-2">
                                                <Box className="h-4 w-4 text-primary" />
                                                3D Model File
                                            </div>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <label className="flex-1">
                                                <div className="flex items-center justify-center w-full px-4 py-3 border border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors">
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {modelFile ? modelFile.name : "Choose GLB/GLTF file..."}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept=".glb,.gltf"
                                                        onChange={handleModelChange}
                                                        className="hidden"
                                                    />
                                                </div>
                                            </label>
                                            <div className="text-xs text-muted-foreground">
                                                Optional
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-border"></div>
                                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase tracking-wider">OR</span>
                                        <div className="flex-grow border-t border-border"></div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">3D Embed URL</label>
                                        <input
                                            type="text"
                                            name="modelEmbedUrl"
                                            value={formData.modelEmbedUrl}
                                            onChange={handleChange}
                                            placeholder="Paste Spline or Sketchfab embed URL here"
                                            className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-muted/30 rounded-lg border border-border">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        id="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-primary focus:ring-primary border-border rounded transition-all"
                                    />
                                    <label htmlFor="isFeatured" className="ml-3 block text-sm font-medium text-foreground cursor-pointer select-none">
                                        Feature this project on Dashboard
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl transition-all font-bold text-lg shadow-lg shadow-primary/20 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin h-5 w-5" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5" />
                                            Upload Project
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminProjectUpload;
