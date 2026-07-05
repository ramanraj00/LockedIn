import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "200+", label: "Registered Users" },
  { value: "100+", label: "Active Users" },
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
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function StatsSection() {
  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-12">
      <motion.div
        className="
          relative
          flex flex-wrap items-center justify-center
          gap-10 md:gap-16 lg:gap-24
          rounded-3xl
          border border-white/10
          bg-white/10
          backdrop-blur-[2px]
          shadow-xl
          py-8
          px-6

          before:content-['']
          before:absolute
          before:inset-0
          before:rounded-3xl
          before:border
          before:border-white/20
          before:pointer-events-none
        "
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
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
            }}
            className="flex flex-col items-center cursor-default select-none"
          >
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
              {stat.value}
            </span>

            <span className="mt-2 text-sm sm:text-base font-medium tracking-wide text-white/70">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default StatsSection;