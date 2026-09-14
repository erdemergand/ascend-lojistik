import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccess, customerShipmentView } from '../access-policy.mjs';

const identity = (role, kind = 'staff') => ({
  userId: 'synthetic-user', active: true, sessionRevoked: false, kind,
  memberships: [{ tenantId: 'company-a', role, active: true }],
});

test('NCTS finance is admin-only for every operation and requires company membership', () => {
  for (const action of ['read', 'write', 'export', 'totals']) {
    for (const role of ['Yönetici', 'Operasyon', 'Finans', 'Görüntüleme', 'Müşteri', 'unknown']) {
      const principal = identity(role, role === 'Müşteri' ? 'customer' : 'staff');
      assert.equal(canAccess(principal, `ncts.finance.${action}`, 'company-a'), role === 'Yönetici');
      assert.equal(canAccess(principal, `ncts.finance.${action}`, 'company-b'), false);
    }
  }
});

test('missing, inactive, revoked and ambiguous identities fail closed', () => {
  const admin = identity('Yönetici');
  for (const principal of [null, {}, { ...admin, active: false },
    { ...admin, sessionRevoked: true }, { ...admin, sessionRevoked: undefined },
    { ...admin, userId: '' }, { ...admin, memberships: [] },
    { ...admin, memberships: [...admin.memberships, ...admin.memberships] },
    { ...admin, memberships: [{ ...admin.memberships[0], active: false }] }]) {
    assert.equal(canAccess(principal, 'users.manage', 'company-a'), false);
  }
  assert.equal(canAccess(admin, 'undefined.permission', 'company-a'), false);
  assert.equal(canAccess(identity('Finans'), 'users.manage', 'company-a'), false);
  assert.equal(canAccess(identity('Yönetici', 'customer'), 'users.manage', 'company-a'), false);
});

test('customer read and export use only approved fields, excluding internal finance', () => {
  const customer = identity('Müşteri', 'customer');
  const record = { id: 'sample-1', tenantId: 'company-a', customerVisible: true,
    reference: 'DEMO-001', status: 'Operasyonda', profit: 123, share: 45,
    shareTL: 67, finance: { profit: 123 }, agent:'Internal carrier',agentId:'private-id',carrier:{name:'Internal carrier'}, internalNotes: 'synthetic internal note' };
  for (const action of ['shipments.customer.read', 'shipments.customer.export']) {
    assert.deepEqual(customerShipmentView(customer, record, action), {
      id: 'sample-1', reference: 'DEMO-001', status: 'Operasyonda',
    });
    assert.throws(() => customerShipmentView(customer, { ...record, tenantId: 'company-b' }, action), /Access denied/);
    assert.throws(() => customerShipmentView(customer, { ...record, customerVisible: false }, action), /Access denied/);
  }
  assert.throws(() => customerShipmentView(customer, record, 'ncts.finance.read'), /Access denied/);
  assert.throws(() => customerShipmentView(identity('Görüntüleme'), record), /Access denied/);
  assert.throws(() => customerShipmentView(customer, { ...record, status: { profit: 123 } }), /Invalid customer shipment/);
});
