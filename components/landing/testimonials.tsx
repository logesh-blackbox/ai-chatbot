'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    content: 'This AI chat platform has completely transformed how our team works. The responses are incredibly accurate and the interface is intuitive.',
    author: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
  },
  {
    content: 'The code generation capabilities are outstanding. It has cut our development time in half and helped us ship features faster.',
    author: 'Michael Chen',
    role: 'Lead Developer',
    company: 'StartupXYZ',
  },
  {
    content: 'Best AI chatbot I have used. The context awareness and multi-modal support make it stand out from the competition.',
    author: 'Emily Rodriguez',
    role: 'Content Strategist',
    company: 'Creative Agency',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                thousands of users
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say about their experience.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6">
                <svg
                  className="size-8 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {testimonial.content}
              </p>
              <div className="flex items-center">
                <div className="size-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-sm">{testimonial.author}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
