import React, { useState, useEffect } from 'react';
const Overlay = () => {
  const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//     }, 10000);

//     return () => clearTimeout(timer);
//   }, []);

  const closeOverlay = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-blue p-6 rounded-md text-center">
            <h1 className="text-2xl font-bold mb-4">Welcome to PromptTune by Kaizen</h1>
            <p className="mb-6">
                <br/><br/>
                <h2>Improve your prompts to get the most out of them.</h2>
                <br/>
                <li>Click on a model you want to use.</li>
                <li>Write a prompt you want to improve in the text box below.</li>
                <li>Get reccomended prompts as outputs.</li>
                <li>Use the Compare button to check quality of each prompt.</li>
                
                <br/><br/>
                <h2>Want to run the prompts across multiple LLMs?</h2>
                <br/>
                <li>Click on the toogle button on the top right corner</li> 
                <li>Select the models you want from the "Select LLM" dropdown menu.</li>
                <li>Create more LLM instances if you want (at max 4). </li>
                <li>Get output from the LLM(s).</li>
                <li>Use the Compare button to check performance of each response.</li>

            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={closeOverlay}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Overlay;