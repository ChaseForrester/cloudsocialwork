import os

css_append = """
/* Fix specificity for CTA button in side menu */
.navbar-side .side-nav-menu .btn-cta {
  color: var(--btn-text) !important;
  background: var(--btn-bg) !important;
  text-align: center;
  padding: 0.9rem 2rem;
  border-radius: 4px;
}
.navbar-side .side-nav-menu .btn-cta:hover {
  background: var(--btn-hover) !important;
  color: var(--btn-text) !important;
  opacity: 1;
}

/* Fix specificity for CTA button in top menu */
.navbar-top .nav-menu .btn-cta {
  color: var(--btn-text) !important;
  background: var(--btn-bg) !important;
  padding: 0.6rem 1.5rem;
  border-radius: 4px;
  margin-left: 1rem;
}
.navbar-top .nav-menu .btn-cta:hover {
  background: var(--btn-hover) !important;
}
.navbar-top .nav-menu .btn-cta::after {
  display: none; /* remove hover line */
}
"""

with open("/Users/stormyforrester/cloudsocialwork/css/style.css", "a") as f:
    f.write(css_append)

print("CSS appended.")
