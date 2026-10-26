import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

// Structural preflight only: does not judge scientific truth or rendered appearance.
export function checkStoryboard(deck) {
  const errors=[];
  const fail=(id,m)=>errors.push(`slide ${id}: ${m}`);
  if(!deck.styleProfile?.roles) errors.push('styleProfile.roles is required');
  if(!Array.isArray(deck.slides)||!deck.slides.length) errors.push('slides is required');
  for(const s of deck.slides||[]) {
    const id=s.id;
    for(const k of ['topic','takeaway','relation','relationEvidence']) if(!s[k]) fail(id,`missing ${k}`);
    if(!['strict','preserve-edit','structure','none'].includes(s.referenceUse)) fail(id,'referenceUse is required');
    if(!s.layoutFamily||!s.layoutReason) fail(id,'layoutFamily/layoutReason is required');
    if(s.topSummary&&s.topSummary===s.bottomTakeaway) fail(id,'duplicate top and bottom summaries');
    const nodes=s.logic?.nodes||[], ids=new Set(nodes.map(n=>n.id));
    if(!nodes.length) fail(id,'logic.nodes is empty');
    if(ids.size!==nodes.length) fail(id,'duplicate node id');
    for(const n of nodes) if(n.parent&&!ids.has(n.parent)) fail(id,`unknown parent ${n.parent}`);
    for(const e of s.logic?.edges||[]) {
      if(!ids.has(e.from)||!ids.has(e.to)) fail(id,'edge has unknown endpoint');
      if(!e.relation||!e.evidence) fail(id,'edge lacks relation/evidence');
    }
    const t=s.template;
    if(s.referenceUse!=='none'&&(!t?.referenceId||!t?.sourcePath||!t?.preserved?.length)) fail(id,'template reference/reuse explanation missing');
    const assigned=new Set();
    for(const slot of t?.slots||[]) {
      const b=slot.bounds;
      if(!Array.isArray(b)||b.length!==4||!b.every(Number.isFinite)||b[0]<0||b[1]<0||b[2]<=0||b[3]<=0||b[0]+b[2]>1280||b[1]+b[3]>720) fail(id,`invalid slot bounds ${slot.id}`);
      for(const n of slot.nodeIds||[]) {if(!ids.has(n)) fail(id,`unknown slot node ${n}`);assigned.add(n);}
    }
    for(const n of ids) if(!assigned.has(n)) fail(id,`unassigned node ${n}`);
    if(s.visibleTextPolicy?.noMicroCaptions!==true||!s.visibleTextPolicy?.textColors?.length||!s.visibleTextPolicy?.colorBasis) fail(id,'visibleTextPolicy incomplete');
  }
  return errors;
}
export function layoutWarnings(deck) {
  const warnings=[];
  for(let i=2;i<(deck.slides||[]).length;i++) {
    const a=deck.slides.slice(i-2,i+1);
    if(a[0].layoutFamily&&a.every(s=>s.layoutFamily===a[0].layoutFamily)&&!a[2].reuseReason)
      warnings.push(`slide ${a[2].id}: three consecutive ${a[0].layoutFamily} layouts; review semantic necessity`);
  }
  return warnings;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const deck=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
  const errors=checkStoryboard(deck);
  console.log(JSON.stringify({ok:!errors.length,errors,warnings:layoutWarnings(deck)},null,2));
  if(errors.length) process.exitCode=1;
}
