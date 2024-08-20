"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

// Dynamically import components that might cause hydration issues
const DynamicPromptLibrary = dynamic(() => import('./PromptLibrary'), { ssr: false });
const DynamicAttachedFiles = dynamic(() => import('./AttachedFiles'), { ssr: false });
const DynamicCompare = dynamic(() => import('./Compare'), { ssr: false });

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
import { sendMessage } from './KaizenApi';

const customResponse = (inputText) => {
  const inputLower = inputText.toLowerCase().trim();
  const words = inputLower.split(/\s+/);

  // Check if the input is short (3 words or less) or seems like a greeting
  if (words.length <= 3 || /^(hi|hello|hey|ola|hola|greetings|sup|yo)/i.test(inputLower)) {
    return "Hi there! I'm PromptTune, an AI assistant specialized in helping you craft better prompts for AI models. Whether you're saying hello in any language or just dropping by, I'm here to help! How can I assist you today with improving your prompts or answering questions about AI?";
  }

  return null; // Not a short input or greeting, proceed with normal LLM processing
};

const ThinkingAnimation = () => (
  <div className="flex items-center space-x-1 text-gray-400">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const PromptTune = () => {
  const { toast } = useToast();
  const [chatBoxes, setChatBoxes] = useState([{ id: 1, messages: [], model: '' }]); // Initial model value set to empty string
  const [inputMessage, setInputMessage] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [newModel, setNewModel] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
     if (!inputMessage.trim()) {return}
    //     toast({
    //         title: "Warning",
    //         description: "Please type a message before sending.",
    //         variant: "destructive",
    //     });
    //     return; // Prevent sending if the message is emptyty
    // }

    // if (!selectedModelId) { // Check if LLM is selected
    //     toast({
    //         title: "Warning",
    //         description: "LLM not selected. Please select an LLM before sending.",
    //         variant: "destructive",
    //     });
    //     return; // Prevent sending if no LLM is selecteded
    // }

    // setIsThinking(true);
    const updatedChatBoxes = await Promise.all(chatBoxes.map(async (box) => {
      const userMessage = { role: 'user', content: inputMessage };
      const updatedMessages = [...box.messages, userMessage];
      const customResp = customResponse(inputMessage);
      if (customResp) {
        // It's a short input or potential greeting, use the custom response
        const aiMessage = { role: 'assistant', content: customResp };
        updatedMessages.push(aiMessage);
      } else {
        // It's a longer input, send to LLM
        try {
          const response = await sendMessage(inputMessage, box.model);
          const aiMessage = { role: 'assistant', content: response.message };
          updatedMessages.push(aiMessage);
        } catch (error) {
          console.error('Error sending message:', error);
          toast({
            title: "Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive",
          });
        }
      }

      return {
        ...box,
        messages: updatedMessages
      };
    }));

    setChatBoxes(updatedChatBoxes);
    setInputMessage('');
    setIsThinking(false);
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
      <div className="space-y-4 mr-2">
        {messages.map((message, index) => (
            <div key={index} className={`p-3 rounded-lg max-w-[70%] ${
              message.role === 'user'
                ? 'bg-gray-200 text-gray-800 rounded-br-none ml-auto' 
                : 'bg-indigo-500 text-white rounded-bl-none mr-auto' 
            }`}>
              <p>{message.content}</p>
            </div>
          ))}
        {isThinking && (
          <div className="flex justify-center">
            <ThinkingAnimation />
          </div>
        )}
      </div>
    </div>
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div>
        <div className="container mx-auto p-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            {chatBoxes.map(renderChatBox)}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
            <div className="flex items-center space-x-2">
              <DynamicPromptLibrary />
              <DynamicAttachedFiles />
              <input
                type="text"
                className="flex-grow border rounded-lg px-4 py-2 text-black"
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <DynamicCompare/>
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
    </>
  );
};

export default PromptTune;