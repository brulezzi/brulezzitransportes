const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function message(query){const link={href:'https://wa.me/5519992445953?text=Ol%C3%A1'};vm.runInNewContext(fs.readFileSync('script.js','utf8'),{URL,URLSearchParams,window:{location:{search:query}},document:{getElementById(){return null},querySelectorAll(){return [link]},addEventListener(name,fn){if(name==='DOMContentLoaded')fn()}}});return new URL(link.href).searchParams.get('text')}
test('only approved Google campaign markers are added, without forwarding identifiers',()=>{
 for(const city of ['campinas','indaiatuba','santos'])assert.equal(message('?utm_source=google&utm_medium=cpc&utm_campaign=brz_'+city+'&gclid=private'),'Olá\nReferência: BRZ-'+city.toUpperCase());
 assert.equal(message('?utm_source=google&utm_medium=cpc&utm_campaign=unknown'),'Olá');
 assert.equal(message('?utm_campaign=brz_santos'),'Olá');
 assert.equal(message(''),'Olá');
});
