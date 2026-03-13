const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const PAGES_DIR = path.join(__dirname, "src", "pages");
const DIST_DIR = path.join(__dirname, "dist");

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/services.html", label: "Services" },
  { href: "/technology.html", label: "Technology" },
  { href: "/cats.html", label: "Cats" },
  { href: "/about.html", label: "About" },
  { href: "/contact.html", label: "Contact" },
];

function template(title, content, currentPage) {
  const nav = NAV_ITEMS.map(
    (item) =>
      `<a href="${item.href}" class="${item.href === currentPage ? "active" : ""}">${item.label}</a>`
  ).join("\n          ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — MedFlow Health</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1a1a2e; line-height: 1.7; }
    header { background: #0f3460; color: #fff; padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 1.4rem; font-weight: 700; }
    header h1 span { color: #4ec5f1; }
    nav { display: flex; gap: 1.5rem; }
    nav a { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.95rem; font-weight: 500; transition: color 0.2s; }
    nav a:hover, nav a.active { color: #4ec5f1; }
    main { max-width: 800px; margin: 3rem auto; padding: 0 2rem; }
    main h1 { font-size: 2rem; margin-bottom: 1rem; color: #0f3460; }
    main h2 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 0.75rem; color: #16213e; }
    main h3 { font-size: 1.15rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1a1a2e; }
    main p { margin-bottom: 1rem; color: #333; }
    main ul, main ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    main li { margin-bottom: 0.4rem; color: #333; }
    main a { color: #0f3460; }
    main strong { color: #16213e; }
    footer { text-align: center; padding: 2rem; color: #999; font-size: 0.85rem; border-top: 1px solid #eee; margin-top: 4rem; }
  </style>
</head>
<body>
  <header>
    <h1>Med<span>Flow</span> Health</h1>
    <nav>
      ${nav}
    </nav>
  </header>
  <main>
    ${content}
  </main>
  <footer>
    &copy; 2026 MedFlow Health. All rights reserved.
  </footer>
</body>
</html>`;
}

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const md = fs.readFileSync(path.join(PAGES_DIR, file), "utf-8");
  const html = marked(md);

  const name = file.replace(".md", "");
  const outName = name === "index" ? "index.html" : `${name}.html`;
  const currentPage = name === "index" ? "/" : `/${outName}`;

  const titleMatch = md.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : name;

  fs.writeFileSync(path.join(DIST_DIR, outName), template(title, html, currentPage));
  console.log(`Built: ${outName}`);
}

console.log(`Done — ${files.length} pages built.`);
