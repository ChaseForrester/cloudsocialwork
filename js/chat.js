document.addEventListener('DOMContentLoaded', () => {

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

    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow    = document.getElementById('chat-window');
    const chatCloseBtn  = document.getElementById('chat-close-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput     = document.getElementById('user-query-input');
    const chatMessages  = document.getElementById('chat-messages');

    const presets = Array.isArray(window.CSW_PRESETS) ? window.CSW_PRESETS : [];
    let chatEnabled = false;
    let aiStatusKnown = false;
    let messageHistory = [];

    function normalise(text) {
        return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function findPreset(text) {
        const key = normalise(text);
        return presets.find(item => normalise(item.question) === key) || null;
    }

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
        try {
            sessionStorage.setItem('csw-history', JSON.stringify(messageHistory.slice(-12)));
        } catch (err) {}
        return div;
    }

    function showPresets() {
        const existing = document.getElementById('chat-quick-replies');
        if (existing) existing.remove();
        if (!presets.length) return;

        const wrap = document.createElement('div');
        wrap.className = 'chat-quick-replies';
        wrap.id = 'chat-quick-replies';
        presets.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quick-reply-btn';
            btn.textContent = item.question;
            btn.addEventListener('click', () => answerPreset(item));
            wrap.appendChild(btn);
        });
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showWelcome() {
        renderMessage("Hello. Choose a question below, or type your own.", 'assistant');
        showPresets();
    }

    function answerPreset(item) {
        appendMessage(item.question, 'user');
        appendMessage(item.answer, 'assistant');
        showPresets();
    }

    function showHandoff(question) {
        const previous = document.getElementById('chat-handoff');
        if (previous) previous.remove();

        const box = document.createElement('div');
        box.className = 'message assistant chat-handoff';
        box.id = 'chat-handoff';

        const intro = document.createElement('p');
        intro.textContent = "I don't have a prepared answer for that. Leave your email and phone and I'll send your question to the team. Your name is optional.";
        box.appendChild(intro);

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Name (optional)';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.autocomplete = 'name';
        nameInput.maxLength = 100;
        nameLabel.appendChild(nameInput);

        const emailLabel = document.createElement('label');
        emailLabel.textContent = 'Email';
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.name = 'email';
        emailInput.autocomplete = 'email';
        emailInput.required = true;
        emailInput.maxLength = 200;
        emailLabel.appendChild(emailInput);

        const phoneLabel = document.createElement('label');
        phoneLabel.textContent = 'Phone';
        const phoneInput = document.createElement('input');
        phoneInput.type = 'tel';
        phoneInput.name = 'phone';
        phoneInput.autocomplete = 'tel';
        phoneInput.required = true;
        phoneInput.maxLength = 40;
        phoneLabel.appendChild(phoneInput);

        const honeypotLabel = document.createElement('label');
        honeypotLabel.className = 'chat-honeypot';
        honeypotLabel.textContent = 'Company';
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'company';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypotLabel.appendChild(honeypot);

        const sendBtn = document.createElement('button');
        sendBtn.type = 'button';
        sendBtn.className = 'chat-handoff-send';
        sendBtn.textContent = 'Send to the team';

        const note = document.createElement('p');
        note.className = 'chat-handoff-note';

        sendBtn.addEventListener('click', async () => {
            note.textContent = '';
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            const phoneDigits = phone.replace(/\D/g, '');
            if (!emailOk || phoneDigits.length < 8 || phoneDigits.length > 15) {
                note.textContent = 'Please enter a valid email address and phone number.';
                return;
            }

            sendBtn.disabled = true;
            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name: nameInput.value.trim(),
                        email,
                        phone,
                        message: question,
                        company: honeypot.value
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.ok) {
                    throw new Error('send');
                }
                const done = document.createElement('div');
                done.className = 'message assistant';
                done.textContent = "Thanks, your question has been sent to the team. We'll be in touch soon.";
                box.replaceWith(done);
            } catch (err) {
                note.textContent = '';
                const fail = document.createElement('span');
                fail.append("Sorry, we couldn't send that just now. Please call us on ");
                const phoneLink = document.createElement('a');
                phoneLink.href = 'tel:0451011473';
                phoneLink.textContent = '0451 011 473';
                fail.append(phoneLink);
                fail.append('.');
                note.appendChild(fail);
                sendBtn.disabled = false;
            }
        });

        box.append(nameLabel, emailLabel, phoneLabel, honeypotLabel, sendBtn, note);
        chatMessages.appendChild(box);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        emailInput.focus();
    }

    async function sendToAi(text) {
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
            if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
            if (res.status === 503 || data.enabled === false) {
                chatEnabled = false;
                showHandoff(text);
                return;
            }
            if (!res.ok || typeof data.reply !== 'string' || !data.reply.trim()) {
                throw new Error('api');
            }
            let reply = data.reply;
            if (reply.includes('||LEAD_CAPTURED||')) {
                reply = reply.replace('||LEAD_CAPTURED||', '').trim();
                const transcript = messageHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
                if (typeof sendChatTranscript === 'function') {
                    sendChatTranscript(transcript).catch(err => console.error('Email failed:', err));
                }
            }
            appendMessage(reply, 'assistant');
        } catch (err) {
            if (chatMessages.contains(loadingDiv)) chatMessages.removeChild(loadingDiv);
            appendMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    }

    const aiStatusPromise = fetch('/api/chat', { method: 'GET', cache: 'no-store', headers: { 'Accept': 'application/json' } })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            chatEnabled = !!(data && data.enabled === true);
        })
        .catch(() => {
            chatEnabled = false;
        })
        .finally(() => {
            aiStatusKnown = true;
        });

    chatToggleBtn.addEventListener('click', () => {
        const isHidden = chatWindow.classList.toggle('hidden');
        sessionStorage.setItem('csw-open', isHidden ? '0' : '1');
        if (!isHidden) chatInput.focus();
    });

    chatCloseBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
        sessionStorage.setItem('csw-open', '0');
    });

    if (sessionStorage.getItem('csw-open') === '1') {
        chatWindow.classList.remove('hidden');
    }

    showWelcome();

    chatInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';

        const preset = findPreset(text);
        appendMessage(text, 'user');
        if (preset) {
            appendMessage(preset.answer, 'assistant');
            showPresets();
            return;
        }

        if (!aiStatusKnown) await aiStatusPromise;
        if (chatEnabled) {
            await sendToAi(text);
            return;
        }
        showHandoff(text);
    });
});
