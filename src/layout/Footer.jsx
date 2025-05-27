import React from "react";
import { Link } from "react-router-dom";
import fb from "../assets/fb.png";
import git from "../assets/git.png";
import linkedin from "../assets/linkedin.png";

const Footer = () => {
  return (
    <>
      <footer className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white pt-20 pb-8 px-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient"></div>
        <div className="max-w-7xl mx-auto flex justify-between items-start flex-wrap gap-10">
          <div className="flex-[0_0_300px]">
            <h2 className="text-2xl font-bold mb-4">AI Chat Moderation</h2>
            <p className="text-base leading-relaxed opacity-80 mb-5">
              An advanced platform leveraging artificial intelligence to create
              safe, efficient, and productive chat environments.
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Subscribe to our Newsletter</h3>
              <form className="flex max-w-[300px]">
                <input
                  type="email"
                  className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-l-lg focus:outline-none focus:bg-white/15"
                  placeholder="Enter your email"
                />
                <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 rounded-r-lg transition-colors">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
          <div className="flex-[0_0_200px]">
            <h3 className="text-lg font-semibold mb-5 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-0.5 after:bg-indigo-500">
              Quick Links
            </h3>
            <ul className="list-none p-0">
              <li className="mb-3">
                <a href="#" className="text-white/80 no-underline transition-all flex items-center gap-2 hover:text-white hover:translate-x-1.5">
                  <i className="fas fa-chevron-right text-xs"></i> Home
                </a>
              </li>
              <li className="mb-3">
                <a href="#features" className="text-white/80 no-underline transition-all flex items-center gap-2 hover:text-white hover:translate-x-1.5">
                  <i className="fas fa-chevron-right text-xs"></i> Features
                </a>
              </li>
              <li className="mb-3">
                <a href="#technologies" className="text-white/80 no-underline transition-all flex items-center gap-2 hover:text-white hover:translate-x-1.5">
                  <i className="fas fa-chevron-right text-xs"></i> Technologies
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-white/80 no-underline transition-all flex items-center gap-2 hover:text-white hover:translate-x-1.5">
                  <i className="fas fa-chevron-right text-xs"></i> Documentation
                </a>
              </li>
              <li className="mb-3">
                <a href="#" className="text-white/80 no-underline transition-all flex items-center gap-2 hover:text-white hover:translate-x-1.5">
                  <i className="fas fa-chevron-right text-xs"></i> Support
                </a>
              </li>
            </ul>
          </div>
          <div className="flex-[0_0_200px]">
            <h3 className="text-lg font-semibold mb-5 relative inline-block after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-10 after:h-0.5 after:bg-indigo-500">
              Connect With Us
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="https://facebook.com/profile.php?id=100030535123397&mibextid=9R9pXO"
                target="_blank"
                className="w-11 h-11 flex justify-center items-center rounded-full bg-white/10 transition-all hover:bg-indigo-500 hover:-translate-y-1"
              >
                <img src={fb} alt="Facebook" className="w-5 h-5 brightness-0 invert" />
              </Link>
              <Link
                to="https://www.youtube.com/channel/UCbGtkGZ9sDg54PtU3GEDE6w"
                target="_blank"
                className="w-11 h-11 flex justify-center items-center rounded-full bg-white/10 transition-all hover:bg-indigo-500 hover:-translate-y-1"
              >
                <i className="fab fa-youtube text-xl text-white"></i>
              </Link>
              <Link
                to="https://www.linkedin.com/in/muhammad-zeeshan-khan-dev/"
                target="_blank"
                className="w-11 h-11 flex justify-center items-center rounded-full bg-white/10 transition-all hover:bg-indigo-500 hover:-translate-y-1"
              >
                <img src={linkedin} alt="LinkedIn" className="w-5 h-5 brightness-0 invert" />
              </Link>
              <Link
                to="https://github.com/Zeeshu911"
                target="_blank"
                className="w-11 h-11 flex justify-center items-center rounded-full bg-white/10 transition-all hover:bg-indigo-500 hover:-translate-y-1"
              >
                <img src={git} alt="GitHub" className="w-5 h-5 brightness-0 invert" />
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center text-sm mt-16 pt-5 border-t border-white/10 opacity-70">
          <p className="mb-1">
            &copy; {new Date().getFullYear()} AI Chat Moderation System. All Rights Reserved.
          </p>
          <p className="flex justify-center items-center gap-1">
            Designed with <i className="fas fa-heart text-pink-500"></i> by Huzaifa Khan
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;