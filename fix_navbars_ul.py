import os
import re

files = [
    "index.html", "about-us.html", "faq.html", 
    "contact-us.html", "events.html", "documents.html",
    "blog.html", "blog-post-1.html", "blog-post-2.html", "blog-post-3.html", "blog-post-4.html",
    "blog-post-5.html", "blog-post-6.html", "blog-post-7.html", "blog-post-8.html", "blog-post-9.html"
]

for f in files:
    filepath = os.path.join("/Users/stormyforrester/cloudsocialwork", f)
    if not os.path.exists(filepath): continue
    
    with open(filepath, "r") as file:
        content = file.read()
    
    # Clean up any existing blog links to avoid duplicates
    content = re.sub(r'\s*<li><a href="blog\.html".*?>BLOG</a></li>', '', content)
    
    # Inject BLOG link into desktop nav
    content = re.sub(
        r'(<ul class="nav-menu">.*?<li><a href="events\.html"[^>]*>EVENTS</a></li>)',
        r'\1\n                <li><a href="blog.html">BLOG</a></li>',
        content, flags=re.DOTALL
    )
    
    # Inject BLOG link into mobile side nav
    content = re.sub(
        r'(<ul class="side-nav-menu">.*?<li><a href="events\.html"[^>]*>EVENTS</a></li>)',
        r'\1\n            <li><a href="blog.html">BLOG</a></li>',
        content, flags=re.DOTALL
    )

    with open(filepath, "w") as file:
        file.write(content)

print("Navbars Fixed using ul.nav-menu.")
