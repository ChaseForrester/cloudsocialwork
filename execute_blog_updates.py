import os
import re

# 1. FIX THE NAVBARS ACROSS THE 10 BLOG FILES

files_to_fix = [
    "blog.html",
    "blog-post-1.html", "blog-post-2.html", "blog-post-3.html", 
    "blog-post-4.html", "blog-post-5.html", "blog-post-6.html", 
    "blog-post-7.html", "blog-post-8.html", "blog-post-9.html"
]

correct_nav_top = """    <nav class="navbar-top">
        <div class="navbar-container">
            <a href="index.html" class="logo">
                <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
            </a>
            <ul class="nav-menu">
                <li><a href="index.html">HOME</a></li>
                <li><a href="about-us.html">ABOUT</a></li>
                <li><a href="faq.html">CONTACT</a></li>
                <li><a href="events.html">EVENTS</a></li>
                <li><a href="blog.html" class="active">BLOG</a></li>
            </ul>
            <a href="book-in.html" class="btn-primary" style="margin-left: 20px;">BOOK IN</a>
            <div class="menu-button">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>"""

correct_nav_side = """    <div class="navbar-side">
        <a href="index.html" class="side-logo">
            <img src="https://cdn.prod.website-files.com/66691c8dd608efff5cd4843d/666ae4055fa1c07f27951fd8_Blue%20White.png" alt="Cloud Social Work Logo">
        </a>
        <ul class="side-nav-menu">
            <li><a href="index.html">HOME</a></li>
            <li><a href="about-us.html">ABOUT</a></li>
            <li><a href="faq.html">CONTACT</a></li>
            <li><a href="events.html">EVENTS</a></li>
            <li><a href="blog.html" class="active">BLOG</a></li>
        </ul>
        <a href="book-in.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">BOOK IN</a>
    </div>"""

for f in files_to_fix:
    path = os.path.join("/Users/stormyforrester/cloudsocialwork", f)
    if not os.path.exists(path): continue
    
    with open(path, "r") as file:
        content = file.read()
    
    # Remove old navbar-top
    content = re.sub(r'<nav class="navbar-top">.*?</nav>', correct_nav_top, content, flags=re.DOTALL)
    
    # Remove old navbar-side
    content = re.sub(r'<nav class="navbar-side">.*?</nav>', correct_nav_side, content, flags=re.DOTALL)
    
    with open(path, "w") as file:
        file.write(content)

# 2. ADD SEARCH & FILTERS TO BLOG.HTML
blog_path = "/Users/stormyforrester/cloudsocialwork/blog.html"
with open(blog_path, "r") as file:
    blog_content = file.read()

filter_ui = """
    <!-- Search & Filter Bar -->
    <section class="blog-filters container animate-on-scroll">
        <div class="filter-toolbar">
            <div class="search-box">
                <input type="text" id="blogSearch" placeholder="Search articles...">
            </div>
            <div class="category-filters" id="categoryFilters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="Laws & News">Laws & News</button>
                <button class="filter-btn" data-filter="Consumer Guide">Consumer Guide</button>
                <button class="filter-btn" data-filter="Therapy Focus">Therapy Focus</button>
                <button class="filter-btn" data-filter="Philosophy">Philosophy</button>
            </div>
            <div class="sort-box">
                <select id="blogSort">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="az">A-Z</option>
                    <option value="za">Z-A</option>
                </select>
            </div>
        </div>
    </section>
"""

# Insert filter UI before the blog-grid
blog_content = blog_content.replace('<div class="blog-grid">', filter_ui + '\n    <div class="blog-grid" id="blogGrid">')

# Add data attributes to blog cards
def add_data_attrs(match):
    full_match = match.group(0)
    # Extract title
    title_match = re.search(r'<h3>(.*?)</h3>', full_match)
    title = title_match.group(1) if title_match else ""
    
    # Extract category and date
    meta_match = re.search(r'<div class="blog-card-meta">(.*?) &bull; (.*?)</div>', full_match)
    if meta_match:
        date_str = meta_match.group(1).strip()
        category = meta_match.group(2).strip()
    else:
        date_str = ""
        category = ""
    
    # Parse date to timestamp roughly for sorting (e.g. Aug 14, 2026 -> 20260814)
    # Simple mapping
    months = {"Jan":"01", "Feb":"02", "Mar":"03", "Apr":"04", "May":"05", "Jun":"06", "Jul":"07", "Aug":"08", "Sep":"09", "Oct":"10", "Nov":"11", "Dec":"12"}
    timestamp = "0"
    if date_str:
        parts = date_str.split(" ")
        if len(parts) == 3:
            mo = months.get(parts[0], "00")
            da = parts[1].replace(",","").zfill(2)
            yr = parts[2]
            timestamp = f"{yr}{mo}{da}"
            
    # Inject attributes into the anchor tag
    replacement = full_match.replace('class="blog-card"', f'class="blog-card" data-title="{title}" data-category="{category}" data-date="{timestamp}"')
    return replacement

blog_content = re.sub(r'<a href="blog-post-\d\.html" class="blog-card">.*?</a>', add_data_attrs, blog_content, flags=re.DOTALL)

with open(blog_path, "w") as file:
    file.write(blog_content)

print("Navbars fixed and filter UI injected.")
