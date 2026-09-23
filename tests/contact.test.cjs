const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(valid = true) {
  const events = [], listeners = {}, opened = [];
  const fields = {};
  for (const name of ['nome','whatsapp','empresa','servico','carga','frequencia','coleta','entrega']) {
    fields[name] = { value: 'Teste & ' + name };
  }
  const fieldset = { disabled: true };
  const form = { elements: fields, reportValidity: () => valid,
    addEventListener: (name, fn) => { listeners[name] = fn; }, querySelector: () => fieldset };
  const fallback = { hidden: true }, status = {};
  const document = {
    getElementById: id => ({ contactForm: form, whatsappFallback: fallback, formStatus: status }[id] || null),
    addEventListener: (name, fn) => { if (name === 'DOMContentLoaded') fn(); }
  };
  const window = { trackContact: (...args) => events.push(args), open: (...args) => opened.push(args) };
  vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), { document, window });
  return { events, listeners, opened, fieldset, fallback, status };
}
test('validated quote opens encoded WhatsApp message and sends no form values to tracking', () => {
  const env = setup();
  assert.equal(env.fieldset.disabled, false);
  let prevented = false;
  env.listeners.submit({ preventDefault: () => { prevented = true; } });
  assert.ok(prevented);
  assert.equal(env.opened.length, 1);
  const url = new URL(env.opened[0][0]);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5519992445953');
  assert.ok(url.searchParams.get('text').includes('Empresa: Teste & empresa'));
  assert.deepEqual(env.events, [['contato_whatsapp', 'formulario']]);
  assert.equal(env.opened[0][2], 'noopener,noreferrer');
  assert.equal(env.fallback.href, env.opened[0][0]);
  assert.equal(env.fallback.hidden, false);
});
test('invalid quote neither opens WhatsApp nor records a contact', () => {
  const env = setup(false);
  env.listeners.submit({ preventDefault() {} });
  assert.equal(env.opened.length, 0);
  assert.equal(env.events.length, 0);
});
test('form cannot submit personal data without JavaScript', () => {
  const html = fs.readFileSync('index.html','utf8');
  assert.match(html, /<fieldset disabled>/);
  assert.match(html, /id="contactForm" method="post"/);
  assert.match(html, /<noscript>[\s\S]*?https:\/\/wa.me\/5519992445953/);
});

test('Analytics tracks by default (opt-out), omits URL query data, and stops after refusal', () => {
  const nodes = new Map(), scripts = [];
  function element() {
    return { children: [], listeners: {}, hidden: false, setAttribute() {},
      appendChild(child) { this.children.push(child); if (child.id) nodes.set(child.id, child); },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      querySelector() { return this.children.find(child => child.type === 'button'); }, focus() {} };
  }
  const settings = element(); nodes.set('privacySettings', settings);
  const document = { cookie: '', createElement: element,
    getElementById: id => nodes.get(id), body: element(),
    head: { appendChild: script => scripts.push(script) },
    addEventListener(name, fn) { if (name === 'DOMContentLoaded') fn(); } };
  const storage = new Map(), window = {};
  vm.runInNewContext(fs.readFileSync('analytics.js','utf8'), {
    window, document, location: { origin:'https://example.com', pathname:'/', hostname:'example.com', search:'?nome=private' },
    localStorage: { getItem: key => storage.get(key), setItem: (key,value) => storage.set(key,value) }
  });
  // Tracks immediately, before any interaction with the notice.
  assert.equal(scripts.length,1);
  window.trackContact('contato_whatsapp','formulario');
  assert.ok(!JSON.stringify(window.dataLayer).includes('private'));
  assert.ok(!JSON.stringify(window.dataLayer).includes('link_url'));
  const buttons = nodes.get('privacyChoice').children.filter(child => child.type === 'button');
  buttons[1].listeners.click(); // Recusar
  const count = window.dataLayer.length;
  window.trackContact('contato_whatsapp','formulario');
  assert.equal(window.dataLayer.length,count);
  assert.equal(window['ga-disable-G-CENYXB4MYP'],true);
});

