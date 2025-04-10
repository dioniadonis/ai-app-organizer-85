
import React from 'react';
import { MessageSquareDot } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  aiResponse: string;
  isAiProcessing: boolean;
  processAIPrompt: () => void;
}

const AIAssistantDialog: React.FC<AIAssistantDialogProps> = ({
  open,
  onOpenChange,
  aiPrompt,
  setAiPrompt,
  aiResponse,
  isAiProcessing,
  processAIPrompt
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="ai-gradient-text flex items-center gap-2">
            <MessageSquareDot className="h-5 w-5 text-ai-cyan" />
            AI Assistant
          </DialogTitle>
          <DialogDescription>
            Ask questions about your subscriptions or add new items using natural language
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 max-h-[300px] overflow-y-auto">
          {aiResponse ? (
            <div className="whitespace-pre-line">{aiResponse}</div>
          ) : (
            <div className="text-gray-400 text-center">
              Ask me about your subscriptions, tasks, or to add new items
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask a question or give a command..."
              className="bg-black/20 border-gray-700 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  processAIPrompt();
                }
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Try: "What's my total monthly cost?" or "Add subscription Netflix $15.99 on 2023-04-15"
            </div>
          </div>
          <Button 
            disabled={isAiProcessing || !aiPrompt.trim()} 
            onClick={processAIPrompt}
            className="bg-ai-cyan hover:bg-ai-cyan/90"
          >
            {isAiProcessing ? "Processing..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
