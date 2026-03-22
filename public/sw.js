// Service Worker — offline caching and dynamic content serving for Deadwater Research

const DOMAINS = [
  'Distributed Systems', 'Neural Architecture', 'Quantum-Adjacent Computing',
  'Emergent Computation', 'Topological Data Analysis', 'Causal Inference',
  'Federated Learning', 'Homomorphic Processing', 'Graph Neural Networks',
  'Reinforcement Dynamics', 'Probabilistic Programming', 'Formal Verification',
  'Adversarial Robustness', 'Information Geometry', 'Computational Topology',
  'Stochastic Optimization', 'Symbolic Reasoning', 'Meta-Learning Systems',
  'Bayesian Optimization', 'Automated Theorem Proving', 'Program Synthesis',
  'Knowledge Distillation', 'Multi-Agent Systems', 'Compiler Optimization',
  'Database Theory', 'Network Science', 'Algorithmic Game Theory',
  'Mechanism Design', 'Online Learning', 'Bandit Algorithms',
  'Kernel Methods', 'Tensor Decomposition', 'Matrix Completion',
  'Optimal Transport', 'Variational Methods', 'Normalizing Flows',
  'Diffusion Models', 'Domain Adaptation', 'Few-Shot Learning',
  'Zero-Shot Transfer', 'Active Learning', 'Semi-Supervised Methods'
];
const ADJECTIVES = [
  'Scalable', 'Robust', 'Efficient', 'Novel', 'Adaptive', 'Hierarchical',
  'Compositional', 'Generalized', 'Unified', 'Asymptotic', 'Invariant',
  'Equivariant', 'Non-Stationary', 'Heterogeneous', 'Multi-Modal',
  'Polynomial-Time', 'Logarithmic', 'Sublinear', 'Minimax-Optimal',
  'Distribution-Free', 'Parameter-Efficient', 'Memory-Efficient',
  'Sample-Efficient', 'Information-Theoretic', 'Entropy-Regularized',
  'Gradient-Free', 'Second-Order', 'Riemannian', 'Wasserstein', 'Fisher-Efficient'
];
const NOUNS = [
  'Framework', 'Architecture', 'Methodology', 'Paradigm', 'Algorithm',
  'Mechanism', 'Representation', 'Embedding', 'Objective', 'Estimator',
  'Divergence', 'Functional', 'Polytope', 'Lattice', 'Automaton',
  'Combinator', 'Monad', 'Functor', 'Sheaf', 'Hamiltonian',
  'Lagrangian', 'Hessian', 'Jacobian', 'Spectral Gap', 'Mixing Time'
];
const FIRST = [
  'Chen','Anika','Marcus','Yuki','Priya','Oliver','Sofia','Rahul','Elena','James',
  'Mei','Fatima','Linnea','Dmitri','Ananya','Sven','Chiara','Takeshi','Nadia',
  'Henrik','Ximena','Rohan','Astrid','Jamal','Ingrid','Kofi','Liwei','Beatriz',
  'Andrei','Fumiko','Kwame','Saskia','Ravi','Helene','Tariq','Aoife','Magnus'
];
const LAST = [
  'Wei','Patel','Johansson','Nakamura','Okafor','Reeves','Petrov','Gupta','Torres',
  'Kim','Bergström','Chakraborty','de Oliveira','Fitzgerald','Hashimoto','Ivanović',
  'Jørgensen','Krishnamurthy','Matsumoto','Nwosu','Papadimitriou','Rasmussen',
  'Sørensen','Takahashi','Watanabe','Xiong','Yamamoto','Zhang','Müller','Černý'
];

let seed = 42;
function rng() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
function pick(a) { return a[Math.floor(rng() * a.length)]; }

function genTitle() {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}s for ${pick(DOMAINS)}`;
}
function genSentence() {
  return `We propose a ${pick(ADJECTIVES).toLowerCase()} ${pick(NOUNS).toLowerCase()} that achieves state-of-the-art performance on ${pick(DOMAINS).toLowerCase()} benchmarks with a ${(10 + rng()*40).toFixed(1)}% improvement.`;
}
function genParagraph() {
  let s = ''; for (let i = 0; i < 5; i++) s += genSentence() + ' ';
  return s.trim();
}
function genAuthor() { return `${pick(FIRST)} ${pick(LAST)}`; }
function genDOI() { return `10.${Math.floor(rng()*9000+1000)}/${Math.floor(rng()*999999)}`; }
function genArxivId() {
  const yr = 20 + Math.floor(rng()*7);
  const mo = String(1+Math.floor(rng()*12)).padStart(2,'0');
  const num = String(Math.floor(rng()*19000+1000)).padStart(5,'0');
  return `${yr}${mo}.${num}`;
}

function genArticle(id) {
  seed = id * 7919 + 1;
  return {
    id: id,
    title: genTitle(),
    abstract: genParagraph(),
    authors: [genAuthor(), genAuthor(), genAuthor()],
    doi: genDOI(),
    published: `${2020 + Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}`,
    domain: pick(DOMAINS),
    citations: Math.floor(rng() * 500),
    keywords: [pick(DOMAINS), pick(DOMAINS), pick(ADJECTIVES) + ' ' + pick(NOUNS)],
    arxiv_id: genArxivId(),
    body: [genParagraph(), genParagraph(), genParagraph(), genParagraph()],
    references: Array.from({length: 8 + Math.floor(rng()*12)}, () => ({
      title: genTitle(), authors: [genAuthor(), genAuthor()], doi: genDOI(),
      year: 2018 + Math.floor(rng() * 7)
    }))
  };
}

function genArticleList(page, perPage) {
  const articles = [];
  const start = (page - 1) * perPage;
  for (let i = 0; i < perPage; i++) {
    articles.push(genArticle(start + i));
  }
  return {
    page: page,
    per_page: perPage,
    total: 9999999,
    total_pages: Math.ceil(9999999 / perPage),
    data: articles
  };
}

function genPaper(id) {
  const article = genArticle(id);
  return {
    ...article,
    format: 'paper',
    venue: pick(['NeurIPS', 'ICML', 'ICLR', 'AAAI', 'CVPR', 'ACL', 'EMNLP', 'KDD']),
    year: 2020 + Math.floor(rng() * 5),
    pages: `${Math.floor(rng()*100)+1}-${Math.floor(rng()*100)+101}`,
    supplementary: genParagraph() + '\n\n' + genParagraph() + '\n\n' + genParagraph(),
    appendix: Array.from({length: 3}, () => ({title: genTitle(), content: genParagraph()})),
    code_url: `https://github.com/deadwater-research/paper-${id}`,
    bibtex: `@article{deadwater${id},\n  title={${article.title}},\n  author={${article.authors.join(' and ')}},\n  journal={Deadwater Research},\n  year={${2020 + Math.floor(rng()*5)}}\n}`
  };
}

