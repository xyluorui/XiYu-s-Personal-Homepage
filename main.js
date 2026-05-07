(function () {
  'use strict';

  /* ── Category config ────────────────────────────── */
  const CAT_COLORS = {
    '工具':   { bg: 'rgba(0,216,255,.15)',    text: '#00d8ff' },
    'AI实践': { bg: 'rgba(114,241,184,.15)',  text: '#72f1b8' },
    '教程':   { bg: 'rgba(255,253,130,.15)',  text: '#fffd82' },
    '思考':   { bg: 'rgba(199,116,232,.15)',  text: '#c774e8' },
    '项目':   { bg: 'rgba(255,106,213,.15)',  text: '#ff6ad5' },
    '实验':   { bg: 'rgba(255,154,86,.15)',   text: '#ff9a56' },
  };
  const CAT_DEFAULT = { bg: 'rgba(255,255,255,.08)', text: 'rgba(255,255,255,.7)' };

  const TAG_COLORS = {
    '开源':     { bg: 'rgba(114,241,184,.15)', text: '#72f1b8' },
    'AI 工程':  { bg: 'rgba(0,216,255,.15)',   text: '#00d8ff' },
    '学习资源': { bg: 'rgba(255,253,130,.15)', text: '#fffd82' },
    '工具':     { bg: 'rgba(199,116,232,.15)', text: '#c774e8' },
    '效率':     { bg: 'rgba(255,106,213,.15)', text: '#ff6ad5' },
  };
  const TAG_DEFAULT = { bg: 'rgba(255,255,255,.08)', text: 'rgba(255,255,255,.7)' };

  const TAB_COLORS = ['#ff6ad5','#00d8ff','#c774e8','#72f1b8','#fffd82','#ff9a56'];
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
      (article.source ? '<div class="article-card-source">来源：' + escHtml(article.source) + '</div>' : '') +
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

    // Hero stats
    const hc = $('hero-stat-courses');
    const ha = $('hero-stat-articles');
    const hr = $('hero-stat-recs');
    if (hc) hc.textContent = courses.length;
    if (ha) ha.textContent = articles.length;
    if (hr) hr.textContent = recommendations.length;

    // About stats
    const sc = $('stat-courses');
    const sm = $('stat-modules');
    const sa = $('stat-articles');
    const sr = $('stat-recs');
    if (sc) sc.textContent = courses.length;
    if (sm) sm.textContent = totalModules;
    if (sa) sa.textContent = articles.length;
    if (sr) sr.textContent = recommendations.length;

    initNav();
  }

  /* ── Nav scroll spy ─────────────────────────────── */
  function initNav() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sectionIds = Array.from(navLinks).map(l => l.dataset.section);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    }, { rootMargin: '-72px 0px -60% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ── Mobile nav ─────────────────────────────────── */
  const hamburger = document.getElementById('nav-hamburger');
  const mobile    = document.getElementById('nav-mobile');
  if (hamburger && mobile) {
    hamburger.addEventListener('click', () => mobile.classList.toggle('open'));
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobile.classList.remove('open'));
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
