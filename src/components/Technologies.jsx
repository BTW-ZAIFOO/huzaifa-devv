import React from "react";

const techData = [
  {
    name: "React",
    image: "https://cdn.worldvectorlogo.com/logos/react-2.svg",
    description:
      "React is a powerful JavaScript library for building dynamic and responsive user interfaces with reusable components.",
  },
  {
    name: "Node.js",
    image: "https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg",
    description:
      "Node.js is a JavaScript runtime that lets you build scalable server-side applications with event-driven architecture.",
  },
  {
    name: "Express.js",
    image: "https://cdn.worldvectorlogo.com/logos/express-109.svg",
    description:
      "Express.js is a lightweight web application framework for Node.js, used to build robust APIs and web applications.",
  },
  {
    name: "MongoDB",
    image: "https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg",
    description:
      "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents for easy development and scaling.",
  },
];

const Technologies = () => {
  return (
    <div id="technologies" className="py-20 px-5 text-center bg-white">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-6 relative inline-block text-slate-800 after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:transform after:translate-x-[-50%] after:w-20 after:h-1 after:bg-gradient-to-r after:from-blue-600 after:to-indigo-600 after:rounded">
          Technologies We Use
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
          Our platform is built with modern technologies to ensure performance,
          scalability, and a great developer experience.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
        {techData.map((tech, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg overflow-hidden w-[280px] p-8 text-center transition-all duration-500 border border-gray-100 hover:-translate-y-4 hover:shadow-xl relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-blue-600 before:to-indigo-600 before:transform before:scale-x-0 before:origin-left before:transition-transform before:duration-500 before:ease-out hover:before:scale-x-100"
          >
            <div className="h-24 mb-5 flex justify-center items-center">
              <img
                src={tech.image}
                alt={tech.name}
                className="h-20 w-20 object-contain transition-transform duration-300 hover:scale-110"
              />
            </div>
            <h3 className="text-2xl text-blue-600 font-semibold mb-4">
              {tech.name}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {tech.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Technologies;