
import React from 'react';

interface HolographicTitleProps {
  title: string;
}

const HolographicTitle: React.FC<HolographicTitleProps> = ({ title }) => {
  return (
    <div className="relative py-4">
      <h1 className="text-4xl font-bold tracking-tight text-white">
        {title}
      </h1>
    </div>
  );
};

export default HolographicTitle;
