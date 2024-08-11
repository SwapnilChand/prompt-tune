'use client'

import { useState } from 'react';
import Header from "@/components/header"; // Corrected import
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PinIcon, ShareIcon, ClockIcon, XIcon, WandIcon, SendIcon } from 'lucide-react';

const PromptTune = () => {
  const [chatBoxes, setChatBoxes] = useState([{ id: 1 }]);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);

  const addChatBox = () => {
    const newId = chatBoxes.length + 1;
    setChatBoxes([...chatBoxes, { id: newId }]);
  };

  const removeChatBox = (id) => {
    setChatBoxes(chatBoxes.filter(box => box.id !== id));
  };

  const renderChatBox = ({ id }) => (
    <div key={id} className="border rounded-lg p-4 mb-4 relative">
      <div className="flex justify-between items-center mb-4">
        <Select>
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
                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600"> <ShareIcon className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600"><ClockIcon className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View conversation history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600" onClick={() => removeChatBox(id)}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close this LLM chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="h-64 bg-muted"></div>
    </div>
  );

  return (
    <div>
      <Header title="PromptTune" />
      <div className="container mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 gap-4">
          {chatBoxes.map(renderChatBox)}
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-background p-4">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600" onClick={addChatBox}>+ LLM</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add a new LLM chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Dialog open={showPromptLibrary} onOpenChange={setShowPromptLibrary}>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600"><WandIcon className="h-4 w-4 mr-2" />Prompt Library</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open prompt library</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent>
                <h2>Prompt Library</h2>
                <p>You have no prompts.</p>
                <Button className="text-white bg-blue-500 hover:bg-blue-600">Create new prompt</Button>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600"><PinIcon className="h-4 w-4"/></Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach a file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <input type="text" className="flex-grow border rounded-lg px-4 py-2" placeholder="Type your message here..." />
            <Dialog open={showComparePopup} onOpenChange={setShowComparePopup}>
              <DialogTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600">Compare</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compare responses from different LLMs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTrigger>
              <DialogContent>
                <h2>Compare Responses</h2>
                <p>Comparison results will be shown here.</p>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="text-white bg-blue-500 hover:bg-blue-600"><SendIcon className="h-4 w-4 mr-2" />Send</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message to all active LLM chats</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptTune;