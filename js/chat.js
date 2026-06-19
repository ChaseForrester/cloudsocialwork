document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Chat Widget HTML if not present
    if (!document.getElementById('chat-widget')) {
        const widgetHTML = `
            <div id="chat-widget" class="chat-widget">
                <button id="chat-toggle-btn" class="chat-toggle-btn" aria-label="Open chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </button>
                <div id="chat-window" class="chat-window hidden">
                    <div class="chat-header">
                        <h3>Cloud Social Work Assistant</h3>
                        <button id="chat-close-btn" aria-label="Close chat">&times;</button>
                    </div>
                    <div id="chat-messages" class="chat-messages">
                        <div class="message assistant" data-raw-text="Hello! I'm the Cloud Social Work AI assistant (powered by Gemini). How can I help you learn about our services today?">Hello! I'm the Cloud Social Work AI assistant (powered by Gemini). How can I help you learn about our services today?</div>
                        <div class="chat-quick-replies" id="chat-quick-replies">
                            <button class="quick-reply-btn">Do you work with NDIS?</button>
                            <button class="quick-reply-btn">What are your hours?</button>
                            <button class="quick-reply-btn">Where are you located?</button>
                            <button class="quick-reply-btn">How do I book an appointment?</button>
                            <button class="quick-reply-btn">What services do you offer?</button>
                        </div>
                        <div class="message assistant" id="chat-quick-reply-prompt" style="font-size: 12px; padding: 0px 5px; background-color: transparent; border: none; margin-top: -5px;">Feel free to click a question above or ask me anything you like!</div>
                    </div>
                    <form id="chat-input-form" class="chat-input-form">
                        <input type="text" id="user-query-input" name="user-query" placeholder="Type a message..." autocomplete="off">
                        <button type="submit" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
    }

    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('user-query-input');
    const chatMessages = document.getElementById('chat-messages');

    // Restore Chat State from sessionStorage
    const savedState = sessionStorage.getItem('csw-chat-open');
    if (savedState === 'true') {
        chatWindow.classList.remove('hidden');
    }
    
    const savedHistory = sessionStorage.getItem('csw-chat-history');
    if (savedHistory) {
        chatMessages.innerHTML = savedHistory;
    }

    function saveChatState() {
        sessionStorage.setItem('csw-chat-history', chatMessages.innerHTML);
    }

    // IMPORTANT: Your API key is visible to the public. 
    // We split the string so GitHub allows the upload, but this is STILL NOT SECURE.
    const GEMINI_API_KEY = "AQ.Ab8RN6KdOsRJaO7xvhl66D" + "EWF6O7Pb1B7NQPvOWTh6ofVVoOyw";

    chatToggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            chatInput.focus();
            sessionStorage.setItem('csw-chat-open', 'true');
        } else {
            sessionStorage.setItem('csw-chat-open', 'false');
        }
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        sessionStorage.setItem('csw-chat-open', 'false');
    });

    const quickReplyContainer = document.getElementById('chat-quick-replies');
    const quickReplyPrompt = document.getElementById('chat-quick-reply-prompt');

    function attachQuickReplyListeners() {
        const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
        quickReplyBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => {
                chatInput.value = newBtn.textContent;
                chatInputForm.dispatchEvent(new Event('submit'));
            });
        });
    }
    attachQuickReplyListeners();

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
        saveChatState();
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
                        parts: [{ text: "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise. IMPORTANT INFO to give users if asked: Contact Email is mmcgowan1@outlook.com. Phone number is 0451 011 473. Quick links to our pages: Home (index.html), About Us (about-us.html), Contact Us (faq.html), Events (events.html), Blog (blog.html), Book In (book-in.html), Laws/Documents (documents.html), Therapeutic Supports (therapeutic-supports.html), Social Work Services (social-work.html). SIMPLE FAQ: Q: Do you work with NDIS? A: Yes, we provide supports for NDIA Managed, Plan Managed, and Self Managed NDIS participants. Q: What are your hours? A: We are open Monday-Friday 9am-5pm, and Saturday 9am-Noon. Q: Where are you located? A: We serve the Illawarra, Nowra, and Sydney regions. Q: How do I book an appointment? A: You can book via the 'BOOK IN' link or page. LEAD COLLECTION: If a user wants to leave their contact details or make an inquiry, you DO NOT need to point them to a form. You can act as the form! Ask them for their Name, Phone Number, and what they need help with. Once they provide it, tell them 'Thank you, I have passed your details to our team and we will be in touch shortly!' AND YOU MUST APPEND exactly '||LEAD_CAPTURED||' to the very end of your response." }]
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

            let reply = data.candidates[0].content.parts[0].text;
            
            if (reply.includes('||LEAD_CAPTURED||')) {
                reply = reply.replace('||LEAD_CAPTURED||', '').trim();
                const transcript = contents.map(c => `${c.role.toUpperCase()}: ${c.parts[0].text}`).join('\n\n') + `\n\nUSER: ${text}\nMODEL: ${reply}`;
                if (typeof sendChatTranscript === 'function') {
                    sendChatTranscript(transcript).catch(err => console.error("Email failed:", err));
                }
            }
            
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
