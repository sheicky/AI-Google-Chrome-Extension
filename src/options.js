import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";

function Options() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Load saved API key
    chrome.storage.local.get(["GEMINI_API_KEY"], result => {
      if (result.GEMINI_API_KEY) {
        setApiKey(result.GEMINI_API_KEY);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set(
      {
        GEMINI_API_KEY: apiKey,
      },
      () => {
        setStatus("API key saved successfully!");
        setTimeout(() => setStatus(""), 3000);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Extension Options
        </h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              Gemini API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your Gemini API key"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save API Key
          </button>
          {status && <p className="mt-2 text-sm text-green-600">{status}</p>}
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
