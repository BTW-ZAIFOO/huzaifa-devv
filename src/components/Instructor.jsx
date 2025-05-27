import React, { useContext } from "react";
import { Context } from "../main";

const Instructor = () => {
  const { user } = useContext(Context);

  return (
    <>
      <div id="features" className="py-20 px-5 bg-gray-50 relative overflow-hidden text-center w-full">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-6 relative inline-block text-slate-800">
            Meet Your Developer
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
            The mind behind this AI-powered chat moderation system
          </p>
        </div>
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden flex relative z-10">
          <div className="p-10 flex flex-col justify-center">
            <h4 className="text-lg text-blue-600 font-semibold mb-2.5 uppercase tracking-wide">Software Engineer</h4>
            <h2 className="text-4xl text-slate-800 font-bold mb-5 leading-tight">Huzaifa Khan</h2>
            <p className="text-gray-600 leading-loose mb-8">
              Hello! I'm Huzaifa Khan, a passionate Software Engineer with expertise in building
              AI-powered applications. With extensive experience in JavaScript, React, Node.js,
              Express, and MongoDB, I specialize in creating scalable and secure web applications
              that solve real-world problems.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Instructor;
