
import React, { useState, useEffect } from 'react';
import Planner from '@/components/Planner';
import HolographicTitle from '@/components/HolographicTitle';

const PlannerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <HolographicTitle title="Planner & Goals" />
        <Planner />
        
        <footer className="py-6 text-center text-gray-500 mt-12">
          <p>Loop Space AI Organizer &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default PlannerPage;
