import React from "react";
import Section from "./Section";

const testimonials = [
  {
    name: "Alexis Roy, CTO",
    avatar: "🧑",
    feedback:
      "AIChatBOT has set a new standard for digital trust and safety. Our user engagement and compliance scores have never been higher.",
  },
];

const TestimonialsSection = () => (
  <Section
    title="Testimonials"
    id="testimonials"
    className="bg-white/60 rounded-2xl shadow-lg my-16"
    data-aos="fade-up"
  >
    <div className="flex flex-wrap justify-center gap-10">
      {testimonials.map((testimonial, idx) => (
        <article
          key={idx}
          className="bg-white rounded-2xl shadow-lg p-8 w-96 text-center transition-all duration-700"
          data-aos="zoom-in"
          data-aos-delay={200 + idx * 100}
        >
          <span
            className="text-5xl mb-4 block"
            role="img"
            aria-label="user"
          >
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
