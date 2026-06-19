import os

template = """<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{meta_title}</title>
    <meta name="description" content="{meta_desc}">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Figtree:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" type="image/x-icon" href="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/66691d9aa3f93414bb8f8b39_imresizer-1718164884165.jpg">
</head>
<body>
    <div class="nav-overlay"></div>
    <nav class="navbar-top">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
            </a>
            <div class="nav-links">
                <a href="index.html" class="nav-link">HOME</a>
                <a href="about-us.html" class="nav-link">ABOUT</a>
                <a href="faq.html" class="nav-link">CONTACT</a>
                <a href="events.html" class="nav-link">EVENTS</a>
                <a href="blog.html" class="nav-link active">BLOG</a>
                <a href="book-in.html" class="btn-primary">BOOK IN</a>
            </div>
            <button class="menu-button" aria-label="Toggle navigation">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>
    <nav class="navbar-side">
        <div class="side-nav-links">
            <a href="index.html" class="nav-link">HOME</a>
            <a href="about-us.html" class="nav-link">ABOUT</a>
            <a href="faq.html" class="nav-link">CONTACT</a>
            <a href="events.html" class="nav-link">EVENTS</a>
            <a href="blog.html" class="nav-link active">BLOG</a>
            <a href="book-in.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">BOOK IN</a>
        </div>
    </nav>

    <div class="blog-hero" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('{image}');">
        <div class="container-small animate-on-scroll">
            <h1 class="hero-title">{title}</h1>
            <p class="hero-subtitle">{date} &bull; {category}</p>
        </div>
    </div>

    <main class="blog-article container-small animate-on-scroll">
        <div class="social-share-bar">
            <span>Share this post:</span>
            <button onclick="shareSocial('facebook')" class="btn-share facebook">Facebook</button>
            <button onclick="shareSocial('linkedin')" class="btn-share linkedin">LinkedIn</button>
            <button onclick="shareSocial('email')" class="btn-share email">Email</button>
            <button onclick="shareSocial('copy')" class="btn-share copy">Copy Link</button>
        </div>
        
        <div class="article-content">
            {content}
        </div>
        
        <div class="article-footer">
            <a href="blog.html" class="btn-outline">&larr; Back to Blog</a>
        </div>
    </main>

    <footer class="site-footer">
        <div class="footer-grid">
            <div class="footer-brand">
                <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
                <p class="tagline">Dedication to improving lives through person-centered and community-focused services.</p>
                <div class="social-links">
                    <a href="contact-us.html" class="social-link" aria-label="Google">
                        <svg viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/></svg>
                    </a>
                    <a href="https://www.facebook.com/outlivinadventures" target="_blank" class="social-link" aria-label="Facebook">
                        <svg viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
                    </a>
                    <a href="https://www.instagram.com/outlivinadventures" target="_blank" class="social-link" aria-label="Instagram">
                        <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    </a>
                </div>
            </div>
            <div class="footer-column">
                <h3>Get in touch</h3>
                <p>mmcgowan1@outlook.com</p>
                <p>0451 011 473</p>
                <p>Illawarra | Nowra | Sydney</p>
            </div>
            <div class="footer-column">
                <h3>We are open</h3>
                <p>Mon - Fri: 9am - 5pm</p>
                <p>Sat: 9am - Noon</p>
                <p>Sun: Closed</p>
            </div>
            <div class="footer-column">
                <h3>Links</h3>
                <a href="index.html" class="footer-link">Home</a>
                <a href="contact-us.html" class="footer-link">Contact Us</a>
                <a href="about-us.html" class="footer-link">About Us</a>
                <a href="documents.html" class="footer-link">Laws</a>
                <a href="blog.html" class="footer-link">Blog</a>
                <div class="footer-newsletter">
                    <h4>Subscribe</h4>
                    <form class="newsletter-form" onsubmit="event.preventDefault(); alert('Subscribed successfully!');">
                        <input type="email" placeholder="Email address" class="newsletter-input" required>
                        <button type="submit" class="newsletter-btn">Join</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">All visuals and artworks were illustrated and designed by <a href="https://www.linkedin.com/in/chaseforrester/" target="_blank">Chase Forrester</a>. Copyright © <span class="year">2026</span> <a href="https://www.techaidaustralia.com.au/" target="_blank">Tech Aid Australia</a>. All Rights Reserved</p>
            <p class="footer-acknowledgement">We acknowledge the Traditional Custodians of the land on which we operate, the Dharawal people, and pay our respects to Elders past, present, and emerging.</p>
        </div>
    </footer>
    <button id="theme-toggle-btn" class="theme-toggle" aria-label="Toggle Theme">
        <svg class="moon-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
    </button>
    <script src="js/main.js"></script>
</body>
</html>
"""

