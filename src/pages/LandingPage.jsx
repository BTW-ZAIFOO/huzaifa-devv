import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import AnnouncementBar from "../components/Landing/AnnouncementBar";
import Navbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import ScrollToTop from "../components/Landing/ScrollToTop";
import PartnersSection from "../components/Landing/PartnersSection";
import ResourcesSection from "../components/Landing/ResourcesSection";
import Section from "../components/Landing/Section";
import HeroSection from "../components/Landing/HeroSection";
import WhyUsSection from "../components/Landing/WhyUsSection";
import ModerationFrameworkSection from "../components/Landing/ModerationFrameworkSection";
import PlatformCapabilitiesSection from "../components/Landing/PlatformCapabilitiesSection";
import SolutionsSuiteSection from "../components/Landing/SolutionsSuiteSection";
import IndustriesSection from "../components/Landing/IndustriesSection";
import IntegrationSection from "../components/Landing/IntegrationSection";
import TestimonialsSection from "../components/Landing/TestimonialsSection";
import ContactSection from "../components/Landing/ContactSection";
import {
  FaBrain,
  FaGlobe,
  FaUserShield,
  FaUniversalAccess,
  FaTools,
  FaFileAlt,
  FaShieldAlt,
  FaRobot,
  FaMobileAlt,
  FaHospital,
  FaUniversity,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";

const SectionIcons = {
  "Cutting-Edge AI": (
    <FaBrain className="text-blue-700 text-4xl mb-4 mx-auto" />
  ),
  "Global Scalability": (
    <FaGlobe className="text-indigo-700 text-4xl mb-4 mx-auto" />
  ),
  "Compliance Leadership": (
    <FaUserShield className="text-purple-700 text-4xl mb-4 mx-auto" />
  ),
  "Universal Accessibility": (
    <FaUniversalAccess className="text-blue-700 text-4xl mb-3 mx-auto" />
  ),
  "Intelligent Moderation Suite": (
    <FaTools className="text-indigo-700 text-4xl mb-3 mx-auto" />
  ),
  "Executive Reporting": (
    <FaFileAlt className="text-purple-700 text-4xl mb-3 mx-auto" />
  ),
  "AI-Driven Risk Audit": (
    <FaShieldAlt className="text-blue-700 text-4xl mb-3 mx-auto" />
  ),
  "Chatbot Remediation": (
    <FaRobot className="text-indigo-700 text-4xl mb-3 mx-auto" />
  ),
  "Omnichannel Monitoring": (
    <FaMobileAlt className="text-purple-700 text-4xl mb-3 mx-auto" />
  ),
  Healthcare: <FaHospital className="text-blue-700 text-3xl mb-3 mx-auto" />,
  Education: <FaUniversity className="text-indigo-700 text-3xl mb-3 mx-auto" />,
  Enterprise: <FaBriefcase className="text-purple-700 text-3xl mb-3 mx-auto" />,
  Communities: <FaUsers className="text-pink-700 text-3xl mb-3 mx-auto" />,
};

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: "ease-in-out-cubic",
      offset: 80,
      mirror: false,
    });
  }, []);

  return (
    <>
      <div
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen"
        style={{ fontFamily: "Roboto, sans-serif" }}
      >
        <AnnouncementBar />
        <Navbar />
        <div>
          <HeroSection />
          <WhyUsSection SectionIcons={SectionIcons} />
          <Section id="solutions" data-aos="fade-up">
            <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
              Our Solutions
            </h1>
            <ModerationFrameworkSection />
            <PlatformCapabilitiesSection SectionIcons={SectionIcons} />
            <SolutionsSuiteSection SectionIcons={SectionIcons} />
          </Section>
          <IndustriesSection SectionIcons={SectionIcons} />
          <IntegrationSection>
            <PartnersSection />
            <ResourcesSection />
          </IntegrationSection>
          <TestimonialsSection />
          <ContactSection />
          <Footer />
        </div>
        <ScrollToTop />
      </div>
    </>
  );
};

export default LandingPage;
