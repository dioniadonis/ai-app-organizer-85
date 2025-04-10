
import React from 'react';
import { motion } from 'framer-motion';

interface HolographicTitleProps {
  title: string;
}

const HolographicTitle: React.FC<HolographicTitleProps> = ({ title }) => {
  return (
    <div className="relative py-4 overflow-hidden">
      <motion.h1 
        className="text-4xl font-bold tracking-tight relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-teal-400 
                       bg-clip-text text-transparent relative hover:scale-105 
                       transition-transform duration-300 inline-block">
          {title}
        </span>
      </motion.h1>
      
      {/* Holographic effect elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 
                    blur-xl rounded-full scale-110 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 
                    blur-md rounded-full scale-125 animate-pulse" 
           style={{ animationDelay: '500ms' }}></div>
    </div>
  );
};

export default HolographicTitle;
