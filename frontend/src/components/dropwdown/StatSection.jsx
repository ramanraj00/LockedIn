import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "200+", label: "Registered Users" },
  { value: "100+", label: "Online Users" },
  { value: "8+", label: "Features" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function StatsSection() {
  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12">
      <motion.div
        className="flex flex-wrap items-center justify-center gap-10 md:gap-16 lg:gap-24 border border-gray-200 bg-gray-300 shadow-xl rounded-3xl py-8 px-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex flex-col items-center cursor-default select-none"
          >
            <span className="text-5xl sm:text-6xl font-black text-black tracking-tight leading-none">
              {stat.value}
            </span>
            <span className="mt-2 text-sm sm:text-base text-black font-medium tracking-wide">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default StatsSection;