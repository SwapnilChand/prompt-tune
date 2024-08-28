import React, { useEffect, useState } from 'react';

const SharedConversation = ({ conversationId }) => {
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConversation = async () => {
            const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                setConversation(data);
            } else {
                alert('Conversation not found');
            }
            setLoading(false);
        };

        fetchConversation();
    }, [conversationId]);

    if (loading) return <p>Loading...</p>;
    if (!conversation) return <p>No conversation found.</p>;

    return (
        <div>
            <h2>Shared Conversation</h2>
            {conversation.map((msg, index) => (
                <p key={index}>{msg}</p> // Adjust based on your message structure
            ))}
        </div>
    );
};

export default SharedConversation;