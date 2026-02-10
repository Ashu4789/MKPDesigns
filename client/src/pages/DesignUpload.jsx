import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { uploadDesign } from '../services/api';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, FileText, Image, IndianRupee, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const DesignUpload = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Residential',
        material: '',
        price: ''
    });

    const [files, setFiles] = useState({
        image: null,
        publicResource: null,
        privateDetails: null
    });

    // Redirect if not admin
    if (user && user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center p-8 bg-card rounded-2xl shadow-xl border border-border">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!files.image) {
            setError('Please select a main design image.');
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('material', formData.material);
            data.append('price', formData.price);
            data.append('image', files.image);

            if (files.publicResource) {
                data.append('publicResource', files.publicResource);
            }
            if (files.privateDetails) {
                data.append('privateDetails', files.privateDetails);
            }

            await uploadDesign(data);
            setSuccess('Design uploaded successfully!');

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'Residential',
                material: '',
                price: ''
            });
            setFiles({ image: null, publicResource: null, privateDetails: null });

            // Reset file inputs manually
            document.getElementById('image-upload').value = '';
            document.getElementById('public-upload').value = '';
            document.getElementById('private-upload').value = '';

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload design. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DashboardLayout>
                <div className="min-h-screen bg-background">
                    <Navbar />

                    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">

                            <div className="p-8 border-b border-border bg-muted/20">
                                <h1 className="text-3xl font-bold text-foreground flex items-center">
                                    <Upload className="mr-3 h-8 w-8 text-primary" />
                                    Upload New Design
                                </h1>
                                <p className="mt-2 text-muted-foreground">
                                    Add a new patented design or project to the showroom.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">

                                {/* Messages */}
                                {error && (
                                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl flex items-center border border-destructive/20">
                                        <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-4 bg-green-500/10 text-green-600 rounded-xl flex items-center border border-green-500/20">
                                        <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                                        {success}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Design Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                placeholder="e.g. Modern Eco Villa"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            >
                                                <option value="Residential">Residential</option>
                                                <option value="Commercial">Commercial</option>
                                                <option value="Industrial">Industrial</option>
                                                <option value="Landscape">Landscape</option>
                                                <option value="Interior">Interior</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Primary Material</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    name="material"
                                                    value={formData.material}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    placeholder="e.g. Concrete, Timber, Glass"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">License Price (₹)</label>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    required
                                                    min="0"
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description & Files */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                required
                                                rows="4"
                                                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                                                placeholder="Detailed description of the design..."
                                            />
                                        </div>

                                        <div className="p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors bg-muted/10">
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                <Image className="inline h-4 w-4 mr-2" />
                                                Main Image (Required)
                                            </label>
                                            <input
                                                type="file"
                                                id="image-upload"
                                                name="image"
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            />
                                            {files.image && <p className="mt-2 text-xs text-primary truncate">Selected: {files.image.name}</p>}
                                        </div>

                                        <div className="p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors bg-muted/10">
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                <FileText className="inline h-4 w-4 mr-2" />
                                                Public Resources (Downloadable by All)
                                            </label>
                                            <input
                                                type="file"
                                                id="public-upload"
                                                name="publicResource"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            />
                                            {files.publicResource && <p className="mt-2 text-xs text-primary truncate">Selected: {files.publicResource.name}</p>}
                                        </div>

                                        <div className="p-4 border-2 border-dashed border-border rounded-xl hover:border-primary/50 transition-colors bg-muted/10">
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                <FileText className="inline h-4 w-4 mr-2" />
                                                Project Details (Downloadable after Purchase)
                                            </label>
                                            <input
                                                type="file"
                                                id="private-upload"
                                                name="privateDetails"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            />
                                            {files.privateDetails && <p className="mt-2 text-xs text-primary truncate">Selected: {files.privateDetails.name}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-primary/25"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="-ml-1 mr-3 h-5 w-5" />
                                                Upload Design
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default DesignUpload;
