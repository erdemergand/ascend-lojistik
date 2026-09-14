const fs=require('fs');const geo=JSON.parse(fs.readFileSync('portal/assets/countries.geojson'));
const groups={
 '#e74652':'CAN USA IDN CHL RUS NOR TLS PER CRI VEN SUR ECU CUB NAM GIN LBR AGO BDI TUN MAR EGY JOR OMN QAT KHM THA LAO VNM PRK KOR MNG NPL KGZ IRN SYR ARM BLR POL AUT HUN LVA ALB CHE BEL NLD PRT ESP CHN TWN DNK GBR GEO MYS SVN SVK CZE JPN PRY YEM MNE TTO MKD SRB LBN TUR PAN PRI IRQ HRV',
 '#3498e0':'FJI KAZ UZB ARG COD SOM HTI DOM BHS FLK GRL ATF URY NIC HND SLV GTM BLZ BWA LSO ISR EST GRC LUX NCL SLB NZL AUS ISL PHL FIN KOS BIH RWA DJI SOL',
 '#36ae73':'TZA SAH KEN SDN ZAF MEX BRA GUY ZWE SEN MLI MRT BEN NGA CMR TGO GHA CIV GNB SLE BFA COG GAB GNQ ZMB MWI MOZ MDG PSX DZA ARE KWT VUT BGD PAK AFG TJK TKM BGR IRL ITA AZE ERI SAU LBY ETH SDS',
 '#e9bc35':'PNG BOL COL JAM NER CAF SWZ GMB MMR BTN SWE UKR MDA ROU LTU DEU LKA BRN CYP UGA',
 '#7eb9ea':'FRA CYN', '#b9c5ce':'ATA', '#ef7145':'TCD IND'};
const color={};for(const [c,ids] of Object.entries(groups))for(const id of ids.split(' '))color[id]=c;
let missing=[];const paths=geo.features.filter(f=>f.properties.ADM0_A3!=='ATA').map((f,i)=>{const id=f.properties.ADM0_A3;if(!color[id])missing.push(id);const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
const d=polygons.map(poly=>poly.map(ring=>ring.map(([x,y],j)=>(j?'L':'M')+((x+180)*2.5).toFixed(1)+' '+((85-y)*2.5).toFixed(1)).join(' ')+'Z').join(' ')).join(' ');
return '<path id="'+id+'" d="'+d+'" style="--country:'+ (color[id]||'#6497bc')+';animation-delay:-'+(i*.37%8).toFixed(2)+'s"><title>'+f.properties.NAME_TR+'</title></path>';});if(missing.length)throw Error('Missing colors '+missing);
fs.writeFileSync('portal/prototype/world-countries.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 370" role="img" aria-label="Bayrak renkleriyle dünya ülkeleri"><style>path{fill:var(--country);stroke:#61728b;stroke-width:.35;opacity:.58;animation:glow 8s ease-in-out infinite}@keyframes glow{0%,100%{opacity:.3}40%,60%{opacity:.94}}@media(prefers-reduced-motion:reduce){path{animation:none;opacity:.65}}</style>${paths.join('')}</svg>`);
