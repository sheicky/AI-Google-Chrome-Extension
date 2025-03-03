const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Add logging to check args
      console.log("Debounce calling function with args:", args);
      func(...args);
    }, wait);
  };
};

// Function to gather webpage context
const getWebpageContext = element => {
  console.log("getWebpageContext called with element:", element);

  if (!element || !(element instanceof Element)) {
    console.warn("Invalid element passed to getWebpageContext:", element);
    return JSON.stringify({
      url: window.location.href,
      title: document.title,
      path: window.location.pathname,
      elementContext: "",
    });
  }

  const context = {
    url: window.location.href,
    title: document.title,
    path: window.location.pathname,
    elementContext: "",
  };

  let parentContext = [];
  let currentElement = element;
  for (let i = 0; i < 3; i++) {
    if (currentElement.parentElement) {
      currentElement = currentElement.parentElement;
      const tagName = currentElement.tagName.toLowerCase();
      const id = currentElement.id ? `#${currentElement.id}` : "";
      const className = currentElement.className
        ? `.${currentElement.className.split(" ").join(".")}`
        : "";
      parentContext.unshift(`${tagName}${id}${className}`);
    }
  }

  // Get nearby headings
  const nearbyHeadings = [];
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const elementRect = element.getBoundingClientRect();
  headings.forEach(heading => {
    const headingRect = heading.getBoundingClientRect();
    if (Math.abs(headingRect.top - elementRect.top) < 500) {
      // Within 500px
      nearbyHeadings.push(
        `${heading.tagName.toLowerCase()}: ${heading.textContent}`
      );
    }
  });

  context.elementContext = {
    parents: parentContext,
    nearbyHeadings: nearbyHeadings,
    tagName: element.tagName.toLowerCase(),
    id: element.id || "",
    className: element.className || "",
  };

  const finalContext = JSON.stringify(context);
  console.log("Generated context:", finalContext);
  return finalContext;
};

// Function to get completion from local API
const getCompletion = async (message, element) => {
  console.log(
    "getCompletion called with message:",
    message,
    "type:",
    typeof message
  );
  console.log("getCompletion called with element:", element);

  // Ensure message is a string
  if (typeof message !== "string") {
    console.error("Invalid message type in getCompletion:", typeof message);
    return "";
  }

  const context = getWebpageContext(element);
  console.log("Context in getCompletion:", context);

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get completion: ${response.status}`);
    }

    const data = await response.json();

    // Handle case where data or data.response might be null/undefined
    if (!data) return "";
    if (!data.response) return "";

    // Only try to parse if it's a non-empty string
    if (typeof data.response === "string" && data.response.trim()) {
      try {
        const parsedResponse = JSON.parse(data.response);
        return parsedResponse.response || parsedResponse || "";
      } catch (e) {
        // If parsing fails, return the original response
        return data.response;
      }
    }

    return data.response.response || data.response || "";
  } catch (error) {
    console.error("API Error:", error);
    return "";
  }
};

class SuggestOverlay {
  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "ai-suggestion-overlay";
    this.overlay.style.cssText = `
        position: absolute;
        color: #9CA3AF;
        font-family: monospace;
        white-space: pre;
        z-index: 10000;
        background: transparent;
        `;
    document.body.appendChild(this.overlay);
  }

  show(element, suggestion, cursorPosition) {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // Create a temporary span to measure text width
    const measureSpan = document.createElement("span");
    measureSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            letter-spacing: ${computedStyle.letterSpacing};
            white-space: pre;
        `;
    measureSpan.textContent = element.value.slice(0, cursorPosition);
    document.body.appendChild(measureSpan);

    // Calculate cursor position
    const textWidth = measureSpan.getBoundingClientRect().width;
    document.body.removeChild(measureSpan);

    // Position overlay at cursor
    this.overlay.style.top = `${rect.top + window.scrollY}px`;
    this.overlay.style.left = `${rect.left + window.scrollX - textWidth}px`;
    this.overlay.style.height = computedStyle.lineHeight;
    this.overlay.style.padding = computedStyle.padding;
    this.overlay.style.fontSize = computedStyle.fontSize;
    this.overlay.style.fontFamily = computedStyle.fontFamily;
    this.overlay.style.letterSpacing = computedStyle.letterSpacing;
    this.overlay.style.lineHeight = computedStyle.lineHeight;

    // Only show the suggestion
    this.overlay.textContent = suggestion;
    this.overlay.style.display = "block";
  }

  hide() {
    this.overlay.style.display = "none";
  }
}

