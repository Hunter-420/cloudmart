document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  const tabs  = document.querySelectorAll('.tab');
  const searchInput = document.getElementById('search-input');

  const activate = (targetId) => {
    tabs.forEach(t  => t.classList.toggle('active', t.id === targetId));
    links.forEach(l => l.classList.toggle('active', l.dataset.target === targetId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.pushState(null, '', '#' + targetId);

    // If it's a volume tab, load the markdown
    if (targetId.startsWith('vol-')) {
      loadVolume(targetId);
    }
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      activate(link.dataset.target);
    });
  });

  // Support direct URL hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(hash)) {
    activate(hash);
  } else {
    // Default to intro
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
      container.innerHTML = marked.parse(text);
      container.dataset.loaded = 'true';
    } catch (e) {
      container.innerHTML = '<div class="alert alert-danger">Error loading document.</div>';
    }
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      // Extremely basic client side search: just highlight matching nav links
      // Or filter nav links
      links.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes(term)) {
          link.style.display = 'block';
        } else {
          link.style.display = 'none';
        }
      });
    });
  }
});
