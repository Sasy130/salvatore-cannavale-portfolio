import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const base = fileURLToPath(new URL('../', import.meta.url));
const req = createRequire(import.meta.url);
const ts = req('typescript');
const React = req('react');
const { renderToStaticMarkup } = req('react-dom/server');
let config;
function load(name) {
  const suffix = ['location'].includes(name) ? '.tsx' : '.ts';
  const source = fs.readFileSync(path.join(base, 'src/features/fuoco', name + suffix), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const moduleState = { exports: {} };
  const localRequire = spec => {
    if (spec === './restaurant') return config;
    if (spec === './ui') return { Eyebrow: ({ children }) => React.createElement('p', null, children) };
    if (spec === 'next/image') return function Image({ src, alt }) { return React.createElement('img', { src, alt }); };
    return req(spec);
  };
  vm.runInNewContext(code, { module: moduleState, exports: moduleState.exports, require: localRequire, URL, Intl, console }, { filename: name + suffix });
  return moduleState.exports;
}
config = load('restaurant');
const baseline = structuredClone(config.restaurant);
beforeEach(() => Object.assign(config.restaurant, structuredClone(baseline)));
afterEach(() => Object.assign(config.restaurant, structuredClone(baseline)));

test('unconfigured and malformed numbers cannot produce outbound contacts', () => {
  for (const number of [null, '', ' ', '123', '0039abc', '+39/123456789', 'javascript:alert(1)', '+0 123456789', '1'.repeat(16)]) {
    assert.equal(config.getWhatsAppUrl(undefined, number), null);
    assert.equal(config.getPhoneUrl(number), null);
  }
});
test('configured international phone and generic WhatsApp use the exact requested message', () => {
  const number = '+39 (320) 000-0000'; // Test fixture only; never published or contacted.
  assert.equal(config.getPhoneUrl(number), 'tel:+393200000000');
  const url = new URL(config.getWhatsAppUrl(undefined, number));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/393200000000');
  assert.equal(url.searchParams.get('text'), 'Ciao! Vorrei avere informazioni sul menu della pizzeria.');
});
test('selected pizza requests encode names including reserved characters', () => {
  const url = new URL(config.getWhatsAppUrl(' Salsiccia & Friarielli ', '+393200000000'));
  assert.equal(url.searchParams.get('text'), 'Ciao! Vorrei informazioni sulla pizza Salsiccia & Friarielli.');
  assert.equal([...url.searchParams].length, 1);
});
test('directions only exist for a configured address and encode the destination', () => {
  assert.equal(config.getDirectionsUrl(null), null);
  assert.equal(config.getDirectionsUrl('  '), null);
  const url = new URL(config.getDirectionsUrl(' Via di Test 1, Città & Centro '));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('destination'), 'Via di Test 1, Città & Centro');
});
test('social links require a supported HTTPS host without credentials', () => {
  assert.equal(config.getSocialUrl('https://www.instagram.com/fuoco-demo/'), 'https://www.instagram.com/fuoco-demo/');
  for (const url of [null, '', 'javascript:alert(1)', 'http://instagram.com/demo', 'https://instagram.com.evil.test/demo', 'https://user:password@facebook.com/demo', 'https://facebook.com:8080/demo']) assert.equal(config.getSocialUrl(url), null);
});
test('optional demo prices are explicit, formatted in EUR and reject invalid amounts', () => {
  for (const price of [null, NaN, Infinity, -1]) assert.equal(config.getMenuPrice(price).value, 'Da definire');
  assert.match(config.getMenuPrice(7.5).value, /7,50/);
  assert.equal(config.getMenuPrice(7.5).caption, 'Prezzo demo');
  config.restaurant.demo = false;
  assert.equal(config.getMenuPrice(7.5).caption, 'Prezzo');
});
test('demo sitemap is empty and Restaurant schema requires verified real details', () => {
  let seo = load('seo');
  assert.equal(seo.sitemapEntries().length, 0);
  assert.equal(seo.restaurantSchema(), null);
  config.restaurant.demo = false;
  config.restaurant.allowIndexing = true;
  seo = load('seo');
  assert.equal(seo.sitemapEntries().length, 4);
  assert.deepEqual(Array.from(seo.sitemapEntries(), entry => new URL(entry.url).pathname).sort(), ['/fuoco', '/fuoco/contatti', '/fuoco/menu', '/fuoco/storia']);
  assert.equal(seo.restaurantSchema(), null);
  Object.assign(config.restaurant, { verifiedBusiness: true, address: 'Indirizzo fixture di test', phone: '+393200000000' });
  const schema = seo.restaurantSchema();
  assert.equal(schema['@type'], 'Restaurant');
  assert.equal(schema.telephone, '+393200000000');
  assert.equal('aggregateRating' in schema, false);
  assert.equal('review' in schema, false);
});
test('demo contact UI shows explicit placeholders and no invented outbound links', () => {
  const { Location } = load('location');
  const html = renderToStaticMarkup(React.createElement(Location));
  assert.match(html, /Indirizzo da confermare/);
  assert.doesNotMatch(html, /href="(?:https:\/\/(?:wa\.me|www\.google\.com)|tel:)/);
});
test('configured live contact UI renders phone, maps, WhatsApp, hours and social links', () => {
  Object.assign(config.restaurant, { demo: false, phone: '+393200000000', whatsappNumber: '+393200000000', address: 'Via di Test 1, Città', openingHours: [{ day: 'Lunedì', hours: 'Chiuso' }], socials: { instagram: 'https://www.instagram.com/fuoco-demo/', facebook: null } });
  const { Location } = load('location');
  const html = renderToStaticMarkup(React.createElement(Location));
  assert.match(html, /href="tel:\+393200000000"/);
  assert.match(html, /href="https:\/\/wa\.me\/393200000000\?text=/);
  assert.match(html, /destination=Via%20di%20Test%201%2C%20Citt%C3%A0/);
  assert.match(html, /Lunedì/);
  assert.match(html, /Chiuso/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/fuoco-demo\/"/);
  assert.doesNotMatch(html, /da confermare|non ancora disponibile|CONCEPT DEMO/i);
});
test('live empty config hides demo-only placeholders', () => {
  config.restaurant.demo = false;
  const { Location } = load('location');
  const html = renderToStaticMarkup(React.createElement(Location));
  assert.doesNotMatch(html, /da confermare|demo|INDIRIZZO|TELEFONO|ORARI|WHATSAPP/i);
});
test('all requested pizzas exist and absent photography stays absent', () => {
  const { menuItems } = load('menu-data');
  const names = menuItems.map(item => item.name);
  for (const name of ['Margherita', 'Marinara', 'Diavola', 'Quattro Formaggi', 'Capricciosa', 'Salsiccia e Friarielli']) assert.ok(names.includes(name));
  assert.equal(new Set(menuItems.map(item => item.id)).size, menuItems.length);
  for (const item of menuItems) {
    if (item.image) assert.ok(fs.existsSync(path.join(base, 'public/images/fuoco', item.image)));
    if (item.category !== 'classiche') assert.equal(item.image, undefined);
  }
});

test('quick search is case and accent insensitive for names and ingredients', () => {
  const { findMenuItems } = load('menu-search');
  const { menuItems } = load('menu-data');
  assert.deepEqual(Array.from(findMenuItems(menuItems, 'all', '  marGHERITÀ '), item => item.id), ['margherita']);
  assert.deepEqual(Array.from(findMenuItems(menuItems, 'all', 'básilico POMODÒRO'), item => item.id), ['margherita']);
  assert.deepEqual(Array.from(findMenuItems(menuItems, 'fritti', 'CROCCHE'), item => item.id), ['crocche']);
});
test('quick search combines categories with every search term', () => {
  const { findMenuItems } = load('menu-search');
  const { menuItems } = load('menu-data');
  assert.deepEqual(Array.from(findMenuItems(menuItems, 'speciali', 'pomodoro mozzarella'), item => item.id), ['capricciosa']);
  assert.equal(findMenuItems(menuItems, 'bevande', 'pomodoro').length, 0);
});
test('quick menu handles empty and unmatched queries without altering its source', () => {
  const { findMenuItems } = load('menu-search');
  const { menuItems } = load('menu-data');
  const original = JSON.stringify(menuItems);
  assert.equal(findMenuItems(menuItems, 'all', '   ').length, 11);
  assert.equal(findMenuItems(menuItems, 'all', 'ingrediente-che-non-esiste').length, 0);
  assert.equal(findMenuItems([], 'all', 'pizza').length, 0);
  assert.equal(JSON.stringify(menuItems), original);
});
