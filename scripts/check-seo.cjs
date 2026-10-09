const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name.startsWith('.'))continue;const p=path.join(dir,e.name);if(e.isDirectory()&&!['assets','tests','scripts','auditoria-competitiva','node_modules'].includes(e.name))walk(p);else if(e.name.endsWith('.html'))files.push(p)}}walk(root);
const titles=new Set(),urls=new Set(),sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');let faqs=0;
const norm=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
for(const file of files){const h=fs.readFileSync(file,'utf8');if(h.includes('http-equiv="refresh"'))continue;
 const title=h.match(/<title>([^<]+)<\/title>/)?.[1],description=h.match(/<meta name="description" content="([^"]+)"/)?.[1],canonical=h.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
 assert.ok(title&&description&&canonical,file+': metadados');assert.ok(!titles.has(title),file+': título duplicado');titles.add(title);assert.ok(!urls.has(canonical),file+': canonical duplicado');urls.add(canonical);assert.ok(sitemap.includes('<loc>'+canonical+'</loc>'),file+': sitemap');assert.ok(h.includes('property="og:url" content="'+canonical+'"'),file+': og:url');
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,file+': ids duplicados');
 const visible=norm(h.replace(/<script[\s\S]*?<\/script>/g,''));
 function visit(o){if(!o||typeof o!=='object')return;if(o['@type']==='Question'){faqs++;assert.ok(visible.includes(norm(o.name)),file+': pergunta invisível '+o.name);assert.ok(visible.includes(norm(o.acceptedAnswer.text)),file+': resposta diferente '+o.name);}Object.values(o).forEach(v=>{if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v)})}
 for(const match of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))visit(JSON.parse(match[1]));
 for(const m of h.matchAll(/<img\b[^>]*>/g)){assert.ok(/\balt="[^"]*"/.test(m[0]),file+': alt');assert.ok(/\bwidth="\d+"/.test(m[0])&&/\bheight="\d+"/.test(m[0]),file+': dimensões');}
}
assert.equal([...sitemap.matchAll(/<loc>/g)].length,urls.size,'sitemap sem URLs extras');console.log(urls.size+' páginas: metadados únicos, sitemap, IDs, imagens e '+faqs+' respostas FAQ coerentes.');
