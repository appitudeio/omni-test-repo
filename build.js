const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const PAGES_DIR = path.join(__dirname, "src", "pages");
const DIST_DIR = path.join(__dirname, "dist");

const NAV_ITEMS = [
  { href: "/", label: "Hem" },
  { href: "/jobs.html", label: "Lediga jobb" },
  { href: "/consultant.html", label: "Bli konsult" },
  { href: "/providers.html", label: "V\u00e5rdgivare" },
  { href: "/about.html", label: "Om oss" },
  { href: "/contact.html", label: "Kontakt" },
];

const logoSvg = fs.readFileSync(path.join(__dirname, "src", "logo.svg"), "utf-8");
// Create a second logo with unique IDs to avoid duplicate ID conflicts in the DOM
const logoSvgFooter = logoSvg
  .replace(/id="a"/g, 'id="a-footer"')
  .replace(/url\(#a\)/g, "url(#a-footer)");

function parseFrontmatter(raw) {
  const metadata = {};
  let content = raw;

  if (raw.startsWith("---")) {
    const end = raw.indexOf("---", 3);
    if (end !== -1) {
      const block = raw.slice(3, end).trim();
      for (const line of block.split("\n")) {
        const idx = line.indexOf(":");
        if (idx !== -1) {
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 1).trim();
          metadata[key] = val;
        }
      }
      content = raw.slice(end + 3).trim();
    }
  }

  return { metadata, content };
}

function template(title, content, currentPage, metadata) {
  const nav = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.href === currentPage ? "active" : ""}">${item.label}</a>`
  ).join("\n            ");

  const heroSection = metadata.hero_title
    ? `<section class="hero ${metadata.page_class || ""}">
        <div class="hero-inner">
          <h1>${metadata.hero_title}</h1>
          ${metadata.hero_subtitle ? `<p class="hero-sub">${metadata.hero_subtitle}</p>` : ""}
          <div class="hero-cta">
            ${metadata.hero_cta_primary_text ? `<a href="${metadata.hero_cta_primary_href || "#"}" class="btn btn-primary">${metadata.hero_cta_primary_text}</a>` : ""}
            ${metadata.hero_cta_secondary_text ? `<a href="${metadata.hero_cta_secondary_href || "#"}" class="btn btn-outline">${metadata.hero_cta_secondary_text}</a>` : ""}
          </div>
        </div>
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${title} \u2014 Almia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    /* ── Reset ── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #2d3748;
      line-height: 1.7;
      background: #fff;
      -webkit-font-smoothing: antialiased;
    }

    img, svg { max-width: 100%; height: auto; }

    /* ── Top bar ── */
    .top-bar {
      background: #1b2a4a;
      color: rgba(255,255,255,0.7);
      font-size: 0.85rem;
      padding: 0.45rem 2rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1.5rem;
    }
    .top-bar a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      transition: color 0.2s;
    }
    .top-bar a:hover { color: #5aaddf; }
    .top-bar .phone::before { content: "\\260E\\FE0F "; }
    .top-bar .email::before { content: "\\2709\\FE0F "; }

    /* ── Header / Nav ── */
    header {
      background: #fff;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 0.75rem 0;
    }
    .logo svg {
      height: 44px;
      width: auto;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      color: #1b2a4a;
      font-size: 1.6rem;
      cursor: pointer;
      padding: 0.5rem;
    }

    nav {
      display: flex;
      gap: 0;
    }
    nav a {
      color: #1b2a4a;
      text-decoration: none;
      font-size: 0.92rem;
      font-weight: 500;
      padding: 1.1rem 0.9rem;
      transition: color 0.2s, border-color 0.2s;
      border-bottom: 3px solid transparent;
    }
    nav a:hover, nav a.active {
      color: #4a90d9;
      border-bottom-color: #4a90d9;
    }
    .nav-cta {
      margin-left: 0.5rem;
    }
    .nav-cta a {
      background: #4a90d9;
      color: #fff !important;
      border-radius: 6px;
      padding: 0.6rem 1.2rem !important;
      border-bottom: none !important;
      font-weight: 600;
      transition: background 0.2s;
    }
    .nav-cta a:hover { background: #3a7bc8; }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #1b2a4a 0%, #2a5298 50%, #4a90d9 100%);
      color: #fff;
      padding: 5rem 2rem;
      text-align: center;
    }
    .hero-home {
      padding: 6rem 2rem;
    }
    .hero-inner {
      max-width: 750px;
      margin: 0 auto;
    }
    .hero h1 {
      font-size: 2.8rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .hero-sub {
      font-size: 1.15rem;
      color: rgba(255,255,255,0.85);
      margin-bottom: 2.2rem;
      line-height: 1.6;
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-block;
      padding: 0.9rem 2.2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      cursor: pointer;
      border: none;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary {
      background: #4a90d9;
      color: #fff;
      box-shadow: 0 2px 8px rgba(74,144,217,0.3);
    }
    .btn-primary:hover { background: #3a7bc8; }
    .btn-outline {
      background: rgba(255,255,255,0.12);
      color: #fff;
      border: 2px solid rgba(255,255,255,0.4);
    }
    .btn-outline:hover { background: rgba(255,255,255,0.22); }
    .btn-blue {
      background: #4a90d9;
      color: #fff;
    }
    .btn-blue:hover { background: #3a7bc8; }

    /* ── Main content ── */
    main {
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    main h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #1b2a4a;
      font-weight: 700;
    }
    main h2 {
      font-size: 1.5rem;
      margin-top: 2.5rem;
      margin-bottom: 0.75rem;
      color: #1b2a4a;
      font-weight: 600;
    }
    main h3 {
      font-size: 1.15rem;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      color: #2d3748;
      font-weight: 600;
    }
    main p {
      margin-bottom: 1rem;
      color: #4a5568;
    }
    main ul, main ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    main li {
      margin-bottom: 0.5rem;
      color: #4a5568;
    }
    main a {
      color: #4a90d9;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }
    main a:hover { color: #2a5298; text-decoration: underline; }
    main strong { color: #1b2a4a; }

    /* ── Sections (full-width) ── */
    .section {
      padding: 4rem 2rem;
    }
    .section-inner {
      max-width: 1000px;
      margin: 0 auto;
    }
    .section-alt {
      background: #f7fafc;
    }
    .section-blue {
      background: linear-gradient(135deg, #1b2a4a 0%, #2a5298 100%);
      color: #fff;
    }
    .section-blue h2, .section-blue p { color: #fff; }
    .section-blue p { opacity: 0.85; }
    .section h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #1b2a4a;
      margin-bottom: 0.5rem;
    }
    .section p.lead {
      font-size: 1.05rem;
      color: #4a5568;
      margin-bottom: 2rem;
    }
    .section-blue p.lead { color: rgba(255,255,255,0.85); }
    .text-center { text-align: center; }

    /* ── Card grid ── */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }
    .card-grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      transition: box-shadow 0.3s, transform 0.3s;
    }
    .card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .card h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1b2a4a;
      margin-bottom: 0.75rem;
      margin-top: 0;
    }
    .card p {
      color: #4a5568;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .card .card-link {
      color: #4a90d9;
      font-weight: 600;
      text-decoration: none;
      font-size: 0.95rem;
    }
    .card .card-link:hover { text-decoration: underline; }
    .card-icon {
      font-size: 2.2rem;
      margin-bottom: 0.75rem;
      display: block;
    }

    /* ── Role cards ── */
    .role-card {
      text-align: center;
      padding: 2.5rem 1.5rem;
    }
    .role-card .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* ── Stats row ── */
    .stats-row {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
      margin: 2rem 0;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: #4a90d9;
      display: block;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #4a5568;
      font-weight: 500;
    }

    /* ── CTA banner ── */
    .cta-banner {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #1b2a4a 0%, #2a5298 100%);
      color: #fff;
    }
    .cta-banner h2 {
      color: #fff;
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }
    .cta-banner p {
      color: rgba(255,255,255,0.85);
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }
    .cta-options {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ── Contact form ── */
    .contact-form {
      max-width: 540px;
      margin: 2rem auto;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: #1b2a4a;
      margin-bottom: 0.35rem;
    }
    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fff;
    }
    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #4a90d9;
      box-shadow: 0 0 0 3px rgba(74,144,217,0.15);
    }
    .form-group textarea { resize: vertical; min-height: 120px; }
    .form-submit {
      background: #4a90d9;
      color: #fff;
      border: none;
      padding: 0.85rem 2.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      font-family: inherit;
    }
    .form-submit:hover { background: #3a7bc8; }
    .form-consent {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 0.5rem;
    }

    /* ── Footer ── */
    footer {
      background: #1b2a4a;
      color: rgba(255,255,255,0.7);
      margin-top: 0;
      padding: 3.5rem 2rem 2rem;
    }
    .footer-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 2rem;
    }
    .footer-brand p {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-top: 0.75rem;
    }
    .footer-logo svg {
      height: 36px;
      width: auto;
      filter: brightness(0) invert(1);
    }
    footer h4 {
      color: #fff;
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    footer ul {
      list-style: none;
      padding: 0;
    }
    footer li { margin-bottom: 0.45rem; }
    footer a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }
    footer a:hover { color: #5aaddf; }
    .footer-social {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .footer-social a {
      font-size: 1.2rem;
      color: rgba(255,255,255,0.6);
    }
    .footer-social a:hover { color: #fff; }
    .footer-bottom {
      max-width: 1000px;
      margin: 2rem auto 0;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    /* ── Fade-in animation ── */
    .fade-in {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .fade-in.visible {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Mobile responsive ── */
    @media (max-width: 768px) {
      .top-bar {
        padding: 0.4rem 1rem;
        font-size: 0.78rem;
        gap: 0.8rem;
      }

      header { padding: 0 1rem; }
      .menu-toggle { display: block; }
      .logo svg { height: 36px; }

      nav {
        display: none;
        flex-direction: column;
        width: 100%;
        padding: 0.5rem 0;
      }
      nav.open { display: flex; }
      nav a {
        padding: 0.7rem 0;
        border-bottom: 1px solid #e2e8f0;
      }
      nav a:last-child { border-bottom: none; }
      .nav-cta { margin-left: 0; }
      .nav-cta a { display: block; text-align: center; margin-top: 0.5rem; }

      .hero { padding: 3rem 1.5rem; }
      .hero-home { padding: 3.5rem 1.5rem; }
      .hero h1 { font-size: 2rem; }
      .hero-sub { font-size: 1rem; }

      main { padding: 2rem 1rem; }
      main h1 { font-size: 1.6rem; }

      .section { padding: 2.5rem 1rem; }

      .card-grid, .card-grid-3 {
        grid-template-columns: 1fr;
      }

      .stats-row { gap: 1.5rem; }
      .stat-number { font-size: 2rem; }

      .footer-inner {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .footer-social { justify-content: center; }
      .footer-bottom {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }

      .cta-banner h2 { font-size: 1.4rem; }
      .cta-options { flex-direction: column; align-items: center; }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .card-grid-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="top-bar">
    <a href="tel:+46841025050" class="phone">08-410 250 50</a>
    <a href="mailto:info@almia.se" class="email">info@almia.se</a>
  </div>
  <header>
    <a href="/" class="logo">${logoSvg}</a>
    <button class="menu-toggle" aria-label="Meny" onclick="document.querySelector('nav').classList.toggle('open')">&#9776;</button>
    <nav>
      ${nav}
    </nav>
  </header>
  ${heroSection}
  <main>
    ${content}
  </main>
  <footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">${logoSvgFooter}</div>
        <p>Almia \u00e4r specialister p\u00e5 bemanning inom v\u00e5rd och omsorg. Vi hj\u00e4lper v\u00e5rdpersonal till friare och b\u00e4ttre villkor sedan 2016.</p>
        <div class="footer-social">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">in</a>
          <a href="#" aria-label="LinkedIn">Li</a>
        </div>
      </div>
      <div>
        <h4>Almia</h4>
        <ul>
          <li><a href="/about.html">Om oss</a></li>
          <li><a href="/consultant.html">Bli konsult</a></li>
          <li><a href="/providers.html">V\u00e5rdgivare</a></li>
          <li><a href="/jobs.html">Lediga jobb</a></li>
        </ul>
      </div>
      <div>
        <h4>V\u00e5rdomr\u00e5den</h4>
        <ul>
          <li><a href="/jobs.html">Sjuksk\u00f6terskor</a></li>
          <li><a href="/jobs.html">L\u00e4kare</a></li>
          <li><a href="/jobs.html">Fysioterapeuter</a></li>
          <li><a href="/jobs.html">Arbetsterapeuter</a></li>
          <li><a href="/jobs.html">Undersk\u00f6terskor</a></li>
        </ul>
      </div>
      <div>
        <h4>Kontakt</h4>
        <ul>
          <li><a href="tel:+46841025050">08-410 250 50</a></li>
          <li><a href="mailto:info@almia.se">info@almia.se</a></li>
          <li>Engelbrektsgatan 35B</li>
          <li>114 32 Stockholm</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Copyright &copy; 2016\u20132026 Almia AB. Org.nr: 559058-4610</span>
      <span><a href="#">Integritetspolicy</a> &middot; <a href="#">Allm\u00e4nna villkor</a></span>
    </div>
  </footer>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var els = document.querySelectorAll('.fade-in');
      if (!els.length) return;
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(function(el) { obs.observe(el); });
    });
  </script>
</body>
</html>`;
}

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy logo to dist
fs.copyFileSync(
  path.join(__dirname, "src", "logo.svg"),
  path.join(DIST_DIR, "logo.svg")
);

// Write robots.txt
fs.writeFileSync(
  path.join(DIST_DIR, "robots.txt"),
  "User-agent: *\nDisallow: /\n"
);

const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const raw = fs.readFileSync(path.join(PAGES_DIR, file), "utf-8");
  const { metadata, content } = parseFrontmatter(raw);
  const html = marked(content);

  const name = file.replace(".md", "");
  const outName = name === "index" ? "index.html" : `${name}.html`;
  const currentPage = name === "index" ? "/" : `/${outName}`;

  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = metadata.title || (titleMatch ? titleMatch[1] : name);

  fs.writeFileSync(
    path.join(DIST_DIR, outName),
    template(title, html, currentPage, metadata)
  );
  console.log(`Built: ${outName}`);
}

console.log(`Done \u2014 ${files.length} pages built.`);
