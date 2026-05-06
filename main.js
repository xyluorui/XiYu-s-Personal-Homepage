(function () {
  'use strict';

  const CATALOG_URL = 'courses/catalog.json';

  const ACCENT_COLORS = [
    ['#2A7B9B', '#1F6280'],
    ['#D94F30', '#B83D22'],
    ['#2D8B55', '#1F6B3F'],
    ['#7B6DAA', '#5F5289'],
    ['#D4A843', '#B08A2E'],
    ['#C45B8A', '#A0406D'],
  ];

  function colorForIndex(i) {
    return ACCENT_COLORS[i % ACCENT_COLORS.length];
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function buildCard(course, index) {
    const [bg, bgDark] = colorForIndex(index);
    const modules = course.modules || 0;
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.setProperty('--stagger', index);
    card.style.animationDelay = (index * 80) + 'ms';

    card.innerHTML = `
      <div class="course-card-header" style="background: linear-gradient(135deg, ${bg} 0%, ${bgDark} 100%);">
        <span class="course-module-count">${modules} 个模块</span>
      </div>
      <div class="course-card-body">
        <div class="course-card-title">${escHtml(course.title || '未命名课程')}</div>
        <div class="course-card-desc">${escHtml(course.description || '')}</div>
        <div class="course-card-footer">
          <span class="course-card-date">${formatDate(course.date)}</span>
          <a class="course-card-link" href="${escHtml(course.path || '#')}index.html" target="_blank" rel="noopener">
            开始学习 →
          </a>
        </div>
      </div>`;
    return card;
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function loadCatalog() {
    const grid    = document.getElementById('course-grid');
    const noMsg   = document.getElementById('no-courses');
    const statC   = document.getElementById('stat-courses');
    const statM   = document.getElementById('stat-modules');

    try {
      const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('catalog not found');
      const data = await res.json();
      const courses = data.courses || [];

      // Clear skeletons
      grid.innerHTML = '';

      if (courses.length === 0) {
        noMsg.style.display = 'block';
      } else {
        courses.forEach((c, i) => grid.appendChild(buildCard(c, i)));
      }

      // Stats
      const totalModules = courses.reduce((s, c) => s + (c.modules || 0), 0);
      if (statC) statC.textContent = courses.length;
      if (statM) statM.textContent = totalModules;

    } catch (e) {
      grid.innerHTML = '';
      noMsg.style.display = 'block';
      if (statC) statC.textContent = '0';
      if (statM) statM.textContent = '0';
    }
  }

  document.addEventListener('DOMContentLoaded', loadCatalog);
})();
