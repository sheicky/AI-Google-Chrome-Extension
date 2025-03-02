# AutoTab: Chrome Extension for Text Completions

A Chrome extension that provides AI-powered text completion for any text field on the web. As you type in any input field, text area, or contenteditable element, AutoTab will suggest completions that you can accept by simply pressing the Tab key.

## Features

- Works on any website and in any text input field
- Provides real-time AI-powered text suggestions as you type
- Accept suggestions with a simple Tab key press
- Seamlessly integrates with existing text inputs without disrupting your workflow
- Supports both standard text inputs and contenteditable elements
- Intelligent debouncing to minimize API calls and improve performance

## Installation

1. Clone this repository or download the source code
2. Run `npm install` to install all dependencies
3. Run `npm run build` to create the distribution files (creates a new "dist" folder)
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" using the toggle in the top right corner
6. Click "Load unpacked" and select the "dist" folder from this project
7. The extension icon should appear in your browser toolbar - click and pin it for easy access

## Usage

1. Navigate to any website with text input fields
2. Start typing in any text field
3. As you type, AI suggestions will appear in light gray
4. Press the Tab key to accept a suggestion
5. Continue typing and accepting suggestions as needed

## How It Works

The extension uses a content script that injects into web pages and attaches event listeners to track user input. When you type, the extension sends your text to a local API server that returns AI-generated completions. These completions are displayed as an overlay that perfectly matches the styling of the input field you're typing in.

## Development

- `npm install` - Install dependencies
- `npm run build` - Build the extension for production
- `npm run format` - Format code using Prettier

## Customization

The extension's appearance and behavior can be customized by modifying the appropriate CSS and JavaScript files.
# AI-Google-Chrome-Extension
