import {extractMail} from './mail-extract.mjs';
process.on('message',async data=>{try{const result=await extractMail(Buffer.from(data.base64,'base64'));process.send({result},()=>process.exit(0));}catch{process.send({error:'Mail veya ekler okunamadı. Dosya türünü ve boyutunu kontrol edin.'},()=>process.exit(1));}});
