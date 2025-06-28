import React from "react";
import PropTypes from "prop-types";

const SolutionsSuiteSection = ({ SectionIcons }) => (
  <div className="my-8">
    <h3
      className="text-3xl font-bold text-center text-blue-700 pb-9 transition-all duration-700"
      data-aos="fade-right"
    >
      Comprehensive Solutions Suite
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
      <div
        data-aos="zoom-in-up"
        data-aos-delay="100"
        className="transition-all duration-700"
      >
        {SectionIcons["AI-Driven Risk Audit"]}
        <h4 className="font-bold mb-2">AI-Driven Risk Audit</h4>
        <p className="text-gray-600">
          Automated, adaptive moderation and threat detection at scale.
        </p>
      </div>
      <div
        data-aos="zoom-in-up"
        data-aos-delay="250"
        className="transition-all duration-700"
      >
        {SectionIcons["Chatbot Remediation"]}
        <h4 className="font-bold mb-2">Chatbot Remediation</h4>
        <p className="text-gray-600">
          Instant, intelligent resolution of flagged issues.
        </p>
      </div>
      <div
        data-aos="zoom-in-up"
        data-aos-delay="400"
        className="transition-all duration-700"
      >
        {SectionIcons["Omnichannel Monitoring"]}
        <h4 className="font-bold mb-2">Omnichannel Monitoring</h4>
        <p className="text-gray-600">
          Unified oversight across web, mobile, and enterprise platforms.
        </p>
      </div>
    </div>
  </div>
);

SolutionsSuiteSection.propTypes = {
  SectionIcons: PropTypes.objectOf(PropTypes.node).isRequired,
};

export default SolutionsSuiteSection;
