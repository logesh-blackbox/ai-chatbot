'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'Lightning Fast Responses',
    description: 'Get instant answers powered by cutting-edge AI models that understand context and nuance.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Multi-Modal Support',
    description: 'Work with text, images, and code seamlessly in a unified conversational interface.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Smart Context Awareness',
    description: 'Our AI remembers your conversation history and maintains context across sessions.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    title: 'Advanced Code Generation',
    description: 'Generate, debug, and optimize code in multiple programming languages with ease.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Secure & Private',
    description: 'Enterprise-grade security with end-to-end encryption and data privacy compliance.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    title: 'Team Collaboration',
    description: 'Share conversations, insights, and AI-generated content with your team effortlessly.',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                work smarter
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to enhance your productivity and streamline your workflow.
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
            >
              <div className="relative z-10">
                <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                  <div className="size-6 rounded-full bg-white/20" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-24 grid grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {[
            { value: '10M+', label: 'Messages Processed' },
            { value: '50K+', label: 'Active Users' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Support' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
