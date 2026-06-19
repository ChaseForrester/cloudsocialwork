document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Inject the widget HTML ───────────────────────────────────────────
    if (!document.getElementById('chat-widget')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="chat-widget" class="chat-widget">
                <button id="chat-toggle-btn" class="chat-toggle-btn" aria-label="Open chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                </button>
                <div id="chat-window" class="chat-window hidden">
                    <div class="chat-header">
                        <h3>Cloud Social Work Assistant</h3>
                        <button id="chat-close-btn" aria-label="Close chat">&times;</button>
                    </div>
                    <div id="chat-messages" class="chat-messages"></div>
                    <form id="chat-input-form" class="chat-input-form">
                        <input type="text" id="user-query-input" name="user-query" placeholder="Type a message..." autocomplete="off">
                        <button type="submit" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        `);
    }

    // ─── 2. Grab DOM references ──────────────────────────────────────────────
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow    = document.getElementById('chat-window');
    const chatCloseBtn  = document.getElementById('chat-close-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput     = document.getElementById('user-query-input');
    const chatMessages  = document.getElementById('chat-messages');

    const GEMINI_API_KEY = "AQ.Ab8RN6KdOsRJaO7xvhl66D" + "EWF6O7Pb1B7NQPvOWTh6ofVVoOyw";

    const SYSTEM_PROMPT = "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise. IMPORTANT INFO to give users if asked: Contact Email is mmcgowan1@outlook.com. Phone number is 0451 011 473. Quick links to our pages: Home (index.html), About Us (about-us.html), Contact Us (faq.html), Events (events.html), Blog (blog.html), Book In (book-in.html), Laws/Documents (documents.html), Therapeutic Supports (therapeutic-supports.html), Social Work Services (social-work.html). SIMPLE FAQ: Q: Do you work with NDIS? A: Yes, we provide supports for NDIA Managed, Plan Managed, and Self Managed NDIS participants. Q: What are your hours? A: We are open Monday-Friday 9am-5pm, and Saturday 9am-Noon. Q: Where are you located? A: We serve the Illawarra, Nowra, and Sydney regions. Q: How do I book an appointment? A: You can book via the 'BOOK IN' link or page. LEAD COLLECTION: If a user wants to leave their contact details or make an inquiry, you DO NOT need to point them to a form. You can act as the form! Ask them for their Name, Phone Number, and what they need help with. Once they provide it, tell them 'Thank you, I have passed your details to our team and we will be in touch shortly!' AND YOU MUST APPEND exactly '||LEAD_CAPTURED||' to the very end of your response.";

    // ─── 3. Message history (stored as a plain array) ────────────────────────
    // Each item: { role: 'user'|'assistant', text: '...' }
    let messageHistory = [];
    let quickRepliesUsed = false;

    function saveHistory() {
        try {
            sessionStorage.setItem('csw-history', JSON.stringify(messageHistory));
            sessionStorage.setItem('csw-quick-used', quickRepliesUsed ? '1' : '0');
        } catch(e) {}
    }

    function loadHistory() {
        try {
            const raw = sessionStorage.getItem('csw-history');
            if (raw) {
                messageHistory = JSON.parse(raw);
                quickRepliesUsed = sessionStorage.getItem('csw-quick-used') === '1';
                // Re-render all saved messages
                messageHistory.forEach(m => renderMessage(m.text, m.role));
            }
        } catch(e) {
            messageHistory = [];
        }

        // If no history, show welcome + quick replies
        if (messageHistory.length === 0) {
            showWelcome();
        }
    }

    function showWelcome() {
        const welcome = "Hello! I'm the Cloud Social Work AI assistant (powered by Gemini). How can I help you learn about our services today?";
        renderMessage(welcome, 'assistant');

        const qr = document.createElement('div');
        qr.className = 'chat-quick-replies';
        qr.id = 'chat-quick-replies';
        ['Do you work with NDIS?', 'What are your hours?', 'Where are you located?', 'How do I book an appointment?', 'What services do you offer?']
            .forEach(label => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.textContent = label;
                btn.addEventListener('click', () => {
                    chatInput.value = label;
                    chatInputForm.dispatchEvent(new Event('submit'));
                });
                qr.appendChild(btn);
            });
        chatMessages.appendChild(qr);

        const hint = document.createElement('div');
        hint.className = 'message assistant';
        hint.id = 'chat-quick-reply-prompt';
        hint.style.cssText = 'font-size:12px;padding:0 5px;background:transparent;border:none;margin-top:-5px;box-shadow:none;';
        hint.textContent = 'Feel free to click a question above or ask me anything you like!';
        chatMessages.appendChild(hint);
    }

    function hideQuickReplies() {
        if (quickRepliesUsed) return;
        quickRepliesUsed = true;
        const qr = document.getElementById('chat-quick-replies');
        const qp = document.getElementById('chat-quick-reply-prompt');
        if (qr) qr.remove();
        if (qp) qp.remove();
        saveHistory();
    }

    // ─── 4. Render a message bubble ──────────────────────────────────────────
    function parseMarkdown(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="text-decoration:underline;color:inherit;">$1</a>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    function renderMessage(text, role) {
        const div = document.createElement('div');
        div.className = `message ${role}`;
        div.dataset.rawText = text;
        div.innerHTML = parseMarkdown(text);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div;
    }

    function appendMessage(text, role) {
        const div = renderMessage(text, role);
        messageHistory.push({ role, text });
        saveHistory();
        return div;
    }

    // ─── 5. Toggle / close ───────────────────────────────────────────────────
    chatToggleBtn.addEventListener('click', () => {
        const isHidden = chatWindow.classList.toggle('hidden');
        sessionStorage.setItem('csw-open', isHidden ? '0' : '1');
        if (!isHidden) chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        sessionStorage.setItem('csw-open', '0');
    });

    // ─── 6. Restore open/closed state ───────────────────────────────────────
    if (sessionStorage.getItem('csw-open') === '1') {
        chatWindow.classList.remove('hidden');
    }

    // ─── 7. Load history (or show welcome) ───────────────────────────────────
    loadHistory();

    // ─── 8. Submit handler ───────────────────────────────────────────────────
    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        hideQuickReplies();
        appendMessage(text, 'user');
        chatInput.value = '';

        // Build the Gemini conversation history (user/model alternation)
        const contents = messageHistory.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading';
        loadingDiv.textContent = 'Thinking…';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents,
                        generationConfig: { temperature: 0.7 }
                    })
                }
            );

            if (!res.ok) throw new Error(`API ${res.status}`);
            const data = await res.json();
            let reply = data.candidates[0].content.parts[0].text;

            // Lead capture signal
            if (reply.includes('||LEAD_CAPTURED||')) {
                reply = reply.replace('||LEAD_CAPTURED||', '').trim();
                const transcript = messageHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n') + `\n\nUSER: ${text}\nMODEL: ${reply}`;
                if (typeof sendChatTranscript === 'function') {
                    sendChatTranscript(transcript).catch(err => console.error('Email failed:', err));
                }
            }

            chatMessages.removeChild(loadingDiv);
            appendMessage(reply, 'assistant');

        } catch (err) {
            console.error('Chat error:', err);
            if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
            let msg = 'Sorry, I encountered an error. Please try again.';
            if (err.message.includes('400')) msg = 'API Error: Bad request. Please check the API key.';
            else if (err.name === 'TypeError') msg = 'Network error. Please check your connection.';
            appendMessage(msg, 'assistant');
        }
    });
});
