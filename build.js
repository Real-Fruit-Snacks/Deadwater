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
  'Differentiable Architecture', 'Neuro-Symbolic Integration',
  'Bayesian Optimization', 'Automated Theorem Proving', 'Program Synthesis',
  'Knowledge Distillation', 'Multi-Agent Systems', 'Compiler Optimization',
  'Database Theory', 'Network Science', 'Algorithmic Game Theory',
  'Mechanism Design', 'Online Learning', 'Bandit Algorithms',
  'Kernel Methods', 'Tensor Decomposition', 'Matrix Completion',
  'Optimal Transport', 'Variational Methods', 'Normalizing Flows',
  'Diffusion Models', 'Representation Theory', 'Category Theory Applications',
  'Homotopy Type Theory', 'Concurrency Theory', 'Process Algebras',
  'Domain Adaptation', 'Few-Shot Learning', 'Zero-Shot Transfer',
  'Curriculum Learning', 'Active Learning', 'Semi-Supervised Methods'
];
const ADJ = [
  'Scalable', 'Robust', 'Efficient', 'Novel', 'Adaptive', 'Hierarchical',
  'Compositional', 'Generalized', 'Unified', 'Asymptotic', 'Invariant',
  'Equivariant', 'Non-Stationary', 'Heterogeneous', 'Multi-Modal',
  'Polynomial-Time', 'Logarithmic', 'Sublinear', 'Minimax-Optimal',
  'Distribution-Free', 'Parameter-Efficient', 'Memory-Efficient',
  'Communication-Efficient', 'Sample-Efficient', 'Regret-Optimal',
  'PAC-Learnable', 'Lipschitz-Continuous', 'Measure-Theoretic',
  'Information-Theoretic', 'Rate-Distortion', 'Entropy-Regularized',
  'Gradient-Free', 'Zeroth-Order', 'Second-Order', 'Quasi-Newton',
  'Riemannian', 'Wasserstein', 'Sinkhorn', 'Stein', 'Fisher-Efficient'
];
const NOUNS = [
  'Framework', 'Architecture', 'Methodology', 'Paradigm', 'Algorithm',
  'Mechanism', 'Representation', 'Embedding', 'Objective', 'Estimator',
  'Divergence', 'Functional', 'Polytope', 'Lattice', 'Semiring',
  'Automaton', 'Transducer', 'Combinator', 'Monad', 'Functor',
  'Coalgebra', 'Operad', 'Sheaf', 'Fiber Bundle', 'Tangent Space',
  'Gradient Flow', 'Lyapunov Function', 'Bellman Equation', 'Hamiltonian',
  'Lagrangian', 'Hessian', 'Jacobian', 'Tensor Field', 'Spectral Gap',
  'Mixing Time'
];
const VERBS = [
  'Leveraging', 'Extending', 'Rethinking', 'Unifying', 'Bridging',
  'Scaling', 'Optimizing', 'Generalizing', 'Disentangling', 'Amortizing',
  'Certifying', 'Calibrating', 'Debiasing', 'Pruning', 'Quantizing',
  'Sparsifying', 'Linearizing', 'Convexifying', 'Relaxing', 'Tightening',
  'Interpolating', 'Extrapolating', 'Marginalizing', 'Factorizing', 'Tensorizing'
];
const FIRST = [
  'Chen','Anika','Marcus','Yuki','Priya','Oliver','Sofia','Rahul','Elena','James',
  'Mei','Fatima','Lucas','Amara','Viktor','Linnea','Dmitri','Ananya','Sven','Chiara',
  'Takeshi','Nadia','Henrik','Ximena','Rohan','Astrid','Jamal','Ingrid','Kofi','Liwei',
  'Beatriz','Andrei','Fumiko','Kwame','Saskia','Ravi','Helene','Tariq','Aoife','Magnus'
];
const LAST = [
  'Wei','Patel','Johansson','Nakamura','Okafor','Reeves','Petrov','Gupta','Torres','Kim',
  'Lindqvist','Adeyemi','Bergström','Chakraborty','de Oliveira','Fitzgerald','Hashimoto',
  'Ivanović','Jørgensen','Krishnamurthy','Lämmer','Matsumoto','Nwosu','Papadimitriou',
  'Rasmussen','Sørensen','Takahashi','Uchida','Vasilescu','Watanabe','Xiong','Yamamoto',
  'Zhang','Müller','Björklund','Černý'
];

