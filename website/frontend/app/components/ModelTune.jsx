"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
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
import { XIcon, PlusIcon, SendIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendModelMessage, addLLM } from "./KaizenApi";

const DynamicPromptLibrary = dynamic(() => import("./PromptLibrary"), {
  ssr: false,
});
const DynamicCompare = dynamic(() => import("./Compare"), { ssr: false });

const customResponse = (inputText) => {
  const inputLower = inputText.toLowerCase().trim();
  const words = inputLower.split(/\s+/);

  if (
    words.length <= 3 ||
    /^(hi|hello|hey|ola|hola|greetings|sup|yo)/i.test(inputLower)
  ) {
    return "Hi there! I'm PromptTune, an AI assistant specialized in helping you craft better prompts for AI models. How can I assist you today with improving your prompts or answering questions about AI?";
  }

  return null;
};

const ThinkingAnimation = () => (
  <div className="flex items-center space-x-1 text-gray-400">
    {[0, 0.2, 0.4].map((delay, index) => (
      <div
        key={index}
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: `${delay}s` }}
      ></div>
    ))}
  </div>
);

const Popup = ({ onClose, onSubmit }) => {
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiBase, setApiBase] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!modelName || !apiKey) {
      toast({
        title: "Error",
        description: "Model name and API key are required.",
        variant: "destructive",
      });
      return;
    }
    onSubmit({ modelName, apiKey, apiBase });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Add New Model</h2>
        <input
          type="text"
          placeholder="Model Name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="API Base (optional)"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default function ModelTune() {
  const { toast } = useToast();
  const [chatBoxes, setChatBoxes] = useState(() => {
    if (typeof window !== "undefined") {
      const savedHistory = sessionStorage.getItem("modelTuneHistory");
      return savedHistory
        ? JSON.parse(savedHistory)
        : [{ id: 1, model: "", messages: [] }];
    }
    return [{ id: 1, model: "", messages: [] }];
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatBoxRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [llmOptions, setLlmOptions] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("modelTuneHistory", JSON.stringify(chatBoxes));
    }
  }, [chatBoxes]);

  const addChatBox = () => {
    if (chatBoxes.length >= 4) {
      toast({
        title: "Limit Reached",
        description: "You can only have up to 4 chat boxes.",
      });
      return;
    }
    const newId = Math.max(...chatBoxes.map((box) => box.id), 0) + 1;
    setChatBoxes([...chatBoxes, { id: newId, model: "", messages: [] }]);
  };

  const removeChatBox = (id) => {
    setChatBoxes(chatBoxes.filter((box) => box.id !== id));
  };

  const handleModelChange = async (id, model) => {
    const confirmed = window.confirm(
      "Changing the model will reset the chat. All previous context will be lost. Would you like to continue?"
    );
    if (confirmed) {
      setChatBoxes(
        chatBoxes.map((box) =>
          box.id === id ? { ...box, model, messages: [] } : box
        )
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsThinking(true);
    const userMessage = { role: "user", content: inputMessage };

    const updatedChatBoxes = await Promise.all(
      chatBoxes.map(async (box) => {
        const updatedMessages = [...box.messages, userMessage];
        const customResp = customResponse(inputMessage);

        if (customResp) {
          updatedMessages.push({ role: "assistant", content: customResp });
        } else if (box.model) {
          try {
            const response = await sendModelMessage(inputMessage, box.model);
            updatedMessages.push({
              role: "assistant",
              content: response.message,
            });
          } catch (error) {
            console.error("Error sending message:", error);
            toast({
              title: "Error",
              description: `Failed to send message to ${box.model}. Please try again.`,
              variant: "destructive",
            });
          }
        }

        return { ...box, messages: updatedMessages };
      })
    );

    setChatBoxes(updatedChatBoxes);
    setInputMessage("");
    setIsThinking(false);

    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  const handleAddNewModel = async (newModel) => {
    try {
      await addLLM(newModel.modelName, newModel.apiKey, newModel.apiBase);
      setLlmOptions((prev) => [...prev, newModel.modelName]);
      toast({
        title: "Success",
        description: `Added new model: ${newModel.modelName}`,
      });
    } catch (error) {
      console.error("Error adding new model:", error);
      toast({
        title: "Error",
        description: "Failed to add new model. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderChatBox = ({ id, messages, model }) => (
    <div key={id} className="border rounded-lg p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select
            value={model}
            onValueChange={(value) => handleModelChange(id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={
                  llmOptions.length === 0 ? "No LLMs added" : "Select a model"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {llmOptions.length === 0 ? (
                <SelectItem value="no-llms" disabled>
                  No LLMs added
                </SelectItem>
              ) : (
                llmOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPopup(true)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="text-white bg-blue-500 hover:bg-blue-600"
                onClick={() => removeChatBox(id)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close instance</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className="space-y-2 ml-2 overflow-y-auto"
        style={{ maxHeight: "300px" }}
      >
        {messages.map((message, index) => (
          <p
            key={index}
            className={`p-3 rounded-lg ${
              message.role === "user"
                ? "bg-gray-200 text-gray-800 rounded-br-none ml-auto max-w-[70%]"
                : "bg-indigo-500 text-white rounded-bl-none mr-auto max-w-[70%]"
            }`}
          >
            {message.content}
          </p>
        ))}
        {isThinking && (
          <div className="bg-indigo-500 text-white p-3 rounded-lg mr-auto max-w-[70%]">
            <ThinkingAnimation />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 mt-4 flex flex-col h-screen">
      <style jsx global>{`
        /* Customize scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 20px;
          border: transparent;
        }
      `}</style>
      <div className="flex-grow overflow-y-auto mb-4" ref={chatBoxRef}>
        <div className="grid grid-cols-1 gap-4 pb-20">
          {chatBoxes.map(renderChatBox)}
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background p-4 border-t">
        <div className="flex items-center space-x-2 max-w-6xl mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="text-white bg-blue-500 hover:bg-blue-600"
                  onClick={addChatBox}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new LLM chat box</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DynamicPromptLibrary />
          <input
            type="text"
            className="flex-grow border rounded-lg px-4 py-2 text-black"
            placeholder="Type your message here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <DynamicCompare />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="text-white bg-blue-500 hover:bg-blue-600"
                  onClick={handleSendMessage}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Send to all instances</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {showPopup && (
        <Popup
          onClose={() => setShowPopup(false)}
          onSubmit={handleAddNewModel}
        />
      )}
    </div>
  );
}
