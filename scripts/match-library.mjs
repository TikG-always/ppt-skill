import fs from 'node:fs/promises';
import path from 'node:path';
const [catalogPath,relation,kind]=process.argv.slice(2);
if(!catalogPath||!relation)throw Error('Usage: node match-library.mjs <catalog.json> <relation> [kind]');
const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const root=path.resolve(path.dirname(catalogPath),catalog.library_root||'..');
const matches=catalog.items.filter(x=>x.relations.includes(relation)&&(!kind||x.kind===kind)).map(x=>({id:x.id,name:x.name,kind:x.kind,relations:x.relations,purpose:x.purpose,sourcePath:path.resolve(root,x.source_file),status:x.status,palette:x.palette||null,adaptation_notes:x.adaptation_notes}));
console.log(JSON.stringify({relation,matches,note:'候选须查看原图后决定；visual-reference不等于可编辑组件。'},null,2));