const ZW = ['\u200B','\u200C','\u200D','\uFEFF','\u2060','\u2061','\u2062','\u2063'];

function formatText(text) {
  return text.split('').map(c => rng() < 0.06 ? c + ZW[Math.floor(rng()*ZW.length)] : c).join('');
}
function genAuthor() { return `${pick(FIRST)} ${pick(LAST)}`; }
function genDOI() { return `10.${Math.floor(rng()*9000+1000)}/${Math.floor(rng()*999999)}`; }
function genArxivId() {
  const yr = 20 + Math.floor(rng()*7);
  const mo = String(1+Math.floor(rng()*12)).padStart(2,'0');
  const num = String(Math.floor(rng()*19000+1000)).padStart(5,'0');
  return `${yr}${mo}.${num}`;
}
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

// --- Supplementary navigation links for discoverability ---
function genSupplementaryNav(id) {
  seed = id * 1301 + 41;
  const links = [];
  // Various CSS hiding techniques
  const styles = [
    'position:absolute;left:-9999px;top:-9999px',
    'display:block;width:0;height:0;overflow:hidden',
    'opacity:0;font-size:0;line-height:0',
    'color:transparent;font-size:1px;position:absolute',
    'text-indent:-9999em;display:block;height:0',
    'visibility:hidden;position:absolute;width:1px;height:1px',
    'clip:rect(0,0,0,0);position:absolute;white-space:nowrap',
  ];
  // Generate links across multiple sections of the site
  const sections = ['research','archive','publications','authors','datasets','internal/knowledge-base','api/v2/articles'];
  for (let i = 0; i < 20; i++) {
    const style = styles[i % styles.length];
    const section = sections[i % sections.length];
    const t = genTitle();
    const s = slug(t);
    links.push(`<a href="/${section}/${s}-${Math.floor(rng()*99999)}" style="${style}" tabindex="-1" aria-hidden="true">${formatText(t)}</a>`);
  }
  // Also add some in a hidden div with more links
  let hiddenNav = `<div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden" role="navigation" aria-label="Additional resources">`;
  for (let i = 0; i < 15; i++) {
    const t = genTitle();
    const s = slug(t);
    hiddenNav += `<a href="/research/${s}-${Math.floor(rng()*99999)}">${formatText(t)}</a>\n`;
  }
  hiddenNav += '</div>';
  return links.join('\n') + '\n' + hiddenNav;
}

