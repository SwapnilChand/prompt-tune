const API_BASE_URL = 'http://localhost:5000/api';

export const sendMessage = async (message, model) => {
  const response = await fetch(`${API_BASE_URL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
};

export const sendModelMessage = async (message, model) => {
  const response = await fetch(`${API_BASE_URL}/model`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, model }),
  });
  if (!response.ok) {
    throw new Error('Failed to send message to model');
  }
  return response.json();
};

export const addLLM = async (name, key, base) => {
  console.log("add_llm function called")
  const response = await fetch(`${API_BASE_URL}/add-llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, key, base }),
  });

  if (!response.ok) {
    throw new Error('Failed to add LLM model');
  }

  return response.json();
};