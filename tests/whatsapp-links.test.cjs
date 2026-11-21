const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs');
const routes = [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const fileOf = route => route === '/' ? 'index.html' : route.slice(1) + 'index.html';

test('no page opens WhatsApp directly: the only wa.me link is the plain noscript fallback', () => {
  for (const route of routes) {
    const html = fs.readFileSync(fileOf(route), 'utf8');
    const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)].map(m => m[1]);
    for (const link of links) assert.equal(link, 'https://wa.me/5519992445953', route + ': direct WhatsApp link with text');
    const outside = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    assert.ok(!/wa\.me/.test(outside), route + ': WhatsApp link outside the noscript fallback');
    assert.ok(!/href="tel:/.test(html), route + ': tel: link');
  }
});

test('hero and header carry no call to action; the first quiz button comes after the explanation', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const head = html.slice(html.indexOf('<header'), html.indexOf('id="como-funciona"'));
  assert.ok(!/data-start-quiz|class="btn/.test(head), 'header/hero must not contain quote buttons');
  assert.ok(html.indexOf('data-start-quiz') > html.indexOf('id="como-funciona"'));
});

test('every tracked button has a safe stable ID', () => {
  for (const route of routes) {
    const html = fs.readFileSync(fileOf(route), 'utf8');
    for (const m of html.matchAll(/data-track-id="([^"]*)"/g)) assert.match(m[1], /^[a-z][a-z0-9_]{0,63}$/, route);
  }
});
