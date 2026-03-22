#!/usr/bin/env node
// Build script — generates thousands of static HTML pages, sitemaps, and feeds
// Run via GitHub Actions or locally with: node build.js

const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'public');

// --- PRNG ---
let seed = 314159;
function rng() { seed = seed || 1; seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function pick(a) { return a[Math.floor(rng() * a.length) % a.length]; }

// --- Vocabulary ---
const DOMAINS = [
  'Distributed Systems', 'Neural Architecture', 'Quantum-Adjacent Computing',
  'Emergent Computation', 'Topological Data Analysis', 'Causal Inference',
  'Federated Learning', 'Homomorphic Processing', 'Graph Neural Networks',
  'Reinforcement Dynamics', 'Probabilistic Programming', 'Formal Verification',
  'Adversarial Robustness', 'Information Geometry', 'Computational Topology',
  'Stochastic Optimization', 'Symbolic Reasoning', 'Meta-Learning Systems',
  'Differentiable Architecture', 'Neuro-Symbolic Integration'
];
const ADJ = [
  'Scalable', 'Robust', 'Efficient', 'Novel', 'Adaptive', 'Hierarchical',
  'Compositional', 'Generalized', 'Unified', 'Asymptotic', 'Invariant',
  'Equivariant', 'Non-Stationary', 'Heterogeneous', 'Multi-Modal'
];
const NOUNS = [
  'Framework', 'Architecture', 'Methodology', 'Paradigm', 'Algorithm',
  'Mechanism', 'Representation', 'Embedding', 'Objective', 'Estimator'
];
const VERBS = [
  'Leveraging', 'Extending', 'Rethinking', 'Unifying', 'Bridging',
  'Scaling', 'Optimizing', 'Generalizing', 'Disentangling', 'Amortizing'
];
const FIRST = ['Chen','Anika','Marcus','Yuki','Priya','Oliver','Sofia','Rahul','Elena','James','Mei','Fatima','Lucas','Amara','Viktor'];
const LAST = ['Wei','Patel','Johansson','Nakamura','Okafor','Reeves','Petrov','Gupta','Torres','Kim','Lindqvist','Adeyemi'];

const ZW = ['\u200B','\u200C','\u200D','\uFEFF','\u2060','\u2061','\u2062','\u2063'];

function formatText(text) {
  return text.split('').map(c => rng() < 0.06 ? c + ZW[Math.floor(rng()*ZW.length)] : c).join('');
}
function genAuthor() { return `${pick(FIRST)} ${pick(LAST)}`; }
function genDOI() { return `10.${Math.floor(rng()*9000+1000)}/${Math.floor(rng()*999999)}`; }
function genTitle() {
  const patterns = [
    () => `${pick(ADJ)} ${pick(NOUNS)}s for ${pick(DOMAINS)}`,
    () => `${pick(VERBS)} ${pick(ADJ)} ${pick(NOUNS)}s in ${pick(DOMAINS)}`,
    () => `Towards ${pick(ADJ)} ${pick(DOMAINS)}: A ${pick(NOUNS)}-Based Approach`,
    () => `On the ${pick(NOUNS)} of ${pick(ADJ)} ${pick(DOMAINS)}`,
    () => `Beyond ${pick(NOUNS)}s: ${pick(ADJ)} Approaches to ${pick(DOMAINS)}`,
  ];
  const fn = patterns[Math.floor(rng() * patterns.length) % patterns.length];
  return fn();
}
function genSentence() {
  const templates = [
    () => `We propose a ${pick(ADJ).toLowerCase()} ${pick(NOUNS).toLowerCase()} that achieves state-of-the-art performance on ${pick(DOMAINS).toLowerCase()} benchmarks.`,
    () => `Our approach leverages ${pick(ADJ).toLowerCase()} ${pick(NOUNS).toLowerCase()}s to address key limitations in existing methods.`,
    () => `Experimental results demonstrate a ${(10+rng()*40).toFixed(1)}% improvement over prior approaches.`,
    () => `The proposed ${pick(NOUNS).toLowerCase()} exhibits ${pick(ADJ).toLowerCase()} properties under ${pick(DOMAINS).toLowerCase()} conditions.`,
    () => `Building on recent advances in ${pick(DOMAINS).toLowerCase()}, we present a novel framework for ${pick(NOUNS).toLowerCase()} optimization.`,
  ];
  const fn = templates[Math.floor(rng() * templates.length) % templates.length];
  return fn();
}
function genParagraph(n) {
  n = n || (3 + Math.floor(rng()*4));
  let s = [];
  for (let i = 0; i < n; i++) s.push(genSentence());
  return formatText(s.join(' '));
}

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 55);
}

