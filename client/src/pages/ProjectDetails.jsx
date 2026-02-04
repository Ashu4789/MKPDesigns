import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ThreeDViewer from '../components/ThreeDViewer';
import { MapPin, Calendar, Ruler, IndianRupee, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
// import ImageGallery from 'react-image-gallery'; // Assuming this is installed as per package.json
// Note: You might need to import CSS for image gallery if not already imported globally or in App.jsx
// import "react-image-gallery/styles/css/image-gallery.css";

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
                setProject(res.data);
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (!project) return <div className="flex justify-center items-center min-h-screen">Project not found</div>;

    // Prepare images for gallery (if we were using the gallery lib, but for now let's just use a simple grid)

    return (
        <>
            <DashboardLayout>
                <div className="min-h-screen bg-background pt-20 pb-10">
                    {/* Header / Hero */}
                    <div className="bg-muted/30 border-b border-border py-12 px-4 md:px-8 mb-8">
                        <div className="max-w-7xl mx-auto">
                            <Link to="/projects" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                                <ArrowLeft size={20} className="mr-2" /> Back to Projects
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{project.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                <div className="flex items-center"><MapPin size={18} className="mr-2" /> {project.location}</div>
                                <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                                    {project.status}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">

                                {/* 3D View Section */}
                                {(project.model3D || project.modelEmbedUrl) && (
                                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                                        <h2 className="text-2xl font-bold mb-4 text-foreground">3D Authorization</h2>
                                        <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
                                            {project.modelEmbedUrl ? (
                                                <iframe
                                                    src={project.modelEmbedUrl}
                                                    frameBorder="0"
                                                    width="100%"
                                                    height="100%"
                                                    className="absolute inset-0 w-full h-full"
                                                    title="3D Model"
                                                ></iframe>
                                            ) : project.model3D ? (
                                                <ThreeDViewer modelUrl={project.model3D.url} height="100%" />
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 text-center">Interact with the model to explore details.</p>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                                    <h2 className="text-2xl font-bold mb-4 text-foreground">Project Overview</h2>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{project.description}</p>
                                </div>

                                {/* Image Gallery Grid */}
                                {project.images && project.images.length > 0 && (
                                    <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                                        <h2 className="text-2xl font-bold mb-4 text-foreground">Gallery</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {project.images.map((img, index) => (
                                                <div key={index} className="aspect-video rounded-lg overflow-hidden group cursor-pointer relative">
                                                    <img
                                                        src={img.url}
                                                        alt={`${project.title} - ${index}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-card border border-border rounded-xl shadow-sm p-6 sticky top-24">
                                    <h3 className="text-xl font-bold mb-6 text-foreground border-b border-border pb-2">Project Details</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                                                <Ruler size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Area</p>
                                                <p className="font-semibold text-foreground">{project.estimations?.area || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                                                <IndianRupee size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                                <p className="font-semibold text-foreground">{project.estimations?.cost || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 flex-shrink-0">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Duration</p>
                                                <p className="font-semibold text-foreground">{project.estimations?.duration || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-8 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                                        Contact for Inquiry
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default ProjectDetails;
