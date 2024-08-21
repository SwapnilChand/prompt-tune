"use client"; 
import { useState } from "react"; 
import PromptLibrary from './PromptLibrary'; 
import AttachedFiles from './AttachedFiles'; 
import Compare from './Compare'; 
import { Button } from "@/components/ui/button"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import { PinIcon, ShareIcon, ClockIcon, XIcon, WandIcon, SendIcon, FolderTree, Plus } from "lucide-react"; 
import { useToast } from "@/components/ui/use-toast"; 
import { ToastAction } from "@/components/ui/toast"; 
import { sendMessage } from './kaizenApi'; 

const ModelTune = () => { 
    const { toast } = useToast(); 
    const [chatBoxes, setChatBoxes] = useState([{ id: 1 }]); 
    const [inputMessage, setInputMessage] = useState(''); 

    const addChatBox = () => { 
        if (chatBoxes.length >= 4) { 
            toast({ 
                title: "Limit Reached", 
                description: "You can only have up to 4 chat boxes.", 
                action: ( 
                    <ToastAction altText="Dismiss" onClick={() => console.log("Toast dismissed")}> 
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

    const handleModelChange = (id, model) => { 
        setChatBoxes(chatBoxes.map(box => box.id === id ? { ...box, model } : box)); 
    }; 

    const handleSendMessage = async () => { 
        if (!inputMessage.trim()) { return; } 
        const updatedChatBoxes = chatBoxes.map(box => { 
            const userMessage = { role: 'user', content: inputMessage }; 
            return { ...box, messages: [...(box.messages || []), userMessage] }; 
        }); 
        setChatBoxes(updatedChatBoxes); 
        setInputMessage(''); 
        toast({ 
            title: "Analysis Complete", 
            description: "Code scan and unit tests have been generated.", 
        }); 
    }; 

    const renderChatBox = ({ id, messages = [], model }) => ( 
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
                                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600">
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
                                <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600">
                                    <ClockIcon className="h-4 w-4" />
                                </Button>
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
                                <p>Close instance</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            
            <div className="h-64 bg-muted overflow-y-auto p-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                            {msg.content}
                        </span>
                    </div>
                ))}
            </div>
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
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600" onClick={addChatBox}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add a new LLM chat box</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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
                        <Compare />
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
            </div>
        </div>
    ); 
}; 

export default ModelTune;