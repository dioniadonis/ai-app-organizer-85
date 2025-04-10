
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomStepInputProps {
  initialSteps?: string[];
  onChange: (steps: string[]) => void;
}

const CustomStepInput: React.FC<CustomStepInputProps> = ({ initialSteps = [], onChange }) => {
  const [steps, setSteps] = useState<string[]>(initialSteps);
  const [newStep, setNewStep] = useState('');

  const handleAddStep = () => {
    if (newStep.trim()) {
      const updatedSteps = [...steps, newStep.trim()];
      setSteps(updatedSteps);
      setNewStep('');
      onChange(updatedSteps);
    }
  };

  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    onChange(updatedSteps);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStep();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Add a step..."
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-gray-700 border-gray-600"
        />
        <Button 
          type="button" 
          onClick={handleAddStep}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {steps.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-sm text-gray-400">Steps:</p>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700/30 p-2 rounded-md">
                <span className="text-sm flex-1">{step}</span>
                <Button 
                  type="button" 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveStep(index)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomStepInput;
