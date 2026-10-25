import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {buildSlide} from './components/index.mjs';

const [input,output]=process.argv.slice(2);
if(!input||!output)throw Error('Usage: node scripts/build.mjs <input.json> <output-directory>');
const mods=process.env.RUNTIME_NODE_MODULES;
if(!mods)throw Error('Set RUNTIME_NODE_MODULES to the directory returned by Codex load_workspace_dependencies.');
const require=createRequire(path.join(path.resolve(mods),'__ppt_loader.cjs'));
const {Presentation,PresentationFile}=await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const config=JSON.parse(await fs.readFile(input,'utf8'));if(!Array.isArray(config.slides)||!config.slides.length)throw Error('Input needs slides[]');
const out=path.resolve(output);await fs.mkdir(out,{recursive:true});const candidate=path.join(out,'candidate.pptx');try{await fs.access(candidate);throw Error('Output already exists. Use a new build directory.');}catch(e){if(e.code!=='ENOENT')throw e;}
const p=Presentation.create({slideSize:{width:1280,height:720}});
for(let i=0;i<config.slides.length;i++)await buildSlide(p,config.slides[i],i+1);
await(await PresentationFile.exportPptx(p)).save(candidate);
await fs.writeFile(path.join(out,'input-resolved.json'),JSON.stringify(config,null,2));
console.log(candidate);
