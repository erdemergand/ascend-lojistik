import {offerService} from './offers.mjs';
import {createMailTransport} from './smtp-transport.mjs';
import {quoteService} from './quotes.mjs';
import {portalOperations} from './operations.mjs';
import { createTenantStore } from './tenant-store.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const assets = new Map([
  ['/quote-center.html','quote-center.html'],
  ['/offer-center.html','offer-center.html'],
  ['/control-center.html','control-center.html'],
  ['/world-countries.svg','world-countries.svg'],
  ['/tenant-bridge.js','tenant-bridge.js'],
  ['/portal-theme.css','portal-theme.css'],
  ['/ascend-logo-dark.svg','ascend-logo-dark.svg'],
  ['/ascend-logo-light.svg','ascend-logo-light.svg'],
  ['/dm-sans-0.ttf','dm-sans-0.ttf'],
  ['/dm-sans-1.ttf','dm-sans-1.ttf'],
  ['/dm-sans-2.ttf','dm-sans-2.ttf'],
  ['/dm-sans-3.ttf','dm-sans-3.ttf'],
  ['/manrope-0.ttf','manrope-0.ttf'],
  ['/manrope-1.ttf','manrope-1.ttf'],
  ['/manrope-2.ttf','manrope-2.ttf'],
  ['/manrope-3.ttf','manrope-3.ttf'],
  ['/portal-fonts.css','portal-fonts.css'],
  ['/portal-theme.js','portal-theme.js'],
  ['/space-grotesk-0.ttf','space-grotesk-0.ttf'],
  ['/space-grotesk-1.ttf','space-grotesk-1.ttf'],
  ['/space-grotesk-2.ttf','space-grotesk-2.ttf'],
  ['/role-preview.html','role-preview.html'],
  ['/portal-design.css','portal-design.css'],
  ['/portal-reports.js','portal-reports.js'],
  ['/world-map.svg','world-map.svg'],
  ['/shared-portal.js', 'shared-portal.js'],
  ['/notification-templates.js', 'notification-templates.js'],
  ['/account-ledger.js', 'account-ledger.js'],
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/01_NCTS_BRANDED_v15.html', '01_NCTS_BRANDED_v15.html'],
  ['/02_LOJISTIK_PORTAL_BRANDED_v14.html', '02_LOJISTIK_PORTAL_BRANDED_v14.html'],
  ['/03_KULLANICI_YONETIMI.html', '03_KULLANICI_YONETIMI.html'],
  ['/ascend_logo_correct.png', 'ascend_logo_correct.png'],
]);
const digest = (value) => createHash('sha256').update(value).digest();

