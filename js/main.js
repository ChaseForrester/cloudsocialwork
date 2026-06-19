/* ===================================
   Cloud Social Work - Main JavaScript
   =================================== */

document.addEventListener('DOMContentLoaded', function() {

  // ===================================
  // Theme Toggle Logic
  // ===================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Check for saved theme preference, otherwise check OS preference
  const savedTheme = localStorage.getItem('csw-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Toggle theme on click
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      let targetTheme = 'light';
      
      if (currentTheme === 'light') {
        targetTheme = 'dark';
      }
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('csw-theme', targetTheme);
    });
  }

  // ===================================
  // Mobile Menu Toggle
  // ===================================
  const menuButton = document.querySelector('.menu-button');
  const navSide = document.querySelector('.navbar-side');
  const navOverlay = document.querySelector('.nav-overlay');

  if (menuButton) {
    menuButton.addEventListener('click', function() {
      menuButton.classList.toggle('open');
      if (navSide) navSide.classList.toggle('open');
      if (navOverlay) navOverlay.classList.toggle('active');
      document.body.style.overflow = navSide && navSide.classList.contains('open') ? 'hidden' : '';
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', function() {
      if (menuButton) menuButton.classList.remove('open');
      if (navSide) navSide.classList.remove('open');
      navOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // ===================================
  // Dynamic Copyright Year
  // ===================================
  const yearElems = document.querySelectorAll('.year');
  yearElems.forEach(function(el) {
    el.textContent = new Date().getFullYear();
  });

  // ===================================
  // Active Navigation Link
  // ===================================
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-menu a, .side-nav-menu a');
  navLinks.forEach(function(link) {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/') ||
        (currentPath.endsWith('/index.html') && (href === '/' || href === 'index.html'))) {
      link.classList.add('active');
    } else if (currentPath.includes(href) && href !== '/' && href !== 'index.html') {
      link.classList.add('active');
    }
  });

  // ===================================
  // Scroll Animations
  // ===================================
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  function checkScroll() {
    animateElements.forEach(function(el) {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight * 0.85) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Check on load

  // ===================================
  // Smooth Scroll for Anchor Links
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===================================
  // Navbar Background on Scroll
  // ===================================
  const navbar = document.querySelector('.navbar-top');
  if (navbar) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ===================================
  // Inject Accessibility & Chatbot Widgets
  // ===================================
  
  // Hide the original theme toggle since we are replacing it
  if (themeToggleBtn) {
    themeToggleBtn.classList.add('hidden');
  }

  const widgetHTML = `
    <div class="floating-widgets">
      <!-- Accessibility Button -->
      <button id="btn-a11y" class="widget-btn" aria-label="Accessibility Menu">
        <svg viewBox="0 0 24 24"><path d="M12 2c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 11.5c-3.33 0-10 1.67-10 5v3.5h20v-3.5c0-3.33-6.67-5-10-5z"/></svg>
      </button>
      <!-- Chatbot Button -->
      <button id="btn-chat" class="widget-btn" aria-label="Chat with Support">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
      </button>
    </div>

    <!-- Accessibility Panel -->
    <div id="panel-a11y" class="a11y-panel">
      <div class="a11y-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div class="a11y-title" style="margin-bottom: 0;">Accessibility Settings</div>
        <button id="a11y-close" class="chat-close" style="font-size: 1.5rem; background: none; border: none; color: inherit; cursor: pointer;">&times;</button>
      </div>
      <button id="a11y-theme" class="a11y-btn">Toggle Dark/Light Mode</button>
      <button id="a11y-contrast" class="a11y-btn">Toggle High Contrast</button>
      <button id="a11y-font-increase" class="a11y-btn">Increase Font Size</button>
      <button id="a11y-font-reset" class="a11y-btn">Reset Font Size</button>
    </div>

    <!-- Chatbot Panel -->
    <div id="panel-chat" class="chatbot-panel">
      <div class="chat-header">
        <div class="chat-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          Support Assistant
        </div>
        <button id="chat-close" class="chat-close">&times;</button>
      </div>
      <div id="chat-body" class="chat-body">
        <div class="chat-message bot">Hello! I'm the Cloud Social Work virtual assistant. How can I help you today?</div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" class="chat-input" placeholder="Type a message...">
        <button id="chat-send" class="chat-send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Widget Logic
  const btnA11y = document.getElementById('btn-a11y');
  const btnChat = document.getElementById('btn-chat');
  const panelA11y = document.getElementById('panel-a11y');
  const panelChat = document.getElementById('panel-chat');

  btnA11y.addEventListener('click', () => {
    panelA11y.classList.toggle('open');
    panelChat.classList.remove('open');
  });

  btnChat.addEventListener('click', () => {
    panelChat.classList.toggle('open');
    panelA11y.classList.remove('open');
  });

  document.getElementById('chat-close').addEventListener('click', () => {
    panelChat.classList.remove('open');
  });

  document.getElementById('a11y-close').addEventListener('click', () => {
    panelA11y.classList.remove('open');
  });

  // A11y Actions
  document.getElementById('a11y-theme').addEventListener('click', () => {
    if(themeToggleBtn) themeToggleBtn.click();
  });

  let contrastHigh = false;
  document.getElementById('a11y-contrast').addEventListener('click', () => {
    contrastHigh = !contrastHigh;
    if (contrastHigh) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  });

  let fontScale = 1;
  document.getElementById('a11y-font-increase').addEventListener('click', () => {
    if (fontScale < 1.4) fontScale += 0.1;
    document.documentElement.style.fontSize = `calc((0.625rem + 0.416vw) * ${fontScale})`;
  });

  document.getElementById('a11y-font-reset').addEventListener('click', () => {
    fontScale = 1;
    document.documentElement.style.fontSize = '';
  });

  // Inject SVG filter for perfectly accurate logo color conversion in Light Mode
  // Maps White (#FFFFFF) to Black (#000000) and preserves exact Blue (#282de5)
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('style', 'display: none;');
  svg.innerHTML = `
    <filter id="exact-blue-black-filter">
      <feColorMatrix type="matrix" values="
        -0.2115  0   0.2115  0   0
        -0.2380  0   0.2380  0   0
        -1.2115  0   1.2115  0   0
         0       0   0       1   0
      " />
    </filter>
  `;
  document.body.appendChild(svg);

  // Chatbot Logic
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatBody = document.getElementById('chat-body');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function handleUserMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addMessage(text, 'user');
    chatInput.value = '';

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "I'm not sure about that. You can contact us directly via the Contact page or call 0451 011 473.";
      
      if (lower.includes('book') || lower.includes('appointment')) {
        reply = "You can book an adventure or therapy session by clicking the 'BOOK IN' link in the top menu!";
      } else if (lower.includes('ndis')) {
        reply = "Yes, we work with NDIS! You can find our NDIS Pricing Guide on the Documents page.";
      } else if (lower.includes('hours') || lower.includes('open')) {
        reply = "We are open Monday-Friday 9am-5pm, and Saturday 9am-Noon. We are closed on Sundays.";
      } else if (lower.includes('where') || lower.includes('location')) {
        reply = "We proudly serve the Illawarra, Nowra, and Sydney regions.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        reply = "Hi there! How can I assist you with Cloud Social Work today?";
      }

      addMessage(reply, 'bot');
    }, 600);
  }

  chatSend.addEventListener('click', handleUserMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });

  // ===================================
  // Testimonials Slider Logic
  // ===================================
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let slideInterval;

  if (slides.length > 0) {
    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      
      currentSlide = index;
      if (currentSlide >= slides.length) currentSlide = 0;
      if (currentSlide < 0) currentSlide = slides.length - 1;
      
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      showSlide(currentSlide + 1);
    }

    // Auto rotate every 5 seconds
    slideInterval = setInterval(nextSlide, 5000);

    // Allow manual click
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(slideInterval);
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });
  }

  // ===================================
  // Blog Carousel Logic (blog.html)
  // ===================================
  const blogSlides = document.querySelectorAll('.blog-slide');
  const btnPrev = document.querySelector('.blog-carousel-btn.prev');
  const btnNext = document.querySelector('.blog-carousel-btn.next');
  let currentBlogSlide = 0;
  let blogInterval;

  if (blogSlides.length > 0) {
    function showBlogSlide(index) {
      blogSlides.forEach(s => s.classList.remove('active'));
      currentBlogSlide = index;
      if (currentBlogSlide >= blogSlides.length) currentBlogSlide = 0;
      if (currentBlogSlide < 0) currentBlogSlide = blogSlides.length - 1;
      blogSlides[currentBlogSlide].classList.add('active');
    }

    function nextBlogSlide() { showBlogSlide(currentBlogSlide + 1); }
    function prevBlogSlide() { showBlogSlide(currentBlogSlide - 1); }

    blogInterval = setInterval(nextBlogSlide, 4000);

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        clearInterval(blogInterval);
        nextBlogSlide();
        blogInterval = setInterval(nextBlogSlide, 4000);
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        clearInterval(blogInterval);
        prevBlogSlide();
        blogInterval = setInterval(nextBlogSlide, 4000);
      });
    }
  }

});

// ===================================
// Social Share Logic (Global Scope)
// ===================================
window.shareSocial = function(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  
  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  } else if (platform === 'linkedin') {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  } else if (platform === 'email') {
    window.location.href = `mailto:?subject=${title}&body=Check out this article: ${url}`;
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  }
};

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
