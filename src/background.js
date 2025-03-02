// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Text Completion extension installed");
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any future message passing needs
  return true;
});