export async function createPortalServer(env = process.env) {
  const preview = env.PORTAL_PREVIEW_ENABLED === 'true';
  const username = env.PORTAL_PREVIEW_USER ?? '';
  const password = env.PORTAL_PREVIEW_PASSWORD ?? '';
  if (preview && (!username || username.includes(':') || password.length < 24)) {
    throw new Error('Preview requires a username without a colon and a password of at least 24 characters.');
  }
  // Read the complete release before declaring readiness. Never serve arbitrary paths.
  const files = new Map();
  if (preview) {
    for (const name of new Set(assets.values())) {
      files.set(name, await readFile(new URL(`./prototype/${name}`, import.meta.url)));
    }
  }
  const tenants=await createTenantStore(env.PORTAL_DATA_FILE);
  const operations=portalOperations(tenants),quotes=quoteService(tenants),offers=offerService(tenants),intakeLimits=new Map();
  const mailTransport=createMailTransport(env);let mailTimer;if(mailTransport){mailTimer=setInterval(()=>operations.deliver(mailTransport).catch(()=>tenants.database.audit('system','mail.worker-failed')),60000);mailTimer.unref();}
  const expected = digest(`Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  const server=createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    const send = (status, body, type = 'text/plain; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(req.method) && !req.url.startsWith('/api/tenant/')&&!req.url.startsWith('/api/quote-request')) {
      res.setHeader('Allow', 'GET, HEAD');
      return send(405, 'Method not allowed');
    }
    let pathname;
    try { pathname = new URL(req.url, 'http://localhost').pathname; }
    catch { return send(400, 'Bad request'); }
    if (pathname === '/healthz') return send(200, '{"status":"ok"}', 'application/json');
    if (pathname === '/robots.txt') return send(200, 'User-agent: *\nDisallow: /\n');
    if (!preview) return send(503, 'Portal önizlemesi kapalı.');
    if(pathname==='/api/quote-request'){
      const origin=env.PORTAL_QUOTE_ORIGIN||'https://www.ascendlojistik.com';
      if(env.PORTAL_PUBLIC_QUOTES!=='true')return send(503,JSON.stringify({error:'Teklif bağlantısı henüz etkin değil.'}),'application/json');
      if(req.headers.origin&&req.headers.origin!==origin)return send(403,'Origin denied');
      res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
      if(req.method==='OPTIONS')return send(204,'');if(req.method!=='POST')return send(405,'Method not allowed');
      const key=req.socket.remoteAddress,prior=intakeLimits.get(key),now=Date.now();const count=prior&&prior.until>now?prior.count:0;if(count>=10)return send(429,JSON.stringify({error:'Çok fazla talep. Daha sonra tekrar deneyin.'}),'application/json');intakeLimits.set(key,{count:count+1,until:now+3600000});
      try{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>30000)return send(413,'Too large');}const result=quotes.intake(JSON.parse(raw));return send(201,JSON.stringify(result),'application/json');}catch(e){return send(400,JSON.stringify({error:e.message}),'application/json');}
    }
    if (!timingSafeEqual(digest(req.headers.authorization ?? ''), expected)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Ascend internal preview", charset="UTF-8"');
      return send(401, 'Kimlik doğrulama gerekli.');
    }

    const principal=tenants.principal(req);
    if(pathname.startsWith('/api/tenant/')){
      const json=(status,data)=>send(status,JSON.stringify(data),'application/json; charset=utf-8');
      try{
        if(req.method==='POST' && (req.headers['sec-fetch-site']==='cross-site'||(req.headers.origin&&req.headers.origin!== 'http://'+req.headers.host)))return json(403,{error:'Origin denied'});
        let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>5000000)return json(413,{error:'Too large'});}body=JSON.parse(raw||'{}');}
        if(pathname==='/api/tenant/login'&&req.method==='POST'){const result=tenants.login(String(body.username||''),String(body.password||''),String(body.code||''));if(!result)return json(401,{error:'Kullanıcı adı veya şifre hatalı.'});res.setHeader('Set-Cookie','ascend_sid='+result.token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800');return json(200,result.user);}
        if(pathname==='/api/tenant/security/reset-complete'&&req.method==='POST')return json(200,await tenants.security('reset-complete',null,body));
        if(!principal)return json(401,{error:'Giriş gerekli'});
        if(pathname==='/api/tenant/logout'&&req.method==='POST'){tenants.logout(req);res.setHeader('Set-Cookie','ascend_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(200,{});}
        if(pathname==='/api/tenant/data'&&req.method==='GET')return json(200,tenants.data(principal));
        if(pathname==='/api/tenant/sync'&&req.method==='POST'){if(!Number.isInteger(body._revision))return json(409,{error:'Sayfayı yenileyin: kayıt sürümü gerekli.'});await tenants.sync(principal,body);return json(200,{revision:tenants.revision()});}
        if(pathname.startsWith('/api/tenant/security/')&&req.method==='POST')return json(200,await tenants.security(pathname.split('/').pop(),principal,body));
        if(pathname==='/api/tenant/offers'&&req.method==='GET')return json(200,offers.list(principal));
        if(pathname==='/api/tenant/offers/save'&&req.method==='POST')return json(200,offers.save(principal,body));
        if(pathname==='/api/tenant/offers/send'&&req.method==='POST')return json(200,offers.send(principal,body));
        if(pathname==='/api/tenant/quotes'&&req.method==='GET')return json(200,quotes.list(principal));
        if(pathname==='/api/tenant/quotes'&&req.method==='POST')return json(201,quotes.create(principal,body));
        if(pathname==='/api/tenant/quotes/prepare'&&req.method==='POST')return json(200,quotes.prepare(body.id,principal));
        if(pathname==='/api/tenant/quotes/approve'&&req.method==='POST')return json(200,quotes.approve(principal,body));
        if(pathname==='/api/tenant/audit'&&req.method==='GET')return json(200,operations.audit(principal));
        if(pathname==='/api/tenant/backup'&&req.method==='POST')return json(200,await operations.backup(principal));
        if(pathname==='/api/tenant/recipients'&&req.method==='GET'){const q=new URL(req.url,'http://localhost').searchParams;return json(200,operations.recipients(principal,q.get('module'),q.get('record'),q.get('event')));}
        if(pathname==='/api/tenant/outbox'&&req.method==='GET')return json(200,operations.outbox(principal));
        if(pathname==='/api/tenant/outbox'&&req.method==='POST')return json(200,operations.queue(principal,body));
        if(pathname==='/api/tenant/archive'&&req.method==='GET'){const query=new URL(req.url,'http://localhost').searchParams;return json(200,operations.list(principal,query.get('module'),query.get('record')));}
        if(pathname==='/api/tenant/archive'&&req.method==='POST')return json(200,operations.upload(principal,body));
        if(pathname==='/api/tenant/archive/publish'&&req.method==='POST')return json(200,operations.publish(principal,body));
        if(pathname.startsWith('/api/tenant/archive/file/')&&req.method==='GET'){const doc=operations.download(principal,pathname.split('/').pop());res.setHeader('Content-Disposition',"attachment; filename*=UTF-8''"+encodeURIComponent(doc.name));return send(200,doc.body,doc.mime);}
        if(pathname.startsWith('/api/tenant/document/')&&req.method==='GET'){
          const [,module,id]=pathname.match(/^\/api\/tenant\/document\/(shipments|ncts)\/(.+)$/)||[];
          if(!module)return json(404,{error:'Belge bulunamadı'});
          const record=tenants.records(principal,module).find(r=>String(r.id||r.fileNo||r.no)===decodeURIComponent(id));
          if(!record)return json(404,{error:'Belge bulunamadı'});return json(200,record);
        }
        return json(404,{error:'Not found'});
      }catch(error){return json(error.status||400,{error:error.status===403?'Bu işlem için yetkiniz yok.':error.message||'İşlem kaydedilemedi.'});}
    }
    if(principal&&tenants.customer(principal)&&['/03_KULLANICI_YONETIMI.html','/role-preview.html'].includes(pathname))return send(403,'Bu sayfaya erişim yetkiniz yok.');

    const filename = assets.get(pathname);
    if (!filename) return send(404, 'Not found');
    let content=files.get(filename);
    if(principal && (filename.endsWith('.html')||filename.endsWith('.js'))){
      content=content.toString().replace(/\blocalStorage\b/g,'portalLocal').replace(/\bsessionStorage\b/g,'portalSession');
      if(filename.endsWith('.html')){
        const state=JSON.stringify(tenants.data(principal)).replace(/</g,'\\u003c');
        content=content.replace(/<head([^>]*)>/,'<head$1><script>window.portalBootstrap='+state+';</script><script src="tenant-bridge.js"></script>');
      }
    }
    return send(200, content, filename.endsWith('.ttf') ? 'font/ttf' : filename.endsWith('.css') ? 'text/css; charset=utf-8' : filename.endsWith('.svg') ? 'image/svg+xml' : filename.endsWith('.png') ? 'image/png' : filename.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8');
  });
  server.once('close',()=>{clearInterval(mailTimer);mailTransport?.close();tenants.close();});
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const server = await createPortalServer();
  server.listen(port, '0.0.0.0', () => console.log(`Ascend portal listening on port ${port}`));
  for (const signal of ['SIGTERM', 'SIGINT']) {
    process.once(signal, () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(1), 10000).unref();
    });
  }
}
