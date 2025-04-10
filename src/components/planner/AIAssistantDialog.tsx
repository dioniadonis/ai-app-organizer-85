
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({ isOpen, onOpenChange }) => {
  const [aiAssistantInput, setAIAssistantInput] = useState('');
  const [aiAssistantConversation, setAIAssistantConversation] = useState<AIConversationMessage[]>([]);

  const handleAIAssistantSubmit = () => {
    if (!aiAssistantInput.trim()) return;
    
    const userMessage: AIConversationMessage = { 
      role: 'user', 
      content: aiAssistantInput 
    };
    const updatedConversation: AIConversationMessage[] = [
      ...aiAssistantConversation,
      userMessage
    ];
    setAIAssistantConversation(updatedConversation);
    
    setAIAssistantInput('');
    
    setTimeout(() => {
      let response: string;
      
      if (aiAssistantInput.toLowerCase().includes('goal')) {
        response = "I can help you set up a goal. What's the title of your goal, and when would you like to complete it? Would you like to add any steps to track progress?";
      } else if (aiAssistantInput.toLowerCase().includes('task')) {
        response = "I'd be happy to help you create a task. What's the task title, due date, and priority level? Should this be a recurring task?";
      } else if (aiAssistantInput.toLowerCase().includes('recurring')) {
        response = "I can set up a recurring task for you. What task would you like to repeat, and how often? (Daily, Weekly, Monthly)";
      } else if (aiAssistantInput.toLowerCase().includes('expense')) {
        response = "I can help you track expenses related to your goals. What's the expense for, and what's the amount? Which goal is this expense related to?";
      } else {
        response = "I'm your AI assistant for planning. I can help you create tasks, set goals, manage recurring tasks, and track expenses. What would you like help with today?";
      }
      
      const assistantMessage: AIConversationMessage = {
        role: 'assistant',
        content: response
      };
      
      setAIAssistantConversation([
        ...updatedConversation,
        assistantMessage
      ]);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Planning Assistant</DialogTitle>
          <DialogDescription className="text-gray-400">
            I can help you create tasks, set goals, and manage your planning
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto flex flex-col space-y-4 p-4 my-2 bg-gray-900/50 rounded-md">
          {aiAssistantConversation.length === 0 ? (
            <div className="text-center text-gray-500 p-6">
              <p>Ask me to help with your planning needs!</p>
              <p className="text-sm mt-2">Examples:</p>
              <ul className="text-xs mt-1 space-y-1">
                <li>"Create a new goal for my project"</li>
                <li>"Add a recurring task for weekly reports"</li>
                <li>"Help me plan my expenses for this month"</li>
              </ul>
            </div>
          ) : (
            aiAssistantConversation.map((message, index) => (
              <div 
                key={index} 
                className={`${
                  message.role === 'user' 
                    ? 'ml-auto bg-purple-600/80' 
                    : 'mr-auto bg-gray-700/80'
                } p-3 rounded-xl max-w-[80%]`}
              >
                {message.content}
              </div>
            ))
          )}
        </div>
        
        <div className="flex gap-2 mt-2">
          <Textarea 
            placeholder="Ask me about tasks, goals, or planning..."
            value={aiAssistantInput}
            onChange={(e) => setAIAssistantInput(e.target.value)}
            className="bg-gray-700 border-gray-600 focus:border-purple-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIAssistantSubmit();
              }
            }}
          />
          <Button 
            onClick={handleAIAssistantSubmit}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Send
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
