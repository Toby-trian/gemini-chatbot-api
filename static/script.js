document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  let chatHistory = [];

  // Function to get current time in HH:MM format
  function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessageText = userInput.value.trim();
    if (!userMessageText) return;

    addMessageToUI('user', userMessageText);
    chatHistory.push({ role: 'user', text: userMessageText });
    userInput.value = '';

    // Remove welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const thinkingMessageElement = addMessageToUI('model', '', true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: chatHistory }),
      });

      thinkingMessageElement.remove();

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to get response from server.';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data && data.success && data.data) {
        addMessageToUI('model', data.data);
        chatHistory.push({ role: 'model', text: data.data });
      } else {
        const errorMessage = data.message || 'Sorry, no valid response received.';
        addMessageToUI('model', errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      if(thinkingMessageElement) thinkingMessageElement.remove();
      addMessageToUI('model', error.message);
    }
  });

  function addMessageToUI(role, content, isThinking = false) {
    const messageElement = document.createElement('div');
    const senderClass = role === 'model' ? 'bot' : 'user';
    
    messageElement.classList.add('message', senderClass);
    
    if (isThinking) {
      messageElement.classList.add('thinking');
      messageElement.innerHTML = `
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
        Thinking...
      `;
    } else {
      messageElement.textContent = content;
      
      // Add timestamp
      const timeElement = document.createElement('div');
      timeElement.classList.add('message-time');
      timeElement.textContent = getCurrentTime();
      messageElement.appendChild(timeElement);
    }
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }

  // Auto-focus on input when page loads
  userInput.focus();
});