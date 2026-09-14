(()=>{
 const key='ascend-portal-theme',root=document.documentElement;
 const system=matchMedia('(prefers-color-scheme: dark)');
 const stored=localStorage.getItem(key);root.dataset.theme=stored|| (system.matches?'dark':'light');
 function apply(mode){root.dataset.theme=mode;localStorage.setItem(key,mode);refresh();}
 function refresh(){const dark=root.dataset.theme==='dark';document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.textContent=dark?'☀ Gündüz modu':'☾ Gece modu';b.setAttribute('aria-pressed',String(dark));});document.querySelectorAll('header img,.portal-home .hero>img').forEach(img=>{img.src=dark?'ascend-logo-dark.svg':'ascend-logo-light.svg';img.alt='ASCEND Lojistik';});}
 document.addEventListener('DOMContentLoaded',()=>{const host=document.querySelector('header')||document.querySelector('.hero')||document.body;const b=document.createElement('button');b.type='button';b.className='secondary no-print theme-toggle';b.dataset.themeToggle='';b.onclick=()=>apply(root.dataset.theme==='dark'?'light':'dark');host.append(b);document.querySelectorAll('.field').forEach(f=>{const label=f.querySelector('label'),input=f.querySelector('input,select,textarea');if(label&&input?.id)label.htmlFor=input.id;});document.querySelectorAll('textarea').forEach(e=>{const grow=()=>{e.style.height='auto';e.style.height=Math.max(96,e.scrollHeight)+'px';};e.addEventListener('input',grow);grow();});refresh();});
 window.addEventListener('storage',e=>{if(e.key===key&&e.newValue){root.dataset.theme=e.newValue;refresh();}});
 system.addEventListener('change',e=>{if(!localStorage.getItem(key)){root.dataset.theme=e.matches?'dark':'light';refresh();}});
})();