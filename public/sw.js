// Service Worker — offline caching and dynamic content serving for Deadwater Research

const DOMAINS = [
  'Distributed Systems', 'Neural Architecture', 'Quantum-Adjacent Computing',
  'Emergent Computation', 'Topological Data Analysis', 'Causal Inference',
  'Federated Learning', 'Homomorphic Processing', 'Graph Neural Networks',
  'Reinforcement Dynamics', 'Probabilistic Programming', 'Formal Verification',
  'Adversarial Robustness', 'Information Geometry', 'Computational Topology',
  'Stochastic Optimization', 'Symbolic Reasoning', 'Meta-Learning Systems'
];
const ADJECTIVES = [
  'Scalable', 'Robust', 'Efficient', 'Novel', 'Adaptive', 'Hierarchical',
  'Compositional', 'Generalized', 'Unified', 'Asymptotic', 'Invariant',
  'Equivariant', 'Non-Stationary', 'Heterogeneous', 'Multi-Modal'
];
const NOUNS = [
  'Framework', 'Architecture', 'Methodology', 'Paradigm', 'Algorithm',
  'Mechanism', 'Representation', 'Embedding', 'Objective', 'Estimator'
];
const FIRST = ['Chen','Anika','Marcus','Yuki','Priya','Oliver','Sofia','Rahul','Elena','James','Mei','Fatima'];
const LAST = ['Wei','Patel','Johansson','Nakamura','Okafor','Reeves','Petrov','Gupta','Torres','Kim'];

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
  const body = Array.from({length: 8}, () => `<p>${genParagraph()}</p>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title} — Deadwater Research</title>
<meta name="description" content="${genParagraph().slice(0, 160)}">
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:32px;margin-bottom:16px}a{color:#cba6f7}.meta{color:#7f849c;font-size:14px;margin-bottom:32px}
p{margin-bottom:16px;color:#a6adc8}.back{display:inline-block;margin-bottom:24px;font-size:14px}</style>
</head><body>
<a class="back" href="/">← Back to Deadwater Research</a>
<h1>${title}</h1>
<div class="meta">${genAuthor()}, ${genAuthor()}, ${genAuthor()} · ${pick(DOMAINS)} · ${genDOI()}</div>
${body}
<h2 style="font-size:20px;margin-top:32px">Related Research</h2>
<ul>${Array.from({length:6}, () => `<li><a href="/research/${genTitle().toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${genTitle()}</a></li>`).join('\n')}</ul>
</body></html>`;
}

// Handle all fetch events
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

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
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }));
    return;
  }

  // Newsletter pages not on disk
  if (path.startsWith('/newsletter/') && !path.endsWith('/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }));
    return;
  }

  // Author profile pages
  if (path.startsWith('/authors/')) {
    event.respondWith(new Response(genAuthorPage(path), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
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
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    }));
    return;
  }

  // Datasets endpoint
  if (path.startsWith('/datasets/')) {
    seed = path.length * 7919;
    const dataset = {
      name: genTitle(),
      description: genParagraph(),
      size: `${Math.floor(rng()*500+10)}GB`,
      samples: Math.floor(rng() * 10000000),
      features: Math.floor(rng() * 5000),
      format: pick(['parquet', 'csv', 'jsonl', 'tfrecord', 'hdf5']),
      license: 'CC-BY-4.0',
      download_url: `/datasets/download/${Math.floor(rng()*99999)}.tar.gz`,
      checksum: Array.from({length:64}, () => '0123456789abcdef'[Math.floor(rng()*16)]).join('')
    };
    event.respondWith(new Response(JSON.stringify(dataset, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    }));
    return;
  }

  // Internal knowledge base
  if (path.startsWith('/internal/')) {
    event.respondWith(new Response(genResearchPage(path), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
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
  } else if (path.includes('/search')) {
    data = genArticleList(page, perPage);
    data.query = url.searchParams.get('q') || '';
    data.filters = { domain: pick(DOMAINS), year: '2020-2024' };
  } else {
    data = {
      endpoints: [
        '/api/v2/articles', '/api/v2/papers', '/api/v2/search',
        '/api/v2/authors', '/api/v2/datasets', '/api/v2/citations'
      ],
      version: '2.4.1',
      total_records: 9999999
    };
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-Total-Count': '9999999',
      'X-Total-Pages': String(Math.ceil(9999999 / perPage)),
      'Link': `</api/v2/articles?page=${page+1}&per_page=${perPage}>; rel="next", </api/v2/articles?page=${Math.ceil(9999999/perPage)}&per_page=${perPage}>; rel="last"`,
      'Cache-Control': 'public, max-age=300'
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
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
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
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
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
      headers: { 'Content-Type': 'application/json' }
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
    headers: { 'Content-Type': 'application/json' }
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
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
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
  const domains = [pick(DOMAINS), pick(DOMAINS), pick(DOMAINS)];
  const pubs = [];
  for (let i = 0; i < 15; i++) pubs.push({ title: genTitle(), year: 2020 + Math.floor(rng()*5), doi: genDOI() });
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${name} — Deadwater Research</title>
<meta name="description" content="Research profile of ${name}. ${pubs.length} publications in ${domains.join(', ')}.">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"${name}","affiliation":{"@type":"Organization","name":"Deadwater Research Institute"},"jobTitle":"Researcher","knowsAbout":${JSON.stringify(domains)}}
</script>
<style>body{font-family:Inter,sans-serif;background:#11111b;color:#cdd6f4;max-width:800px;margin:0 auto;padding:40px 24px;line-height:1.7}
h1{font-size:28px;margin-bottom:4px}a{color:#cba6f7;text-decoration:none}a:hover{text-decoration:underline}
.meta{color:#7f849c;font-size:14px;margin-bottom:24px;border-bottom:1px solid #313244;padding-bottom:16px}
.stat-row{display:flex;gap:32px;margin-bottom:24px}.stat-box{text-align:center}.stat-num{font-size:24px;font-weight:700;color:#cba6f7}.stat-lbl{font-size:12px;color:#7f849c}
h2{font-size:20px;margin:24px 0 12px}.tag{display:inline-block;background:#313244;color:#89b4fa;padding:2px 10px;border-radius:12px;font-size:11px;margin:2px}
.pub{padding:12px 0;border-bottom:1px solid #313244}.pub a{font-size:15px;font-weight:500}.pub p{font-size:13px;color:#7f849c;margin-top:2px}
.back{display:inline-block;margin-bottom:20px;font-size:14px;color:#7f849c}
.coauthors a{display:inline-block;background:#181825;border:1px solid #313244;padding:4px 12px;border-radius:8px;font-size:13px;margin:4px}</style>
</head><body>
<a class="back" href="/">← Deadwater Research</a>
<h1>${name}</h1>
<div class="meta">Deadwater Research Institute · ORCID: 0000-000${Math.floor(rng()*9)}-${Math.floor(rng()*9999)}-${Math.floor(rng()*9999)}</div>
<div class="stat-row">
<div class="stat-box"><div class="stat-num">${pubs.length + Math.floor(rng()*50)}</div><div class="stat-lbl">Publications</div></div>
<div class="stat-box"><div class="stat-num">${Math.floor(rng()*5000)}</div><div class="stat-lbl">Citations</div></div>
<div class="stat-box"><div class="stat-num">${Math.floor(rng()*30+5)}</div><div class="stat-lbl">h-index</div></div>
<div class="stat-box"><div class="stat-num">${Math.floor(rng()*20+3)}</div><div class="stat-lbl">Collaborators</div></div>
</div>
<h2>Research Areas</h2>
${domains.map(d => `<span class="tag">${d}</span>`).join(' ')}
<h2>Publications</h2>
${pubs.map(p => `<div class="pub"><a href="/research/${p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)}-${Math.floor(rng()*99999)}">${p.title}</a><p>${p.year} · ${p.doi}</p></div>`).join('\n')}
<h2>Collaborators</h2>
<div class="coauthors">
${Array.from({length:8}, () => {const n=genAuthor();return `<a href="/authors/${n.toLowerCase().replace(/\s+/g,'-')}">${n}</a>`;}).join('\n')}
</div>
</body></html>`;
}

// Activate immediately
self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