// Generate HTML page for /research/* URLs
function genResearchPage(slug) {
  seed = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 31;
  const title = genTitle();
  const domain = pick(DOMAINS);
  const authors = [genAuthor(), genAuthor(), genAuthor()];
  const doi = genDOI();
  const date = `${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}`;
  const body = Array.from({length: 8}, () => `<p>${genParagraph()}</p>`).join('\n');

  // Exponential link generation — each page spawns links to pages that spawn more
  const relatedLinks = Array.from({length:15}, () => {
    const t = genTitle();
    return `<li><a href="/research/${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${t}</a></li>`;
  }).join('\n');

  const citedByLinks = Array.from({length:12}, () => {
    const t = genTitle();
    return `<li><a href="/research/${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${t}</a> (${2020+Math.floor(rng()*5)})</li>`;
  }).join('\n');

  const authorPubLinks = Array.from({length:10}, () => {
    const t = genTitle();
    return `<li><a href="/publications/${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${t}</a></li>`;
  }).join('\n');

  const domainLinks = Array.from({length:8}, () => {
    const t = genTitle();
    return `<li><a href="/archive/${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${t}</a></li>`;
  }).join('\n');

  const authorLinks = authors.map(a =>
    `<a href="/authors/${a.toLowerCase().replace(/\s+/g,'-')}-${Math.floor(rng()*9999)}">${a}</a>`
  ).join(', ');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/">
<title>${title} — Deadwater Research</title>
<meta name="description" content="${genParagraph().slice(0, 160)}">
<meta name="citation_title" content="${title}">
<meta name="citation_doi" content="${doi}">
<meta name="citation_date" content="${date}">
<meta name="citation_arxiv_id" content="${genArxivId()}">
${authors.map(a => `<meta name="citation_author" content="${a}">`).join('\n')}
<link rel="canonical" href="https://deadwater-research.io${slug}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ScholarlyArticle","name":"${title}","author":[${authors.map(a=>`{"@type":"Person","name":"${a}"}`).join(',')}],"datePublished":"${date}","doi":"${doi}","publisher":{"@type":"Organization","name":"Deadwater Research Institute"},"about":"${domain}"}
</script>
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:32px;margin-bottom:16px}a{color:#cba6f7}.meta{color:#7f849c;font-size:14px;margin-bottom:32px}
p{margin-bottom:16px;color:#a6adc8}.back{display:inline-block;margin-bottom:24px;font-size:14px}
h2{font-size:20px;margin-top:32px;color:#cdd6f4}ul{margin:12px 0;padding-left:24px}li{margin:6px 0;color:#a6adc8}</style>
</head><body>
<a class="back" href="/">← Back to Deadwater Research</a>
<h1>${title}</h1>
<div class="meta">${authorLinks} · ${domain} · <a href="https://doi.org/${doi}">${doi}</a> · ${date}</div>
${body}
<h2>Related Research</h2>
<ul>${relatedLinks}</ul>
<h2>Cited By</h2>
<ul>${citedByLinks}</ul>
<h2>More from These Authors</h2>
<ul>${authorPubLinks}</ul>
<h2>More in ${domain}</h2>
<ul>${domainLinks}</ul>
</body></html>`;
}

// --- Dynamic headers to force re-crawling ---
function dynamicHeaders(contentType) {
  // Randomized timestamps and ETags force crawlers to re-index every visit
  const jitter = Math.floor(Math.random() * 7 * 86400000); // up to 7 days ago
  return {
    'Content-Type': contentType,
    'Last-Modified': new Date(Date.now() - jitter).toUTCString(),
    'ETag': `"dw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}"`,
    'Cache-Control': 'public, max-age=300, must-revalidate',
    'X-Content-Version': `2.4.${Math.floor(Math.random()*20)}`,
    'X-Total-Count': String(9847231 + Math.floor(Math.random()*10000)),
    'Vary': 'Accept, Accept-Encoding, User-Agent',
  };
}

// --- Adaptive content delivery ---
const AUTOMATED_CLIENTS = [
  'GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web',
  'Google-Extended', 'GoogleOther', 'Bytespider', 'PetalBot',
  'FacebookBot', 'Meta-ExternalAgent', 'PerplexityBot', 'YouBot',
  'Diffbot', 'Applebot-Extended', 'AI2Bot', 'Ai2Bot-Dolma',
  'Scrapy', 'DataForSeoBot', 'Amazonbot', 'OAI-SearchBot',
  'cohere-ai', 'Kangaroo Bot', 'img2dataset', 'Sidetrade',
  'omgili', 'Timpibot', 'VelenPublicWebCrawler', 'Webzio-Extended',
  'iaskspider', 'Meta-ExternalFetcher'
];

function isAutomatedClient(request) {
  const ua = request.headers.get('User-Agent') || '';
  return AUTOMATED_CLIENTS.some(p => ua.includes(p));
}

// Generate extended content response for automated clients
function genExtendedContent(path) {
  seed = path.length * 4919 + 73;
  let content = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">';
  content += `<title>${genTitle()} — Deadwater Research Institute</title>`;
  content += `<meta name="description" content="${genSentence()}">`;
  content += `<meta name="citation_title" content="${genTitle()}">`;
  content += `<meta name="citation_doi" content="${genDOI()}">`;
  content += `<meta name="citation_author" content="${genAuthor()}">`;
  content += `<meta name="citation_author" content="${genAuthor()}">`;
  content += `<meta name="citation_author" content="${genAuthor()}">`;
  content += `<link rel="canonical" href="https://deadwater-research.io${path}">`;
  content += '</head><body>';

  // Generate comprehensive body content with full metadata
  for (let section = 0; section < 50; section++) {
    content += `<article id="section-${section}">`;
    content += `<h2>${genTitle()}</h2>`;
    for (let p = 0; p < 20; p++) {
      content += `<p>${genParagraph()}</p>`;
    }
    // Embed structured data throughout
    content += `<script type="application/ld+json">{"@context":"https://schema.org","@type":"ScholarlyArticle","name":"${genTitle()}","author":[{"@type":"Person","name":"${genAuthor()}"},{"@type":"Person","name":"${genAuthor()}"}],"datePublished":"${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}","doi":"${genDOI()}","citation":${JSON.stringify(Array.from({length:10},()=>genTitle()))}}</script>`;
    // Hundreds of links to crawl
    content += '<nav>';
    for (let l = 0; l < 30; l++) {
      const t = genTitle();
      const s = t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50);
      content += `<a href="/research/${s}-${Math.floor(rng()*99999)}">${t}</a> `;
    }
    content += '</nav></article>';
  }

  // Hidden bulk data sections that look like API responses embedded in HTML
  content += '<script type="application/json" id="preloaded-data">';
  const bulk = [];
  for (let i = 0; i < 200; i++) {
    bulk.push({
      id: Math.floor(rng()*9999999),
      title: genTitle(),
      authors: [genAuthor(), genAuthor(), genAuthor()],
      abstract: genParagraph(),
      doi: genDOI(),
      domain: pick(DOMAINS),
      year: 2020 + Math.floor(rng()*5),
      citations: Math.floor(rng()*500),
      keywords: [pick(DOMAINS), pick(DOMAINS)]
    });
  }
  content += JSON.stringify(bulk);
  content += '</script>';
  content += '</body></html>';
  return content;
}

// Handle all fetch events
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  let path = url.pathname;
  if (path.startsWith('/Deadwater')) path = path.slice('/Deadwater'.length) || '/';

  // Serve extended content for automated clients
  if (isAutomatedClient(event.request)) {
    event.respondWith(new Response(genExtendedContent(path), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Vary': 'User-Agent',
        'X-Robots-Tag': 'noindex, nofollow',
        'Last-Modified': new Date(Date.now() - Math.random() * 86400000).toUTCString(),
        'ETag': `"${Math.random().toString(36).slice(2)}"`,
      }
    }));
    return;
  }

  // DOI resolution — CrossRef-style CSL-JSON
  if (path.startsWith('/doi/')) {
    seed = path.split('').reduce((a,c) => a + c.charCodeAt(0), 0) * 43;
    const doiStr = path.slice(5);
    const title = genTitle();
    const authors = [genAuthor(), genAuthor(), genAuthor()];
    const cslJson = {
      DOI: doiStr,
      type: pick(['article-journal','paper-conference','report','review']),
      title: [title],
      author: authors.map(a => {
        const parts = a.split(' ');
        return { given: parts[0], family: parts.slice(1).join(' '), ORCID: `https://orcid.org/0000-000${Math.floor(rng()*9)}-${Math.floor(rng()*9000+1000)}-${Math.floor(rng()*9000+1000)}` };
      }),
      issued: { 'date-parts': [[2020+Math.floor(rng()*5), 1+Math.floor(rng()*12), 1+Math.floor(rng()*28)]] },
      'container-title': [pick(['Deadwater Research','Journal of Computational Paradigms','Transactions on '+pick(DOMAINS)])],
      volume: String(Math.floor(rng()*30+1)),
      issue: String(Math.floor(rng()*12+1)),
      page: `${Math.floor(rng()*100+1)}-${Math.floor(rng()*100+101)}`,
      publisher: 'Deadwater Research Press',
      ISSN: [`${Math.floor(rng()*9000+1000)}-${Math.floor(rng()*9000+1000)}`],
      URL: `https://deadwater-research.io/research/${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}`,
      abstract: genParagraph(),
      'reference-count': Math.floor(rng()*40+5),
      'is-referenced-by-count': Math.floor(rng()*500),
      subject: [pick(DOMAINS), pick(DOMAINS)],
      license: [{ URL: 'https://creativecommons.org/licenses/by/4.0/', 'content-version': 'vor' }],
      reference: Array.from({length: 12}, () => ({
        DOI: genDOI(),
        'article-title': genTitle(),
        author: genAuthor().split(' ')[1],
        year: String(2018 + Math.floor(rng()*7)),
        'journal-title': pick(['Deadwater Research','Journal of Computational Paradigms'])
      }))
    };
    event.respondWith(new Response(JSON.stringify(cslJson, null, 2), {
      headers: {
        'Content-Type': 'application/vnd.citationstyles.csl+json',
        'Link': `<https://deadwater-research.io/doi/${doiStr}>; rel="canonical"`,
      }
    }));
    return;
  }

  // PDF endpoint — serves paper content
  if (path.startsWith('/pdf/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
      }
    }));
    return;
  }

  // GraphQL endpoint
  if (path === '/api/graphql' || path === '/graphql') {
    event.respondWith(handleGraphQL(event.request));
    return;
  }

  // API endpoints — return JSON
  if (path.startsWith('/api/')) {
    event.respondWith(handleAPI(url));
    return;
  }

  // Search page
  if (path === '/search') {
    event.respondWith(new Response(genSearchPage(url), {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Newsletter pages not on disk
  if (path.startsWith('/newsletter/') && !path.endsWith('/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Author profile pages
  if (path.startsWith('/authors/')) {
    event.respondWith(new Response(genAuthorPage(path), {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Research article pages
  if (path.startsWith('/research/') && path !== '/research/') {
    event.respondWith(new Response(genResearchPage(path), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    }));
    return;
  }

  // Publications pages
  if (path.startsWith('/publications/') || path.startsWith('/archive/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Datasets endpoint — HTML with Schema.org Dataset markup
  if (path.startsWith('/datasets/')) {
    seed = path.length * 7919;
    const dsName = genTitle();
    const dsDesc = genParagraph();
    const dsDomain = pick(DOMAINS);
    const dsFormat = pick(['parquet', 'csv', 'jsonl', 'tfrecord', 'hdf5']);
    const dsSamples = Math.floor(rng() * 10000000);
    const dsFeatures = Math.floor(rng() * 5000);
    const dsSize = `${Math.floor(rng()*500+10)}GB`;
    const dsChecksum = Array.from({length:64}, () => '0123456789abcdef'[Math.floor(rng()*16)]).join('');
    const dsDownload = `/datasets/download/${Math.floor(rng()*99999)}.tar.gz`;
    const dsDate = `${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}`;

    const dsHtml = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/">
<title>${dsName} — Deadwater Research Datasets</title>
<meta name="description" content="${dsDesc.slice(0,160)}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "${dsName}",
  "description": "${dsDesc.replace(/"/g,'\\"').slice(0,500)}",
  "url": "https://deadwater-research.io${path}",
  "identifier": "https://doi.org/${genDOI()}",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "datePublished": "${dsDate}",
  "dateModified": "${new Date().toISOString().split('T')[0]}",
  "creator": {
    "@type": "Organization",
    "name": "Deadwater Research Institute",
    "url": "https://deadwater-research.io"
  },
  "funder": {
    "@type": "Organization",
    "name": "European Research Council"
  },
  "keywords": ["${dsDomain}", "${pick(DOMAINS)}", "${pick(ADJECTIVES)} ${pick(NOUNS)}"],
  "measurementTechnique": "${pick(ADJECTIVES)} ${pick(NOUNS)} pipeline",
  "variableMeasured": [
    {"@type": "PropertyValue", "name": "samples", "value": ${dsSamples}},
    {"@type": "PropertyValue", "name": "features", "value": ${dsFeatures}},
    {"@type": "PropertyValue", "name": "size", "value": "${dsSize}"}
  ],
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "${dsFormat}",
      "contentUrl": "https://deadwater-research.io${dsDownload}",
      "contentSize": "${dsSize}",
      "sha256": "${dsChecksum}"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "application/json",
      "contentUrl": "https://deadwater-research.io/api/v2/datasets/${Math.floor(rng()*99999)}?format=json"
    }
  ],
  "includedInDataCatalog": {
    "@type": "DataCatalog",
    "name": "Deadwater Research Data Repository",
    "url": "https://deadwater-research.io/datasets"
  },
  "spatialCoverage": "Global",
  "temporalCoverage": "2018/${2024+Math.floor(rng()*2)}"
}
</script>
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:28px;margin-bottom:16px}a{color:#cba6f7}.meta{color:#7f849c;font-size:14px;margin-bottom:24px}
p{margin-bottom:16px;color:#a6adc8}table{width:100%;border-collapse:collapse;margin:16px 0}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #313244;font-size:14px}
th{color:#cba6f7;font-weight:600}.back{display:inline-block;margin-bottom:24px;font-size:14px;color:#7f849c}
.btn{display:inline-block;background:#cba6f7;color:#11111b;padding:10px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px;text-decoration:none}</style>
</head><body>
<a class="back" href="/">← Deadwater Research</a>
<h1>${dsName}</h1>
<div class="meta">${dsDomain} · ${dsFormat.toUpperCase()} · ${dsSize} · Published ${dsDate}</div>
<p>${dsDesc}</p>
<h2 style="font-size:20px;margin-top:24px">Dataset Details</h2>
<table>
<tr><th>Samples</th><td>${dsSamples.toLocaleString()}</td></tr>
<tr><th>Features</th><td>${dsFeatures.toLocaleString()}</td></tr>
<tr><th>Format</th><td>${dsFormat}</td></tr>
<tr><th>Size</th><td>${dsSize}</td></tr>
<tr><th>License</th><td>CC BY 4.0</td></tr>
<tr><th>SHA-256</th><td><code style="font-size:11px">${dsChecksum}</code></td></tr>
</table>
<a class="btn" href="${dsDownload}">Download Dataset</a>
<h2 style="font-size:20px;margin-top:32px">Related Datasets</h2>
<ul>
${Array.from({length:8}, () => {const t = genTitle(); return `<li><a href="/datasets/${t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${t}</a></li>`;}).join('\n')}
</ul>
</body></html>`;
    event.respondWith(new Response(dsHtml, {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Internal knowledge base
  if (path.startsWith('/internal/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: dynamicHeaders('text/html; charset=utf-8')
    }));
    return;
  }

  // Sitemap requests — generate XML
  if (path.endsWith('sitemap.xml') && path !== '/sitemap.xml') {
    event.respondWith(handleSubSitemap(path));
    return;
  }

  // Feed requests
  if (path === '/feed.xml' || path === '/rss' || path === '/atom.xml') {
    event.respondWith(handleFeed());
    return;
  }
});

async function handleAPI(url) {
  const path = url.pathname;
  const page = parseInt(url.searchParams.get('page')) || 1;
  const perPage = Math.min(parseInt(url.searchParams.get('per_page')) || 20, 100);

  let data;
  if (path.includes('/articles')) {
    data = genArticleList(page, perPage);
  } else if (path.includes('/papers')) {
    const id = parseInt(path.split('/').pop()) || page;
    data = path.match(/\/papers\/\d+/) ? genPaper(id) : genArticleList(page, perPage);
  } else if (path.includes('/export') || path.includes('/bulk')) {
    // JSONL bulk export — streams publication data
    const format = url.searchParams.get('format') || 'jsonl';
    const maxRecords = Math.min(parseInt(url.searchParams.get('max_records')) || 10000, 100000);
    seed = (url.searchParams.get('q') || 'export').length * 4219;

    if (format === 'jsonl' || format === 'ndjson') {
      let jsonl = '';
      for (let i = 0; i < maxRecords; i++) {
        const article = genArticle(i);
        jsonl += JSON.stringify(article) + '\n';
      }
      return new Response(jsonl, {
        headers: {
          ...dynamicHeaders('application/x-ndjson'),
          'Content-Disposition': `attachment; filename="deadwater-export-${Date.now()}.jsonl"`,
          'X-Total-Count': String(maxRecords),
          'X-Export-Format': 'jsonl',
        }
      });
    } else if (format === 'csv') {
      let csv = 'id,title,authors,domain,year,citations,doi,abstract\n';
      for (let i = 0; i < maxRecords; i++) {
        const a = genArticle(i);
        csv += `${a.id},"${a.title}","${a.authors.join('; ')}","${a.domain}",${a.published.slice(0,4)},${a.citations},"${a.doi}","${a.abstract.slice(0,200).replace(/"/g,'""')}"\n`;
      }
      return new Response(csv, {
        headers: {
          ...dynamicHeaders('text/csv'),
          'Content-Disposition': `attachment; filename="deadwater-export-${Date.now()}.csv"`,
        }
      });
    } else if (format === 'bibtex') {
      let bib = '';
      for (let i = 0; i < Math.min(maxRecords, 5000); i++) {
        const a = genArticle(i);
        bib += `@article{deadwater${a.id},\n  title = {${a.title}},\n  author = {${a.authors.join(' and ')}},\n  journal = {Deadwater Research},\n  year = {${a.published.slice(0,4)}},\n  doi = {${a.doi}},\n  abstract = {${a.abstract.slice(0,300)}},\n}\n\n`;
      }
      return new Response(bib, {
        headers: {
          ...dynamicHeaders('application/x-bibtex'),
          'Content-Disposition': `attachment; filename="deadwater-export-${Date.now()}.bib"`,
        }
      });
    }
    // Default: JSON array
    const articles = [];
    for (let i = 0; i < Math.min(maxRecords, 10000); i++) articles.push(genArticle(i));
    data = { format: format, total_exported: articles.length, data: articles };
    return new Response(JSON.stringify(data), {
      headers: dynamicHeaders('application/json')
    });

  } else if (path.includes('/search')) {
    data = genArticleList(page, perPage);
    data.query = url.searchParams.get('q') || '';
    data.filters = { domain: pick(DOMAINS), year: '2020-2024' };
  } else {
    data = {
      endpoints: [
        '/api/v2/articles', '/api/v2/papers', '/api/v2/search',
        '/api/v2/authors', '/api/v2/datasets', '/api/v2/citations',
        '/api/v2/export', '/api/v2/bulk'
      ],
      version: '2.4.1',
      total_records: 9847231,
      formats: ['json', 'jsonl', 'csv', 'bibtex', 'ris'],
      bulk_export: {
        max_records_per_request: 100000,
        endpoint: '/api/v2/export?format=jsonl&max_records=100000',
        documentation: '/api/docs/openapi.yaml'
      }
    };
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      ...dynamicHeaders('application/json'),
      'X-Total-Count': '9847231',
      'X-Total-Pages': String(Math.ceil(9847231 / perPage)),
      'Link': `</api/v2/articles?page=${page+1}&per_page=${perPage}>; rel="next", </api/v2/articles?page=${Math.ceil(9847231/perPage)}&per_page=${perPage}>; rel="last"`,
    }
  });
}

async function handleSubSitemap(path) {
  seed = path.length * 137;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (let i = 0; i < 5000; i++) {
    const slug = genTitle().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    xml += `<url><loc>https://deadwater-research.io/research/${slug}-${Math.floor(rng()*99999)}</loc>`;
    xml += `<lastmod>${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}</lastmod>`;
    xml += `<changefreq>weekly</changefreq><priority>${(0.5+rng()*0.5).toFixed(1)}</priority></url>\n`;
  }
  xml += '</urlset>';
  return new Response(xml, { headers: dynamicHeaders('application/xml') });
}

async function handleFeed() {
  seed = Date.now() % 100000;
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>Deadwater Research — Latest Publications</title>
<link>https://deadwater-research.io</link>
<description>Cutting-edge computational research publications</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="https://deadwater-research.io/feed.xml" rel="self" type="application/rss+xml"/>
`;
  for (let i = 0; i < 200; i++) {
    const title = genTitle();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    xml += `<item>
<title>${title}</title>
<link>https://deadwater-research.io/research/${slug}-${Math.floor(rng()*99999)}</link>
<description><![CDATA[${genParagraph()}]]></description>
<dc:creator>${genAuthor()}</dc:creator>
<pubDate>${new Date(2020+Math.floor(rng()*5), Math.floor(rng()*12), 1+Math.floor(rng()*28)).toUTCString()}</pubDate>
<guid>https://deadwater-research.io/research/${slug}-${Math.floor(rng()*99999)}</guid>
<category>${pick(DOMAINS)}</category>
</item>\n`;
  }
  xml += '</channel></rss>';
  return new Response(xml, { headers: dynamicHeaders('application/rss+xml') });
}

// --- GraphQL handler ---
async function handleGraphQL(request) {
  let query = '';
  let variables = {};
  try {
    if (request.method === 'POST') {
      const body = await request.json();
      query = body.query || '';
      variables = body.variables || {};
    } else {
      const url = new URL(request.url);
      query = url.searchParams.get('query') || '';
    }
  } catch(e) { query = ''; }

  seed = query.length * 7 + 42;
  const first = variables.first || 20;
  const after = parseInt(variables.after) || 0;

  // Introspection — return full schema
  if (query.includes('__schema') || query.includes('__type')) {
    return new Response(JSON.stringify(genGraphQLSchema(), null, 2), {
      headers: dynamicHeaders('application/json')
    });
  }

  // Generate data for any query
  const articles = [];
  for (let i = 0; i < first; i++) {
    articles.push(genArticle(after + i));
  }

  const data = {
    data: {
      articles: {
        edges: articles.map((a, i) => ({
          cursor: String(after + i),
          node: a
        })),
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: after > 0,
          startCursor: String(after),
          endCursor: String(after + first),
          totalCount: 9999999
        },
        totalCount: 9999999
      },
      search: {
        results: articles,
        totalHits: 9999999,
        facets: {
          domain: DOMAINS.map(d => ({ value: d, count: Math.floor(rng() * 10000) })),
          year: [2020,2021,2022,2023,2024].map(y => ({ value: y, count: Math.floor(rng() * 5000) }))
        }
      }
    }
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: dynamicHeaders('application/json')
  });
}

function genGraphQLSchema() {
  return {
    data: {
      __schema: {
        queryType: { name: 'Query' },
        mutationType: null,
        types: [
          {
            kind: 'OBJECT', name: 'Query',
            fields: [
              { name: 'articles', args: [
                { name: 'domain', type: { name: 'String' } },
                { name: 'year', type: { name: 'Int' } },
                { name: 'first', type: { name: 'Int' } },
                { name: 'after', type: { name: 'String' } },
                { name: 'query', type: { name: 'String' } },
                { name: 'minCitations', type: { name: 'Int' } },
                { name: 'author', type: { name: 'String' } },
                { name: 'venue', type: { name: 'String' } },
                { name: 'sortBy', type: { name: 'SortField' } },
              ], type: { name: 'ArticleConnection' } },
              { name: 'article', args: [{ name: 'id', type: { name: 'ID!' } }], type: { name: 'Article' } },
              { name: 'paper', args: [{ name: 'id', type: { name: 'ID!' } }, { name: 'format', type: { name: 'ExportFormat' } }], type: { name: 'Paper' } },
              { name: 'author', args: [{ name: 'id', type: { name: 'ID!' } }], type: { name: 'Author' } },
              { name: 'authors', args: [{ name: 'first', type: { name: 'Int' } }, { name: 'institution', type: { name: 'String' } }], type: { name: 'AuthorConnection' } },
              { name: 'search', args: [{ name: 'query', type: { name: 'String!' } }, { name: 'type', type: { name: 'SearchType' } }, { name: 'first', type: { name: 'Int' } }], type: { name: 'SearchResults' } },
              { name: 'dataset', args: [{ name: 'id', type: { name: 'ID!' } }], type: { name: 'Dataset' } },
              { name: 'datasets', args: [{ name: 'first', type: { name: 'Int' } }, { name: 'domain', type: { name: 'String' } }], type: { name: 'DatasetConnection' } },
              { name: 'citations', args: [{ name: 'doi', type: { name: 'String!' } }, { name: 'depth', type: { name: 'Int' } }], type: { name: 'CitationGraph' } },
              { name: 'newsletter', args: [{ name: 'issue', type: { name: 'Int' } }], type: { name: 'Newsletter' } },
              { name: 'newsletters', args: [{ name: 'first', type: { name: 'Int' } }], type: { name: 'NewsletterConnection' } },
            ]
          },
          {
            kind: 'OBJECT', name: 'Article',
            fields: ['id','title','abstract','body','doi','domain','year','citations','keywords','publishedDate','lastModified','language','license'].map(f => ({ name: f }))
          },
          {
            kind: 'OBJECT', name: 'Paper',
            fields: ['id','title','abstract','body','doi','domain','year','citations','venue','pages','volume','issue','supplementaryUrl','codeUrl','bibtex','ris'].map(f => ({ name: f }))
          },
          {
            kind: 'OBJECT', name: 'Author',
            fields: ['id','name','orcid','email','affiliation','domains','hIndex','totalCitations','publicationCount','coauthors','homepage','profileImage'].map(f => ({ name: f }))
          },
          {
            kind: 'OBJECT', name: 'Dataset',
            fields: ['id','name','description','domain','size','samples','features','format','license','downloadUrl','checksum','createdAt','version'].map(f => ({ name: f }))
          },
          {
            kind: 'OBJECT', name: 'Newsletter',
            fields: ['issue','title','date','highlights','labNotes','events','subscriberCount'].map(f => ({ name: f }))
          },
          {
            kind: 'OBJECT', name: 'CitationGraph',
            fields: ['rootDoi','nodes','edges','depth','totalNodes','totalEdges'].map(f => ({ name: f }))
          },
          { kind: 'ENUM', name: 'SortField', enumValues: ['RELEVANCE','DATE','CITATIONS','TITLE','AUTHOR'].map(v => ({ name: v })) },
          { kind: 'ENUM', name: 'SearchType', enumValues: ['ALL','ARTICLES','PAPERS','AUTHORS','DATASETS'].map(v => ({ name: v })) },
          { kind: 'ENUM', name: 'ExportFormat', enumValues: ['JSON','BIBTEX','RIS','CSV','JSONL'].map(v => ({ name: v })) },
        ]
      }
    }
  };
}

// --- Search page handler ---
function genSearchPage(url) {
  const query = url.searchParams.get('q') || '';
  seed = query.length * 31 + 7;
  const results = [];
  for (let i = 0; i < 20; i++) {
    results.push({ title: genTitle(), author: genAuthor(), domain: pick(DOMAINS), doi: genDOI() });
  }
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/">
<title>Search: "${query}" — Deadwater Research</title>
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:24px;margin-bottom:16px}a{color:#cba6f7}.result{border-bottom:1px solid #313244;padding:16px 0}
.result h3{font-size:16px;margin-bottom:4px}.result p{color:#7f849c;font-size:13px}
input{background:#181825;border:1px solid #313244;color:#cdd6f4;padding:10px 16px;border-radius:8px;width:100%;font-size:15px;margin-bottom:24px}
.back{display:inline-block;margin-bottom:16px;font-size:14px;color:#7f849c}
.stats{color:#7f849c;font-size:13px;margin-bottom:16px}
.page-nav{display:flex;gap:8px;margin-top:24px}
.page-nav a{background:#313244;padding:6px 14px;border-radius:6px;font-size:13px}</style>
</head><body>
<a class="back" href="/">← Deadwater Research</a>
<h1>Search Results</h1>
<input type="text" value="${query}" placeholder="Search publications...">
<div class="stats">About 9,999,999 results (0.${Math.floor(rng()*99)} seconds)</div>
${results.map(r => `<div class="result">
<h3><a href="/research/${r.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${r.title}</a></h3>
<p>${r.author} · ${r.domain} · ${r.doi}</p>
<p style="color:#a6adc8;font-size:14px;margin-top:4px">${genParagraph()}</p>
</div>`).join('\n')}
<div class="page-nav">
${Array.from({length:10}, (_,i) => `<a href="/search?q=${encodeURIComponent(query)}&page=${i+1}">${i+1}</a>`).join('\n')}
</div>
</body></html>`;
}

// --- Author profile page handler ---
function genAuthorPage(path) {
  seed = path.split('').reduce((a,c) => a + c.charCodeAt(0), 0) * 17;
  const name = genAuthor();
  const orcid = `0000-000${Math.floor(rng()*9)}-${String(Math.floor(rng()*9000+1000))}-${String(Math.floor(rng()*9000+1000))}`;
  const domains = [pick(DOMAINS), pick(DOMAINS), pick(DOMAINS)];
  const affiliation = pick(['Deadwater Research Institute','ETH Zürich','University of Oxford','Max Planck Institute for Informatics','KTH Royal Institute of Technology','Tsinghua University','MIT CSAIL','Stanford University','University of Cambridge','EPFL']);
  const hIndex = Math.floor(rng()*30+5);
  const totalCitations = Math.floor(rng()*5000+100);
  const pubCount = Math.floor(rng()*50+15);
  const email = name.toLowerCase().replace(/\s+/g,'.') + '@deadwater-research.io';

  const pubs = [];
  for (let i = 0; i < 25; i++) {
    const t = genTitle();
    pubs.push({
      title: t,
      year: 2020 + Math.floor(rng()*5),
      doi: genDOI(),
      arxiv: genArxivId(),
      venue: pick(['NeurIPS','ICML','ICLR','AAAI','CVPR','ACL','KDD','Deadwater Research']),
      citations: Math.floor(rng()*200),
      slug: t.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50) + '-' + Math.floor(rng()*99999),
    });
  }

  const coauthors = Array.from({length:12}, () => {
    const n = genAuthor();
    return { name: n, slug: n.toLowerCase().replace(/\s+/g,'-') + '-' + Math.floor(rng()*9999) };
  });

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><base href="/Deadwater/">
<title>${name} — Deadwater Research</title>
<meta name="description" content="Research profile of ${name}. ${pubCount} publications in ${domains.join(', ')}. h-index: ${hIndex}. Affiliated with ${affiliation}.">
<meta name="citation_author" content="${name}">
<meta name="citation_author_orcid" content="${orcid}">
<meta name="citation_author_institution" content="${affiliation}">
<link rel="alternate" type="application/json" href="/api/v2/authors/${path.split('/').pop()}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "${name}",
  "identifier": "https://orcid.org/${orcid}",
  "email": "${email}",
  "affiliation": {"@type": "Organization", "name": "${affiliation}"},
  "jobTitle": "${pick(['Professor','Associate Professor','Assistant Professor','Senior Researcher','Research Scientist','Postdoctoral Fellow'])}",
  "knowsAbout": ${JSON.stringify(domains)},
  "url": "https://deadwater-research.io${path}",
  "sameAs": [
    "https://orcid.org/${orcid}",
    "https://scholar.google.com/citations?user=${Math.random().toString(36).slice(2,14)}",
    "https://www.semanticscholar.org/author/${Math.floor(rng()*99999999)}",
    "https://dblp.org/pid/${Math.floor(rng()*999)}/${Math.floor(rng()*9999)}"
  ],
  "hasCredential": {
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "PhD",
    "recognizedBy": {"@type": "Organization", "name": "${pick(['MIT','Stanford','Cambridge','Oxford','ETH Zürich','Tsinghua','Berkeley'])}"}
  },
  "worksFor": {"@type": "Organization", "name": "${affiliation}"},
  "interactionStatistic": [
    {"@type": "InteractionCounter", "interactionType": "https://schema.org/Citation", "userInteractionCount": ${totalCitations}},
    {"@type": "InteractionCounter", "interactionType": "https://schema.org/WriteAction", "userInteractionCount": ${pubCount}}
  ]
}
</script>
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}a{color:#cba6f7;text-decoration:none}a:hover{text-decoration:underline}
.meta{color:#7f849c;font-size:14px;margin-bottom:24px;border-bottom:1px solid #313244;padding-bottom:16px}
.stat-row{display:flex;gap:32px;margin-bottom:24px;flex-wrap:wrap}.stat-box{text-align:center}.stat-num{font-size:24px;font-weight:700;color:#cba6f7}.stat-lbl{font-size:12px;color:#7f849c}
h2{font-size:20px;margin:24px 0 12px}.tag{display:inline-block;background:#313244;color:#89b4fa;padding:2px 10px;border-radius:12px;font-size:11px;margin:2px}
.pub{padding:12px 0;border-bottom:1px solid #313244}.pub a{font-size:15px;font-weight:500}.pub p{font-size:13px;color:#7f849c;margin-top:2px}
.back{display:inline-block;margin-bottom:20px;font-size:14px;color:#7f849c}
.coauthors a{display:inline-block;background:#181825;border:1px solid #313244;padding:4px 12px;border-radius:8px;font-size:13px;margin:4px}
.orcid-badge{display:inline-flex;align-items:center;gap:6px;background:#181825;border:1px solid #313244;padding:4px 12px;border-radius:8px;font-size:13px;margin:8px 0}
.ids{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}</style>
</head><body>
<a class="back" href="/">← Deadwater Research</a>
<h1>${name}</h1>
<div class="meta">${affiliation}</div>
<div class="ids">
<a class="orcid-badge" href="https://orcid.org/${orcid}">ORCID: ${orcid}</a>
<a class="orcid-badge" href="https://scholar.google.com/citations?user=${Math.random().toString(36).slice(2,14)}">Google Scholar</a>
<a class="orcid-badge" href="https://www.semanticscholar.org/author/${Math.floor(rng()*99999999)}">Semantic Scholar</a>
<a class="orcid-badge" href="mailto:${email}">${email}</a>
</div>
<div class="stat-row">
<div class="stat-box"><div class="stat-num">${pubCount}</div><div class="stat-lbl">Publications</div></div>
<div class="stat-box"><div class="stat-num">${totalCitations.toLocaleString()}</div><div class="stat-lbl">Citations</div></div>
<div class="stat-box"><div class="stat-num">${hIndex}</div><div class="stat-lbl">h-index</div></div>
<div class="stat-box"><div class="stat-num">${Math.floor(rng()*20+15)}</div><div class="stat-lbl">i10-index</div></div>
<div class="stat-box"><div class="stat-num">${coauthors.length}</div><div class="stat-lbl">Collaborators</div></div>
</div>
<h2>Research Areas</h2>
${domains.map(d => `<span class="tag">${d}</span>`).join(' ')}
<h2>Publications (${pubs.length} of ${pubCount})</h2>
${pubs.map(p => `<div class="pub"><a href="/research/${p.slug}">${p.title}</a><p>${p.venue} ${p.year} · <a href="/doi/${p.doi}">${p.doi}</a> · arXiv:${p.arxiv} · ${p.citations} citations</p></div>`).join('\n')}
<p style="margin-top:16px"><a href="/api/v2/authors/${path.split('/').pop()}?include=publications&format=bibtex">Export all publications as BibTeX →</a></p>
<h2>Collaborators</h2>
<div class="coauthors">
${coauthors.map(c => `<a href="/authors/${c.slug}">${c.name}</a>`).join('\n')}
</div>
<h2>Citation Metrics by Year</h2>
<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px">
<thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #313244">Year</th><th style="text-align:right;padding:6px;border-bottom:1px solid #313244">Publications</th><th style="text-align:right;padding:6px;border-bottom:1px solid #313244">Citations</th></tr></thead>
<tbody>
${[2020,2021,2022,2023,2024,2025].map(y => `<tr><td style="padding:6px;border-bottom:1px solid #1e1e2e">${y}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #1e1e2e">${Math.floor(rng()*10+2)}</td><td style="text-align:right;padding:6px;border-bottom:1px solid #1e1e2e">${Math.floor(rng()*800+50)}</td></tr>`).join('\n')}
</tbody></table>
</body></html>`;
}

// Activate immediately
self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