class AICompletion {
  constructor() {
    this.currentElement = null;
    this.suggestion = "";
    this.overlay = new SuggestOverlay();
    this.cursorPosition = 0;

    this.debouncedGetSuggestions = debounce(
      this.getSuggestions.bind(this),
      500
    );
    this.setupEventListeners();
  }

  async getSuggestions(text, cursorPosition) {
    try {
      // Explicitly convert to string if possible (defensive coding)
      if (text !== null && text !== undefined) {
        text = String(text);
      }

      if (typeof text !== "string") {
        console.error(
          "Invalid text type in getSuggestions:",
          typeof text,
          text
        );
        this.suggestion = "";
        this.overlay.hide();
        return;
      }

      if (!text || !text.trim()) {
        this.suggestion = "";
        this.overlay.hide();
        return;
      }

      try {
        const suggestion = await getCompletion(text, this.currentElement);

        // Only process if we got a non-empty suggestion
        if (suggestion && typeof suggestion === "string") {
          this.suggestion = suggestion.trim();
          if (this.currentElement && this.suggestion) {
            this.overlay.show(
              this.currentElement,
              this.suggestion,
              cursorPosition
            );
          } else {
            this.overlay.hide();
          }
        } else {
          this.suggestion = "";
          this.overlay.hide();
        }
      } catch (error) {
        console.error("Error getting suggestions:", error);
        this.suggestion = "";
        this.overlay.hide();
      }
    } catch (outerError) {
      console.error("Fatal error in getSuggestions:", outerError);
      this.suggestion = "";
      this.overlay.hide();
    }
  }

  handleInput(event) {
    const element = event.target;
    this.currentElement = element;
    const cursorPosition = element.selectionStart;

    // Log what we're passing to make sure it's correct
    console.log("Element value:", element.value, "Type:", typeof element.value);

    // Make sure we pass a string value for text
    if (element.value && typeof element.value === "string") {
      this.debouncedGetSuggestions(element.value, cursorPosition);
    } else {
      console.error("Invalid element value in handleInput:", element.value);
    }
  }

  handleKeyDown(event) {
    try {
      if (event.key === "Tab" && this.suggestion) {
        event.preventDefault();
        const element = event.target;
        const beforeCursor = element.value.slice(0, this.cursorPosition);
        const afterCursor = element.value.slice(this.cursorPosition);
        element.value = beforeCursor + this.suggestion + afterCursor;

        // Move cursor to end of inserted suggestion
        const newCursorPosition = this.cursorPosition + this.suggestion.length;
        element.setSelectionRange(newCursorPosition, newCursorPosition);

        this.suggestion = "";
        this.overlay.hide();
      }
    } catch (error) {
      console.error("Error in handleKeyDown:", error);
      this.suggestion = "";
      this.overlay.hide();
    }
  }

  handleSelectionChange(event) {
    if (this.currentElement === event.target) {
      this.cursorPosition = event.target.selectionStart;
      if (this.suggestion) {
        this.overlay.show(
          this.currentElement,
          this.suggestion,
          this.cursorPosition
        );
      }
    }
  }

  handleFocus(event) {
    this.currentElement = event.target;
    this.cursorPosition = event.target.selectionStart;
    if (event.target.value && this.suggestion) {
      this.overlay.show(event.target, this.suggestion, this.cursorPosition);
    }
  }

  handleBlur() {
    this.currentElement = null;
    this.overlay.hide();
  }

  setupEventListeners() {
    document.addEventListener("input", this.handleInput.bind(this), true);
    document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
    document.addEventListener("focus", this.handleFocus.bind(this), true);
    document.addEventListener("blur", this.handleBlur.bind(this), true);
    document.addEventListener(
      "selectionchange",
      this.handleSelectionChange.bind(this),
      true
    );
  }
}

// Initialize the extension
new AICompletion();
