import '../prototype/notification-templates.js';
import { mkdir, writeFile } from 'node:fs/promises';
const sample = {
  fileNo: 'DEMO-2026-0001', shipper: 'DEMO Avrupa Tedarik GmbH',
  consignee: 'DEMO Anadolu Dış Ticaret Ltd. Şti.', agent: 'DEMO Avrupa Karayolu Taşımacılık Ltd. Şti.',
  loadingDate: '2026-09-10', departureDate: '2026-09-11', arrivalDate: '2026-09-14',
  plate: 'DEMO-PLAKA-01', billNo: 'DEMO-BL-001', containerNo: 'DEMO-KONTEYNER-01',
  packages: 12, weight: 2400, goods: 'Ambalaj malzemesi - tamamen kurgusal test yükü.',
  reg:'DEMO-TESCIL-001',warehouse:'DEMO Tuzla Antreposu',warehouseNo:'DEMO-AMBAR-12',
  originalDocs:['Invoice','Packing List','A.TR'],
};
const output = new URL('../../output/pdf/', import.meta.url);
await mkdir(output, { recursive: true });
for (const event of ['departure', 'arrival']) {
  const notice = AscendNotifications.create(sample, event);
  await writeFile(new URL(`${event}.json`, output), JSON.stringify(notice, null, 2));
  await writeFile(new URL(`${event}-email.txt`, output), `Konu: ${notice.subject}\n\n${notice.text}\n`);
}
