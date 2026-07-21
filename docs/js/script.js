document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  const tabs  = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('search-input');

  // Custom renderer to add IDs to headers for TOC support
  const renderer = new marked.Renderer();
  renderer.heading = function(text, level, raw) {
    // Generate a simple ID from the text
    const id = raw.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };

  marked.setOptions({
    renderer: renderer,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  const activate = (targetId, preventScroll = false) => {
    // Check if it's an internal TOC link (meaning it doesn't match a main tab ID)
    const isTab = Array.from(tabs).some(t => t.id === targetId);
    
    if (isTab) {
      tabs.forEach(t  => t.classList.toggle('active', t.id === targetId));
      links.forEach(l => l.classList.toggle('active', l.dataset.target === targetId));
      if (!preventScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '#' + targetId);

      if (targetId.startsWith('vol-')) {
        loadVolume(targetId);
      }
    } else {
      // It's likely a TOC hash jump. Let the browser handle it natively.
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activate(link.dataset.target);
    });
  });

  // Handle clicking internal links in the markdown body
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target && target.getAttribute('href') && target.getAttribute('href').startsWith('#')) {
      const hash = target.getAttribute('href').replace('#', '');
      // If it's not a tab link, let's smoothly scroll to it within the document
      const isTab = Array.from(tabs).some(t => t.id === hash);
      if (!isTab) {
        e.preventDefault();
        activate(hash, true);
        history.pushState(null, '', '#' + hash);
      }
    }
  });

  // Support direct URL hash navigation on load
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    // We might need to activate the parent tab first if it's a deep link, but for simplicity:
    // We check if it's a tab, if so, load it. If not, load intro.
    const isTab = Array.from(tabs).some(t => t.id === hash);
    if (isTab) {
      activate(hash);
    } else {
      activate('intro');
      // If it's a deep link to an ID, we could scroll to it after rendering, but that's complex with lazy loading.
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  } else {
    activate('intro');
  }

  // Load markdown dynamically
  async function loadVolume(targetId) {
    const container = document.getElementById(targetId + '-content');
    if (container.dataset.loaded === 'true') return;

    const fileMap = {
      'vol-01': 'volume-01-project-vision-and-requirements.md',
      'vol-02': 'volume-02-system-architecture.md',
      'vol-03': 'volume-03-microservice-architecture.md',
      'vol-04': 'volume-04-azure-infrastructure.md',
      'vol-05': 'volume-05-terraform-iac.md',
      'vol-06': 'volume-06-docker-containerization.md',
      'vol-07': 'volume-07-kubernetes-aks.md',
      'vol-08': 'volume-08-cicd-github-actions.md',
      'vol-09': 'volume-09-monitoring-logging-sre.md',
      'vol-10': 'volume-10-security-architecture.md',
      'vol-11': 'volume-11-database-design.md',
      'vol-12': 'volume-12-development-roadmap.md'
    };

    const fileName = fileMap[targetId];
    if (!fileName) return;

    container.innerHTML = '<div class="loading">Loading document...</div>';
    try {
      const res = await fetch('volumes/' + fileName);
      if (!res.ok) throw new Error('Failed to load');
      const text = await res.text();
      
      container.innerHTML = `<div class="markdown-body">${marked.parse(text)}</div>`;
      container.dataset.loaded = 'true';
    } catch (e) {
      container.innerHTML = '<div class="alert alert-danger">Error loading document.</div>';
    }
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      
      links.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(term)) {
          link.style.display = 'block';
        } else {
          link.style.display = 'none';
        }
      });

      const endpoints = document.querySelectorAll('.tab.active .endpoint');
      endpoints.forEach(ep => {
        const text = ep.textContent.toLowerCase();
        if (text.includes(term)) {
          ep.style.display = 'block';
        } else {
          ep.style.display = 'none';
        }
      });
    });
  }
});
