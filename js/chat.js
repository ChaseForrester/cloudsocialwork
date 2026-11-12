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
                        <input type="text" id="user-query-input" name="user-query" placeholder="Type a message..." autocomplete="off" disabled>
                        <button type="submit" aria-label="Send message" disabled>
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
    const chatSubmitBtn = chatInputForm.querySelector('button[type="submit"]');

    // Calls are allowed only after /api/chat says the server flag is on.
    let chatEnabled = false;

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
                messageHistory.forEach(m => renderMessage(m.text, m.role));
            }
        } catch(e) {
            messageHistory = [];
        }

        if (messageHistory.length === 0) {
            showWelcome();
        }
    }

    function showWelcome() {
        const welcome = "Hello! I'm the Cloud Social Work assistant. How can I help you learn about our services today?";
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
                    if (!chatEnabled) return;
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

    function setComposerEnabled(enabled) {
        chatInput.disabled = !enabled;
        if (chatSubmitBtn) chatSubmitBtn.disabled = !enabled;
        chatInput.placeholder = enabled ? 'Type a message...' : 'Assistant unavailable';
    }

    function showUnavailable() {
        chatEnabled = false;
        setComposerEnabled(false);
        chatMessages.innerHTML = '';

        const div = document.createElement('div');
        div.className = 'message assistant chat-unavailable';

        const paragraph = document.createElement('p');
        paragraph.append('Our AI assistant is temporarily unavailable. Please use the ');

        const formLink = document.createElement('a');
        formLink.href = 'contact-us.html';
        formLink.textContent = 'contact form';
        paragraph.append(formLink);

        paragraph.append(' or call us on ');

        const phoneLink = document.createElement('a');
        phoneLink.href = 'tel:0451011473';
        phoneLink.textContent = '0451 011 473';
        paragraph.append(phoneLink);

        paragraph.append('. You can also email ');

        const emailLink = document.createElement('a');
        emailLink.href = 'mailto:mmcgowan1@outlook.com';
        emailLink.textContent = 'mmcgowan1@outlook.com';
        paragraph.append(emailLink);
        paragraph.append('.');

        div.append(paragraph);
        chatMessages.appendChild(div);
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
        if (!isHidden && chatEnabled) chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        sessionStorage.setItem('csw-open', '0');
    });

    if (sessionStorage.getItem('csw-open') === '1') {
        chatWindow.classList.remove('hidden');
    }

    // Off until the server confirms AI_CHAT_ENABLED=true. This path never calls the model.
    showUnavailable();

    fetch('/api/chat', { method: 'GET', cache: 'no-store', headers: { 'Accept': 'application/json' } })
        .then(res => {
            if (!res.ok) throw new Error('status');
            return res.json();
        })
        .then(data => {
            if (!data || data.enabled !== true) return;
            chatEnabled = true;
            setComposerEnabled(true);
            chatMessages.innerHTML = '';
            loadHistory();
        })
        .catch(() => {
            chatEnabled = false;
            showUnavailable();
        });

    // ─── 6. Submit handler ───────────────────────────────────────────────────
    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!chatEnabled) {
            showUnavailable();
            return;
        }

        const text = chatInput.value.trim();
        if (!text) return;

        hideQuickReplies();
        appendMessage(text, 'user');
        chatInput.value = '';

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading';
        loadingDiv.textContent = 'Thinking…';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    messages: messageHistory.slice(-6).map(m => ({ role: m.role, text: m.text }))
                })
            });

            const data = await res.json().catch(() => ({}));
            if (res.status === 503 || data.enabled === false) {
                chatMessages.removeChild(loadingDiv);
                showUnavailable();
                return;
            }
            if (!res.ok) throw new Error(`API ${res.status}`);

            let reply = data.reply;
            if (typeof reply !== 'string' || !reply.trim()) throw new Error('empty');

            if (reply.includes('||LEAD_CAPTURED||')) {
                reply = reply.replace('||LEAD_CAPTURED||', '').trim();
                const transcript = messageHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n') + `\n\nMODEL: ${reply}`;
                if (typeof sendChatTranscript === 'function') {
                    sendChatTranscript(transcript).catch(err => console.error('Email failed:', err));
                }
            }

            chatMessages.removeChild(loadingDiv);
            appendMessage(reply, 'assistant');
        } catch (err) {
            console.error('Chat error:', err);
            if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
            appendMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    });
});