test('quote card selects a vehicle, fills the form and records only a non-personal GA4 event', () => {
  const events = [];
  const mk = (extra = {}) => Object.assign({ listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; },
    classList: { toggle() {}, add() {}, contains: () => false }, setAttribute() {}, style: { setProperty() {} } }, extra);
  const buttons = ['Motoboy', 'Utilitário', 'Caminhão'].map(vehicle => mk({ dataset: { vehicle } }));
  const start = mk({ firstChild: { textContent: '' } });
  const status = mk({ textContent: '' });
  const select = { value: '', dispatchEvent() {} };
  const nameInput = { focused: false, focus() { this.focused = true; } };
  const form = mk({ querySelector: sel => sel.includes('servico') ? select : sel.includes('nome') ? nameInput : null, scrollIntoView() {} });
  const document = { documentElement: mk(), body: mk(),
    getElementById: id => ({ startQuote: start, quoteStatus: status, contactForm: form }[id] || null),
    querySelectorAll: sel => sel === '[data-vehicle]' ? buttons : [] };
  const window = { trackContact: (...args) => events.push(args) };
  vm.runInNewContext(fs.readFileSync('modern.js', 'utf8'), { window, document, matchMedia: () => ({ matches: false }), Event: class {} });
  buttons[2].listeners.click();
  start.listeners.click();
  assert.equal(select.value, 'Caminhão');
  assert.equal(nameInput.focused, true);
  assert.deepEqual(events, [['cotacao_iniciada', 'cartao_caminhao']]);
});

test('contact clicks keep event names and origem_contato "link" and add where on the page they happened', () => {
  const clicks = {}, events = [];
  const document = { getElementById: () => null, addEventListener: (name, fn) => { if (name === 'DOMContentLoaded') fn(); else clicks[name] = fn; } };
  vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), { document, window: { trackContact: (...args) => events.push(args) } });
  const linkIn = (href, ...areas) => { const link = { id: '', href, closest: sel => areas.includes(sel) ? link : null }; return { closest: sel => sel === 'a' ? link : null }; };
  clicks.click({ target: linkIn('https://wa.me/5519992445953?text=x', '.site-header') });
  clicks.click({ target: linkIn('https://wa.me/5519992445953', '.whatsapp-float') });
  clicks.click({ target: linkIn('tel:+5519992445953', '.mobile-bar') });
  clicks.click({ target: linkIn('https://wa.me/5519992445953', '.site-footer') });
  clicks.click({ target: linkIn('https://wa.me/5519992445953') });
  clicks.click({ target: linkIn('https://example.com/other', '.site-header') });
  assert.deepEqual(events, [
    ['contato_whatsapp', 'link', 'cabecalho'],
    ['contato_whatsapp', 'link', 'botao_flutuante'],
    ['contato_telefone', 'link', 'barra_celular'],
    ['contato_whatsapp', 'link', 'rodape'],
    ['contato_whatsapp', 'link', 'conteudo']
  ]);
});

test('analytics sends local_contato only when given and never form values', () => {
  const nodes = new Map(), scripts = [];
  function element() { return { children: [], listeners: {}, hidden: false, setAttribute() {}, appendChild(c) { this.children.push(c); if (c.id) nodes.set(c.id, c); }, addEventListener(n, f) { this.listeners[n] = f; }, querySelector() { return this.children.find(c => c.type === 'button'); }, focus() {} }; }
  const document = { cookie: '', createElement: element, getElementById: id => nodes.get(id), body: element(), head: { appendChild: s => scripts.push(s) }, addEventListener(n, f) { if (n === 'DOMContentLoaded') f(); } };
  const window = {};
  vm.runInNewContext(fs.readFileSync('analytics.js', 'utf8'), { window, document, location: { origin: 'https://example.com', pathname: '/x/', hostname: 'example.com', search: '?nome=private' }, localStorage: { getItem: () => null, setItem() {} } });
  window.trackContact('contato_whatsapp', 'link', 'cabecalho');
  window.trackContact('contato_whatsapp', 'formulario');
  const sent = window.dataLayer.map(a => Array.from(a)).filter(a => a[0] === 'event' && a[1] === 'contato_whatsapp').map(a => a[2]);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].local_contato, 'cabecalho'); assert.equal(sent[0].origem_contato, 'link');
  assert.equal('local_contato' in sent[1], false); assert.equal(sent[1].origem_contato, 'formulario');
  assert.ok(!JSON.stringify(window.dataLayer).includes('private'));
});
