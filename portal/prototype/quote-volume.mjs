// Dimensions are centimetres. One uncounted row applies to all packages.
export function calculateVolume(dimensions, packages) {
 const count=Number(packages);if(!Number.isSafeInteger(count)||count<=0)throw Error('Toplam kap/palet adedi pozitif tam sayı olmalı.');
 const lines=String(dimensions||'').trim().split(/[;\n]+/).map(s=>s.trim()).filter(Boolean);if(!lines.length)throw Error('Kap/palet ölçülerini girin.');
 let total=0,units=0;
 for(const line of lines){const cleaned=line.replace(/\s*(cm)?\s*(\/\s*palet)?\s*$/i,'');const m=cleaned.match(/^(?:(\d+)\s*(?:adet|palet|kap)?\s*[:x×*]\s*)?(\d+(?:[.,]\d+)?)\s*[x×*]\s*(\d+(?:[.,]\d+)?)\s*[x×*]\s*(\d+(?:[.,]\d+)?)$/i);if(!m)throw Error('Ölçü biçimi: 120 x 80 x 150 veya her satırda 3 adet: 120 x 80 x 150 (cm).');if(!m[1]&&lines.length!==1)throw Error('Farklı ölçüler için her satırda adet belirtin.');const n=m[1]?Number(m[1]):count;const values=m.slice(2).map(x=>Number(x.replace(',','.')));if(n<=0||values.some(x=>!Number.isFinite(x)||x<=0))throw Error('Adet ve ölçüler sıfırdan büyük olmalı.');units+=n;total+=n*values[0]*values[1]*values[2]/1000000;}
 if(units!==count)throw Error('Ölçü satırlarındaki adet toplamı toplam kap/palet ile eşleşmeli.');if(!Number.isFinite(total)||total<=0)throw Error('Hacim hesaplanamadı.');return Number(total.toFixed(6));
}
