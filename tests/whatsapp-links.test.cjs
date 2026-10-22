const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
test('direct WhatsApp buttons contain only a short origin message without empty fields',()=>{
  const routes=[...fs.readFileSync('sitemap.xml','utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname);let count=0;
  for(const route of routes){const file=route==='/'?'index.html':route.slice(1)+'index.html';for(const match of fs.readFileSync(file,'utf8').matchAll(/href="(https:\/\/wa\.me\/5519992445953[^\"]*)"/g)){const message=new URL(match[1].replaceAll('&amp;','&')).searchParams.get('text');assert.ok(message&&message.includes('Origem:'),file);assert.ok(message.includes('('+route+')'),file);assert.ok(message.length<=180,file+': message too long');assert.doesNotMatch(message,/[\[\]*\n]|MATERIAL|COLETA|ENTREGA|HORÁRIO DESEJADO/,file);count++;}}
  assert.equal(count,54);
});
