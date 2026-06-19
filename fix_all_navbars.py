import os
import re

files_to_fix = [
    "index.html", "about-us.html", "faq.html", 
    "contact-us.html", "events.html", "documents.html",
    "blog.html",
    "blog-post-1.html", "blog-post-2.html", "blog-post-3.html", 
    "blog-post-4.html", "blog-post-5.html", "blog-post-6.html", 
    "blog-post-7.html", "blog-post-8.html", "blog-post-9.html"
]

def get_nav_top(active_page):
    def active(page):
        return ' class="active"' if page == active_page else ''
    
    return f"""    <nav class="navbar-top">
        <div class="navbar-container">
            <a href="index.html" class="logo">
                <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
            </a>
            <ul class="nav-menu">
                <li><a href="index.html"{active('index.html')}>HOME</a></li>
                <li><a href="about-us.html"{active('about-us.html')}>ABOUT</a></li>
                <li><a href="faq.html"{active('faq.html')}>CONTACT</a></li>
                <li><a href="events.html"{active('events.html')}>EVENTS</a></li>
                <li><a href="blog.html"{active('blog.html')}>BLOG</a></li>
                <li class="desktop-btn"><a href="book-in.html" class="btn-cta">BOOK IN</a></li>
            </ul>
            <div class="menu-button">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>"""

def get_nav_side(active_page):
    def active(page):
        return ' class="active"' if page == active_page else ''

    return f"""    <div class="navbar-side">
        <a href="index.html" class="side-logo">
            <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
        </a>
        <ul class="side-nav-menu">
            <li><a href="index.html"{active('index.html')}>HOME</a></li>
            <li><a href="about-us.html"{active('about-us.html')}>ABOUT</a></li>
            <li><a href="faq.html"{active('faq.html')}>CONTACT</a></li>
            <li><a href="events.html"{active('events.html')}>EVENTS</a></li>
            <li><a href="blog.html"{active('blog.html')}>BLOG</a></li>
            <li style="margin-top: 1rem;"><a href="book-in.html" class="btn-cta">BOOK IN</a></li>
        </ul>
    </div>"""

for f in files_to_fix:
    path = os.path.join("/Users/stormyforrester/cloudsocialwork", f)
    if not os.path.exists(path): continue
    
    with open(path, "r") as file:
        content = file.read()
    
    # Determine which page should be active
    active_page = f
    if f.startswith("blog-post"):
        active_page = "blog.html"
    elif f == "contact-us.html":
        active_page = "faq.html" # Assuming faq.html is CONTACT link based on original structure
    elif f == "documents.html":
        active_page = "" # none active

    # Remove old navbar-top
    content = re.sub(r'<nav class="navbar-top">.*?</nav>', get_nav_top(active_page), content, flags=re.DOTALL)
    
    # Handle the fact that sidebar might be <nav class="navbar-side"> or <div class="navbar-side">
    content = re.sub(r'<(nav|div) class="navbar-side">.*?</\1>', get_nav_side(active_page), content, flags=re.DOTALL)
    
    with open(path, "w") as file:
        file.write(content)

print("All navbars perfectly rebuilt.")