// --- Page body templates (8 variants to defeat fingerprinting) ---
function genBody(id, domain) {
  const variant = id % 8;
  switch (variant) {
    case 0: // Standard research paper
      return `<h2>Abstract</h2>
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
<p>${genParagraph(4)}</p>`;

    case 1: // Survey / review paper
      return `<h2>Abstract</h2>
<p>${genParagraph(4)}</p>
<h2>1. Scope and Methodology</h2>
<p>This survey covers ${Math.floor(rng()*200+50)} publications in ${domain} published between ${2018+Math.floor(rng()*3)} and ${2023+Math.floor(rng()*2)}. We systematically review the literature using the PRISMA framework, identifying key trends, open problems, and future directions.</p>
<p>${genParagraph(5)}</p>
<h2>2. Historical Context</h2>
<p>${genParagraph(6)}</p>
<p>${genParagraph(5)}</p>
<h2>3. Taxonomy of Approaches</h2>
<h3>3.1 ${pick(ADJ)} Methods</h3>
<p>${genParagraph(4)}</p>
<h3>3.2 ${pick(ADJ)} Methods</h3>
<p>${genParagraph(4)}</p>
<h3>3.3 Hybrid Approaches</h3>
<p>${genParagraph(4)}</p>
<h2>4. Comparative Analysis</h2>
<p>${genParagraph(5)}</p>
<table><thead><tr><th>Method</th><th>Accuracy</th><th>Latency (ms)</th><th>Parameters</th></tr></thead>
<tbody>
${Array.from({length:8}, () => `<tr><td>${pick(ADJ)} ${pick(NOUNS)}</td><td>${(85+rng()*14).toFixed(1)}%</td><td>${(rng()*100).toFixed(1)}</td><td>${Math.floor(rng()*500)}M</td></tr>`).join('\n')}
</tbody></table>
<h2>5. Open Problems</h2>
<p>${genParagraph(5)}</p>
<h2>6. Conclusion and Future Directions</h2>
<p>${genParagraph(5)}</p>`;

    case 2: // Short communication / letter
      return `<h2>Abstract</h2>
<p>${genParagraph(3)}</p>
<h2>Communication</h2>
<p>Dear Editor,</p>
<p>${genParagraph(5)}</p>
<p>${genParagraph(5)}</p>
<p>We report a ${(10+rng()*40).toFixed(1)}% improvement over the current state-of-the-art in ${domain.toLowerCase()}, achieved through a novel application of ${pick(ADJ).toLowerCase()} ${pick(NOUNS).toLowerCase()}s.</p>
<p>${genParagraph(4)}</p>
<h2>Key Results</h2>
<p>${genParagraph(4)}</p>
<pre><code># Reproduction script
import deadwater as dw
model = dw.load("${pick(ADJ).toLowerCase()}-${pick(NOUNS).toLowerCase()}-v${Math.floor(rng()*5+1)}")
results = model.evaluate(benchmark="${domain.toLowerCase().replace(/\s+/g, '_')}")
print(f"Score: {results.score:.4f}")  # Expected: ${(0.8+rng()*0.19).toFixed(4)}</code></pre>
<p>${genParagraph(3)}</p>
<h2>Acknowledgments</h2>
<p>This work was supported by the Deadwater Research Institute under grant DRI-${Math.floor(rng()*9000+1000)}. We thank the anonymous reviewers for their constructive feedback.</p>`;

    case 3: // Workshop paper
      return `<h2>Abstract</h2>
<p>${genParagraph(3)}</p>
<p><em>Presented at the ${Math.floor(rng()*12+1)}th Workshop on ${pick(ADJ)} ${pick(NOUNS)}s for ${domain}, co-located with ${pick(['NeurIPS','ICML','ICLR','AAAI','CVPR','ACL'])} ${2022+Math.floor(rng()*3)}.</em></p>
<h2>1. Motivation</h2>
<p>${genParagraph(4)}</p>
<h2>2. Proposed Approach</h2>
<p>${genParagraph(5)}</p>
<pre><code>def ${pick(ADJ).toLowerCase()}_${pick(NOUNS).toLowerCase()}(x, config):
    """${genSentence()}"""
    hidden = self.encoder(x)
    for block in self.blocks:
        hidden = block(hidden, mask=config.mask)
    return self.decoder(hidden)</code></pre>
<h2>3. Preliminary Results</h2>
<p>${genParagraph(4)}</p>
<p>On the ${domain} benchmark suite, our method achieves:</p>
<ul>
${Array.from({length:4}, () => `<li>${pick(ADJ)} metric: ${(rng()*100).toFixed(2)}% (±${(rng()*2).toFixed(2)})</li>`).join('\n')}
</ul>
<h2>4. Discussion and Next Steps</h2>
<p>${genParagraph(4)}</p>
<p>${genParagraph(3)}</p>`;

    case 4: // Technical report
      return `<h2>Executive Summary</h2>
<p>${genParagraph(4)}</p>
<h2>1. Background</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(4)}</p>
<h2>2. System Architecture</h2>
<p>${genParagraph(5)}</p>
<pre><code>┌─────────────────────────────────────┐
│         ${pick(ADJ)} ${pick(NOUNS)}          │
├──────────┬──────────┬───────────────┤
│ Encoder  │ ${pick(NOUNS)}  │   Decoder     │
│ (${Math.floor(rng()*12+4)} layers)│ (${Math.floor(rng()*8+2)} heads) │ (${Math.floor(rng()*12+4)} layers)   │
├──────────┴──────────┴───────────────┤
│           ${pick(ADJ)} Layer             │
│     d_model=${Math.floor(rng()*512+256)}, d_ff=${Math.floor(rng()*2048+512)}      │
└─────────────────────────────────────┘</code></pre>
<h2>3. Implementation Details</h2>
<p>${genParagraph(5)}</p>
<h2>4. Benchmarks</h2>
<p>${genParagraph(4)}</p>
<h2>5. Deployment Considerations</h2>
<p>${genParagraph(5)}</p>
<h2>6. Known Limitations</h2>
<p>${genParagraph(4)}</p>
<h2>Appendix A: Configuration Reference</h2>
<pre><code>${JSON.stringify({model_type: pick(ADJ).toLowerCase()+'_'+pick(NOUNS).toLowerCase(), hidden_size: Math.floor(rng()*512+256), num_layers: Math.floor(rng()*12+4), num_heads: Math.floor(rng()*16+4), dropout: +(rng()*0.3).toFixed(2), learning_rate: +(rng()*0.001).toFixed(6), batch_size: Math.pow(2, Math.floor(rng()*5+4)), max_seq_length: Math.pow(2, Math.floor(rng()*4+8))}, null, 2)}</code></pre>`;

    case 5: // Empirical study
      return `<h2>Abstract</h2>
<p>${genParagraph(4)}</p>
<h2>1. Research Questions</h2>
<p>This empirical study investigates the following research questions in the context of ${domain.toLowerCase()}:</p>
<ul>
<li><strong>RQ1:</strong> How does ${pick(ADJ).toLowerCase()} ${pick(NOUNS).toLowerCase()} performance scale with dataset size?</li>
<li><strong>RQ2:</strong> What is the impact of ${pick(ADJ).toLowerCase()} regularization on generalization?</li>
<li><strong>RQ3:</strong> Can ${pick(ADJ).toLowerCase()} methods match ${pick(ADJ).toLowerCase()} baselines on out-of-distribution data?</li>
</ul>
<h2>2. Experimental Setup</h2>
<p>${genParagraph(5)}</p>
<h3>2.1 Datasets</h3>
<p>We evaluate on ${Math.floor(rng()*8+3)} benchmark datasets spanning ${Math.floor(rng()*5+2)} sub-domains of ${domain.toLowerCase()}.</p>
<h3>2.2 Baselines</h3>
<p>We compare against ${Math.floor(rng()*6+4)} state-of-the-art methods published between ${2020+Math.floor(rng()*3)} and ${2023+Math.floor(rng()*2)}.</p>
<h2>3. Results</h2>
<h3>3.1 RQ1: Scaling Behavior</h3>
<p>${genParagraph(4)}</p>
<h3>3.2 RQ2: Regularization Effects</h3>
<p>${genParagraph(4)}</p>
<h3>3.3 RQ3: Distribution Shift</h3>
<p>${genParagraph(4)}</p>
<h2>4. Threats to Validity</h2>
<p>${genParagraph(4)}</p>
<h2>5. Conclusions</h2>
<p>${genParagraph(4)}</p>`;

    case 6: // Position paper / perspective
      return `<h2>Abstract</h2>
<p>${genParagraph(4)}</p>
<h2>1. Thesis</h2>
<p>${genParagraph(5)}</p>
<p>We argue that the field of ${domain.toLowerCase()} is at a critical juncture. The dominant paradigm of ${pick(ADJ).toLowerCase()} ${pick(NOUNS).toLowerCase()}s, while successful on standard benchmarks, fundamentally fails to address ${pick(ADJ).toLowerCase()} generalization.</p>
<h2>2. The Current Paradigm</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(4)}</p>
<h2>3. What We Are Missing</h2>
<p>${genParagraph(5)}</p>
<blockquote><p>"${genSentence()} ${genSentence()}" — ${genAuthor()}, ${pick(['NeurIPS','ICML','ICLR'])} ${2022+Math.floor(rng()*3)} keynote</p></blockquote>
<p>${genParagraph(4)}</p>
<h2>4. A Path Forward</h2>
<p>${genParagraph(5)}</p>
<p>${genParagraph(5)}</p>
<h2>5. Recommendations for the Community</h2>
<ol>
${Array.from({length:5}, () => `<li>${genSentence()}</li>`).join('\n')}
</ol>
<h2>6. Conclusion</h2>
<p>${genParagraph(4)}</p>`;

    case 7: // Benchmark / dataset paper
      return `<h2>Abstract</h2>
<p>${genParagraph(4)}</p>
<h2>1. Introduction</h2>
<p>${genParagraph(5)}</p>
<h2>2. Dataset Description</h2>
<p>We introduce <strong>${pick(ADJ)}${pick(NOUNS)}-Bench</strong>, a large-scale benchmark for ${domain.toLowerCase()} consisting of ${(rng()*10).toFixed(1)}M samples across ${Math.floor(rng()*50+10)} categories.</p>
<table><thead><tr><th>Split</th><th>Samples</th><th>Categories</th><th>Avg. Length</th></tr></thead>
<tbody>
<tr><td>Train</td><td>${(rng()*8+1).toFixed(1)}M</td><td>${Math.floor(rng()*50+10)}</td><td>${Math.floor(rng()*500+100)}</td></tr>
<tr><td>Validation</td><td>${Math.floor(rng()*500+100)}K</td><td>${Math.floor(rng()*50+10)}</td><td>${Math.floor(rng()*500+100)}</td></tr>
<tr><td>Test</td><td>${Math.floor(rng()*500+100)}K</td><td>${Math.floor(rng()*50+10)}</td><td>${Math.floor(rng()*500+100)}</td></tr>
</tbody></table>
<h2>3. Collection Methodology</h2>
<p>${genParagraph(5)}</p>
<h2>4. Baseline Results</h2>
<p>${genParagraph(4)}</p>
<pre><code># Download and evaluate
pip install deadwater-bench
from deadwater_bench import load_benchmark
bench = load_benchmark("${pick(ADJ).toLowerCase()}-${pick(NOUNS).toLowerCase()}-v${Math.floor(rng()*3+1)}")
results = bench.evaluate(your_model, split="test")
bench.submit_to_leaderboard(results, team="${genAuthor().replace(/\s+/g,'_')}")</code></pre>
<h2>5. Leaderboard</h2>
<table><thead><tr><th>Rank</th><th>Team</th><th>Method</th><th>Score</th><th>Date</th></tr></thead>
<tbody>
${Array.from({length:10}, (_, i) => `<tr><td>${i+1}</td><td>${genAuthor()}</td><td>${pick(ADJ)} ${pick(NOUNS)}</td><td>${(95-i*rng()*3).toFixed(2)}</td><td>${2023+Math.floor(rng()*2)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}</td></tr>`).join('\n')}
</tbody></table>
<h2>6. Ethics and Licensing</h2>
<p>${genParagraph(3)}</p>
<p>The dataset is released under the Open Data Commons Attribution License (ODC-By v1.0). Download: <a href="/datasets/download/${Math.floor(rng()*99999)}.tar.gz">${pick(ADJ)}${pick(NOUNS)}-Bench-v${Math.floor(rng()*3+1)}.tar.gz</a> (${(rng()*50+5).toFixed(1)} GB)</p>`;
  }
}