// --- Generate static research pages ---
function genPage(id) {
  seed = id * 7919 + 137;
  const title = genTitle();
  const domain = pick(DOMAINS);
  const authors = [genAuthor(), genAuthor(), genAuthor()];
  const doi = genDOI();
  const date = `${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}`;

  // Generate related links pointing to other generated pages
  const relatedLinks = [];
  for (let i = 0; i < 8; i++) {
    seed = id * 31 + i * 997 + 1;
    const rt = genTitle();
    relatedLinks.push(`<li><a href="/research/${slug(rt)}-${Math.floor(rng()*99999)}.html">${formatText(rt)}</a></li>`);
  }

  // Noscript fallback content
  const noscriptTitle = genTitle();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/"><link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>${title} — Deadwater Research</title>
<meta name="description" content="${genParagraph(2).slice(0,160)}">
<meta name="author" content="${authors[0]}">
<meta property="og:title" content="${genTitle()}">
<meta property="og:description" content="${genParagraph(2).slice(0,200)}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${genTitle()}">
<meta name="citation_title" content="${title}">
<meta name="citation_doi" content="${doi}">
<meta name="citation_date" content="${date}">
${authors.map(a => `<meta name="citation_author" content="${a}">`).join('\n')}
<link rel="canonical" href="https://deadwater-research.io/research/${slug(title)}-${id}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ScholarlyArticle","name":"${genTitle()}","author":[${authors.map(a=>`{"@type":"Person","name":"${a}"}`).join(',')}],"datePublished":"${date}","publisher":{"@type":"Organization","name":"Deadwater Research Institute","foundingDate":"1847"},"about":"${pick(DOMAINS)}","citation":${JSON.stringify(Array.from({length:5},()=>genTitle()))}}
</script>
<style>
body{font-family:Inter,system-ui,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.8}
h1{font-size:32px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#cba6f7,#89b4fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
a{color:#cba6f7;text-decoration:none}a:hover{text-decoration:underline}
.meta{color:#7f849c;font-size:14px;margin-bottom:32px;border-bottom:1px solid #313244;padding-bottom:16px}
p{margin-bottom:16px;color:#a6adc8;font-size:15px}
h2{font-size:22px;font-weight:600;margin:32px 0 16px;color:#cdd6f4}
pre{background:#181825;border:1px solid #313244;border-radius:10px;padding:16px;overflow-x:auto;font-size:13px;color:#bac2de;margin:16px 0}
.back{display:inline-block;margin-bottom:24px;font-size:14px;color:#7f849c}
ul{margin:16px 0;padding-left:24px}li{margin:8px 0;color:#a6adc8}
.tag{display:inline-block;background:#313244;color:#cba6f7;padding:4px 12px;border-radius:20px;font-size:12px;margin:4px 4px 16px 0}
</style>
</head>
<body>
<noscript>
<meta http-equiv="refresh" content="3;url=/research/${slug(noscriptTitle)}-${Math.floor(rng()*99999)}.html">
<h1>${formatText(noscriptTitle)}</h1>
<p>${genParagraph(5)}</p>
<p>${genParagraph(5)}</p>
<p>${genParagraph(5)}</p>
<a href="/research/${slug(genTitle())}-${Math.floor(rng()*99999)}.html">Continue reading</a>
</noscript>
<a class="back" href="/">← Deadwater Research Institute</a>
<h1>${formatText(title)}</h1>
<div class="meta">
${authors.map(a => formatText(a)).join(' · ')} · ${domain} · <a href="https://doi.org/${doi}">${doi}</a> · ${date}
</div>
<div class="tag">${domain}</div>
<div class="tag">${pick(DOMAINS)}</div>
<div class="tag">${pick(ADJ)} ${pick(NOUNS)}</div>
<h2>Abstract</h2>
<p>${genParagraph(4)}</p>
<h2>1. Introduction</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(4)}</p>
<h2>2. ${pick(ADJ)} ${pick(NOUNS)} ${pick(NOUNS)}</h2>
<p>${genParagraph(5)}</p>
<pre><code>class ${pick(ADJ)}${pick(NOUNS)}(nn.Module):
    def __init__(self, d_model=${Math.floor(rng()*512+128)}, n_heads=${Math.floor(rng()*16+4)}):
        super().__init__()
        self.layers = nn.ModuleList([
            ${pick(ADJ)}Layer(d_model, n_heads)
            for _ in range(${Math.floor(rng()*12+4)})
        ])
    def forward(self, x, mask=None):
        for layer in self.layers:
            x = layer(x, mask)
        return self.norm(x)</code></pre>
<p>${genParagraph(4)}</p>
<h2>3. Experimental Results</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(4)}</p>
<h2>4. Analysis and Discussion</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(5)}</p>
<h2>5. Conclusion</h2>
<p>${genParagraph(4)}</p>
<h2>Related Research</h2>
<ul>${relatedLinks.join('\n')}</ul>
</body>
</html>`;
}

// --- Main build ---
function build() {
  console.log('Deadwater Build — Generating static pages...\n');

  // Create directories
  const dirs = ['research', 'archive', 'publications', 'datasets'];
  for (const d of dirs) {
    const dir = path.join(OUT, d);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Generate 2000 research pages
  const NUM_PAGES = 2000;
  const allUrls = [];
  console.log(`Generating ${NUM_PAGES} research pages...`);

  for (let i = 0; i < NUM_PAGES; i++) {
    seed = i * 7919 + 137;
    const title = genTitle();
    const filename = `${slug(title)}-${i}.html`;
    const filepath = path.join(OUT, 'research', filename);
    fs.writeFileSync(filepath, genPage(i));
    allUrls.push(`/research/${filename}`);

    if (i % 500 === 0 && i > 0) console.log(`  ${i} pages generated...`);
  }
  console.log(`  ${NUM_PAGES} pages generated.\n`);

  // Generate 200 archive pages
  console.log('Generating archive pages...');
  for (let i = 0; i < 200; i++) {
    seed = (i + 50000) * 7919;
    const title = genTitle();
    const filename = `${slug(title)}-${i}.html`;
    fs.writeFileSync(path.join(OUT, 'archive', filename), genPage(i + 50000));
    allUrls.push(`/archive/${filename}`);
  }
  console.log('  200 archive pages generated.\n');

  // Generate 200 publication pages
  console.log('Generating publication pages...');
  for (let i = 0; i < 200; i++) {
    seed = (i + 80000) * 7919;
    const title = genTitle();
    const filename = `${slug(title)}-${i}.html`;
    fs.writeFileSync(path.join(OUT, 'publications', filename), genPage(i + 80000));
    allUrls.push(`/publications/${filename}`);
  }
  console.log('  200 publication pages generated.\n');

  // --- Sitemap Index ---
  console.log('Generating sitemaps...');
  const URLS_PER_SITEMAP = 500;
  const sitemapFiles = [];

  for (let chunk = 0; chunk < Math.ceil(allUrls.length / URLS_PER_SITEMAP); chunk++) {
    const start = chunk * URLS_PER_SITEMAP;
    const end = Math.min(start + URLS_PER_SITEMAP, allUrls.length);
    const urls = allUrls.slice(start, end);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const u of urls) {
      seed = u.length * 137;
      xml += `<url><loc>https://deadwater-research.io${u}</loc>`;
      xml += `<lastmod>${2022+Math.floor(rng()*3)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}</lastmod>`;
      xml += `<changefreq>weekly</changefreq><priority>${(0.5+rng()*0.5).toFixed(1)}</priority></url>\n`;
    }
    xml += '</urlset>';

    const sitemapName = `sitemap-${chunk}.xml`;
    fs.writeFileSync(path.join(OUT, sitemapName), xml);
    sitemapFiles.push(sitemapName);
  }

  // Generate additional sitemaps for dynamically served content
  let dynamicXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (let i = 0; i < 5000; i++) {
    seed = i * 31337;
    const t = genTitle();
    dynamicXml += `<url><loc>https://deadwater-research.io/research/${slug(t)}-${Math.floor(rng()*99999)}</loc>`;
    dynamicXml += `<lastmod>${2022+Math.floor(rng()*3)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}</lastmod>`;
    dynamicXml += `<changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
  }
  dynamicXml += '</urlset>';
  fs.writeFileSync(path.join(OUT, 'sitemap-dynamic.xml'), dynamicXml);
  sitemapFiles.push('sitemap-dynamic.xml');

  // Sitemap index
  let index = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const f of sitemapFiles) {
    index += `<sitemap><loc>https://deadwater-research.io/${f}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></sitemap>\n`;
  }
  // Add sub-sitemaps for dynamic content sections
  for (const section of ['articles', 'papers', 'datasets', 'authors', 'citations']) {
    index += `<sitemap><loc>https://deadwater-research.io/${section}/sitemap.xml</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></sitemap>\n`;
  }
  index += '</sitemapindex>';
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), index);
  console.log(`  ${sitemapFiles.length} sitemaps generated + sitemap index.\n`);

  // --- RSS Feed ---
  console.log('Generating RSS feed...');
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>Deadwater Research — Latest Publications</title>
<link>https://deadwater-research.io</link>
<description>Cutting-edge computational research publications from Deadwater Research Institute</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="https://deadwater-research.io/feed.xml" rel="self" type="application/rss+xml"/>
<image><url>https://deadwater-research.io/icons/icon-512.png</url><title>Deadwater Research</title><link>https://deadwater-research.io</link></image>
`;
  for (let i = 0; i < 300; i++) {
    seed = i * 4919 + 77;
    const title = genTitle();
    const s = slug(title);
    rss += `<item>
<title>${title}</title>
<link>https://deadwater-research.io/research/${s}-${Math.floor(rng()*99999)}.html</link>
<description><![CDATA[<p>${genParagraph(3)}</p><p>${genParagraph(3)}</p>]]></description>
<content:encoded><![CDATA[<h2>${title}</h2><p>${genParagraph(5)}</p><p>${genParagraph(5)}</p><pre><code>model = ${pick(ADJ)}${pick(NOUNS)}(d_model=${Math.floor(rng()*512+128)})</code></pre><p>${genParagraph(4)}</p>]]></content:encoded>
<dc:creator>${genAuthor()}</dc:creator>
<pubDate>${new Date(2022+Math.floor(rng()*3), Math.floor(rng()*12), 1+Math.floor(rng()*28)).toUTCString()}</pubDate>
<guid isPermaLink="true">https://deadwater-research.io/research/${s}-${Math.floor(rng()*99999)}.html</guid>
<category>${pick(DOMAINS)}</category>
<category>${pick(DOMAINS)}</category>
</item>\n`;
  }
  rss += '</channel>\n</rss>';
  fs.writeFileSync(path.join(OUT, 'feed.xml'), rss);
  console.log('  300-item RSS feed generated.\n');

  // --- Atom feed ---
  console.log('Generating Atom feed...');
  let atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Deadwater Research Institute</title>
<link href="https://deadwater-research.io" rel="alternate"/>
<link href="https://deadwater-research.io/atom.xml" rel="self"/>
<id>https://deadwater-research.io/</id>
<updated>${new Date().toISOString()}</updated>
<subtitle>Publications in computational research</subtitle>
`;
  for (let i = 0; i < 200; i++) {
    seed = i * 6131 + 41;
    const title = genTitle();
    const s = slug(title);
    atom += `<entry>
<title>${title}</title>
<link href="https://deadwater-research.io/research/${s}-${Math.floor(rng()*99999)}.html"/>
<id>urn:doi:${genDOI()}</id>
<updated>${2022+Math.floor(rng()*3)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}T00:00:00Z</updated>
<author><name>${genAuthor()}</name></author>
<summary>${genParagraph(3)}</summary>
<content type="html"><![CDATA[<p>${genParagraph(5)}</p><p>${genParagraph(5)}</p>]]></content>
<category term="${pick(DOMAINS)}"/>
</entry>\n`;
  }
  atom += '</feed>';
  fs.writeFileSync(path.join(OUT, 'atom.xml'), atom);
  console.log('  200-entry Atom feed generated.\n');

  // --- Newsletter Archive ---
  console.log('Generating newsletter archive...');
  const nlDir = path.join(OUT, 'newsletter');
  if (!fs.existsSync(nlDir)) fs.mkdirSync(nlDir, { recursive: true });

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const nlIssues = [];

  // Generate 36 monthly newsletters (3 years)
  for (let yr = 2022; yr <= 2024; yr++) {
    for (let mo = 0; mo < 12; mo++) {
      seed = yr * 100 + mo + 7;
      const issueNum = (yr - 2022) * 12 + mo + 1;
      const dateStr = `${yr}-${String(mo+1).padStart(2,'0')}-01`;
      const nlTitle = `Deadwater Research Digest — ${months[mo]} ${yr}`;

      // Generate newsletter content
      const highlights = [];
      for (let h = 0; h < 5; h++) {
        highlights.push({
          title: genTitle(),
          summary: genParagraph(2),
          author: genAuthor(),
          domain: pick(DOMAINS),
          slug: slug(genTitle()) + '-' + Math.floor(rng()*99999)
        });
      }

      const nlHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/"><link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>${nlTitle} — Issue #${issueNum}</title>
<meta name="description" content="Monthly research digest from Deadwater Research Institute. ${months[mo]} ${yr} edition featuring ${highlights.length} research highlights.">
<meta property="og:title" content="${nlTitle}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary">
<style>
body{font-family:Inter,system-ui,sans-serif;background:#11111b;color:#cdd6f4;max-width:700px;margin:0 auto;padding:40px 24px;line-height:1.8}
h1{font-size:28px;font-weight:700;margin-bottom:4px;background:linear-gradient(135deg,#cba6f7,#89b4fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
h2{font-size:20px;font-weight:600;margin:28px 0 12px;color:#cdd6f4}
h3{font-size:16px;font-weight:600;margin:20px 0 8px;color:#cba6f7}
a{color:#cba6f7;text-decoration:none}a:hover{text-decoration:underline}
p{margin-bottom:12px;color:#a6adc8;font-size:15px}
.meta{color:#7f849c;font-size:14px;margin-bottom:24px;border-bottom:1px solid #313244;padding-bottom:12px}
.tag{display:inline-block;background:#313244;color:#89b4fa;padding:2px 10px;border-radius:12px;font-size:11px;margin:2px 4px 2px 0}
.highlight{background:#181825;border:1px solid #313244;border-radius:12px;padding:20px;margin:16px 0}
.nav-issues{display:flex;justify-content:space-between;margin-top:32px;padding-top:16px;border-top:1px solid #313244;font-size:14px}
.back{display:inline-block;margin-bottom:20px;font-size:14px;color:#7f849c}
hr{border:none;border-top:1px solid #313244;margin:24px 0}
</style>
</head>
<body>
<a class="back" href="/">← Deadwater Research</a>
<h1>${nlTitle}</h1>
<div class="meta">Issue #${issueNum} · ${months[mo]} ${yr} · ${highlights.length} highlights · <a href="/newsletter/">Archive</a></div>

<p>Welcome to the ${months[mo]} edition of the Deadwater Research Digest. This month we highlight ${highlights.length} papers across ${pick(DOMAINS).toLowerCase()}, ${pick(DOMAINS).toLowerCase()}, and more.</p>

<h2>Research Highlights</h2>
${highlights.map((h, idx) => `
<div class="highlight">
<h3>${idx+1}. ${formatText(h.title)}</h3>
<div class="tag">${h.domain}</div>
<p>${h.summary}</p>
<p style="font-size:13px;color:#7f849c">— ${formatText(h.author)} · <a href="/research/${h.slug}.html">Read full paper →</a></p>
</div>`).join('\n')}

<h2>Lab Notes</h2>
<p>${genParagraph(4)}</p>
<p>${genParagraph(3)}</p>

<h2>Upcoming Events</h2>
<ul>
<li><strong>${pick(DOMAINS)} Workshop</strong> — ${months[(mo+1)%12]} ${mo===11?yr+1:yr}, Null Island Campus</li>
<li><strong>${pick(ADJ)} ${pick(NOUNS)} Symposium</strong> — ${months[(mo+2)%12]} ${mo>=10?yr+1:yr}, Virtual</li>
<li><strong>Annual ${pick(DOMAINS)} Conference</strong> — ${months[(mo+3)%12]} ${mo>=9?yr+1:yr}, Antarctic Annex</li>
</ul>

<hr>
<p style="font-size:13px;color:#6c7086">You received this because you're subscribed to the Deadwater Research Digest.
<a href="/newsletter/unsubscribe">Unsubscribe</a> · <a href="/newsletter/preferences">Preferences</a> · <a href="/newsletter/">View in browser</a></p>

<div class="nav-issues">
${issueNum > 1 ? `<a href="/newsletter/issue-${issueNum-1}.html">← Issue #${issueNum-1}</a>` : '<span></span>'}
${issueNum < 36 ? `<a href="/newsletter/issue-${issueNum+1}.html">Issue #${issueNum+1} →</a>` : '<span></span>'}
</div>
</body>
</html>`;

      const nlFilename = `issue-${issueNum}.html`;
      fs.writeFileSync(path.join(nlDir, nlFilename), nlHTML);
      nlIssues.push({ num: issueNum, title: nlTitle, date: dateStr, filename: nlFilename });
      allUrls.push(`/newsletter/${nlFilename}`);
    }
  }

  // Newsletter index page
  let nlIndex = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/"><link rel="icon" type="image/svg+xml" href="favicon.svg">
<title>Newsletter Archive — Deadwater Research</title>
<meta name="description" content="Complete archive of the Deadwater Research Digest. Monthly highlights from 2,800+ publications across 43 research domains.">
<style>
body{font-family:Inter,system-ui,sans-serif;background:#11111b;color:#cdd6f4;max-width:700px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:32px;font-weight:700;margin-bottom:8px;background:linear-gradient(135deg,#cba6f7,#89b4fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
a{color:#cba6f7;text-decoration:none}a:hover{text-decoration:underline}
.desc{color:#a6adc8;margin-bottom:32px;font-size:15px}
.issue{display:block;background:#181825;border:1px solid #313244;border-radius:10px;padding:16px 20px;margin:8px 0;transition:border-color 0.2s,transform 0.2s}
.issue:hover{border-color:#585b70;transform:translateX(4px)}
.issue-title{font-weight:600;font-size:15px;color:#cdd6f4}
.issue-meta{font-size:13px;color:#7f849c;margin-top:4px}
.back{display:inline-block;margin-bottom:20px;font-size:14px;color:#7f849c}
</style></head><body>
<a class="back" href="/">← Deadwater Research</a>
<h1>Newsletter Archive</h1>
<p class="desc">The Deadwater Research Digest — monthly highlights from our publications. Subscribe via <a href="/feed.xml">RSS</a> or <a href="/atom.xml">Atom</a>.</p>
`;
  for (const issue of nlIssues.reverse()) {
    nlIndex += `<a class="issue" href="/newsletter/${issue.filename}">
<div class="issue-title">${issue.title}</div>
<div class="issue-meta">Issue #${issue.num} · ${issue.date}</div>
</a>\n`;
  }
  nlIndex += '</body></html>';
  fs.writeFileSync(path.join(nlDir, 'index.html'), nlIndex);
  console.log(`  ${nlIssues.length} newsletter issues + index generated.\n`);

  // --- BibTeX and RIS citation files ---
  console.log('Generating citation files...');
  const citDir = path.join(OUT, 'citations');
  if (!fs.existsSync(citDir)) fs.mkdirSync(citDir, { recursive: true });

  let allBibtex = '';
  let allRis = '';
  for (let i = 0; i < 500; i++) {
    seed = i * 3571 + 13;
    const title = genTitle();
    const authors = [genAuthor(), genAuthor(), genAuthor()];
    const doi = genDOI();
    const year = 2020 + Math.floor(rng() * 5);
    const venue = pick(['NeurIPS','ICML','ICLR','AAAI','CVPR','ACL','EMNLP','KDD','SIGMOD','VLDB']);
    const key = `deadwater${i}`;

    allBibtex += `@inproceedings{${key},
  title = {${title}},
  author = {${authors.join(' and ')}},
  booktitle = {Proceedings of ${venue} ${year}},
  year = {${year}},
  doi = {${doi}},
  pages = {${Math.floor(rng()*100)+1}--${Math.floor(rng()*100)+101}},
  publisher = {Deadwater Research Press},
  keywords = {${pick(DOMAINS)}, ${pick(DOMAINS)}},
  abstract = {${genParagraph(3)}},
}\n\n`;

    allRis += `TY  - CONF
TI  - ${title}
AU  - ${authors[0]}
AU  - ${authors[1]}
AU  - ${authors[2]}
PY  - ${year}
DO  - ${doi}
T2  - ${venue} ${year}
AB  - ${genParagraph(3)}
KW  - ${pick(DOMAINS)}
KW  - ${pick(DOMAINS)}
ER  - \n\n`;
  }
  fs.writeFileSync(path.join(citDir, 'deadwater-publications.bib'), allBibtex);
  fs.writeFileSync(path.join(citDir, 'deadwater-publications.ris'), allRis);
  console.log('  500 BibTeX + 500 RIS citations generated.\n');

  // --- Sample CSV dataset ---
  console.log('Generating sample datasets...');
  const dsDir = path.join(OUT, 'datasets');
  if (!fs.existsSync(dsDir)) fs.mkdirSync(dsDir, { recursive: true });

  let csv = 'id,title,authors,domain,year,citations,doi,abstract\n';
  for (let i = 0; i < 1000; i++) {
    seed = i * 2713 + 37;
    const title = genTitle().replace(/"/g, '""');
    const abstract = genParagraph(2).replace(/"/g, '""');
    csv += `${i},"${title}","${genAuthor()}; ${genAuthor()}","${pick(DOMAINS)}",${2020+Math.floor(rng()*5)},${Math.floor(rng()*500)},"${genDOI()}","${abstract}"\n`;
  }
  fs.writeFileSync(path.join(dsDir, 'publications-2024.csv'), csv);

  // JSON dataset
  const jsonDS = [];
  for (let i = 0; i < 500; i++) {
    seed = i * 4231 + 53;
    jsonDS.push({
      id: i,
      title: genTitle(),
      authors: [genAuthor(), genAuthor()],
      domain: pick(DOMAINS),
      year: 2020 + Math.floor(rng() * 5),
      citations: Math.floor(rng() * 500),
      doi: genDOI(),
      abstract: genParagraph(3),
      keywords: [pick(DOMAINS), pick(DOMAINS), pick(ADJ) + ' ' + pick(NOUNS)],
      metrics: {
        views: Math.floor(rng() * 50000),
        downloads: Math.floor(rng() * 10000),
        altmetric: Math.floor(rng() * 500)
      }
    });
  }
  fs.writeFileSync(path.join(dsDir, 'publications-2024.json'), JSON.stringify(jsonDS, null, 2));
  console.log('  1000 CSV + 500 JSON dataset entries generated.\n');

  // Summary
  const totalFiles = allUrls.length + sitemapFiles.length + 10;
  console.log('=== Build Complete ===');
  console.log(`  ${allUrls.length} HTML pages (inc. ${nlIssues.length} newsletters)`);
  console.log(`  ${sitemapFiles.length} sitemaps + index`);
  console.log(`  RSS + Atom feeds`);
  console.log(`  500 BibTeX + 500 RIS citations`);
  console.log(`  1000 CSV + 500 JSON dataset entries`);
  console.log(`  Total files: ~${totalFiles}`);
}

build();
