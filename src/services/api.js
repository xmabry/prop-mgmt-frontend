/**
 * Mock API service that simulates backend calls.
 * In production, replace base URL and remove mock data.
 */

const MOCK_DELAY = 300;

const mockDelay = (ms = MOCK_DELAY) => new Promise((res) => setTimeout(res, ms));

// ─── Mock Data ──────────────────────────────────────────────────────────────

let maintenanceRequests = [
  { id: 1, tenantName: 'Alice Johnson', property: '123 Main St, Apt 2B', category: 'Plumbing', description: 'Leaking faucet in kitchen', status: 'open', priority: 'medium', createdAt: '2026-03-15', scheduledDate: '2026-04-20T10:00:00', notes: '' },
  { id: 2, tenantName: 'Bob Smith', property: '456 Oak Ave, Unit 5', category: 'HVAC', description: 'AC not cooling properly', status: 'in_progress', priority: 'high', createdAt: '2026-03-20', scheduledDate: '2026-04-18T14:00:00', notes: 'Technician scheduled' },
  { id: 3, tenantName: 'Carol Davis', property: '789 Pine Rd, Suite 3', category: 'Electrical', description: 'Outlet sparking', status: 'completed', priority: 'critical', createdAt: '2026-03-10', scheduledDate: '2026-03-12T09:00:00', notes: 'Fixed - replaced outlet' },
  { id: 4, tenantName: 'Alice Johnson', property: '123 Main St, Apt 2B', category: 'General', description: 'Broken window screen', status: 'open', priority: 'low', createdAt: '2026-04-01', scheduledDate: '', notes: '' },
];

let payments = [
  { id: 1, tenantName: 'Alice Johnson', property: '123 Main St, Apt 2B', amount: 1800, month: 'April 2026', status: 'paid', paidOn: '2026-04-01', method: 'Bank Transfer', receiptId: 'RCP-2026-001' },
  { id: 2, tenantName: 'Bob Smith', property: '456 Oak Ave, Unit 5', amount: 2200, month: 'April 2026', status: 'pending', paidOn: null, method: null, receiptId: null },
  { id: 3, tenantName: 'Carol Davis', property: '789 Pine Rd, Suite 3', amount: 1650, month: 'April 2026', status: 'paid', paidOn: '2026-04-02', method: 'Credit Card', receiptId: 'RCP-2026-002' },
  { id: 4, tenantName: 'Alice Johnson', property: '123 Main St, Apt 2B', amount: 1800, month: 'March 2026', status: 'paid', paidOn: '2026-03-01', method: 'Bank Transfer', receiptId: 'RCP-2026-003' },
  { id: 5, tenantName: 'Bob Smith', property: '456 Oak Ave, Unit 5', amount: 2200, month: 'March 2026', status: 'paid', paidOn: '2026-03-03', method: 'Credit Card', receiptId: 'RCP-2026-004' },
];

let properties = [
  { id: 1, address: '123 Main St, Apt 2B', city: 'Springfield', state: 'IL', zip: '62701', type: 'Apartment', bedrooms: 2, bathrooms: 1, rent: 1800, tenant: 'Alice Johnson', tenantEmail: 'alice@example.com', ownerName: 'John Property LLC', status: 'occupied' },
  { id: 2, address: '456 Oak Ave, Unit 5', city: 'Springfield', state: 'IL', zip: '62702', type: 'Apartment', bedrooms: 3, bathrooms: 2, rent: 2200, tenant: 'Bob Smith', tenantEmail: 'bob@example.com', ownerName: 'John Property LLC', status: 'occupied' },
  { id: 3, address: '789 Pine Rd, Suite 3', city: 'Springfield', state: 'IL', zip: '62703', type: 'Commercial', bedrooms: 0, bathrooms: 1, rent: 1650, tenant: 'Carol Davis', tenantEmail: 'carol@example.com', ownerName: 'Springfield Real Estate Partners', status: 'occupied' },
  { id: 4, address: '321 Elm St', city: 'Springfield', state: 'IL', zip: '62704', type: 'Single Family', bedrooms: 4, bathrooms: 2, rent: 2800, tenant: null, tenantEmail: null, ownerName: 'John Property LLC', status: 'vacant' },
];

// ─── Auth ────────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  { id: 1, email: 'renter@demo.com', password: 'demo123', role: 'renter', name: 'Alice Johnson', propertyId: 1 },
  { id: 2, email: 'admin@demo.com', password: 'demo123', role: 'admin', name: 'Property Manager', propertyId: null },
];

export async function login(email, password) {
  await mockDelay();
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  const { password: _p, ...safeUser } = user;
  return safeUser;
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export async function getMaintenanceRequests(filters = {}) {
  await mockDelay();
  let results = [...maintenanceRequests];
  if (filters.tenantName) results = results.filter((r) => r.tenantName === filters.tenantName);
  if (filters.status) results = results.filter((r) => r.status === filters.status);
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createMaintenanceRequest(data) {
  await mockDelay();
  const newRequest = {
    id: maintenanceRequests.length + 1,
    ...data,
    status: 'open',
    createdAt: new Date().toISOString().split('T')[0],
    notes: '',
    scheduledDate: data.scheduledDate || '',
  };
  maintenanceRequests.push(newRequest);
  return newRequest;
}

export async function updateMaintenanceRequest(id, updates) {
  await mockDelay();
  const idx = maintenanceRequests.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Request not found');
  maintenanceRequests[idx] = { ...maintenanceRequests[idx], ...updates };
  return maintenanceRequests[idx];
}

// ─── Payments ────────────────────────────────────────────────────────────────

export async function getPayments(filters = {}) {
  await mockDelay();
  let results = [...payments];
  if (filters.tenantName) results = results.filter((p) => p.tenantName === filters.tenantName);
  return results.sort((a, b) => b.id - a.id);
}

export async function submitPayment(data) {
  await mockDelay(600);
  const receiptId = `RCP-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`;
  const newPayment = {
    id: payments.length + 1,
    ...data,
    status: 'paid',
    paidOn: new Date().toISOString().split('T')[0],
    receiptId,
  };
  payments.push(newPayment);
  return newPayment;
}

export async function getReceipts(tenantName) {
  await mockDelay();
  return payments
    .filter((p) => p.status === 'paid' && (!tenantName || p.tenantName === tenantName))
    .map((p) => ({
      receiptId: p.receiptId,
      tenantName: p.tenantName,
      property: p.property,
      amount: p.amount,
      month: p.month,
      paidOn: p.paidOn,
      method: p.method,
    }));
}

// ─── Properties ──────────────────────────────────────────────────────────────

export async function getProperties() {
  await mockDelay();
  return [...properties];
}

export async function getPropertyById(id) {
  await mockDelay();
  return properties.find((p) => p.id === id) || null;
}

// ─── Tax Forms ───────────────────────────────────────────────────────────────

export async function getTaxSummary(year = new Date().getFullYear()) {
  await mockDelay();
  const yearPayments = payments.filter(
    (p) => p.status === 'paid' && p.paidOn?.startsWith(String(year))
  );

  const byOwner = {};
  yearPayments.forEach((p) => {
    const prop = properties.find((pr) => pr.address.includes(p.property?.split(',')[0] || ''));
    const owner = prop?.ownerName || 'Unknown Owner';
    if (!byOwner[owner]) byOwner[owner] = { owner, totalRent: 0, properties: new Set(), payments: [] };
    byOwner[owner].totalRent += p.amount;
    byOwner[owner].properties.add(p.property);
    byOwner[owner].payments.push(p);
  });

  return Object.values(byOwner).map((o) => ({
    ...o,
    properties: Array.from(o.properties),
    propertyCount: o.properties.size,
  }));
}

export async function getBusinessTaxSummary(year = new Date().getFullYear()) {
  await mockDelay();
  const yearPayments = payments.filter(
    (p) => p.status === 'paid' && p.paidOn?.startsWith(String(year))
  );
  const totalRevenue = yearPayments.reduce((sum, p) => sum + p.amount, 0);
  const managementFeeRate = 0.1;
  return {
    year,
    totalRevenue,
    managementFees: totalRevenue * managementFeeRate,
    totalPayments: yearPayments.length,
    activeProperties: properties.filter((p) => p.status === 'occupied').length,
    totalProperties: properties.length,
    payments: yearPayments,
  };
}
