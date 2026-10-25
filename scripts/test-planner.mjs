import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {plan} from './plan.mjs';
const example=JSON.parse(await fs.readFile(new URL('../examples/briefs.json',import.meta.url),'utf8'));
let count=0;
function test(name,fn){fn();count++;console.log('PASS '+name);}
function changed(fn){const b=structuredClone(example);fn(b);return plan(b);}
test('three appropriate selections',()=>assert.deepEqual(plan(example).decisions.map(x=>x.selected),['ribbon-ring','three-columns','tiered-pyramid']));
test('ring content retained',()=>assert.deepEqual(plan(example).deck.slides[0].items,example.slides[0].groups));
for(const relation of ['sequence','cycle','mixed','unknown'])test('reject '+relation,()=>assert.equal(changed(b=>b.slides[0].relation=relation).status,'unsupported'));
test('five directions retained by rejection',()=>assert.equal(changed(b=>b.slides[0].groups.push({...b.slides[0].groups[0]})).status,'unsupported'));
test('template conflict',()=>assert.equal(changed(b=>b.slides[0].requestedTemplate='tiered-pyramid').status,'conflict'));
test('missing evidence',()=>assert.equal(changed(b=>delete b.slides[0].evidence).status,'needs-content'));
test('overflow rejected',()=>assert.equal(changed(b=>b.slides[0].groups[0].label='很长的不可随意截断的完整学科名称').status,'needs-content'));
test('protected term missing',()=>assert.equal(changed(b=>b.slides[0].protectedTerms=['必须完整保留']).status,'conflict'));
test('notes do not satisfy protected text',()=>assert.equal(changed(b=>{b.slides[0].protectedTerms=['必须完整保留'];b.slides[0].notes='必须完整保留';}).status,'conflict'));
test('missing bullets not invented',()=>assert.equal(changed(b=>delete b.slides[1].groups[0].bullets).status,'needs-content'));
for(const mode of ['adapt','edit'])test('unsupported '+mode,()=>assert.equal(plan({...example,mode}).status,'unsupported'));
test('null page',()=>assert.equal(plan({mode:'create',slides:[null]}).status,'needs-content'));
test('null group',()=>assert.equal(changed(b=>b.slides[0].groups[0]=null).status,'needs-content'));
console.log(`${count} planner checks passed. Semantic reasoning itself requires Codex review.`);
