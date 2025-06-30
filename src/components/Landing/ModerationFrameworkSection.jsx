import React from "react";
import PropTypes from "prop-types";

const frameworkSteps = [
  {
    number: "01",
    color: "text-blue-700",
    title: "Strategic Audit",
    description:
      "Comprehensive assessment of your digital ecosystem for risk and opportunity.",
    delay: 100,
  },
  {
    number: "02",
    color: "text-indigo-700",
    title: "Deep AI Analysis",
    description:
      "Advanced NLP and ML models surface actionable insights in real time.",
    delay: 250,
  },
  {
    number: "03",
    color: "text-purple-700",
    title: "Seamless Integration",
    description:
      "Effortless deployment across your platforms with robust APIs.",
    delay: 400,
  },
  {
    number: "04",
    color: "text-pink-700",
    title: "Continuous Impact",
    description:
      "Ongoing monitoring, reporting, and optimization for lasting results.",
    delay: 550,
  },
];

const ModerationFrameworkSection = () => (
  <div className="my-8">
    <h3
      className="text-3xl font-bold text-center text-blue-700 pb-9 transition-all duration-700"
      data-aos="fade-right"
    >
      Moderation Framework
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center">
      {frameworkSteps.map((step) => (
        <div
          key={step.number}
          data-aos="flip-left"
          data-aos-delay={step.delay}
          className="transition-all duration-700"
        >
          <div className={`text-5xl ${step.color} mb-3 font-extrabold`}>
            {step.number}
          </div>
          <h4 className="font-semibold mb-2">{step.title}</h4>
          <p className="text-gray-600">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
);

ModerationFrameworkSection.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      delay: PropTypes.number.isRequired,
    })
  ),
};

export default ModerationFrameworkSection;
