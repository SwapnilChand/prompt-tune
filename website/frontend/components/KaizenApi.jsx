const API_BASE_URL = 'http://localhost:5000/api';

export const sendMessage = async (message, model) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
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

export const generateUnitTests = async (sourceCode, language) => {
  const response = await fetch(`${API_BASE_URL}/generate_unit_tests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source_code: sourceCode, language }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate unit tests');
  }
  
  return response.json();
};

export const scanCode = async (sourceCode) => {
//   const response = await fetch(`${API_BASE_URL}/scan_code`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ source_code: sourceCode }),
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to scan code');
//   }
  
  return "Code Scan complete";
};