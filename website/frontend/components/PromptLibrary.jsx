import { useState } from "react";
import Header from "@/components/Header";
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
  PinIcon,
  ShareIcon,
  ClockIcon,
  XIcon,
  WandIcon,
  SendIcon,
  FolderTree,
  Plus,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const PromptLibrary = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [prompts, setPrompts] = useState(() => {
    // Load prompts from localStorage on initial render
    const savedPrompts = localStorage.getItem('prompts');
    return savedPrompts ? JSON.parse(savedPrompts) : [];
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPromptTitle('');
    setPromptContent('');
    setPrompts(() => {
      // Clear prompts from localStorage when dialog is closed
      localStorage.removeItem('prompts');
      return [];
    });
  };

  const handleSavePrompt = () => {
    if (promptTitle && promptContent) {
      const newPrompts = [...prompts, { title: promptTitle, content: promptContent }];
      setPrompts(newPrompts);
      localStorage.setItem('prompts', JSON.stringify(newPrompts));
      handleDialogClose(); 
    }
  };

  return (
    <TooltipProvider>
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="text-white bg-blue-500 hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDialogOpen(); // Open the dialog on button click
              }}
            >
              <WandIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Prompt Library</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prompt Library</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
            <p>You have {prompts.length} prompts.</p>
            {prompts.map((prompt, index) => (
              <div key={index} className="mb-2">
                <h4 className="font-bold">{prompt.title}</h4>
                <p>{prompt.content}</p>
              </div>
            ))}
            <div className="mt-4">
              <Input
                className="mb-2"
                type="text"
                placeholder="Prompt Title"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
              />
              <Input
                className="mb-2"
                type="text"
                placeholder="Prompt Content"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <Button
                  className="mr-2 text-white bg-blue-500 hover:bg-blue-600"
                  onClick={handleSavePrompt}
                >
                  Save
                </Button>
                <Button
                  className="text-white bg-gray-500 hover:bg-gray-600"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default PromptLibrary;