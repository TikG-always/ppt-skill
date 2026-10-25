import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const [candidate,finalFile,receipt]=process.argv.slice(2);
if(!candidate||!finalFile||!receipt)throw Error('Usage: node scripts/finalize.mjs <candidate.pptx> <final.pptx> <private-receipt.json>');
const skill=process.env.PRESENTATIONS_SKILL_DIR,python=process.env.RUNTIME_PYTHON;
if(!skill||!python)throw Error('Set PRESENTATIONS_SKILL_DIR and RUNTIME_PYTHON from this Codex environment.');
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
const root=path.resolve(process.env.PPT_WORKSPACE_DIR||process.cwd());
await finalizePresentation({workspaceDir:root,candidatePath:path.resolve(candidate),finalPath:path.resolve(finalFile),pythonExecutable:python,integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','12192000,6858000'],fontPolicy:{basis:'design',families:['Microsoft YaHei']},verifyArtifactToolImport:true,receiptPath:path.resolve(receipt)});
