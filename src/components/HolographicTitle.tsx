
import React from 'react';

interface HolographicTitleProps {
  title: string;
}

const HolographicTitle: React.FC<HolographicTitleProps> = ({ title }) => {
  return (
    <div className="py-3">
      <h1 className="text-3xl font-medium text-white">
        {title}
      </h1>
    </div>
  );
};

export default HolographicTitle;
