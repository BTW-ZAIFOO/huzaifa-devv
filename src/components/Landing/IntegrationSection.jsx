import React from "react";
import PropTypes from "prop-types";
import Section from "./Section";
import { Link } from "react-router-dom";

function IntegrationSection({ children }) {
  return (
    <Section id="integration" data-aos="fade-up">
      <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
        Integration & Resources
      </h1>
      <div className="mb-12 transition-all duration-700" data-aos="fade-right">
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          Seamless Integration & Customization
        </h3>
        <ul className="list-disc list-inside text-gray-700 mb-6 text-lg">
          <li>Plug-and-play with leading CMS and collaboration platforms</li>
          <li>Accessible, intuitive interfaces for all user types</li>
          <li>Multi-platform, multi-language support</li>
          <li>Fully customizable to your brand and workflow</li>
        </ul>
        <Link
          to="/chat"
          className="inline-block px-8 py-3 bg-blue-700 text-white rounded-xl font-bold shadow hover:bg-blue-800"
        >
          Login/Signup
        </Link>
      </div>
      {children}
    </Section>
  );
}

IntegrationSection.propTypes = {
  children: PropTypes.node,
};

export default IntegrationSection;
