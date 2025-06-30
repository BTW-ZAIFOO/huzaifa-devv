import React from "react";
import PropTypes from "prop-types";
import Section from "./Section";

const industries = [
  {
    key: "Healthcare",
    title: "Healthcare",
    description: "Secure, HIPAA-compliant patient and provider communication.",
    aosDelay: 100,
  },
  {
    key: "Education",
    title: "Education",
    description:
      "Safe, moderated learning environments for students and faculty.",
    aosDelay: 250,
  },
  {
    key: "Enterprise",
    title: "Enterprise",
    description: "Secure, compliant collaboration for global teams.",
    aosDelay: 400,
  },
  {
    key: "Communities",
    title: "Communities",
    description: "Foster trust and inclusion in public and private forums.",
    aosDelay: 550,
  },
];

const IndustriesSection = ({ SectionIcons }) => (
  <Section id="industries" data-aos="fade-up">
    <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
      Industries We Serve
    </h1>
    <div className="flex flex-wrap justify-center gap-10">
      {industries.map(({ key, title, description, aosDelay }) => (
        <div
          key={key}
          className="p-10 w-64 text-center transition-all duration-700"
          data-aos="flip-up"
          data-aos-delay={aosDelay}
        >
          {SectionIcons[key]}
          <h5 className="font-bold mb-2">{title}</h5>
          <p className="text-gray-600 text-base">{description}</p>
        </div>
      ))}
    </div>
  </Section>
);

IndustriesSection.propTypes = {
  SectionIcons: PropTypes.object.isRequired,
};

export default IndustriesSection;
