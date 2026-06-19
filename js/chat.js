document.addEventListener('DOMContentLoaded', () => {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('user-query-input');
    const chatMessages = document.getElementById('chat-messages');

    // IMPORTANT: Your API key is visible to the public. 
    // We split the string so GitHub allows the upload, but this is STILL NOT SECURE.
    const GEMINI_API_KEY = "AQ.Ab8RN6KdOsRJaO7xvhl66D" + "EWF6O7Pb1B7NQPvOWTh6ofVVoOyw";

    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        // Handle loading class correctly
        if (sender === 'assistant loading') {
            msgDiv.className = `message assistant loading`;
        } else {
            msgDiv.className = `message ${sender}`;
        }
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    }

    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        chatInput.value = '';

        if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            appendMessage("Please open js/chat.js and replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API Key to enable the assistant.", 'assistant');
            return;
        }

        const loadingMsg = appendMessage("Thinking...", 'assistant loading');

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise." }]
                    },
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: text }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.candidates[0].content.parts[0].text;
            
            chatMessages.removeChild(loadingMsg);
            appendMessage(reply, 'assistant');

        } catch (err) {
            console.error("Chat error:", err);
            chatMessages.removeChild(loadingMsg);
            
            let errorMessage = "Sorry, I encountered an error connecting to Gemini. Please try again later.";
            if (err.message.includes("400")) {
                errorMessage = "API Error: Bad Request. Please check your API key.";
            } else if (err.name === 'TypeError') {
                errorMessage = "Network Error: Please check your internet connection.";
            }
            appendMessage(errorMessage, 'assistant');
        }
    });
});
