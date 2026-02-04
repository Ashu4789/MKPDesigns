import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import { ArrowRight, Building } from 'lucide-react';

const ProjectsOverview = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopProjects = async () => {
            try {
                // In a real app, you might have a dedicated endpoint for top projects
                // For now, let's fetch all and slice, or use the /top endpoint if we made one (we did!)
                const res = await axios.get('http://localhost:5000/api/projects/top');
                setProjects(res.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopProjects();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading projects...</div>;
    }

    if (projects.length === 0) {
        return null; // Or a message saying "No featured projects yet"
    }

    return (
        <section className="py-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Building className="text-blue-600" />
                        Featured Projects
                    </h2>
                    <p className="text-gray-500 mt-1">Our top architectural masterpieces</p>
                </div>
                <Link
                    to="/projects"
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium group"
                >
                    View All Projects
                    <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <ProjectCard key={project._id} project={project} />
                ))}
            </div>
        </section>
    );
};

export default ProjectsOverview;
