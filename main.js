(function () {
  'use strict';

  /* ── Category config ────────────────────────────── */
  const CAT_COLORS = {
    '工具':   { bg: 'rgba(0,102,204,.1)',    text: '#0066cc' },
    'AI实践': { bg: 'rgba(29,122,74,.1)',    text: '#1d7a4a' },
    '教程':   { bg: 'rgba(176,125,42,.1)',   text: '#b07d2a' },
    '思考':   { bg: 'rgba(107,79,160,.1)',   text: '#6b4fa0' },
    '项目':   { bg: 'rgba(142,58,46,.1)',    text: '#8e3a2e' },
    '实验':   { bg: 'rgba(42,107,122,.1)',   text: '#2a6b7a' },
  };
  const CAT_DEFAULT = { bg: 'rgba(0,0,0,.06)', text: '#333333' };

  const TAG_COLORS = {
    '开源':     { bg: 'rgba(29,122,74,.1)',    text: '#1d7a4a' },
    'AI 工程':  { bg: 'rgba(0,102,204,.1)',    text: '#0066cc' },
    '学习资源': { bg: 'rgba(176,125,42,.1)',   text: '#b07d2a' },
    '工具':     { bg: 'rgba(107,79,160,.1)',   text: '#6b4fa0' },
    '效率':     { bg: 'rgba(142,58,46,.1)',    text: '#8e3a2e' },
  };
  const TAG_DEFAULT = { bg: 'rgba(0,0,0,.06)', text: '#333333' };

  const TAB_COLORS = ['#0066cc','#1d7a4a','#8e3a2e','#6b4fa0','#b07d2a','#2a6b7a'];
  function tabColor(i) { return TAB_COLORS[i % TAB_COLORS.length]; }

  /* ── Helpers ────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('zh-CN', { year:'numeric', month:'long' });
  }

  /* ── Course card ────────────────────────────────── */
  function buildCourseCard(course, index) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.animationDelay = (index * 55) + 'ms';
    const modules = course.modules || 0;
    const date    = formatDate(course.date);
    const href    = escHtml((course.path || '#') + 'index.html');
    card.innerHTML =
      '<div class="course-card-tab" style="background:' + tabColor(index) + '"></div>' +
      '<div class="course-card-title">' + escHtml(course.title || '未命名课程') + '</div>' +
      '<div class="course-card-desc">'  + escHtml(course.description || '') + '</div>' +
      '<div class="course-card-meta">' +
        '<span class="course-card-modules">' + modules + ' 个模块' + (date ? ' · ' + date : '') + '</span>' +
        '<a class="course-card-link" href="' + href + '" target="_blank" rel="noopener">开始学习</a>' +
      '</div>';
    card.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') window.open(href, '_blank');
    });
    return card;
  }

  /* ── Article card ───────────────────────────────── */
  function buildArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.style.animationDelay = (index * 55) + 'ms';

    const cats  = article.categories || (article.category ? [article.category] : []);
    const date  = formatDate(article.date);
    const href  = escHtml(article.url || (article.path ? article.path + 'index.html' : '#'));
    const external = /^https?:\/\//.test(article.url || '');

    const catHtml = cats.map(c => {
      const col = CAT_COLORS[c] || CAT_DEFAULT;
      return '<span class="cat-pill" style="background:' + col.bg + ';color:' + col.text + '">' + escHtml(c) + '</span>';
    }).join('');

    card.innerHTML =
      '<div class="article-card-top">' +
        '<div class="article-card-cats">' + (catHtml || '') + '</div>' +
        '<span class="article-card-date">' + date + '</span>' +
      '</div>' +
      '<div class="article-card-title">' + escHtml(article.title || '未命名文章') + '</div>' +
      '<div class="article-card-excerpt">' + escHtml(article.excerpt || '') + '</div>' +
      '<a class="article-card-link" href="' + href + '"' +
        (external ? ' target="_blank" rel="noopener"' : '') + '>阅读全文 →</a>';

    card.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') {
        if (external) window.open(href, '_blank');
        else location.href = href;
      }
    });
    return card;
  }

  /* ── Recommendation card ─────────────────────────── */
  function buildRecCard(rec, index) {
    const card = document.createElement('div');
    card.className = 'rec-card';
    card.style.animationDelay = (index * 55) + 'ms';

    const tags = rec.tags || [];
    const tagHtml = tags.map(t => {
      const col = TAG_COLORS[t] || TAG_DEFAULT;
      return '<span class="rec-tag" style="background:' + col.bg + ';color:' + col.text + '">' + escHtml(t) + '</span>';
    }).join('');

    const siteUrl = escHtml(rec.url || '#');
    const repoUrl = rec.repo ? escHtml(rec.repo) : '';

    card.innerHTML =
      '<div class="rec-card-tags">' + tagHtml + '</div>' +
      '<div class="rec-card-title">' + escHtml(rec.title || '') + '</div>' +
      '<div class="rec-card-tagline">' + escHtml(rec.tagline || '') + '</div>' +
      '<div class="rec-card-desc">' + escHtml(rec.description || '') + '</div>' +
      '<div class="rec-card-actions">' +
        '<a class="rec-card-link" href="' + siteUrl + '" target="_blank" rel="noopener">访问网站 →</a>' +
        (repoUrl ? '<a class="rec-card-link" href="' + repoUrl + '" target="_blank" rel="noopener">GitHub →</a>' : '') +
      '</div>';

    card.addEventListener('click', function (e) {
      if (e.target.tagName !== 'A') window.open(siteUrl, '_blank');
    });
    return card;
  }

  /* ── Load catalogs ──────────────────────────────── */
  async function loadCourses() {
    const grid  = $('course-grid');
    const noMsg = $('no-courses');
    try {
      const res = await fetch('courses/catalog.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error();
      const { courses = [] } = await res.json();
      grid.innerHTML = '';
      if (courses.length === 0) { noMsg.style.display = 'block'; }
      else { courses.forEach((c, i) => grid.appendChild(buildCourseCard(c, i))); }
      return courses;
    } catch {
      grid.innerHTML = '';
      noMsg.style.display = 'block';
      return [];
    }
  }

  async function loadArticles() {
    const grid  = $('article-grid');
    const noMsg = $('no-articles');
    try {
      const res = await fetch('articles/catalog.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error();
      const { articles = [] } = await res.json();
      grid.innerHTML = '';
      if (articles.length === 0) { noMsg.style.display = 'block'; }
      else { articles.forEach((a, i) => grid.appendChild(buildArticleCard(a, i))); }
      return articles;
    } catch {
      grid.innerHTML = '';
      noMsg.style.display = 'block';
      return [];
    }
  }

  async function loadRecommendations() {
    const grid  = $('rec-grid');
    const noMsg = $('no-recs');
    try {
      const res = await fetch('recommendations/catalog.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error();
      const { recommendations = [] } = await res.json();
      grid.innerHTML = '';
      if (recommendations.length === 0) { noMsg.style.display = 'block'; }
      else { recommendations.forEach((r, i) => grid.appendChild(buildRecCard(r, i))); }
      return recommendations;
    } catch {
      grid.innerHTML = '';
      noMsg.style.display = 'block';
      return [];
    }
  }

  async function init() {
    const [courses, articles, recommendations] = await Promise.all([
      loadCourses(), loadArticles(), loadRecommendations()
    ]);

    const totalModules = courses.reduce((s, c) => s + (c.modules || 0), 0);

    // Hero meta
    const hc = $('hero-stat-courses');
    const ha = $('hero-stat-articles');
    if (hc) hc.querySelector('.hero-meta-num').textContent = courses.length;
    if (ha) ha.querySelector('.hero-meta-num').textContent = articles.length;

    // About stats
    const sc = $('stat-courses');
    const sm = $('stat-modules');
    const sa = $('stat-articles');
    const sr = $('stat-recs');
    if (sc) sc.textContent = courses.length;
    if (sm) sm.textContent = totalModules;
    if (sa) sa.textContent = articles.length;
    if (sr) sr.textContent = recommendations.length;
  }

  /* ── Mobile nav ─────────────────────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const drawer    = document.getElementById('nav-drawer');
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => drawer.classList.toggle('open'));
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => drawer.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
