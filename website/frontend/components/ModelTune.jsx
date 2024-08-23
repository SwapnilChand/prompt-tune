"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import components that might cause hydration issues
const DynamicPromptLibrary = dynamic(() => import("./PromptLibrary"), {
  ssr: false,
});
// const DynamicAttachedFiles = dynamic(() => import('./AttachedFiles'), { ssr: false });
const DynamicCompare = dynamic(() => import("./Compare"), { ssr: false });

import PromptLibrary from "./PromptLibrary";
import AttachedFiles from "./AttachedFiles";
import Compare from "./Compare";
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
  PlusIcon,
  SendIcon,
  XIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { sendMessage } from "./KaizenApi";

const customResponse = (inputText) => {
  const inputLower = inputText.toLowerCase().trim();
  const words = inputLower.split(/\s+/);

  // Check if the input is short (3 words or less) or seems like a greeting
  if (
    words.length <= 3 ||
    /^(hi|hello|hey|ola|hola|greetings|sup|yo)/i.test(inputLower)
  ) {
    return "Hi there! I'm PromptTune, an AI assistant specialized in helping you craft better prompts for AI models. Whether you're saying hello in any language or just dropping by, I'm here to help! How can I assist you today with improving your prompts or answering questions about AI?";
  }

  return null; // Not a short input or greeting, proceed with normal LLM processing
};

const ThinkingAnimation = () => (
  <div className="flex items-center space-x-1 text-gray-400">
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0s" }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0.2s" }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: "0.4s" }}
    ></div>
  </div>
);
const Popup = ({ onClose, onSubmit }) => {
  const [modelName, setModelName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiBase, setApiBase] = useState("");

  const handleSubmit = () => {
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
const ModelTune = () => {
  const { toast } = useToast();
  const [chatBoxes, setChatBoxes] = useState([
    { id: 1, messages: [], model: "" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [newModel, setNewModel] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const chatBoxRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);

  const addChatBox = () => {
    if (chatBoxes.length >= 4) {
      toast({
        title: "Limit Reached",
        description: "You can only have up to 4 chat boxes.",
        action: (
          <ToastAction
            altText="Dismiss"
            onClick={() => console.log("Toast dismissed")}
          >
            Dismiss
          </ToastAction>
        ),
      });
      return;
    }
    const newId = chatBoxes.length + 1;
    setChatBoxes([...chatBoxes, { id: newId }]);
  };

  const removeChatBox = (id) => {
    setChatBoxes(chatBoxes.filter((box) => box.id !== id));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleModelChange = (id, model) => {
    setShowWarning(true);
    setSelectedModelId(id);
    setNewModel(model);
  };

  const confirmModelChange = () => {
    setChatBoxes(
      chatBoxes.map((box) =>
        box.id === selectedModelId
          ? { ...box, model: newModel, messages: [] }
          : box
      )
    );
    setShowWarning(false);
    setSelectedModelId(null);
    setNewModel("");
  };

  const cancelModelChange = () => {
    setShowWarning(false);
    setSelectedModelId(null);
    setNewModel("");
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      return;
    } // Ensure there's a message to send
    setInputMessage(""); // Clear the input message immediately
    setMessageSent(true); // Set messageSent to true when a message is sent
    setIsThinking(true); // Set isThinking to true to show the animation

    const updatedChatBoxes = await Promise.all(
      chatBoxes.map(async (box) => {
        const userMessage = { role: "user", content: inputMessage };
        const updatedMessages = [...box.messages, userMessage];
        const customResp = customResponse(inputMessage);
        if (customResp) {
          // It's a short input or potential greeting, use the custom response
          const aiMessage = { role: "assistant", content: customResp };
          updatedMessages.push(aiMessage);
        } else {
          // It's a longer input, send to LLM
          try {
            const response = await sendMessage(inputMessage, box.model);
            const aiMessage = { role: "assistant", content: response.message };
            updatedMessages.push(aiMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            toast({
              title: "Error",
              description: "Failed to send message. Please try again.",
              variant: "destructive",
            });
          }
        }

        return {
          ...box,
          messages: updatedMessages,
        };
      })
    );

    setChatBoxes(updatedChatBoxes);
    setIsThinking(false); // Set isThinking to false after processing

    // Scroll to the bottom of the chatbox
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
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
              <SelectValue placeholder="Select LLM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt3">GPT-3</SelectItem>
              <SelectItem value="gpt4">GPT-4</SelectItem>
              <SelectItem value="claude">Claude</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowPopup(true)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
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
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600">
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600">
                  <ClockIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View conversation history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
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
        {isThinking && (
          <div className="justify-left bg-indigo-500 text-white">
            <ThinkingAnimation />
          </div>
        )}
      </div>
      {showPopup && (
        <Popup
          onClose={() => setShowPopup(false)}
          onSubmit={(newModel) => {
            console.log(newModel);
          }}
        />
      )}
    </div>
  );

  if (!isClient) {
    return null;
  }

  const handlePlusButtonClick = () => {
    setShowPopup(true);
  };
  return (
    <>
      <div>
        <div className="container mx-auto p-4 mt-4" ref={chatBoxRef}>
          <div className="grid grid-cols-1 gap-4">
            {chatBoxes.map(renderChatBox)}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
            <div className="flex items-center space-x-2">
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
              {/* <DynamicAttachedFiles /> */}
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
                    <p>send to all instances</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {showWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-blue-900 p-6 rounded-lg shadow-lg">
                <h2 className="text-lg text-red font-bold">Warning</h2>
                <p>
                  Changing the model will reset the chat. All previous context
                  will be lost. Would you like to continue?
                </p>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={cancelModelChange}
                    className="mr-2"
                  >
                    No
                  </Button>
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

export default ModelTune;
