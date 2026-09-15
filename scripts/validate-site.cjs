const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
}
walk(root);
let schemas = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    JSON.parse(match[1]); schemas++;
  }
  if (!html.includes('http-equiv="refresh"')) {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, file + ': h1');
    assert.ok(html.includes('/analytics.js'), file + ': privacy-aware analytics');
    assert.ok(html.includes('aria-expanded="false"'), file + ': menu state');
    assert.ok(html.includes('/privacidade/'), file + ': privacy link');
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    let value = match[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(value)) continue;
    value = value.split(/[?#]/)[0];
    if (!value) continue;
    const target = value.startsWith('/') ? path.join(root, value) : path.resolve(path.dirname(file), value);
    assert.ok(fs.existsSync(target), file + ': missing ' + value);
  }
  assert.ok(!html.includes('googletagmanager.com/gtag/js'), file + ': unconditional Analytics');
  assert.ok(!html.includes('certificação ANVISA'), file + ': unsupported certification claim');
}
console.log(`${files.length} pages and ${schemas} JSON-LD blocks validated; local references resolved.`);
