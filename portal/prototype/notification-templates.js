// Shared operational content for the preview and the future delivery worker.
// Explicit field selection keeps internal finance values out of customer notices.
globalThis.AscendNotifications = Object.freeze({
  create(record, event) {
    if (!['departure', 'arrival'].includes(event)) throw new Error('Unknown notification');
    const title = event === 'departure' ? 'Çıkış Bildirimi' : 'Varış Bildirimi';
    const date = event === 'departure' ? record.departureDate : record.arrivalDate;
    if (!record.fileNo || !date) throw new Error('Notification requires a file number and event date');
    const fields = [
      ['Dosya No', record.fileNo], ['Gönderici', record.shipper], ['Alıcı', record.consignee],
      ['Yükleme Tarihi', record.loadingDate],
      [event === 'departure' ? 'Çıkış Tarihi' : 'Varış Tarihi', date],
      ['Plaka', record.plate], ['B/L - Konşimento No', record.billNo],
      ['Konteyner No', record.containerNo], ['Kap / Koli', record.packages],
      ['Brüt Ağırlık (kg)', record.weight], ['Mal Tanımı', record.goods],
      ...(event === 'arrival' ? [['Tescil No',record.reg],['Antrepo / Depo',record.warehouse],['Antrepo / Ambar No',record.warehouseNo]] : []),
      ['Orijinal Evraklar',Array.isArray(record.originalDocs)?record.originalDocs.filter(value=>typeof value==='string'&&value.trim()).join(', '):''],
    ].filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
      .map(([label, value]) => [label, String(value)]);
    const intro = event === 'departure'
      ? `${record.fileNo} numaralı sevkiyatın çıkış bildirimi ${date} tarihinde oluşturulmuştur.`
      : `${record.fileNo} numaralı sevkiyatın varış bildirimi ${date} tarihinde oluşturulmuştur.`;
    return {
      title, event, fields,
      subject: `ASCEND Lojistik | ${title} | ${record.fileNo}`,
      attachmentName: `${event === 'departure' ? 'Cikis' : 'Varis'}_Bildirimi_${String(record.fileNo).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
      text: `Merhaba,\n\n${intro}\n\n${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nİlgili bildirim formu ekte sunulmuştur.\nSorularınız için info@ascendlojistik.com adresinden bizimle iletişime geçebilirsiniz.\n\nİyi çalışmalar,\nASCEND Lojistik`,
    };
  },
});
