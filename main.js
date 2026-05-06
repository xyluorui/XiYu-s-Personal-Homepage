(function () {
  'use strict';

  const CATALOG_URL = 'courses/catalog.json';

  // Tab colors for course cards
  const TAB_COLORS = ['#0066cc', '#1d7a4a', '#8e3a2e', '#6b4fa0', '#b07d2a', '#2a6b7a'];

  function tabColor(i) { return TAB_COLORS[i % TAB_COLORS.length]; }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildCard(course, index) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.animationDelay = (index * 60) + 'ms';

    const modules = course.modules || 0;
    const date    = formatDate(course.date);

    card.innerHTML =
      '<div class="course-card-tab" style="background:' + tabColor(index) + '"></div>' +
      '<div class="course-card-title">' + escHtml(course.title || '未命名课程') + '</div>' +
      '<div class="course-card-desc">' + escHtml(course.description || '') + '</div>' +
      '<div class="course-card-meta">' +
        '<span class="course-card-modules">' + modules + ' 个模块' + (date ? ' · ' + date : '') + '</span>' +
        '<a class="course-card-link" href="' + escHtml(course.path || '#') + 'index.html" ' +
           'target="_blank" rel="noopener">开始学习</a>' +
      '</div>';

    return card;
  }

  async function loadCatalog() {
    const grid  = document.getElementById('course-grid');
    const noMsg = document.getElementById('no-courses');
    const statC = document.getElementById('stat-courses');
    const statM = document.getElementById('stat-modules');

    try {
      const res = await fetch(CATALOG_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('catalog not found');
      const { courses = [] } = await res.json();

      grid.innerHTML = '';

      if (courses.length === 0) {
        noMsg.style.display = 'block';
      } else {
        courses.forEach((c, i) => grid.appendChild(buildCard(c, i)));
      }

      const totalModules = courses.reduce((s, c) => s + (c.modules || 0), 0);
      if (statC) statC.textContent = courses.length;
      if (statM) statM.textContent = totalModules;

    } catch {
      grid.innerHTML = '';
      noMsg.style.display = 'block';
      if (statC) statC.textContent = '0';
      if (statM) statM.textContent = '0';
    }
  }

  document.addEventListener('DOMContentLoaded', loadCatalog);
})();
