"use client";
import { useState } from "react";
import PromptLibrary from './PromptLibrary';
import AttachedFiles from './AttachedFiles';
import Compare from './Compare';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ShareIcon,
  ClockIcon,
  WandIcon,
  SendIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { sendMessage} from './kaizenApi';

const PromptTune = () => {
  const { toast } = useToast();
  const [chatBoxes, setChatBoxes] = useState([{ id: 1, messages: [], model: 'gpt3' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [newModel, setNewModel] = useState('');

  const handleModelChange = (id, model) => {
    setSelectedModelId(id);
    setNewModel(model);
    setShowWarning(true);
  };

  const confirmModelChange = () => {
    setChatBoxes(chatBoxes.map(box =>
      box.id === selectedModelId ? { ...box, model: newModel, messages: [] } : box
    ));
    setShowWarning(false);
    setSelectedModelId(null);
    setNewModel('');
  };

  const cancelModelChange = () => {
    setShowWarning(false);
    setSelectedModelId(null);
    setNewModel('');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {return};

    try {
      const updatedChatBoxes = chatBoxes.map(box => {
        const userMessage = { role: 'user', content: inputMessage };
        return {
          ...box,
          messages: [...box.messages, userMessage]
        };
      });

      setChatBoxes(updatedChatBoxes);
      setInputMessage('');

      toast({
        title: "Analysis Complete",
        description: "Code scan and unit tests have been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze code and generate unit tests",
        status: "error",
      });
    }
  };

  const renderChatBox = ({ id, messages, model }) => (
    <div key={id} className="border rounded-lg p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-4">
        <Select value={model} onValueChange={(value) => handleModelChange(id, value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select LLM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt3">GPT-3</SelectItem>
            <SelectItem value="gpt4">GPT-4</SelectItem>
            <SelectItem value="claude">Claude</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-white bg-blue-500 hover:bg-blue-600"
                >
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-white bg-blue-500 hover:bg-blue-600"
                >
                  <ClockIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View conversation history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {/* Message rendering can be added back if needed */}
    </div>
  );

  return (
    <div>
      <div className="container mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 gap-4">
          {chatBoxes.map(renderChatBox)}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
          <div className="flex items-center space-x-2">
            <PromptLibrary />
            <AttachedFiles />
            <input
              type="text"
              className="flex-grow border rounded-lg px-4 py-2 text-black"
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Compare/>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button className="text-white bg-blue-500 hover:bg-blue-600" onClick={handleSendMessage}>
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send prompt to all instances</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Warning Overlay */}
        {showWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
              <h2 className="text-lg text-red font-bold">Warning</h2>
              <p>Changing the model will reset the chat. All previous context will be lost. Would you like to continue?</p>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={cancelModelChange} className="mr-2">No</Button>
                <Button onClick={confirmModelChange}>Yes</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptTune;