// Only call with identity and memberships loaded by a trusted server session.
// Never pass request bodies, localStorage or the prototype session to this policy.
// This module is a foundation; the preview server has no customer API.
const staffRoles = new Set(['Yönetici', 'Operasyon', 'Finans', 'Görüntüleme']);
const adminActions = new Set([
  'users.manage',
  'reports.read',
  'reports.export',
  'carriers.ledger.read',
  'carriers.ledger.write',
  'carriers.ledger.export',
  'carriers.ledger.totals',
  'ncts.finance.read',
  'ncts.finance.write',
  'ncts.finance.export',
  'ncts.finance.totals',
]);
const customerActions = new Set(['shipments.customer.read', 'shipments.customer.export']);

export function canAccess(principal, action, tenantId) {
  if (!principal || principal.active !== true || principal.sessionRevoked !== false) return false;
  if (typeof principal.userId !== 'string' || !principal.userId.trim()) return false;
  if (typeof tenantId !== 'string' || !tenantId.trim()) return false;
  if (!Array.isArray(principal.memberships)) return false;
  const memberships = principal.memberships.filter((entry) => entry?.tenantId === tenantId && entry.active === true);
  // Ambiguous membership data must be resolved before granting access.
  if (memberships.length !== 1) return false;
  const membership = memberships[0];
  if (principal.kind === 'staff' && staffRoles.has(membership.role)) {
    if (['shipments.finance.read', 'shipments.finance.export'].includes(action)) return true;
    return membership.role === 'Yönetici' && adminActions.has(action);
  }
  if (principal.kind === 'customer' && membership.role === 'Müşteri') {
    if (['shipments.finance.read', 'shipments.finance.export'].includes(action)) return true;
    return customerActions.has(action);
  }
  return false;
}

// Use only after server session verification and tenant-scoped database selection.
// No object spreading: future internal fields must never enter public responses.
export function shipmentFinanceView(principal, record, action = 'shipments.finance.read') {
  if (!['shipments.finance.read','shipments.finance.export'].includes(action)
    || !record || !canAccess(principal, action, record.tenantId)
    || (principal.kind === 'customer' && record.customerVisible !== true)) throw new Error('Access denied');
  const membership=principal.memberships.find(entry=>entry.tenantId===record.tenantId && entry.active);
  const admin=principal.kind==='staff' && membership.role==='Yönetici';
  const fields=['id','fileNo','shipper','consignee','salePrice','financeCurrency','arrivalDate','paymentDate'];
  if(principal.kind==='staff')fields.push('agent');
  if(admin)fields.push('purchasePrice','profit','share','exchangeRate','shareTL');
  const result={};
  for(const field of fields){
    const value=record[field];
    if(value===null || typeof value==='string' || (typeof value==='number' && Number.isFinite(value)))result[field]=value;
  }
  return result;
}

// Minimal proposed customer contract. Explicit projection prevents new internal
// fields (including nested finance data) from leaking through object spreading.
// Records must still be selected with tenant scope in the eventual database query.
export function customerShipmentView(principal, record, action = 'shipments.customer.read') {
  if (!record || !customerActions.has(action) || principal?.kind !== 'customer'
    || !canAccess(principal, action, record.tenantId) || record.customerVisible !== true) {
    throw new Error('Access denied');
  }
  const result = {};
  for (const field of ['id', 'reference', 'status']) {
    if (typeof record[field] !== 'string') throw new Error('Invalid customer shipment');
    result[field] = record[field];
  }
  return result;
}
