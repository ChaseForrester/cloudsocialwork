document.addEventListener('DOMContentLoaded', () => {
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('user-query-input');
    const chatMessages = document.getElementById('chat-messages');

    // IMPORTANT: Replace this with your actual Grok API Key
    const GROK_API_KEY = "YOUR_GROK_API_KEY";

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

        if (GROK_API_KEY === "YOUR_GROK_API_KEY") {
            appendMessage("Please open js/chat.js and replace 'YOUR_GROK_API_KEY' with your actual Grok API Key to enable the assistant.", 'assistant');
            return;
        }

        const loadingMsg = appendMessage("Thinking...", 'assistant loading');

        try {
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROK_API_KEY}`
                },
                body: JSON.stringify({
                    model: "grok-beta", // Using grok-beta for text completion
                    messages: [
                        {
                            role: "system",
                            content: "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise."
                        },
                        {
                            role: "user",
                            content: text
                        }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            chatMessages.removeChild(loadingMsg);
            appendMessage(reply, 'assistant');

        } catch (err) {
            console.error("Chat error:", err);
            chatMessages.removeChild(loadingMsg);
            appendMessage("Sorry, I encountered an error connecting to Grok. Please try again later.", 'assistant');
        }
    });
});
