import React, { useState } from 'react';
import { Button } from '@/components/Button'; 
import { ShareIcon } from '@heroicons/react/solid';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';

const ShareButton = ({ messages }) => {
    const [shareableLink, setShareableLink] = useState('');

    const handleShare = async () => {
        const response = await fetch('http://localhost:5000/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        if (response.ok) {
            const data = await response.json();
            setShareableLink(data.shareableLink); // Store the shareable link
            alert(`Share this link: ${data.shareableLink}`); // Notify the user
        } else {
            alert('Failed to share the conversation');
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" className="text-white bg-blue-500 hover:bg-blue-600" onClick={handleShare}>
                            <ShareIcon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Share this conversation</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {shareableLink && <p className="text-sm text-gray-500">Link: {shareableLink}</p>}
        </div>
    );
};

export default ShareButton;