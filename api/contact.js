// Chat questions that are not a preset are emailed with the same FormSubmit
// call the contact form already uses (js/email.js). This file never calls an AI API.
// CONTACT_DRY_RUN=true validates and returns success without sending.

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const DEFAULT_ADMIN_EMAIL = "stormychaseforrester@gmail.com";
const DEFAULT_CC = "hello@techaidaustralia.com.au";

const rateBuckets = new Map();

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

function clean(value, max) {
    if (typeof value !== "string") return "";
    return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200;
}

function validPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15 && /^[0-9+\-().\s]+$/.test(phone);
}

function adminEmail() {
    const configured = clean(process.env.ADMIN_EMAIL || "", 200);
    return configured || DEFAULT_ADMIN_EMAIL;
}

function ccEmail() {
    if (process.env.CONTACT_CC === "") return "";
    const configured = clean(process.env.CONTACT_CC || "", 200);
    return process.env.CONTACT_CC === undefined ? DEFAULT_CC : configured;
}

async function sendViaFormSubmit(fields) {
    const to = adminEmail();
    if (!validEmail(to)) {
        throw new Error("admin email");
    }
    const payload = {
        _subject: "New chat question submission from website",
        name: fields.name,
        email: fields.email,
        phone: fields.phone,
        message: fields.message,
        _replyto: fields.email
    };
    const cc = ccEmail();
    if (cc) payload._cc = cc;

    const response = await fetch(`https://formsubmit.co/ajax/${to}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
    });

    let data = null;
    try {
        data = await response.json();
    } catch (err) {
        data = null;
    }
    const accepted = response.ok && data && data.success !== false && data.success !== "false";
    if (!accepted) {
        const error = new Error("formsubmit");
        error.status = response.status;
        throw error;
    }
}

async function handler(req, res) {
    if ((req.method || "GET") !== "POST") {
        res.setHeader("Allow", "POST");
        send(res, 405, { error: "Method not allowed" });
        return;
    }

    if (!withinRateLimit(clientIp(req))) {
        send(res, 429, { error: "Too many messages. Please wait a few minutes and try again." });
        return;
    }

    const body = await readBody(req);
    if (!body || typeof body !== "object") {
        send(res, 400, { error: "Please check the email address and phone number." });
        return;
    }

    // Honeypot. A filled field is treated as success and is not emailed.
    const honeypot = clean(body.company || body.website || "", 200);
    if (honeypot) {
        send(res, 200, { ok: true });
        return;
    }

    const name = clean(body.name, 100);
    const email = clean(body.email, 200);
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 2000);

    if (!message || !validEmail(email) || !validPhone(phone)) {
        send(res, 400, { error: "Please check the email address and phone number." });
        return;
    }

    if (process.env.CONTACT_DRY_RUN === "true") {
        send(res, 200, { ok: true, dryRun: true });
        return;
    }

    try {
        await sendViaFormSubmit({ name, email, phone, message });
        send(res, 200, { ok: true });
    } catch (err) {
        console.error("Contact form send failed", err && err.status ? err.status : "error");
        send(res, 502, { error: "Sorry, we could not send that just now." });
    }
}

module.exports = handler;
module.exports.validEmail = validEmail;
module.exports.validPhone = validPhone;
module.exports.DEFAULT_ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL;
module.exports.DEFAULT_CC = DEFAULT_CC;
