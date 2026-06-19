import os
import re

files = [
    "index.html", "about-us.html", "faq.html", 
    "contact-us.html", "events.html", "documents.html"
]

for f in files:
    filepath = os.path.join("/Users/stormyforrester/cloudsocialwork", f)
    with open(filepath, "r") as file:
        content = file.read()
    
    # 1. Clean up
    content = re.sub(r'\s*<a href="blog\.html".*?>BLOG</a>', '', content)
    content = re.sub(r'\s*<a href="book-in\.html".*?>BOOK IN</a>', '', content)
    
    # Re-insert the desktop nav (inside nav-links)
    # We will find the div class="nav-links" and the end of it
    content = re.sub(
        r'(<div class="nav-links">.*?<a href="events\.html"[^>]*>EVENTS</a>)',
        r'\1\n                <a href="blog.html" class="nav-link">BLOG</a>\n                <a href="book-in.html" class="btn-primary">BOOK IN</a>',
        content, flags=re.DOTALL
    )
    
    # Re-insert the mobile nav (inside side-nav-links)
    content = re.sub(
        r'(<div class="side-nav-links">.*?<a href="events\.html"[^>]*>EVENTS</a>)',
        r'\1\n            <a href="blog.html" class="nav-link">BLOG</a>\n            <a href="book-in.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">BOOK IN</a>',
        content, flags=re.DOTALL
    )
    
    # Footer Blog Link
    content = re.sub(r'\s*<a href="blog\.html" class="footer-link">Blog</a>', '', content)
    content = content.replace(
        '<a href="documents.html" class="footer-link">Laws</a>',
        '<a href="documents.html" class="footer-link">Laws</a>\n                <a href="blog.html" class="footer-link">Blog</a>'
    )

    with open(filepath, "w") as file:
        file.write(content)

# Fix book-in.html manually
book_in_path = "/Users/stormyforrester/cloudsocialwork/book-in.html"
with open(book_in_path, "r") as f:
    book_in = f.read()

book_in = re.sub(r'\s*<li><a href="blog\.html".*?</li>', '', book_in)
book_in = re.sub(r'\s*<li><a href="book-in\.html".*?</li>', '', book_in)

book_in = re.sub(
    r'(<ul class="nav-links">.*?<li><a href="events\.html">EVENTS</a></li>)',
    r'\1\n                <li><a href="blog.html">BLOG</a></li>\n                <li><a href="book-in.html" class="active">BOOK IN</a></li>',
    book_in, flags=re.DOTALL
)

# And footer for book-in
book_in = re.sub(r'\s*<a href="blog\.html" class="footer-link">Blog</a>', '', book_in)
book_in = book_in.replace(
    '<a href="documents.html" class="footer-link">Laws</a>',
    '<a href="documents.html" class="footer-link">Laws</a>\n                <a href="blog.html" class="footer-link">Blog</a>'
)

with open(book_in_path, "w") as f:
    f.write(book_in)

print("Navbars and Footers Fixed Smarter.")
