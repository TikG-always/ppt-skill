import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const checks=[];
const modules=process.env.RUNTIME_NODE_MODULES;
try{if(!modules)throw Error('RUNTIME_NODE_MODULES未设置');const require=createRequire(path.join(path.resolve(modules),'__loader.cjs'));checks.push({name:'artifact-tool',ok:true,path:require.resolve('@oai/artifact-tool')});}catch(e){checks.push({name:'artifact-tool',ok:false,reason:e.message});}
for(let key of ['RUNTIME_PYTHON','PRESENTATIONS_SKILL_DIR']){let value=process.env[key];let target=key==='PRESENTATIONS_SKILL_DIR'&&value?path.join(value,'container_tools/artifact_tool_utils.mjs'):value;checks.push({name:key,ok:!!target&&fs.existsSync(target)});}
console.log(JSON.stringify({status:checks.every(c=>c.ok)?'ready':'missing-dependencies',checks},null,2));if(checks.some(c=>!c.ok))process.exitCode=2;
