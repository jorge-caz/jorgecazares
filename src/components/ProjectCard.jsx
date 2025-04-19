import React from 'react';

const ProjectCard = ({ title, description, imageUrl, githubUrl, demoUrl, status }) => {
  return (
    <div className="card hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300">
      <div className="relative overflow-hidden group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
          <div className="p-4 w-full">
            <h3 className="text-white text-xl font-bold">{title}</h3>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
        <div className="flex space-x-4 mb-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-gray-800 text-white hover:bg-gray-700 transform hover:scale-105 transition-all"
            >
              GitHub
            </a>
          )}
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary transform hover:scale-105 transition-all"
            >
              Demo
            </a>
          )}
        </div>
        {!status && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 italic">🚧 Work in progress – coming soon!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
