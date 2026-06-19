import os

css_append = """
/* Blog Filter Toolbar */
.blog-filters {
    padding: 2rem 5%;
}
.filter-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    justify-content: space-between;
    background: var(--card-bg);
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    margin-bottom: 2rem;
}
.search-box input {
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--primary-color);
    border-radius: 30px;
    background: transparent;
    color: var(--text-color);
    font-family: 'Figtree', sans-serif;
    font-size: 1rem;
    width: 250px;
    outline: none;
}
.search-box input:focus {
    box-shadow: 0 0 0 2px rgba(40,45,229,0.3);
}
.category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.filter-btn {
    padding: 0.6rem 1.2rem;
    border: 1px solid var(--primary-color);
    background: transparent;
    color: var(--text-color);
    border-radius: 30px;
    cursor: pointer;
    font-family: 'Figtree', sans-serif;
    transition: all 0.3s ease;
}
.filter-btn:hover, .filter-btn.active {
    background: var(--primary-color);
    color: #fff;
}
.sort-box select {
    padding: 0.8rem 1.2rem;
    border: 1px solid var(--primary-color);
    border-radius: 30px;
    background: transparent;
    color: var(--text-color);
    font-family: 'Figtree', sans-serif;
    font-size: 1rem;
    outline: none;
    cursor: pointer;
}
.sort-box select option {
    background: var(--card-bg);
    color: var(--text-color);
}
"""

with open("/Users/stormyforrester/cloudsocialwork/css/style.css", "a") as f:
    f.write(css_append)

js_append = """
document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Blog Search, Filter, and Sort Logic
  // ==========================================
  const blogSearch = document.getElementById('blogSearch');
  const categoryFilters = document.getElementById('categoryFilters');
  const blogSort = document.getElementById('blogSort');
  const blogGrid = document.getElementById('blogGrid');

  if (blogGrid && blogSearch && categoryFilters && blogSort) {
      const blogCards = Array.from(blogGrid.querySelectorAll('.blog-card'));
      
      function filterAndSortBlogs() {
          const searchTerm = blogSearch.value.toLowerCase();
          const activeBtn = categoryFilters.querySelector('.active');
          const category = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
          const sortVal = blogSort.value;
          
          let visibleCards = [];
          
          // Filter
          blogCards.forEach(card => {
              const title = card.getAttribute('data-title').toLowerCase();
              const cardCat = card.getAttribute('data-category');
              
              const matchesSearch = title.includes(searchTerm);
              const matchesCategory = category === 'all' || cardCat === category;
              
              if (matchesSearch && matchesCategory) {
                  card.style.display = 'block';
                  visibleCards.push(card);
              } else {
                  card.style.display = 'none';
              }
          });
          
          // Sort
          visibleCards.sort((a, b) => {
              if (sortVal === 'newest') {
                  return parseInt(b.getAttribute('data-date')) - parseInt(a.getAttribute('data-date'));
              } else if (sortVal === 'oldest') {
                  return parseInt(a.getAttribute('data-date')) - parseInt(b.getAttribute('data-date'));
              } else if (sortVal === 'az') {
                  return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
              } else if (sortVal === 'za') {
                  return b.getAttribute('data-title').localeCompare(a.getAttribute('data-title'));
              }
              return 0;
          });
          
          // Re-append to grid in sorted order
          visibleCards.forEach(card => blogGrid.appendChild(card));
      }

      blogSearch.addEventListener('input', filterAndSortBlogs);
      
      blogSort.addEventListener('change', filterAndSortBlogs);
      
      const filterBtns = categoryFilters.querySelectorAll('.filter-btn');
      filterBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
              filterBtns.forEach(b => b.classList.remove('active'));
              e.target.classList.add('active');
              filterAndSortBlogs();
          });
      });
  }
});
"""

with open("/Users/stormyforrester/cloudsocialwork/js/main.js", "a") as f:
    f.write(js_append)

print("Appended CSS and JS logic successfully.")
