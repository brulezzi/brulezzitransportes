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
