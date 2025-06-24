import React from 'react'
import './Resume.css'

const Resume: React.FC = () => {
  return (
    <div className="resume-container">
      <h1>John Doe</h1>
      <p>Email: john.doe@example.com | Location: Somewhere</p>
      <h2>Experience</h2>
      <ul>
        <li>Front-end Developer at XYZ Corp (2021-present)</li>
        <li>Intern at ABC Inc (2020)</li>
      </ul>
      <h2>Education</h2>
      <ul>
        <li>B.Sc. in Computer Science – University</li>
      </ul>
      <h2>Skills</h2>
      <p>React, TypeScript, CSS, Node.js</p>
    </div>
  )
}

export default Resume 