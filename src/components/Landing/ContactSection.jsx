import React, { useState } from "react";
import Section from "./Section";

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your inquiry!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Section id="contact" data-aos="fade-up">
      <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
        Contact & FAQs
      </h1>
      <div className="mb-12 transition-all duration-700" data-aos="fade-right">
        <h3 className="text-2xl text-center font-semibold text-blue-700 mb-4">
          Frequently Asked Questions
        </h3>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-8">
          <h4 className="font-bold mb-4">What makes // AICHATBOT // unique?</h4>
          <p className="text-gray-600 mb-6">
            Our platform combines state-of-the-art AI, enterprise-grade
            security, and regulatory expertise to deliver unmatched moderation
            outcomes.
          </p>
          <h4 className="font-bold mb-4">How do I get started?</h4>
          <p className="text-gray-600 mb-6">
            Schedule a live demo or connect with our team to discuss your
            organization's needs.
          </p>
        </div>
      </div>
      <div className="transition-all duration-700" data-aos="fade-left">
        <h3 className="text-2xl text-center font-semibold text-blue-700 mb-4">
          Connect with Our Team
        </h3>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <input
                type="text"
                name="name"
                aria-label="Your Name"
                placeholder="Your Name"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl mb-3 text-lg"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                aria-label="Your Email"
                placeholder="Your Email"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl mb-3 text-lg"
                value={form.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                aria-label="Your Message"
                placeholder="Your Message"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl text-lg"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="px-10 py-3 bg-blue-700 text-white rounded-xl font-bold shadow hover:bg-blue-800"
            >
              Submit Inquiry
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}

export default ContactSection;
