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

const Compare = () => {
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);

  const handleCompareDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleCompareDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={isCompareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="text-white bg-blue-500 hover:bg-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setCompareDialogOpen(true); // Open the compare dialog
                }}
              >
                <FolderTree className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compare Responses</TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare Responses</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>Comparison results will be shown here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
export default Compare;
