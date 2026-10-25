import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateSpec} from './components/index.mjs';

const compact=v=>String(v??'').replace(/\s/g,'');
function visible(spec){let out=[spec.title,spec.subtitle,spec.center,spec.centerNote];for(let i of spec.items||[])out.push(i.label,i.description);for(let c of spec.columns||[])out.push(c.heading,c.title,...c.bullets,c.caption,...(c.diagram||[]));for(let l of spec.levels||[])out.push(l.title,l.body,l.keyword);return out.filter(Boolean).map(compact).join('\n');}
export function plan(brief){
  if(brief?.mode!=='create')return {status:'unsupported',reason:'本版仅实现文字生成(create)，不实现截图复现或原稿局部修改。'};
  if(!Array.isArray(brief.slides)||!brief.slides.length)return {status:'needs-content',reason:'需要至少一页经过语义整理的内容。'};
  const slides=[],decisions=[];
  for(let i=0;i<brief.slides.length;i++){
    const b=brief.slides[i];
    if(!b||typeof b!=='object')return {status:'needs-content',slide:i+1,reason:'页面必须为对象。'};
    const groups=b.groups;
    if(typeof b.evidence!=='string'||!b.evidence.trim())return {status:'needs-content',slide:i+1,reason:'缺少关系依据；由Codex从用户原文判断并记录，不能仅按组数选择。'};
    if(!Array.isArray(groups)||groups.some(g=>!g||typeof g!=='object'))return {status:'needs-content',slide:i+1,reason:'需要groups数组。'};
    let selected;
    if(b.relation==='parallel'&&groups.length===4&&typeof b.center==='string'&&b.center.trim())selected='ribbon-ring';
    if(b.relation==='parallel'&&groups.length===3)selected='three-columns';
    if(b.relation==='hierarchy'&&groups.length===3)selected='tiered-pyramid';
    if(!selected)return {status:'unsupported',slide:i+1,reason:`现有组件不适配关系 ${b.relation} 与 ${groups.length} 个节点；不得删减节点或改变关系。`};
    if(b.requestedTemplate&&b.requestedTemplate!==selected)return {status:'conflict',slide:i+1,reason:`指定模板 ${b.requestedTemplate} 与内容适配结果 ${selected} 冲突。`};
    let s={title:b.title,subtitle:b.subtitle,theme:b.theme||'academic',type:selected,notes:b.notes};
    if(selected==='ribbon-ring'){s.center=b.center;s.centerNote=b.centerNote;s.items=groups.map(g=>({label:g.label,description:g.description}));}
    if(selected==='three-columns')s.columns=groups.map(g=>({heading:g.label,title:g.title,bullets:g.bullets,caption:g.caption,...(g.image?{image:g.image}:{diagram:g.diagram})}));
    if(selected==='tiered-pyramid')s.levels=groups.map(g=>({title:g.label,body:g.description,keyword:g.keyword}));
    try{validateSpec(s);}catch(e){return {status:'needs-content',slide:i+1,reason:e.message};}
    if(b.protectedTerms!==undefined&&(!Array.isArray(b.protectedTerms)||b.protectedTerms.some(t=>typeof t!=='string'||!t.trim())))return {status:'needs-content',slide:i+1,reason:'protectedTerms必须为非空字符串数组。'};
    const missing=(b.protectedTerms||[]).filter(t=>!visible(s).includes(compact(t)));
    if(missing.length)return {status:'conflict',slide:i+1,reason:'必需保留内容缺失',missing};
    decisions.push({slide:i+1,selected,relation:b.relation,evidence:b.evidence,protectedTerms:b.protectedTerms||[],capacity:'pass'});slides.push(s);
  }
  return {status:'ready',decisions,deck:{slides}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [input,out]=process.argv.slice(2);if(!input||!out)throw Error('Usage: node scripts/plan.mjs <brief.json> <new-output-directory>');
  const result=plan(JSON.parse(await fs.readFile(input,'utf8')));await fs.mkdir(out,{recursive:false});
  const {deck,...decision}=result;await fs.writeFile(path.join(out,'decision.json'),JSON.stringify(decision,null,2));if(deck)await fs.writeFile(path.join(out,'deck.json'),JSON.stringify(deck,null,2));
  console.log(JSON.stringify(decision,null,2));if(result.status!=='ready')process.exitCode=2;
}
