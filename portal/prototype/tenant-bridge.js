(() => {
 const state=window.portalBootstrap;
 if(!state)return;
 const nativeStorage=window['local'+'Storage'];
 const values={ascend_users:state.users,ascend_companies:state.companies,ascend_shipments:state.shipments,ascend_ncts_records:state.ncts};
 const cache=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,JSON.stringify(v)]));
 const session={ascend_session:JSON.stringify(state.user),ascend_logistics_demo_customer:JSON.stringify(state.shipments),ascend_logistics_demo_staff:JSON.stringify(state.shipments),ascend_logistics_demo_companies:JSON.stringify(state.companies),ascend_ncts_role_demo:JSON.stringify(state.ncts)};
 const mapping={ascend_users:'users',ascend_companies:'companies',ascend_shipments:'shipments',ascend_ncts_records:'ncts',ascend_logistics_demo_staff:'shipments',ascend_logistics_demo_companies:'companies',ascend_ncts_role_demo:'ncts'};
 let queue=Promise.resolve();
 function status(text){let note=document.getElementById('serverSaveStatus');if(!note){note=document.createElement('p');note.id='serverSaveStatus';note.setAttribute('role','status');note.className='no-print';document.body.append(note);}note.textContent=text;}
 function save(key,value){if(!mapping[key])return;if(['Görüntüleme','Müşteri'].includes(state.user.role))return;
 queue=queue.then(async()=>{const res=await fetch('/api/tenant/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({[mapping[key]]:JSON.parse(value)})});if(!res.ok)throw Error('Sunucu kaydı tamamlanamadı.');}).catch(e=>status(e.message));}
 window.portalLocal={getItem:k=>k==='ascend-portal-theme'?nativeStorage.getItem(k):cache[k]??null,setItem(k,v){if(k==='ascend-portal-theme'){nativeStorage.setItem(k,v);return;}cache[k]=String(v);save(k,v);},removeItem:k=>delete cache[k]};
 window.portalSession={getItem:k=>session[k]??null,setItem(k,v){session[k]=String(v);save(k,v);},removeItem:k=>delete session[k]};
 window.portalSavePending=()=>queue;
 window.addEventListener('DOMContentLoaded',()=>{for(const b of document.querySelectorAll('button'))if(/^Çıkış(?: Yap)?$/.test(b.textContent.trim()))b.onclick=async()=>{await queue;await fetch('/api/tenant/logout',{method:'POST'});location.href='index.html';};});
})();
