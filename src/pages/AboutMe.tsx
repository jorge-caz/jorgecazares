import React from 'react'
import './AboutMe.css'

const AboutMe: React.FC = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">About Me</h1>
      <div className="about-content">
        <p className="about-paragraph">
          Since a young age, I have always been driven by complex problem solving. I started programming since the age of
          8, and I highly value intellectual challenges. I am firm believer that sky is the limit and that no one should
          ever set themselves a single limitation in their lives: with enough determination, anything is possible.
        </p>
        <p className="about-paragraph">
          I developed a passion for teaching at the age of 13 right after I learned single variable calculus and wanted
          to share my knowledge to the world. Currently, I am working on my own tutoring website and hope to help
          students all around the world.
        </p>

        <div className="about-grid">
          <div className="about-card">
            <h3 className="card-title">Skills</h3>
            <ul className="card-list">
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>Full-Stack Web Development</span>
              </li>
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>Tutoring and Mentoring</span>
              </li>
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>Business Strategy</span>
              </li>
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>Project Management</span>
              </li>
            </ul>
          </div>
          <div className="about-card">
            <h3 className="card-title">Education</h3>
            <ul className="card-list">
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>AA in General Studies, Laredo College</span>
              </li>
              <li className="list-item">
                <span className="list-bullet"></span>
                <span>BS in Math &amp; CS, MIT</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutMe 