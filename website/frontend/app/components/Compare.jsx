import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FolderTree, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import DiffMatchPatch from 'diff-match-patch';


const Compare = () => {
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);
  const [textBoxes, setTextBoxes] = useState([
    { id: 1, content: "", length: 0, selected: false },
  ]);
  const [selectedBoxes, setSelectedBoxes] = useState([]);
  const [similarityScore, setSimilarityScore] = useState(0);
  const [highlightedTexts, setHighlightedTexts] = useState([]);
  const [tokenCounts, setTokenCounts] = useState({});
  const [tokenCountErrors, setTokenCountErrors] = useState({});

  useEffect(() => {
    updateSimilarityScore();
  }, [selectedBoxes, textBoxes]);

  const debouncedUpdateTokenCount = useCallback(
    debounce(async (id, content) => {
      if (content.trim() === "") {
        setTokenCounts((prevCounts) => ({
          ...prevCounts,
          [id]: 0,
        }));
        setTokenCountErrors((prevErrors) => ({
          ...prevErrors,
          [id]: null,
        }));
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/token-count/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: content }),
        });
        if (response.ok) {
          const data = await response.json();
          setTokenCounts((prevCounts) => ({
            ...prevCounts,
            [id]: data.token_count,
          }));
          setTokenCountErrors((prevErrors) => ({
            ...prevErrors,
            [id]: null,
          }));
        } else {
          const errorText = await response.text();
          console.error(
            `Error calculating token count for box ${id}: ${errorText}`
          );
          setTokenCountErrors((prevErrors) => ({
            ...prevErrors,
            [id]: "Error calculating token count",
          }));
        }
      } catch (error) {
        console.error(`Error calculating token count for box ${id}:`, error);
        setTokenCountErrors((prevErrors) => ({
          ...prevErrors,
          [id]: "Network error",
        }));
      }
    }, 500),
    []
  );

  const handleTextChange = (id, content) => {
    const updatedBoxes = textBoxes.map((box) =>
      box.id === id ? { ...box, content, length: content.length } : box
    );
    setTextBoxes(updatedBoxes);
    debouncedUpdateTokenCount(id, content);
  };

  const addTextBox = () => {
    if (textBoxes.length < 4) {
      const newId = textBoxes.length + 1;
      setTextBoxes([
        ...textBoxes,
        { id: newId, content: "", length: 0, selected: false },
      ]);
    }
  };

  const handleBoxClick = (id) => {
    let updatedSelected = [...selectedBoxes];
    if (updatedSelected.includes(id)) {
      updatedSelected = updatedSelected.filter((boxId) => boxId !== id);
    } else if (updatedSelected.length < 2) {
      updatedSelected.push(id);
    } else {
      updatedSelected.shift();
      updatedSelected.push(id);
    }
    setSelectedBoxes(updatedSelected);

    const updatedBoxes = textBoxes.map((box) => ({
      ...box,
      selected: updatedSelected.includes(box.id),
    }));
    setTextBoxes(updatedBoxes);
  };

  const updateSimilarityScore = () => {
    if (selectedBoxes.length === 2) {
      const [box1, box2] = textBoxes.filter((box) =>
        selectedBoxes.includes(box.id)
      );
      const dmp = new DiffMatchPatch.diff_match_patch();
      const diffs = dmp.diff_main(box1.content, box2.content);
      dmp.diff_cleanupSemantic(diffs);

      let matchingChars = 0;
      let totalChars = 0;

      diffs.forEach(([type, text]) => {
        if (type === 0) {matchingChars += text.length};
        totalChars += text.length;
      });

      const score =
        totalChars > 0 ? Math.round((matchingChars / totalChars) * 100) : 100;
      setSimilarityScore(score);

      setHighlightedTexts(highlightDifferences(diffs));
    } else {
      setSimilarityScore(0);
      setHighlightedTexts([]);
    }
  };

  const highlightDifferences = (diffs) => {
    return diffs.map(([type, text], index) => {
      switch (type) {
        case -1:
          return (
            <span key={index} className="bg-red-200">
              {text}
            </span>
          );
        case 1:
          return (
            <span key={index} className="bg-green-200">
              {text}
            </span>
          );
        default:
          return <span key={index}>{text}</span>;
      }
    });
  };

  const removeTextBox = (id) => {
    const newTextBoxes = textBoxes.filter((box) => box.id !== id);
    setTextBoxes(newTextBoxes);
    setSelectedBoxes(selectedBoxes.filter((boxId) => boxId !== id));
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
                  setCompareDialogOpen(true);
                }}
              >
                <FolderTree className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compare Responses</TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Responses</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Similarity Score: {similarityScore}%
              </h2>
              {textBoxes.length < 4 && (
                <Button onClick={addTextBox} className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {textBoxes.map((box) => (
                <div key={box.id} className="relative">
                  <div className="mb-2 flex justify-between items-center">
                    <span>Length: {box.length}</span>
                    <span>
                      Tokens: {tokenCounts[box.id]}
                      {tokenCountErrors[box.id] && (
                        <span className="text-red-500 ml-2">
                          {tokenCountErrors[box.id]}
                        </span>
                      )}
                    </span>
                    {box.selected && (
                      <span className="text-green-500">Selected</span>
                    )}
                  </div>
                  <Textarea
                    value={box.content}
                    onChange={(e) => handleTextChange(box.id, e.target.value)}
                    onClick={() => handleBoxClick(box.id)}
                    className={`w-full h-40 p-2 border rounded ${
                      box.selected ? "border-green-500" : "border-gray-300"
                    }`}
                    placeholder={`Enter text for comparison #${box.id}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextBox(box.id);
                    }}
                    className="text-red-500 hover:text-red-700 absolute top-2 right-2"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            {highlightedTexts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  Differences Highlighted:
                </h3>
                <div className="p-4 border rounded bg-gray-50 text-black">
                  {highlightedTexts}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default Compare;
