// ConfirmationDialog.js
import React from 'react';

const ConfirmationDialog = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-primary p-4 rounded shadow-lg max-w-md">
        <h2 className="text-lg font-semibold mb-2">Warning</h2>
        <p className="mb-4">Please ensure you have copied the required prompts. This action will delete the history.</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
            No
          </button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;