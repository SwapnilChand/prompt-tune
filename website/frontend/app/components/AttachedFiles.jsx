import { useState } from "react";

import Header from "@/app/components/Header";
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

const AttachedFiles = () => {
  const { toast } = useToast();
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isAttachDialogOpen, setAttachDialogOpen] = useState(false);

  const handleAttachDialogOpen = () => {
    setAttachDialogOpen(true);
  };

  const handleAttachDialogClose = () => {
    setAttachDialogOpen(false);
  };
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles([...attachedFiles, ...files]);
    toast({
      title: "Files Attached",
      description: `${files.length} file(s) attached successfully.`,
    });

    // const handleGoogleDriveUpload = () => {
    //     toast({
    //         title: "Google Drive",
    //         description: "Google Drive integration not implemented yet.",
    //     });
    // };
  };
  return (
    <TooltipProvider>
      <Dialog open={isAttachDialogOpen} onOpenChange={setAttachDialogOpen}>
        <DialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="text-white bg-blue-500 hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttachDialogOpen();
                }}
              >
                <PinIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Attach Files</TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Files</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              className="bg-white"
              type="file"
              multiple
              onChange={handleFileUpload}
            />
            {/* <Button className="mt-2" onClick={handleGoogleDriveUpload}>Upload from Google Drive</Button> */}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
export default AttachedFiles;
