import React from 'react';
import SectionContainer from '../components/SectionContainer';
import ProjectCard from '../components/ProjectCard';
import PlaceholderImages from '../utils/PlaceholderImages';
import { usePortfolio } from '../context/PortfolioContext';

const Projects = () => {
  const { projects } = usePortfolio();

  // Map project data to include placeholder images
  const projectsWithImages = projects;//.map(project => {
  //   let imageUrl;
  //   if (project.title === "Sparkmind.pro") {
  //     imageUrl = PlaceholderImages.sparkMind;
  //   } else if (project.title === "TradeAPixel.com") {
  //     imageUrl = PlaceholderImages.tradeAPixel;
  //   } else {
  //     imageUrl = PlaceholderImages.project;
  //   }

  //   return {
  //     ...project,
  //     imageUrl
  //   };
  // });

  return (
    <SectionContainer id="projects">
      <h2 className="section-title text-gray-900 dark:text-white">My Projects</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {projectsWithImages.map((project) => (
          <ProjectCard
            key={project.id}
            title={project.title}
            description={project.description}
            imageUrl={project.imageUrl}
            githubUrl={project.githubUrl}
            demoUrl={project.demoUrl}
            status={project.status}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default Projects;
