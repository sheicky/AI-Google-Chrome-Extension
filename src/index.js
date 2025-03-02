import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

const root = document.createElement("div");
root.className =
  "min-w-60 min-h-60 max-w-60 max-h-60 bg-gray-300 p-4 text-center grid grid-rows-2";
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);

rootDiv.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
