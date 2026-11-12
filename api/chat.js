// Chat is off unless AI_CHAT_ENABLED is exactly "true".
// The xAI key is read from XAI_API_KEY on the server. Never send it to the browser.

const MODEL = "grok-4.20-0309-non-reasoning";
const ENDPOINT = "https://api.x.ai/v1/chat/completions";
const MAX_OUTPUT_TOKENS = 300;
const MAX_HISTORY = 6;
const MAX_MESSAGE_CHARS = 500;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;

const SYSTEM_PROMPT = "You are the Cloud Social Work AI assistant. You help answer questions about Cloud Social Work's services. We offer Therapeutic Supports for the NDIS (for NDIA Managed, Plan Managed, and Self Managed participants) and comprehensive Social Work services across Wollongong, Sydney, and Nowra. Keep your answers helpful, compassionate, and concise. IMPORTANT INFO to give users if asked: Contact Email is mmcgowan1@outlook.com. Phone number is 0451 011 473. Quick links to our pages: Home (index.html), About Us (about-us.html), Contact Us (faq.html), Events (events.html), Blog (blog.html), Book In (book-in.html), Laws/Documents (documents.html), Therapeutic Supports (therapeutic-supports.html), Social Work Services (social-work.html). SIMPLE FAQ: Q: Do you work with NDIS? A: Yes, we provide supports for NDIA Managed, Plan Managed, and Self Managed NDIS participants. Q: What are your hours? A: We are open Monday-Friday 9am-5pm, and Saturday 9am-Noon. Q: Where are you located? A: We serve the Illawarra, Nowra, and Sydney regions. Q: How do I book an appointment? A: You can book via the 'BOOK IN' link or page. LEAD COLLECTION: If a user wants to leave their contact details or make an inquiry, you DO NOT need to point them to a form. You can act as the form! Ask them for their Name, Phone Number, and what they need help with. Once they provide it, tell them 'Thank you, I have passed your details to our team and we will be in touch shortly!' AND YOU MUST APPEND exactly '||LEAD_CAPTURED||' to the very end of your response.";

const UNAVAILABLE = "Our AI assistant is temporarily unavailable. Please use the contact form or call us.";

const rateBuckets = new Map();

function chatIsEnabled() {
    return process.env.AI_CHAT_ENABLED === "true";
}

function send(res, status, body) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
}

function clientIp(req) {
    const header = req.headers || {};
    const forwarded = header["x-forwarded-for"];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof raw === "string" && raw.trim()) {
        return raw.split(",")[0].trim().slice(0, 80);
    }
    const realIp = header["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) return realIp.trim().slice(0, 80);
    return "unknown";
}

function withinRateLimit(ip) {
    const now = Date.now();
    let bucket = rateBuckets.get(ip);
    if (!bucket || now - bucket.start >= RATE_WINDOW_MS) {
        bucket = { start: now, count: 0 };
        rateBuckets.set(ip, bucket);
    }
    bucket.count += 1;
    if (rateBuckets.size > 5000) {
        for (const [key, value] of rateBuckets) {
            if (now - value.start >= RATE_WINDOW_MS) rateBuckets.delete(key);
        }
    }
    return bucket.count <= RATE_MAX;
}

function readBody(req) {
    if (req.body != null) {
        if (typeof req.body === "string") {
            try {
                return Promise.resolve(JSON.parse(req.body));
            } catch (err) {
                return Promise.resolve(null);
            }
        }
        if (typeof req.body === "object") return Promise.resolve(req.body);
    }
    if (!req.on) return Promise.resolve({});
    return new Promise((resolve) => {
        const chunks = [];
        let size = 0;
        req.on("data", (chunk) => {
            size += chunk.length;
            if (size > 20000) {
                resolve(null);
                req.destroy();
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => {
            if (!chunks.length) {
                resolve({});
                return;
            }
            try {
                resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
            } catch (err) {
                resolve(null);
            }
        });
        req.on("error", () => resolve(null));
    });
}

function buildMessages(body) {
    const incoming = body && Array.isArray(body.messages) ? body.messages : [];
    const cleaned = [];
    for (const item of incoming) {
        if (!item || typeof item !== "object") continue;
        const role = item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
        if (!role) continue;
        const source = typeof item.text === "string" ? item.text : typeof item.content === "string" ? item.content : "";
        const text = source.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_CHARS);
        if (!text) continue;
        cleaned.push({ role, content: text });
    }
    const recent = cleaned.slice(-MAX_HISTORY);
    if (!recent.length || recent[recent.length - 1].role !== "user") return null;
    return [{ role: "system", content: SYSTEM_PROMPT }, ...recent];
}

async function callModel(messages) {
    const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages,
            max_tokens: MAX_OUTPUT_TOKENS,
            temperature: 0.7
        }),
        signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
        const error = new Error(`xAI ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    const reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (typeof reply !== "string" || !reply.trim()) {
        throw new Error("empty reply");
    }
    return reply.trim();
}

async function handler(req, res) {
    const method = req.method || "GET";

    if (method === "GET") {
        send(res, 200, { enabled: chatIsEnabled() });
        return;
    }

    if (method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        send(res, 405, { error: "Method not allowed" });
        return;
    }

    if (!chatIsEnabled()) {
        send(res, 503, { enabled: false, message: UNAVAILABLE });
        return;
    }

    if (!withinRateLimit(clientIp(req))) {
        send(res, 429, { error: "Too many messages. Please wait a few minutes and try again." });
        return;
    }

    if (!process.env.XAI_API_KEY) {
        send(res, 503, { enabled: false, message: UNAVAILABLE });
        return;
    }

    const body = await readBody(req);
    if (body == null) {
        send(res, 400, { error: "Invalid request." });
        return;
    }

    const messages = buildMessages(body);
    if (!messages) {
        send(res, 400, { error: "Please type a message." });
        return;
    }

    try {
        const reply = await callModel(messages);
        send(res, 200, { reply });
    } catch (err) {
        console.error("Chat request failed", err && err.status ? err.status : "error");
        send(res, 502, { error: "Sorry, I encountered an error. Please try again." });
    }
}

module.exports = handler;
module.exports.chatIsEnabled = chatIsEnabled;
module.exports.buildMessages = buildMessages;
module.exports.MODEL = MODEL;
module.exports.MAX_OUTPUT_TOKENS = MAX_OUTPUT_TOKENS;
module.exports.ENDPOINT = ENDPOINT;
