import {mkdir,copyFile,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
// Fingerprinted assets refresh phone caches without versioned experience URLs.
const compiled=new Map();
const fingerprint=(name,content)=>name.replace(/\.(js|css)$/,`.${createHash('sha256').update(content).digest('hex').slice(0,12)}.$1`);
async function compile(name){
  if(compiled.has(name))return compiled.get(name);
  let content=await readFile(resolve(root,name),'utf8');
  const dependencies=[...content.matchAll(/from '(\.\/[^']+\.js)'/g)];
  for(const [,dependency] of dependencies){const built=await compile(dependency.slice(2));content=content.replaceAll(dependency,'./'+built);}
  const output=fingerprint(name,content);await writeFile(resolve(dist,output),content);compiled.set(name,output);return output;
}
const app=await compile('app.js'),css=await compile('style.css');
const html=(await readFile(resolve(root,'index.html'),'utf8')).replace('./app.js','./'+app).replace('./style.css','./'+css);
await writeFile(resolve(dist,'index.html'),html);
await cp(resolve(root,'assets'),resolve(dist,'assets'),{recursive:true});
await copyFile(resolve(root,'.nojekyll'),resolve(dist,'.nojekyll'));
console.log('Static site built in dist/');
