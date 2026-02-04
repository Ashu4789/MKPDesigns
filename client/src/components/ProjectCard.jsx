import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
    return (
        <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-border">
            <div className="relative h-48 overflow-hidden">
                {project.images && project.images.length > 0 ? (
                    <img
                        src={project.images[0].url}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-primary shadow-sm">
                    {project.status}
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-foreground mb-2 truncate">{project.title}</h3>

                <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span className="truncate">{project.location}</span>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
                    {project.description}
                </p>

                <Link
                    to={`/projects/${project._id}`}
                    className="mt-auto inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium group"
                >
                    View Details
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default ProjectCard;
