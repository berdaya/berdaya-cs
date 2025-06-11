(function() {
  'use strict';
  
  // Get chatbot ID from script tag
  const scriptTag = document.currentScript || (() => {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  const chatbotId = scriptTag.getAttribute('data-chatbot-id');
  console.log('Embedded chatbot ID:', chatbotId);
  
  if (!chatbotId) {
    console.error('Chatbot ID not specified. Add data-chatbot-id attribute to the script tag.');
    return;
  }
  
  // Get host URL - use the domain where the chatbot is hosted
  const hostUrl = scriptTag.getAttribute('data-host-url') || (() => {
    const scriptSrc = scriptTag.src;
    try {
      return new URL(scriptSrc).origin;
    } catch (e) {
      console.error('Failed to get host URL from script src:', e);
      return window.location.origin; // Fallback to current origin
    }
  })();
  
  console.log('Using host URL:', hostUrl);
  
  // Create CSS
  const createStyles = () => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      :root {
        --chat-bg: white;
        --chat-text: #374151;
        --chat-input-bg: white;
        --chat-input-border: #e5e7eb;
        --chat-message-bot-bg: #f3f4f6;
        --chat-message-user-bg: #4f46e5;
        --chat-message-user-text: white;
        --chat-code-bg: #e5e7eb;
        --chat-blockquote-border: #e5e7eb;
        --chat-blockquote-text: #6b7280;
        --chat-link-color: #4f46e5;
        --chat-table-border: #e5e7eb;
        --chat-table-header-bg: #f3f4f6;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --chat-bg: #1f2937;
          --chat-text: #e5e7eb;
          --chat-input-bg: #374151;
          --chat-input-border: #4b5563;
          --chat-message-bot-bg: #374151;
          --chat-message-user-bg: #4f46e5;
          --chat-message-user-text: white;
          --chat-code-bg: #374151;
          --chat-blockquote-border: #4b5563;
          --chat-blockquote-text: #9ca3af;
          --chat-link-color: #818cf8;
          --chat-table-border: #4b5563;
          --chat-table-header-bg: #374151;
        }
      }
      
      .chat-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      }
      
      .chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #4f46e5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
        transition: all 0.2s ease;
        overflow: hidden;
        margin-left: auto;
      }
      
      .chat-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      }
      
      .chat-button svg {
        width: 28px;
        height: 28px;
      }
      
      .chat-window {
        width: 360px;
        max-width: calc(100vw - 40px);
        height: 550px;
        max-height: calc(100vh - 100px);
        background: var(--chat-bg);
        color: var(--chat-text);
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        margin-bottom: 10px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .chat-header {
        background-color: #4f46e5;
        color: white;
        padding: 15px;
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .chat-close {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s ease;
      }
      
      .chat-close:hover {
        opacity: 1;
      }
      
      .chat-form {
        padding: 20px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        flex: 1;
      }
      
      .chat-form label {
        font-size: 14px;
        margin-bottom: 5px;
        color: var(--chat-text);
      }
      
      .chat-form input {
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid var(--chat-input-border);
        border-radius: 5px;
        font-size: 14px;
        background-color: var(--chat-input-bg);
        color: var(--chat-text);
      }
      
      .chat-form button {
        background-color: #4f46e5;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }
      
      .chat-form button:hover {
        background-color: #4338ca;
      }
      
      .chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .chat-message {
        max-width: 80%;
        padding: 10px 15px;
        border-radius: 15px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .message-user {
        align-self: flex-end;
        background-color: var(--chat-message-user-bg);
        color: var(--chat-message-user-text);
        border-bottom-right-radius: 5px;
      }
      
      .message-bot {
        align-self: flex-start;
        background-color: var(--chat-message-bot-bg);
        color: var(--chat-text);
        border-bottom-left-radius: 5px;
      }
      
      .message-streaming {
        position: relative;
      }
      
      .streaming-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        background-color: var(--chat-text);
        margin-left: 2px;
        animation: blink 1s infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      /* Markdown styles */
      .message-bot p {
        margin: 0 0 10px 0;
      }
      
      .message-bot p:last-child {
        margin-bottom: 0;
      }
      
      .message-bot code {
        background-color: var(--chat-code-bg);
        padding: 2px 4px;
        border-radius: 4px;
        font-family: monospace;
      }
      
      .message-bot pre {
        background-color: var(--chat-code-bg);
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 10px 0;
      }
      
      .message-bot pre code {
        background-color: transparent;
        padding: 0;
      }
      
      .message-bot ul, .message-bot ol {
        margin: 10px 0;
        padding-left: 20px;
      }
      
      .message-bot blockquote {
        border-left: 4px solid var(--chat-blockquote-border);
        margin: 10px 0;
        padding-left: 10px;
        color: var(--chat-blockquote-text);
      }
      
      .message-bot a {
        color: var(--chat-link-color);
        text-decoration: none;
      }
      
      .message-bot a:hover {
        text-decoration: underline;
      }
      
      .message-bot table {
        border-collapse: collapse;
        margin: 10px 0;
        width: 100%;
      }
      
      .message-bot th, .message-bot td {
        border: 1px solid var(--chat-table-border);
        padding: 8px;
        text-align: left;
      }
      
      .message-bot th {
        background-color: var(--chat-table-header-bg);
      }
      
      .typing-indicator {
        align-self: flex-start;
        background-color: var(--chat-message-bot-bg);
        color: var(--chat-text);
        border-radius: 15px;
        border-bottom-left-radius: 5px;
        padding: 12px 15px;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
      }
      
      .typing-indicator span {
        width: 4px;
        height: 4px;
        background-color: var(--chat-text);
        border-radius: 50%;
        display: inline-block;
        margin: 0 1px;
        animation: typingAnimation 1.4s infinite both;
      }
      
      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes typingAnimation {
        0% { transform: translateY(0px); }
        28% { transform: translateY(-5px); }
        44% { transform: translateY(0px); }
      }
      
      .chat-input-area {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--chat-input-border);
        padding: 10px;
      }
      
      .chat-input-container {
        display: flex;
        margin-bottom: 8px;
      }
      
      .chat-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid var(--chat-input-border);
        border-radius: 20px;
        font-size: 14px;
        resize: none;
        outline: none;
        max-height: 100px;
        overflow-y: auto;
        background-color: var(--chat-input-bg);
        color: var(--chat-text);
      }
      
      .chat-contact-info {
        font-size: 12px;
        color: var(--chat-text);
        text-align: center;
        padding: 0 10px;
      }
      
      .chat-contact-info a {
        color: var(--chat-link-color);
        text-decoration: none;
      }
      
      .chat-contact-info a:hover {
        text-decoration: underline;
      }
      
      .chat-send {
        background-color: #4f46e5;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        margin-left: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease;
      }
      
      .chat-send:hover {
        background-color: #4338ca;
      }
      
      .chat-send:disabled {
        background-color: #9ca3af;
        cursor: not-allowed;
      }
      
      .chat-send svg {
        width: 18px;
        height: 18px;
      }
      
      .hidden {
        display: none;
      }
    `;
    document.head.appendChild(styleTag);
  };
  
  // Create chat widget DOM elements
  const createChatWidget = () => {
    // Main container
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    
    // Chat button
    const chatButton = document.createElement('div');
    chatButton.className = 'chat-button';
    chatButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    `;
    
    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window hidden';
    
    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.innerHTML = `
      <div>Chat Support</div>
      <div class="chat-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>
    `;
    
    // Customer info form
    const customerForm = document.createElement('div');
    customerForm.className = 'chat-form';
    customerForm.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 16px;">Before we start chatting</h3>
      <label for="customer-name">Name *</label>
      <input type="text" id="customer-name" required placeholder="Your name">
      
      <label for="customer-email">Email *</label>
      <input type="email" id="customer-email" placeholder="Your email">
      
      <label for="customer-phone">Phone *</label>
      <input type="tel" id="customer-phone" placeholder="Your phone">
      
      <div style="font-size: 12px; color: var(--chat-text); margin-bottom: 15px;">* Please provide either email or phone number</div>
      
      <button type="submit" id="submit-info">Start Chatting</button>

      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--chat-input-border);">
        <div style="font-size: 12px; color: var(--chat-text); text-align: center;">
          Need immediate assistance? Contact us directly:
          <div style="margin-top: 5px;">
            <a href="https://wa.me/628113084084" style="color: var(--chat-link-color); text-decoration: none;">+62 811-3084-084</a> | 
            <a href="mailto:admin.odoo@lui.co.id" style="color: var(--chat-link-color); text-decoration: none;">admin.odoo@lui.co.id</a>
          </div>
        </div>
      </div>
    `;
    
    // Chat messages area
    const chatMessages = document.createElement('div');
    chatMessages.className = 'chat-messages hidden';
    
    // Chat input area
    const chatInputArea = document.createElement('div');
    chatInputArea.className = 'chat-input-area hidden';
    chatInputArea.innerHTML = `
      <div class="chat-input-container">
        <textarea class="chat-input" placeholder="Type your message..."></textarea>
        <button class="chat-send">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <div class="chat-contact-info">
        <a href="https://wa.me/628113084084">+62 811-3084-084</a> | 
        <a href="mailto:admin.odoo@lui.co.id">admin.odoo@lui.co.id</a>
      </div>
    `;
    
    // Assemble all elements
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(customerForm);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputArea);
    
    chatWidget.appendChild(chatWindow);
    chatWidget.appendChild(chatButton);
    
    document.body.appendChild(chatWidget);
    
    // Add marked library
    const markedScript = document.createElement('script');
    markedScript.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    
    // Create a promise to track when marked is loaded
    const markedLoaded = new Promise((resolve) => {
      markedScript.onload = () => {
        console.log('Marked library loaded');
        resolve();
      };
      markedScript.onerror = (error) => {
        console.error('Failed to load marked library:', error);
        resolve(); // Resolve anyway to prevent blocking
      };
    });
    
    document.head.appendChild(markedScript);
    
    return {
      chatWidget,
      chatButton,
      chatWindow,
      customerForm,
      chatMessages,
      chatInputArea,
      markedLoaded
    };
  };
  
  // Initialize chat functionality
  const initChat = () => {
    createStyles();
    
    const elements = createChatWidget();
    const {
      chatButton,
      chatWindow,
      customerForm,
      chatMessages,
      chatInputArea,
      markedLoaded
    } = elements;
    
    // Local state
    let sessionId = localStorage.getItem(`chatbot_session_${chatbotId}`);
    let customerInfo = JSON.parse(localStorage.getItem(`chatbot_customer_${chatbotId}`)) || null;
    let messageHistory = JSON.parse(localStorage.getItem(`chatbot_messages_${chatbotId}_${sessionId}`)) || [];
    let isStreamingResponse = false;
    
    // DOM elements
    const nameInput = document.getElementById('customer-name');
    const emailInput = document.getElementById('customer-email');
    const phoneInput = document.getElementById('customer-phone');
    const submitInfoButton = document.getElementById('submit-info');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send');
    const closeButton = document.querySelector('.chat-close');
    
    // Check if we have a previous session
    if (sessionId && customerInfo) {
      customerForm.classList.add('hidden');
      chatMessages.classList.remove('hidden');
      chatInputArea.classList.remove('hidden');
      console.log('Using existing session ID:', sessionId);
      console.log('Using existing customer info:', customerInfo);
      
      // Load message history
      loadMessageHistory();
    }
    
    // Toggle chat window
    chatButton.addEventListener('click', () => {
      chatWindow.classList.toggle('hidden');
    });
    
    // Close chat window
    closeButton.addEventListener('click', () => {
      chatWindow.classList.add('hidden');
    });
    
    // Submit customer info
    submitInfoButton.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      
      // Reset previous error states
      nameInput.style.borderColor = '#e5e7eb';
      emailInput.style.borderColor = '#e5e7eb';
      phoneInput.style.borderColor = '#e5e7eb';
      
      let hasError = false;
      
      if (!name) {
        nameInput.style.borderColor = '#ef4444';
        hasError = true;
      }
      
      if (!email && !phone) {
        emailInput.style.borderColor = '#ef4444';
        phoneInput.style.borderColor = '#ef4444';
        hasError = true;
      }
      
      if (hasError) {
        return;
      }
      
      customerInfo = { name, email, phone };
      
      // Store customer info in localStorage
      localStorage.setItem(`chatbot_customer_${chatbotId}`, JSON.stringify(customerInfo));
      
      // Hide form and show chat interface
      customerForm.classList.add('hidden');
      chatMessages.classList.remove('hidden');
      chatInputArea.classList.remove('hidden');
      
      // Add welcome message
      addBotMessage('Hi there! How can I help you today?');
    });
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new lines)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    function addUserMessage(text) {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message message-user';
      messageElement.textContent = text;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function addBotMessage(text, citations = []) {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message message-bot';
      
      // Add the main message text with markdown support
      const textElement = document.createElement('div');
      markedLoaded.then(() => {
        if (window.marked) {
          textElement.innerHTML = marked.parse(text);
        } else {
          textElement.textContent = text;
        }
      }).catch(() => {
        textElement.textContent = text;
      });
      messageElement.appendChild(textElement);
      
      // Add citations if any
      if (citations && citations.length > 0) {
        const citationsElement = document.createElement('div');
        citationsElement.className = 'citations';
        citationsElement.style.marginTop = '8px';
        citationsElement.style.fontSize = '12px';
        citationsElement.style.color = '#6b7280';
        
        citations.forEach(citation => {
          const citationElement = document.createElement('div');
          citationElement.textContent = citation;
          citationsElement.appendChild(citationElement);
        });
        
        messageElement.appendChild(citationsElement);
      }
      
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return messageElement;
    }
    
    function createStreamingBotMessage() {
      const messageElement = document.createElement('div');
      messageElement.className = 'chat-message message-bot message-streaming';
      
      const textElement = document.createElement('div');
      textElement.className = 'streaming-text';
      messageElement.appendChild(textElement);
      
      const cursor = document.createElement('span');
      cursor.className = 'streaming-cursor';
      messageElement.appendChild(cursor);
      
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      return { messageElement, textElement, cursor };
    }
    
    function updateStreamingMessage(streamingElements, text, isComplete = false) {
      const { messageElement, textElement, cursor } = streamingElements;
      
      // Update text content
      markedLoaded.then(() => {
        if (window.marked && isComplete) {
          textElement.innerHTML = marked.parse(text);
        } else {
          textElement.textContent = text;
        }
      }).catch(() => {
        textElement.textContent = text;
      });
      
      // Remove cursor when complete
      if (isComplete && cursor.parentNode) {
        cursor.remove();
        messageElement.classList.remove('message-streaming');
      }
      
      // Auto-scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'typing-indicator';
      indicator.innerHTML = 'Typing<span></span><span></span><span></span>';
      indicator.id = 'typing-indicator';
      chatMessages.appendChild(indicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function hideTypingIndicator() {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
    
    async function sendMessage() {
      if (isStreamingResponse) {
        console.log('Already streaming a response, ignoring new message');
        return;
      }
      
      const messageText = chatInput.value.trim();
      if (!messageText) return;
      
      // Disable input during streaming
      isStreamingResponse = true;
      chatInput.disabled = true;
      sendButton.disabled = true;
      
      // Add user message to chat
      addUserMessage(messageText);
      
      // Save message to history
      messageHistory.push({ role: 'user', content: messageText });
      
      // Clear input
      chatInput.value = '';
      
      // Show typing indicator briefly
      showTypingIndicator();
      
      try {
        console.log('Sending message with session ID:', sessionId);
        const response = await fetch(`${hostUrl}/api/chatbot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          body: JSON.stringify({
            chatbot_id: chatbotId,
            session_id: sessionId,
            customer: customerInfo,
            messages: [messageText]
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to get response: ${response.status} ${response.statusText}`);
        }

        // Hide typing indicator and start streaming
        hideTypingIndicator();
        
        // Create streaming message element
        const streamingElements = createStreamingBotMessage();
        let accumulatedText = '';
        let lastUpdateTime = Date.now();
        const UPDATE_INTERVAL = 50; // Update UI every 50ms for smooth streaming

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  console.log('Parsed SSE data:', data);
                  
                  if (data.type === 'done') {
                    // Final message content
                    accumulatedText = data.message.content;
                    updateStreamingMessage(streamingElements, accumulatedText, true);

                    // Save session ID if it's a new conversation
                    if (!sessionId && data.session_id) {
                      sessionId = data.session_id;
                      console.log('Received new session ID:', sessionId);
                      localStorage.setItem(`chatbot_session_${chatbotId}`, sessionId);
                    }

                    // Save bot message to history
                    messageHistory.push({ role: 'assistant', content: data.message.content });
                    
                    // Store updated message history
                    localStorage.setItem(`chatbot_messages_${chatbotId}_${sessionId}`, JSON.stringify(messageHistory));
                    
                  } else if (data.type === 'error') {
                    throw new Error(data.error);
                  } else if (data.type === 'chunk' && data.content) {
                    // Handle streaming chunks (if your backend sends them)
                    accumulatedText += data.content;
                    
                    // Throttle UI updates for performance
                    const now = Date.now();
                    if (now - lastUpdateTime > UPDATE_INTERVAL) {
                      updateStreamingMessage(streamingElements, accumulatedText, false);
                      lastUpdateTime = now;
                    }
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e, 'Line:', line);
                }
              }
            }
          }
        } catch (readerError) {
          console.error('Error reading stream:', readerError);
          throw readerError;
        }
        
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add error message
        addBotMessage('Sorry, I encountered an error. Please try again later.');
      } finally {
        // Re-enable input
        isStreamingResponse = false;
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
      }
    }
    
    function loadMessageHistory() {
      try {
        console.log('Loading message history from localStorage');
        
        // Clear existing messages first
        chatMessages.innerHTML = '';
        
        // Add messages to chat
        if (messageHistory && messageHistory.length > 0) {
          messageHistory.forEach(msg => {
            if (msg.role === 'user') {
              addUserMessage(msg.content);
            } else if (msg.role === 'assistant') {
              addBotMessage(msg.content);
            }
          });
        } else {
          // If no messages, show welcome back message
          addBotMessage('Welcome back! How can I help you today?');
        }
      } catch (error) {
        console.error('Error loading message history:', error);
        addBotMessage('Welcome back! How can I help you today?');
      }
    }
  };
  
  // Initialize when the DOM is loaded
  const initializeWhenReady = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', verifyChatbotAndInit);
    } else {
      verifyChatbotAndInit();
    }
  };
  
  // Verify chatbot ID is valid before initializing
  const verifyChatbotAndInit = async () => {
    try {
      console.log('Verifying chatbot ID:', chatbotId);
      const response = await fetch(`${hostUrl}/api/verify-chatbot?id=${chatbotId}`, {
        mode: 'cors'
      });
      
      const data = await response.json();
      
      if (!data.valid) {
        console.error('Invalid chatbot ID:', data.error);
        return;
      }
      
      console.log('Chatbot verified:', data.name);
      initChat();
    } catch (error) {
      console.error('Error verifying chatbot:', error);
      // Initialize anyway if verification fails
      initChat();
    }
  };
  
  // Start the initialization process
  initializeWhenReady();
  
})();