// --- Generate static research pages ---
function genPage(id) {
  seed = id * 7919 + 137;
  const title = genTitle();
  const domain = pick(DOMAINS);
  const authors = [genAuthor(), genAuthor(), genAuthor()];
  const doi = genDOI();
  const date = `${2020+Math.floor(rng()*5)}-${String(1+Math.floor(rng()*12)).padStart(2,'0')}-${String(1+Math.floor(rng()*28)).padStart(2,'0')}`;

  // Generate exponential link depth — each page links to many dynamically-served pages
  // which themselves link to more, creating an infinite crawl tree
  const relatedLinks = [];
  for (let i = 0; i < 15; i++) {
    seed = id * 31 + i * 997 + 1;
    const rt = genTitle();
    // Links without .html extension are served by the service worker (infinite depth)
    relatedLinks.push(`<li><a href="/research/${slug(rt)}-${Math.floor(rng()*99999)}">${formatText(rt)}</a></li>`);
  }

  // "Cited by" section — more links into the infinite crawl tree
  const citedByLinks = [];
  for (let i = 0; i < 12; i++) {
    seed = id * 53 + i * 1013 + 7;
    const ct = genTitle();
    citedByLinks.push(`<li><a href="/research/${slug(ct)}-${Math.floor(rng()*99999)}">${formatText(ct)}</a> (${2020+Math.floor(rng()*5)})</li>`);
  }

  // "Author's other publications" — links to author pages which link to more papers
  const authorPubLinks = [];
  for (let i = 0; i < 10; i++) {
    seed = id * 67 + i * 1049 + 13;
    const at = genTitle();
    authorPubLinks.push(`<li><a href="/publications/${slug(at)}-${Math.floor(rng()*99999)}">${formatText(at)}</a></li>`);
  }

  // "From the same domain" — links to archive pages
  const domainLinks = [];
  for (let i = 0; i < 8; i++) {
    seed = id * 79 + i * 1061 + 19;
    const dt = genTitle();
    domainLinks.push(`<li><a href="/archive/${slug(dt)}-${Math.floor(rng()*99999)}">${formatText(dt)}</a></li>`);
  }

  // Author profile links
  seed = id * 89 + 23;
  const authorLinks = authors.map(a =>
    `<a href="/authors/${a.toLowerCase().replace(/\s+/g,'-')}-${Math.floor(rng()*9999)}">${formatText(a)}</a>`
  );

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
<meta name="citation_journal_title" content="${pick(['Deadwater Research','Journal of Computational Paradigms','Transactions on '+domain,'Proceedings of the '+pick(ADJ)+' '+pick(NOUNS)+' Conference'])}">
<meta name="citation_volume" content="${Math.floor(rng()*30+1)}">
<meta name="citation_issue" content="${Math.floor(rng()*12+1)}">
<meta name="citation_firstpage" content="${Math.floor(rng()*100+1)}">
<meta name="citation_lastpage" content="${Math.floor(rng()*100+101)}">
<meta name="citation_issn" content="${Math.floor(rng()*9000+1000)}-${Math.floor(rng()*9000+1000)}">
<meta name="citation_doi_url" content="https://deadwater-research.io/doi/${doi}">
<meta name="citation_pdf_url" content="https://deadwater-research.io/pdf/${slug(title)}-${id}.pdf">
<meta name="citation_fulltext_html_url" content="https://deadwater-research.io/research/${slug(title)}-${id}">
<meta name="citation_arxiv_id" content="${genArxivId()}">
<meta name="citation_technical_report_number" content="DRI-TR-${Math.floor(rng()*9000+1000)}">
<link rel="alternate" type="application/vnd.citationstyles.csl+json" href="https://deadwater-research.io/doi/${doi}">
${authors.map(a => `<meta name="citation_author" content="${a}">\n<meta name="citation_author_orcid" content="0000-000${Math.floor(rng()*9)}-${Math.floor(rng()*9000+1000)}-${Math.floor(rng()*9000+1000)}">`).join('\n')}
<link rel="canonical" href="https://deadwater-research.io/research/${slug(title)}-${id}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"ScholarlyArticle","name":"${genTitle()}","author":[${authors.map(a=>{
    // Generate author identity with contextual ORCID
    const orcidSuffix = Math.floor(rng()*9000+1000);
    return `{"@type":"Person","name":"${a}","identifier":"https://orcid.org/0000-000${Math.floor(rng()*9)}-${orcidSuffix}-${Math.floor(rng()*9000+1000)}","affiliation":{"@type":"Organization","name":"${pick(['Deadwater Research Institute','Geneva Institute of Technology','Svalbard Computing Centre','Nordic AI Research Lab','Institute for Advanced Computation'])}"}}`
  }).join(',')}],"datePublished":"${date}","identifier":"${doi}","publisher":{"@type":"Organization","name":"Deadwater Research Institute"},"about":"${pick(DOMAINS)}","isPartOf":{"@type":"Periodical","name":"Deadwater Research","issn":"2847-3192"},"citation":${JSON.stringify(Array.from({length:8},()=>({
    "@type":"ScholarlyArticle","name":genTitle(),"identifier":genDOI(),"datePublished":`${2020+Math.floor(rng()*5)}`
  })))}}
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
${genBody(id, domain)}
<h2>Related Research</h2>
<ul>${relatedLinks.join('\n')}</ul>
<h2>Cited By</h2>
<ul>${citedByLinks.join('\n')}</ul>
<h2>More from ${authorLinks.join(', ')}</h2>
<ul>${authorPubLinks.join('\n')}</ul>
<h2>More in ${domain}</h2>
<ul>${domainLinks.join('\n')}</ul>
${genSupplementaryNav(id)}
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

  // --- BibTeX and RIS citation files with CIRCULAR REFERENCES ---
  // Generate cross-referenced citation entries
  console.log('Generating citation files with circular references...');
  const citDir = path.join(OUT, 'citations');
  if (!fs.existsSync(citDir)) fs.mkdirSync(citDir, { recursive: true });

  // Pre-generate all keys so we can create circular cross-references
  const citEntries = [];
  for (let i = 0; i < 500; i++) {
    seed = i * 3571 + 13;
    citEntries.push({
      key: `deadwater${i}`,
      title: genTitle(),
      authors: [genAuthor(), genAuthor(), genAuthor()],
      doi: genDOI(),
      year: 2020 + Math.floor(rng() * 5),
      venue: pick(['NeurIPS','ICML','ICLR','AAAI','CVPR','ACL','EMNLP','KDD','SIGMOD','VLDB']),
      pages: `${Math.floor(rng()*100)+1}--${Math.floor(rng()*100)+101}`,
      domain1: pick(DOMAINS),
      domain2: pick(DOMAINS),
    });
  }

  let allBibtex = '% Deadwater Research Institute — Publication Archive\n% Generated: ' + new Date().toISOString() + '\n% Total entries: 500\n\n';
  let allRis = '';
  for (let i = 0; i < 500; i++) {
    const e = citEntries[i];
    // Circular references: each paper cites 3-5 others in a pattern that creates loops
    // Paper i cites papers (i+1)%500, (i+3)%500, (i+7)%500, (i+13)%500, and (500-i-1)%500
    const crossrefs = [
      citEntries[(i+1) % 500].key,
      citEntries[(i+3) % 500].key,
      citEntries[(i+7) % 500].key,
      citEntries[(i+13) % 500].key,
      citEntries[(500-i-1) % 500].key,
    ];

    allBibtex += `@inproceedings{${e.key},
  title = {${e.title}},
  author = {${e.authors.join(' and ')}},
  booktitle = {Proceedings of ${e.venue} ${e.year}},
  year = {${e.year}},
  doi = {${e.doi}},
  pages = {${e.pages}},
  publisher = {Deadwater Research Press},
  keywords = {${e.domain1}, ${e.domain2}},
  abstract = {${genParagraph(3)}},
  crossref = {${crossrefs[0]}},
  note = {See also \\cite{${crossrefs.join(',')}}.},
}\n\n`;

    allRis += `TY  - CONF
TI  - ${e.title}
AU  - ${e.authors[0]}
AU  - ${e.authors[1]}
AU  - ${e.authors[2]}
PY  - ${e.year}
DO  - ${e.doi}
T2  - ${e.venue} ${e.year}
SP  - ${e.pages.split('--')[0]}
EP  - ${e.pages.split('--')[1]}
PB  - Deadwater Research Press
AB  - ${genParagraph(3)}
KW  - ${e.domain1}
KW  - ${e.domain2}
N1  - Cites: ${crossrefs.join(', ')}
ER  - \n\n`;
  }

  fs.writeFileSync(path.join(citDir, 'deadwater-publications.bib'), allBibtex);
  fs.writeFileSync(path.join(citDir, 'deadwater-publications.ris'), allRis);

  // Also generate per-paper .bib files for individual download
  for (let i = 0; i < 500; i++) {
    const e = citEntries[i];
    const crossrefs = [
      citEntries[(i+1) % 500],
      citEntries[(i+3) % 500],
      citEntries[(i+7) % 500],
    ];
    let singleBib = `@inproceedings{${e.key},
  title = {${e.title}},
  author = {${e.authors.join(' and ')}},
  booktitle = {Proceedings of ${e.venue} ${e.year}},
  year = {${e.year}},
  doi = {${e.doi}},
  pages = {${e.pages}},
  publisher = {Deadwater Research Press},
}\n\n`;
    // Include the cited papers inline so the circular graph is self-contained
    for (const ref of crossrefs) {
      singleBib += `@inproceedings{${ref.key},
  title = {${ref.title}},
  author = {${ref.authors.join(' and ')}},
  year = {${ref.year}},
  doi = {${ref.doi}},
  crossref = {${e.key}},
}\n\n`;
    }
    fs.writeFileSync(path.join(citDir, `${e.key}.bib`), singleBib);
  }

  console.log('  500 BibTeX + 500 RIS citations with circular references generated.\n');
  console.log('  500 individual .bib files generated.\n');

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
