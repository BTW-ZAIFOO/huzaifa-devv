import React from "react";
import { FaMicrosoft, FaSlack, FaSalesforce } from "react-icons/fa";
import Section from "./Section";

const PARTNERS = [
  {
    name: "Microsoft",
    icon: (
      <FaMicrosoft className="text-blue-700 text-4xl" aria-label="Microsoft" />
    ),
  },
  {
    name: "Slack",
    icon: <FaSlack className="text-indigo-600 text-4xl" aria-label="Slack" />,
  },
  {
    name: "Salesforce",
    icon: (
      <FaSalesforce
        className="text-blue-400 text-4xl"
        aria-label="Salesforce"
      />
    ),
  },
];

const PartnersSection = () => (
  <Section id="partners">
    <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
      Our Trusted Partners
    </h1>
    <div className="flex flex-wrap justify-center items-center gap-10">
      {PARTNERS.map(({ name, icon }) => (
        <div key={name} className="flex flex-col items-center">
          {icon}
          <span className="mt-2 text-sm text-gray-600">{name}</span>
        </div>
      ))}
    </div>
  </Section>
);

PartnersSection.propTypes = {};

export default PartnersSection;
