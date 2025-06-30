import React from "react";
import Section from "./Section";

const testimonials = [
  {
    name: "Alexis Roy, CTO",
    avatar: "🧑",
    feedback:
      "AICHATBOT has set a new standard for digital trust and safety. Our user engagement and compliance scores have never been higher.",
  },
];

const TestimonialsSection = () => (
  <Section id="testimonials" data-aos="fade-up">
    <h1 className="text-5xl font-extrabold pb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 font-sans drop-shadow-lg">
      Testimonials
    </h1>
    <div className="flex flex-wrap justify-center gap-10">
      {testimonials.map((testimonial, idx) => (
        <article
          key={idx}
          className="p-8 w-96 text-center transition-all duration-700"
          data-aos="zoom-in"
          data-aos-delay={200 + idx * 100}
        >
          <span className="text-5xl mb-4 block" role="img" aria-label="user">
            {testimonial.avatar}
          </span>
          <h5 className="font-bold mb-2">{testimonial.name}</h5>
          <p className="text-gray-600 text-base mb-2">
            "{testimonial.feedback}"
          </p>
        </article>
      ))}
    </div>
  </Section>
);

export default TestimonialsSection;
