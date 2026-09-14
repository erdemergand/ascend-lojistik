import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the exact validation used by both quick save and shipment save.
const html = readFileSync(new URL('../prototype/02_LOJISTIK_PORTAL_BRANDED_v14.html', import.meta.url), 'utf8');
const source = html.slice(html.indexOf('function companyRequirementErrors('), html.indexOf('function syncQuickRequirements('));
const validate = runInNewContext(`${source}; companyRequirementErrors`);
const base = { name: 'Örnek Firma Ltd. Şti.', address: 'Örnek Cad. No:1, İstanbul, Türkiye', contacts: [{ email: 'test@example.com' }] };
const fields = (...args) => Array.from(validate(...args), error => error.field);

test('a single company can have all shipment roles without changing its card', () => {
  const roleSource = html.slice(html.indexOf('function shipmentRoles('), html.indexOf('function renderCompanies('));
  const getRoles = runInNewContext(`function normalize(s){return (s||'').toLocaleLowerCase('tr-TR').trim();} ${roleSource}; shipmentRoles`);
  const shipments = [{ shipper: base.name, consignee: 'Başka Firma' }, { consignee: base.name }, { agent: base.name }];
  assert.deepEqual(Array.from(getRoles(base.name, shipments)), ['Gönderici', 'Alıcı', 'Acente/Taşıyıcı']);
  assert.deepEqual(Array.from(getRoles('Yeni Firma', shipments)), []);
  assert.equal((html.match(/list="companyNames"/g)||[]).length, 3);
  assert.ok(!html.includes('id="qRole"'));
});

test('tax requirements follow shipment direction and party, not the company role', () => {
  assert.deepEqual(fields(base, 'İthalat', 'consignee'), ['taxOffice', 'taxNo']);
  assert.deepEqual(fields(base, 'İthalat', 'shipper'), []);
  assert.deepEqual(fields(base, 'İhracat', 'shipper'), ['taxOffice', 'taxNo']);
  assert.deepEqual(fields(base, 'İhracat', 'consignee'), []);
  const complete = { ...base, role: 'Diğer', taxOffice: 'Örnek', taxNo: '1234567890' };
  for (const direction of ['İthalat', 'İhracat']) {
    for (const field of ['shipper', 'consignee']) assert.deepEqual(fields(complete, direction, field), []);
  }
});

test('both parties require email; malformed additional emails are rejected', () => {
  for (const field of ['shipper', 'consignee']) {
    const company = { ...base, taxOffice: 'Örnek', taxNo: '1234567890' };
    for (const contacts of [[], [{ email: '  ' }], [{ email: 'wrong' }], [{ email: 'a@example.com' }, { email: 'wrong' }]]) {
      assert.deepEqual(fields({ ...company, contacts }, 'İthalat', field), ['email']);
    }
    assert.deepEqual(fields({ ...company, contacts: [{ email: ' a@example.com ' }, { first: 'Örnek' }] }, 'İthalat', field), []);
  }
});

test('existing cards and whitespace values cannot bypass required fields', () => {
  assert.deepEqual(fields({ name: ' ', address: ' ', taxOffice: ' ', taxNo: ' ', contacts: [] }, 'İhracat', 'shipper'), ['name', 'address', 'email', 'taxOffice', 'taxNo']);
  assert.deepEqual(fields(base, 'İthalat', 'agent'), []);
});
