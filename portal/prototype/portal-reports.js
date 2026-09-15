
function portalReportAdmin(){if(['staff','customer'].includes(new URLSearchParams(location.search).get('view')))return false;return JSON.parse(sessionStorage.getItem('ascend_session')||'null')?.role==='Yönetici';}
function reportAggregate(records,module,currency,start,end){
 const groups=new Map();
 for(const r of records){const date=module==='ncts'?r.date:r.loadingDate||r.loadDate; if((start&&(!date||date<start))||(end&&(!date||date>end)))continue;
 const company=(module==='ncts'?r.receiver:r.consignee)||'Firma belirtilmemiş';
 if(!groups.has(company))groups.set(company,{company,count:0,amount:0,priced:0});const group=groups.get(company);group.count++;
 if(module==='ncts'&&r.feeCurrency===currency){const profit=Number(r.freightFee||0)+Number(r.guaranteeFee||0);if(Number.isFinite(profit)){group.amount+=profit;group.priced++;}}
 if(module==='logistics'&&(r.financeCurrency||'EUR')===currency&&String(r.salePrice??'').trim()&&String(r.purchasePrice??'').trim()){
 const sale=Number(r.salePrice),purchase=Number(r.purchasePrice);if(Number.isFinite(sale)&&Number.isFinite(purchase)){group.amount+=sale-purchase;group.priced++;}}
 }
 return [...groups.values()];
}
function openPortalReport(module){
 if(!portalReportAdmin())return;
 let dialog=document.getElementById('portalReport');if(dialog)dialog.remove();
 dialog=document.createElement('dialog');dialog.id='portalReport';dialog.className='portal-report';
 dialog.innerHTML='<div class="report-head"><div><h2>'+ (module==='ncts'?'NCTS':'Lojistik')+' Raporları</h2><p>Firma performansı · Yönetici</p></div><button type="button" id="reportClose">Kapat</button></div><div class="report-content"><div class="report-filters"><label>Başlangıç<input type="date" id="reportStart"></label><label>Bitiş<input type="date" id="reportEnd"></label><label>Döviz<select id="reportCurrency"></select></label></div><p id="reportSummary" role="status"></p><div class="report-panels"><section class="report-panel"><h3>Dosya sayısında önde gelen firmalar</h3><div id="reportCounts"></div></section><section class="report-panel"><h3>Navlun kazancında önde gelen firmalar</h3><div id="reportProfit"></div></section></div><div class="report-panels"><section class="report-panel"><h3>En çok işlem yapılan ülkeler</h3><div id="reportCountries"></div></section><section class="report-panel"><h3>Ülke bazında kullanılan acente / taşıyıcılar</h3><div id="reportCarriers"></div></section></div><p class="report-note">Firma gruplaması alıcı üzerinden yapılır. Dövizler birbirine eklenmez. Navlun kazancı, satış − alış farkıdır; diğer giderler düşülmüş net kâr değildir.</p></div>';
 document.body.append(dialog);dialog.querySelector('#reportClose').onclick=()=>dialog.close();
 const currency=dialog.querySelector('#reportCurrency');for(const code of portalCurrencies){const o=document.createElement('option');o.value=code;o.textContent=code;currency.append(o);}
 function render(){
 if(!portalReportAdmin()){dialog.close();dialog.remove();return;}
 const start=dialog.querySelector('#reportStart').value,end=dialog.querySelector('#reportEnd').value;
 const records=JSON.parse(localStorage.getItem(module==='ncts'?'ascend_ncts_records':'ascend_shipments')||'[]');
 const groups=reportAggregate(records,module,currency.value,start,end);
 dialog.querySelector('#reportSummary').textContent=start&&end&&start>end?'Başlangıç tarihi bitişten sonra olamaz.':groups.reduce((n,g)=>n+g.count,0)+' dosya · '+groups.length+' firma';
 const companies=JSON.parse(localStorage.getItem('ascend_companies')||'[]');
 function bars(id,key){const body=dialog.querySelector(id);body.replaceChildren();const sorted=[...groups].filter(g=>key==='count'||g.priced).sort((a,b)=>b[key]-a[key]).slice(0,10);if(!sorted.length){body.textContent='Bu filtreler için kayıt bulunamadı.';return;}const max=Math.max(1,...sorted.map(g=>Math.abs(g[key])));
 for(const g of sorted){const row=document.createElement('div');row.className='report-bar';const label=document.createElement('label'),name=document.createElement('span'),value=document.createElement('strong');name.textContent=companies.find(c=>c.name===g.company)?.shortName||g.company;name.title=g.company;value.textContent=g[key].toLocaleString('tr-TR')+(key==='amount'?' '+currency.value:' dosya');label.append(name,value);const track=document.createElement('div'),fill=document.createElement('div');track.className='report-track';fill.className='report-fill';fill.style.width=(Math.abs(g[key])/max*100)+'%';if(g[key]<0)fill.style.background='#b83e52';track.append(fill);row.append(label,track);body.append(row);}}
 bars('#reportCounts','count');
 bars('#reportProfit','amount');
 const countries=new Map(),carriers=new Map();for(const r of records){const date=module==='ncts'?r.date:r.loadingDate||r.loadDate;if((start&&(!date||date<start))||(end&&(!date||date>end)))continue;const country=(module==='ncts'?r.origin:r.country)||'Ülke belirtilmemiş';countries.set(country,(countries.get(country)||0)+1);const carrier=r.agent||r.carrier;if(carrier){const key=country+' · '+(companies.find(c=>c.name===carrier)?.shortName||carrier);carriers.set(key,(carriers.get(key)||0)+1);}}
 for(const [selector,values] of [['#reportCountries',countries],['#reportCarriers',carriers]]){const body=dialog.querySelector(selector);body.replaceChildren();const sorted=[...values].sort((a,b)=>b[1]-a[1]);if(!sorted.length){body.textContent='Bu filtrelerde kayıt bulunamadı.';continue;}for(const [name,count] of sorted){const row=document.createElement('div');row.className='report-bar';const label=document.createElement('div');label.textContent=name+' — '+count+' dosya';const track=document.createElement('div'),fill=document.createElement('div');track.className='report-track';fill.className='report-fill';fill.style.width=(count/sorted[0][1]*100)+'%';track.append(fill);row.append(label,track);body.append(row);}}

 if(module==='ncts'){dialog.querySelector('.report-panel:nth-child(2) h3').textContent='Toplam ücrette önde gelen firmalar';dialog.querySelector('.report-note').textContent='NCTS toplam ücreti = nakliye ücreti + teminat ücreti. Dövizler ayrı değerlendirilir; dövizi belirtilmemiş dosyalar ücret sıralamasına alınmaz.';}
 }
 dialog.querySelectorAll('input,select').forEach(el=>el.onchange=render);render();dialog.showModal();
}
window.addEventListener('DOMContentLoaded',()=>{
 const ncts=location.pathname.includes('01_NCTS'),logistics=location.pathname.includes('02_LOJISTIK');if(!ncts&&!logistics)return;
 if(ncts){document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden-role',!portalReportAdmin()));}
 if(!portalReportAdmin())return;
 const host=ncts?document.getElementById('tabFinanceBtn').parentElement:document.querySelector('[data-section="finance"]').parentElement;
 const button=document.createElement('button');button.className='secondary report-launch';button.textContent='Raporlar';button.onclick=()=>openPortalReport(ncts?'ncts':'logistics');host.append(button);
});
