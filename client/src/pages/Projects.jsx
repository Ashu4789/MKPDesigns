import React, { useEffect, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { getProjects, deleteProject } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Filter } from 'lucide-react';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await getProjects();
                setProjects(res.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await deleteProject(id);
                setProjects(projects.filter(project => project._id !== id));
                alert('Project deleted successfully');
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Failed to delete project');
            }
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filter === 'All' || project.status === filter;

        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <DashboardLayout>
                <div className="min-h-screen bg-background pt-20 pb-10 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-foreground mb-4">Our Projects</h1>
                            <p className="text-xl text-muted-foreground">Explore our portfolio of architectural excellence.</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                                {['All', 'Ongoing', 'Completed', 'Proposed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === status
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : (
                            <>
                                {filteredProjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredProjects.map(project => (
                                            <ProjectCard
                                                key={project._id}
                                                project={project}
                                                onDelete={() => handleDelete(project._id)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 text-muted-foreground">
                                        No projects found matching your criteria.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default Projects;
