import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../prototype/03_KULLANICI_YONETIMI.html',import.meta.url),'utf8');
const save=html.slice(html.indexOf('function saveUser(){'),html.indexOf('function editUser('));
function setup(companyValue,role='Görüntüleme'){
 let saved;const field=value=>({value,setAttribute(){},removeAttribute(){},focus(){}});
 const ctx={uName:field('Test'),uUsername:field('test'),uEmail:field('test@example.com'),uPassword:field('TestPassword'),uRole:field(role),uCompany:field(companyValue),companyList:()=>[{id:'c1',name:'Test Firma'}],editUserIndex:null,msg:{},users:()=>[],setUsers:list=>saved=list,cancelUserEdit(){},render(){}};
 vm.createContext(ctx);vm.runInContext(save+';saveUser()',ctx);return {ctx,saved};
}
test('view-only users require a registered company, including forged IDs',()=>{for(const id of ['', 'missing']){const {saved,ctx}=setup(id);assert.equal(saved,undefined);assert.match(ctx.msg.textContent,/firma seçmelisiniz/);}});
test('company association is saved for customer and omitted for operation staff',()=>{assert.equal(setup('c1').saved[0].companyId,'c1');assert.equal(setup('c1').saved[0].companyName,'Test Firma');assert.equal(setup('c1','Operasyon').saved[0].companyId,null);});
