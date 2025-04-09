
import React from 'react';
import { BrainCircuit, Zap, Code2, MessageSquare, Image } from 'lucide-react';

export const getAIToolIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'general ai':
      return <BrainCircuit className="w-5 h-5" />;
    case 'writing':
      return <Zap className="w-5 h-5" />;
    case 'image generation':
      return <Image className="w-5 h-5" />;
    case 'code generation':
      return <Code2 className="w-5 h-5" />;
    case 'chatbots':
      return <MessageSquare className="w-5 h-5" />;
    default:
      return <BrainCircuit className="w-5 h-5" />;
  }
};
