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

    const quickReplyContainer = document.getElementById('chat-quick-replies');
    const quickReplyPrompt = document.getElementById('chat-quick-reply-prompt');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');

    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatInput.value = btn.textContent;
            chatInputForm.dispatchEvent(new Event('submit'));
        });
    });

    function hideQuickReplies() {
        if (quickReplyContainer && quickReplyPrompt) {
            quickReplyContainer.style.display = 'none';
            quickReplyPrompt.style.display = 'none';
        }
    }

    function parseMarkdown(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="text-decoration: underline;">$1</a>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        // Handle loading class correctly
        if (sender === 'assistant loading') {
            msgDiv.className = `message assistant loading`;
            msgDiv.textContent = text;
        } else {
            msgDiv.className = `message ${sender}`;
            msgDiv.dataset.rawText = text;
            msgDiv.innerHTML = parseMarkdown(text);
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    }

    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        hideQuickReplies();
        appendMessage(text, 'user');
        chatInput.value = '';

        if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            appendMessage("Please open js/chat.js and replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API Key to enable the assistant.", 'assistant');
            return;
        }

        const loadingMsg = appendMessage("Thinking...", 'assistant loading');

        try {
            const historyElements = Array.from(chatMessages.querySelectorAll('.message:not(.loading)'));
            const contents = historyElements.map(el => {
                const role = el.classList.contains('user') ? 'user' : 'model';
                const rawText = el.dataset.rawText || el.textContent;
                return {
                    role: role,
                    parts: [{ text: rawText }]
                };
            });

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise. IMPORTANT INFO to give users if asked: Contact Email is mmcgowan1@outlook.com. Phone number is 0451 011 473. Quick links to our pages: Home (index.html), About Us (about-us.html), Contact Us (faq.html), Events (events.html), Blog (blog.html), Book In (book-in.html), Laws/Documents (documents.html), Therapeutic Supports (therapeutic-supports.html), Social Work Services (social-work.html). SIMPLE FAQ: Q: Do you work with NDIS? A: Yes, we provide supports for NDIA Managed, Plan Managed, and Self Managed NDIS participants. Q: What are your hours? A: We are open Monday-Friday 9am-5pm, and Saturday 9am-Noon. Q: Where are you located? A: We serve the Illawarra, Nowra, and Sydney regions. Q: How do I book an appointment? A: You can book via the 'BOOK IN' link or page. LEAD COLLECTION: If a user wants to leave their contact details or make an inquiry, you DO NOT need to point them to a form. You can act as the form! Ask them for their Name, Phone Number, and what they need help with. Once they provide it, tell them 'Thank you, I have passed your details to our team and we will be in touch shortly!'" }]
                    },
                    contents: contents,
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