posts = [
    {
        "id": 1,
        "title": "Understanding the Latest NDIS Updates for 2026",
        "meta_title": "NDIS Pricing & Law Updates 2026 | Cloud Social Work",
        "meta_desc": "Stay informed on the latest 2026 updates to NDIS pricing, laws, and regulations. Discover how Cloud Social Work helps you navigate these changes.",
        "category": "Laws & News",
        "date": "Aug 14, 2026",
        "image": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>What You Need to Know About the 2026 NDIS Changes</h2><p>The National Disability Insurance Scheme (NDIS) is continuously evolving. In 2026, the government introduced several key changes to the pricing framework and participant rights to ensure greater transparency and flexibility. These new laws impact how therapeutic supports and community participation services are billed and delivered.</p><p>At Cloud Social Work, we actively monitor these legislative changes so you don't have to. Our goal is to ensure you maximize your plan's potential without the stress of navigating bureaucratic red tape.</p><h3>Key Takeaways for Participants</h3><ul><li>Increased funding flexibility for community-based therapies.</li><li>Stricter guidelines on unregistered providers to enhance safety.</li><li>New digital tools for managing your plan directly from your smartphone.</li></ul><p>If you're confused about what these changes mean for your specific situation, <a href='contact-us.html'>contact our team today</a> for a personalized review of your support plan.</p>"
    },
    {
        "id": 2,
        "title": "Navigating Mental Health Support: Where to Start",
        "meta_title": "Navigating Mental Health Support | Cloud Social Work",
        "meta_desc": "Feeling overwhelmed? Learn how to take the first steps in finding the right mental health support and therapy options tailored to your unique needs.",
        "category": "Consumer Guide",
        "date": "Aug 22, 2026",
        "image": "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>The First Step is the Hardest</h2><p>Reaching out for mental health support can be an incredibly daunting experience. The system is complex, and knowing whether you need a psychologist, a social worker, or a peer support group can be confusing.</p><p>At Cloud Social Work, we believe in a holistic, person-centered approach. When you first contact us, we don't just assign you a service; we sit down with you to understand your story, your challenges, and your goals.</p><h3>Building Your Support Network</h3><p>Effective mental health care often involves a multi-disciplinary approach. A social worker acts as the 'glue' that holds your care plan together, connecting you to therapeutic supports, advocating for your needs, and ensuring your home environment supports your recovery.</p><p>Ready to take the first step? <a href='book-in.html'>Book an initial consultation</a> with us today.</p>"
    },
    {
        "id": 3,
        "title": "The Power of Community Engagement in Recovery",
        "meta_title": "Benefits of Community Engagement | Cloud Social Work",
        "meta_desc": "Discover how community engagement and social participation are vital tools for recovery, mental health, and overcoming addiction.",
        "category": "Therapy Focus",
        "date": "Sep 05, 2026",
        "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>Healing Together</h2><p>Isolation is one of the most significant barriers to recovery, whether you are dealing with addiction, trauma, or a mental health crisis. Human beings are inherently social creatures, and genuine connection is often the catalyst for profound healing.</p><p>Through our <strong>Community Engagement</strong> programs, we help clients step outside their comfort zones. This might involve joining a local art class, participating in community gardening, or simply learning how to confidently navigate public spaces.</p><h3>Why It Works</h3><p>Community engagement rebuilds self-esteem. It reminds individuals that they have valuable contributions to make to society. Furthermore, it naturally builds a peer support network that outlasts any formal therapy session.</p>"
    },
    {
        "id": 4,
        "title": "What to Expect from a Therapeutic Support Session",
        "meta_title": "Therapeutic Support Sessions Explained | Cloud Social Work",
        "meta_desc": "Nervous about your first therapeutic support session? Here is a step-by-step breakdown of what to expect when you work with Cloud Social Work.",
        "category": "Service Details",
        "date": "Sep 18, 2026",
        "image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>Demystifying Therapy</h2><p>The word 'therapy' can conjure up intimidating images of sterile clinical rooms and uncomfortable couches. At Cloud Social Work, we do things differently.</p><p>Our therapeutic support sessions are designed to be as comfortable and accessible as possible. Whether we meet at a local cafe, go for a walk along the Wollongong coastline, or meet in the comfort of your own home, the focus is on creating a safe space.</p><h3>The Process</h3><ul><li><strong>Assessment:</strong> Understanding your current challenges and what you hope to achieve.</li><li><strong>Goal Setting:</strong> Collaboratively defining measurable, achievable milestones.</li><li><strong>Intervention:</strong> Utilizing evidence-based techniques like CBT, narrative therapy, or mindfulness.</li><li><strong>Review:</strong> Constantly adapting our approach based on your feedback.</li></ul>"
    },
    {
        "id": 5,
        "title": "Your Rights as an NDIS Participant",
        "meta_title": "NDIS Participant Rights | Cloud Social Work",
        "meta_desc": "Understand your legal rights as an NDIS participant. Learn how to advocate for yourself and ensure you receive the quality care you deserve.",
        "category": "Laws & Rights",
        "date": "Oct 02, 2026",
        "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>Empowerment Through Knowledge</h2><p>As a consumer of NDIS services, you hold specific, legally protected rights. Knowing these rights is essential to ensuring you receive high-quality, respectful, and effective care.</p><p>You have the right to:</p><ul><li>Choose your providers and change them if you are unsatisfied.</li><li>Receive services that respect your cultural background and personal identity.</li><li>Be fully informed about all fees and charges before services commence.</li><li>Make a complaint without fear of retribution or loss of service.</li></ul><p>If you feel your rights are not being respected by a provider, our social workers can step in to advocate on your behalf. <a href='documents.html'>Review our internal laws and service agreements</a> to see our commitment to these rights.</p>"
    },
    {
        "id": 6,
        "title": "Breaking Down Barriers: Advocacy in Social Work",
        "meta_title": "The Role of Advocacy in Social Work | Cloud Social Work",
        "meta_desc": "Discover why fierce advocacy is at the core of social work. Learn how Cloud Social Work breaks down systemic barriers for our clients.",
        "category": "Social Justice",
        "date": "Oct 15, 2026",
        "image": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>More Than Just Support</h2><p>Social work is unique among the helping professions because it inherently involves social justice. We don't just look at the individual; we look at the systems surrounding them. Are housing policies preventing a client's recovery? Is systemic discrimination making it impossible for them to find employment?</p><p>Advocacy means stepping up and fighting against these barriers. It means making phone calls to government departments, writing letters to housing authorities, and standing beside our clients in courtrooms or tribunal hearings.</p><p>We are not just caregivers; we are champions for your rights.</p>"
    },
    {
        "id": 7,
        "title": "Outdoor Adventures as a Path to Healing",
        "meta_title": "Outdoor Therapy & Adventure | Cloud Social Work",
        "meta_desc": "Learn how nature and outdoor adventures can accelerate healing from trauma, addiction, and mental health challenges.",
        "category": "Service Focus",
        "date": "Oct 30, 2026",
        "image": "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>Nature's Therapy Room</h2><p>Traditional talk therapy is highly effective, but it isn't the only way to heal. There is a growing body of evidence supporting 'ecotherapy'—the healing power of nature.</p><p>At Cloud Social Work, we frequently integrate outdoor adventures into our support plans. Whether it's a guided hike through the Illawarra escarpment, a rock climbing session to build trust and overcome fear, or simply a mindfulness walk on the beach, the outdoors provides a dynamic environment for growth.</p><p>Nature demands presence. It naturally lowers cortisol levels, reduces anxiety, and provides a neutral space where difficult conversations often flow more easily. <a href='events.html'>Check out our upcoming outdoor events!</a></p>"
    },
    {
        "id": 8,
        "title": "How to Choose the Right Support Worker",
        "meta_title": "Choosing a Support Worker | Cloud Social Work",
        "meta_desc": "Finding the right support worker is crucial. Read our top tips on what to look for when interviewing and selecting a care provider.",
        "category": "Consumer Guide",
        "date": "Nov 12, 2026",
        "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>Finding Your Perfect Match</h2><p>Your support worker will spend a significant amount of time in your home and your life. It is absolutely vital that you feel comfortable, respected, and safe with them.</p><h3>Key Things to Look For:</h3><ul><li><strong>Reliability:</strong> Do they show up on time and communicate clearly if they are delayed?</li><li><strong>Empathy, not Pity:</strong> A good support worker empowers you to do things yourself whenever possible.</li><li><strong>Shared Interests:</strong> If you love art, finding a worker who enjoys museums can make community access much more enjoyable!</li><li><strong>Qualifications:</strong> Ensure they have the necessary First Aid, CPR, and relevant screening checks.</li></ul><p>At Cloud Social Work, we rigorously screen our staff to ensure they meet the highest standards of professional excellence and personal integrity.</p>"
    },
    {
        "id": 9,
        "title": "Why Person-Centered Care Matters",
        "meta_title": "Person-Centered Care Philosophy | Cloud Social Work",
        "meta_desc": "Discover the core philosophy of Cloud Social Work. Learn why person-centered care is the most effective approach to social services.",
        "category": "Philosophy",
        "date": "Nov 28, 2026",
        "image": "https://images.unsplash.com/photo-1543269664-56d5d5148afb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "content": "<h2>You Are the Expert on Your Life</h2><p>In the past, the medical and social models of care often operated under a 'doctor knows best' philosophy. Providers would dictate what a client needed, and the client was expected to comply.</p><p>Person-centered care flips this entirely. We recognize that <em>you</em> are the expert on your own life. Our role is not to dictate your path, but to walk alongside you, offering tools, resources, and clinical expertise to help you achieve the goals <em>you</em> have set.</p><p>This philosophy underpins everything we do. It ensures that your dignity, autonomy, and choices are respected at every turn. If you're ready to experience support that truly puts you first, <a href='contact-us.html'>reach out to us today</a>.</p>"
    }
]

for p in posts:
    html = template.format(
        title=p['title'],
        meta_title=p['meta_title'],
        meta_desc=p['meta_desc'],
        category=p['category'],
        date=p['date'],
        image=p['image'],
        content=p['content']
    )
    with open(f"/Users/stormyforrester/cloudsocialwork/blog-post-{p['id']}.html", "w") as f:
        f.write(html)

print("Generated 9 blog posts.")
