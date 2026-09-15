import {createHmac,randomBytes,createCipheriv,createDecipheriv} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32(bytes){let bits=0,value=0,out='';for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=5){out+=alphabet[(value>>>(bits-5))&31];bits-=5;}}if(bits)out+=alphabet[(value<<(5-bits))&31];return out;}
function decode(s){let bits=0,value=0,out=[];for(const c of s){value=(value<<5)|alphabet.indexOf(c);bits+=5;if(bits>=8){out.push((value>>>(bits-8))&255);bits-=8;}}return Buffer.from(out);}
export function totp(secret,time=Date.now()){const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(time/30000)));const mac=createHmac('sha1',decode(secret)).update(counter).digest();const offset=mac[19]&15;return String((mac.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');}
export function verifyTotp(secret,code,last=-1,time=Date.now()){for(const delta of [-1,0,1]){const step=Math.floor(time/30000)+delta;if(step>last&&totp(secret,step*30000)===String(code))return step;}return null;}
export async function secretVault(path){let key;if(path){const filename=path+'.key';await mkdir(dirname(filename),{recursive:true});try{key=await readFile(filename);}catch(e){if(e.code!=='ENOENT')throw e;key=randomBytes(32);await writeFile(filename,key,{mode:0o600,flag:'wx'});}}else key=randomBytes(32);
return {encrypt(text){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);return Buffer.concat([iv,cipher.update(text,'utf8'),cipher.final(),cipher.getAuthTag()]).toString('base64');},decrypt(text){const data=Buffer.from(text,'base64'),decipher=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));decipher.setAuthTag(data.subarray(-16));return Buffer.concat([decipher.update(data.subarray(12,-16)),decipher.final()]).toString('utf8');}};
}
