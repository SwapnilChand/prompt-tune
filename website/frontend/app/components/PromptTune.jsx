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
import { PlusIcon, SendIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendMessage, addLLM } from "./KaizenApi";

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
    return "Hi there! I'm PromptTune, an AI assistant specialized in helping you craft better prompts for AI models. Whether you're saying hello in any language or just dropping by, I'm here to help! How can I assist you today with improving your prompts or answering questions about AI?";
  }

  return null;
};

const ThinkingAnimation = () => (
  <div className="justify-left bg-indigo-500 text-white p-3 rounded-lg ml-auto max-w-[50%]">
    <div className="flex items-center space-x-1">
      {[0, 0.2, 0.4].map((delay, index) => (
        <div
          key={index}
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: `${delay}s` }}
        ></div>
      ))}
    </div>
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
        title: "Warning",
        description: "Model Name and API Key are required.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ modelName, apiKey, apiBase });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg text-black font-semibold mb-2">Add New Model</h2>
        <input
          type="text"
          placeholder="Model Name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full mb-2 p-2 border rounded text-black"
        />
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full mb-2 p-2 border rounded text-black"
        />
        <input
          type="text"
          placeholder="API Base (optional)"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          className="w-full mb-4 p-2 border rounded text-black"
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

export default function PromptTune() {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("");
  const [chatBoxes, setChatBoxes] = useState([
    { id: 1, messages: [], model: "" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const chatBoxRef = useRef(null);
  const [llms, setLlms] = useState([]);

  useEffect(() => {
    const savedHistory = sessionStorage.getItem("promptTuneHistory");
    if (savedHistory) {
      setChatBoxes(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("promptTuneHistory", JSON.stringify(chatBoxes));
  }, [chatBoxes]);

  const handleModelChange = (id, model) => {
    setSelectedModel(model);
    setChatBoxes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, model } : box))
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsThinking(true);
    const userMessage = { role: "user", content: inputMessage };

    const customReply = customResponse(inputMessage);
    if (customReply) {
      setChatBoxes((prev) =>
        prev.map((box) =>
          box.model === selectedModel
            ? {
                ...box,
                messages: [
                  ...box.messages,
                  userMessage,
                  { role: "assistant", content: customReply },
                ],
              }
            : box
        )
      );
      setInputMessage("");
      setIsThinking(false);
      return;
    }

    try {
      const response = await sendMessage(inputMessage, selectedModel);
      const aiMessage = { role: "assistant", content: response.message };
      setChatBoxes((prev) =>
        prev.map((box) =>
          box.model === selectedModel
            ? {
                ...box,
                messages: [...box.messages, userMessage, aiMessage],
              }
            : box
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInputMessage("");
      setIsThinking(false);
    }
  };

  const handleSubmit = async (newModel) => {
    try {
      await addLLM(newModel);
      setLlms((prev) => [...prev, newModel.modelName]);
      toast({
        title: "Success",
        description: "New model added successfully.",
      });
    } catch (error) {
      console.error("Error adding new model:", error);
      toast({
        title: "Error",
        description: "Failed to add new model. Please try again.",
        variant: "destructive",
      });
    }
    setShowPopup(false);
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
                placeholder={llms.length === 0 ? "No LLMs added" : model}
              />
            </SelectTrigger>
            <SelectContent>
              {llms.length === 0 ? (
                <SelectItem value="placeholder" disabled>
                  No LLMs added
                </SelectItem>
              ) : (
                llms.map((llm, index) => (
                  <SelectItem key={index} value={llm}>
                    {llm}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPopup(true)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="space-y-2 ml-2"
        style={{
          maxHeight: "calc(100vh - 275px)",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        {messages.map((message, index) => (
          <p
            key={index}
            className={`p-3 rounded-lg ${
              message.role === "user"
                ? "bg-gray-200 text-gray-800 rounded-br-none ml-auto max-w-[30%]"
                : "bg-indigo-500 text-white rounded-bl-none mr-auto max-w-[50%]"
            }`}
          >
            {message.content}
          </p>
        ))}
        {isThinking && <ThinkingAnimation />}
      </div>
    </div>
  );

  return (
    <div>
      <div className="container mx-auto p-4 mt-4" ref={chatBoxRef}>
        <div className="grid grid-cols-1 gap-4">
          {chatBoxes.map(renderChatBox)}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
          <div className="flex items-center space-x-2">
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
                <TooltipTrigger>
                  <Button
                    className="text-white bg-blue-500 hover:bg-blue-600"
                    onClick={handleSendMessage}
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {showPopup && (
        <Popup onClose={() => setShowPopup(false)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
