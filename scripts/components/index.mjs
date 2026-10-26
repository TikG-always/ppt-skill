import {validateTimeline,timelinePage} from './timeline.mjs';
import fs from 'node:fs/promises';

export const themes={
  academic:{font:'Microsoft YaHei',ink:'#163D6B',accent:'#1C58AB',muted:'#657A91',pale:'#EFF4FB',colors:['#244974','#4B879D','#AD493D','#D57A67']},
  teal:{font:'Microsoft YaHei',ink:'#164D50',accent:'#16847E',muted:'#638283',pale:'#EFF7F5',colors:['#285D77','#319587','#C58D41','#738867']}
};
export function rect(s,name,x,y,w,h,fill,geom='rect',stroke='none',rotation=0){return s.shapes.add({name,geometry:geom,position:{left:x,top:y,width:w,height:h,rotation},fill,line:{fill:stroke,width:stroke==='none'?0:1}});}
export function text(s,t,name,value,x,y,w,h,size=24,color=t.ink,align='left',rotation=0,bold=true){
  let o=rect(s,name,x,y,w,h,'none','rect','none',rotation);o.text=value;o.text.insets=0;o.text.style={typeface:t.font,fontSize:size,bold,color,alignment:align,verticalAlignment:'middle'};return o;
}
function polygon(s,name,pts,fill){let x=Math.min(...pts.map(p=>p[0])),y=Math.min(...pts.map(p=>p[1])),w=Math.max(...pts.map(p=>p[0]))-x,h=Math.max(...pts.map(p=>p[1]))-y;return s.shapes.add({name,geometry:'custom',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0},customPaths:[{width:w,height:h,commands:[{moveTo:{x:pts[0][0]-x,y:pts[0][1]-y}},...pts.slice(1).map(p=>({lineTo:{x:p[0]-x,y:p[1]-y}})),{close:{}}]}]});}
function shade(hex,k){return '#'+hex.slice(1).match(/../g).map(v=>Math.min(255,Math.round(parseInt(v,16)*k)).toString(16).padStart(2,'0')).join('');}
function point(cx,cy,r,a){return [cx+r*Math.cos(a*Math.PI/180),cy+r*Math.sin(a*Math.PI/180)];}
function arc(s,id,cx,cy,r,ri,start,end,color){let pts=[];for(let a=start;a<=end;a++)pts.push(point(cx,cy,r,a));pts.push(point(cx,cy,r,end));for(let a=end;a>=start;a--)pts.push(point(cx,cy,ri,a));polygon(s,id,pts,color);}
export function arcText(s,t,id,label,cx,cy,r,mid,size,color){let chars=[...label.replace(/\s/g,'')];let reverse=mid>0&&mid<180;let step=(size+3)/r*180/Math.PI;chars.forEach((ch,i)=>{let a=mid+(reverse?-1:1)*(i-(chars.length-1)/2)*step;let [x,y]=point(cx,cy,r,a);text(s,t,id+'.char-'+i,ch,x-size*.7,y-size*.7,size*1.4,size*1.4,size,color,'center',a+(reverse?-90:90));});}
function base(s,t,spec,index){s.background.fill='#FFFFFF';text(s,t,'page.title',spec.title,46,28,1170,62,42);rect(s,'page.rule',46,103,1188,2,'#CBD7E4');rect(s,'page.accent',46,100,175,5,t.accent);if(spec.subtitle)text(s,t,'page.subtitle',spec.subtitle,48,116,1170,34,21,t.muted);rect(s,'page.footer',46,681,1188,1,'#DCE4EB');text(s,t,'page.number',String(index).padStart(2,'0'),1180,685,52,24,14,t.muted,'right');}
function reqString(v,key,max){if(typeof v!=='string'||!v.trim())throw Error(key+' must be nonempty text');if([...v.replace(/\s/g,'')].length>max)throw Error(key+' exceeds capacity '+max+' characters; revise or select another layout');}
export function validateSpec(spec){
  reqString(spec.title,'title',26);if(spec.subtitle)reqString(spec.subtitle,'subtitle',50);
  if(spec.type==='timeline-six'){validateTimeline(spec);return;}
  if(!themes[spec.theme||'academic'])throw Error('Unknown theme');
  if(spec.type==='ribbon-ring'){
    reqString(spec.center,'center',14);if(spec.centerNote)reqString(spec.centerNote,'centerNote',12);
    if(spec.items?.length!==4)throw Error('ribbon-ring requires exactly 4 parallel items');
    spec.items.forEach((o,i)=>{reqString(o.label,'items.'+i+'.label',10);reqString(o.description,'items.'+i+'.description',36);});
  }else if(spec.type==='three-columns'){
    if(spec.columns?.length!==3)throw Error('three-columns requires exactly 3 columns');
    spec.columns.forEach((o,i)=>{reqString(o.heading,'column heading',9);reqString(o.title,'column title',12);if(o.bullets?.length!==3)throw Error('Each column requires 3 bullets');o.bullets.forEach(v=>reqString(v,'bullet',14));reqString(o.caption,'caption',18);if(o.image){reqString(o.image.path,'image path',1000);reqString(o.image.source,'image source',1000);}else {if(o.diagram?.length!==3)throw Error('A column needs an image or a 3-node diagram');o.diagram.forEach(v=>reqString(v,'diagram label',7));}});
  }else if(spec.type==='tiered-pyramid'){
    if(spec.levels?.length!==3)throw Error('tiered-pyramid requires 3 levels ordered top to bottom');spec.levels.forEach(o=>{reqString(o.title,'level title',14);reqString(o.body,'level body',36);reqString(o.keyword,'level keyword',7);});
  }else throw Error('Unknown component type '+spec.type);
}
export function ringComponent(s,t,spec,{cx=640,cy=411,r=229}={}){
  const ri=r*.65;rect(s,'ring.back',cx-r-12,cy-r-12,2*r+24,2*r+24,'#F4F6F8','ellipse');
  for(let i=0;i<4;i++){let start=-87+i*90,col=t.colors[i];arc(s,'ring.segment-'+i,cx,cy,r,ri,start,start+82,col);polygon(s,'ring.fold-'+i,[point(cx,cy,r,start+82),point(cx,cy,r*.91,start+90),point(cx,cy,r*.84,start+88),point(cx,cy,r*.88,start+77)],shade(col,.72));let mid=-46+i*90;arcText(s,t,'ring.label-'+i,spec.items[i].label,cx,cy,(r+ri)/2,mid,26,'#FFFFFF');}
  rect(s,'ring.shadow',cx-119,cy-112,238,238,'#D7DEE4','ellipse');rect(s,'ring.core',cx-120,cy-120,240,240,'#FFFFFF','ellipse','#D9E1E8');text(s,t,'ring.center',spec.center,cx-110,cy-66,220,110,32,t.ink,'center');if(spec.centerNote)text(s,t,'ring.note',spec.centerNote,cx-105,cy+51,210,34,18,t.muted,'center',0,false);
}
export function ringPage(s,t,spec,index){base(s,t,spec,index);ringComponent(s,t,spec);let pos=[[946,229],[946,500],[52,500],[52,229]];spec.items.forEach((o,i)=>{let[x,y]=pos[i];rect(s,'detail.rule-'+i,x,y,54,4,t.colors[i]);text(s,t,'detail.label-'+i,o.label,x,y+14,278,56,25,t.colors[i]);text(s,t,'detail.body-'+i,o.description,x,y+76,278,82,22,t.ink,'left',0,false);});}
function miniDiagram(s,t,id,nodes,x,y,w,h,color){let mid=x+w/2;rect(s,id+'.stem',mid-2,y+38,4,h-76,'#BED0DF');nodes.forEach((v,i)=>{let yy=y+i*(h-48)/2;rect(s,id+'.node-'+i,x+25,yy,w-50,48,i===1?color:t.pale,'roundRect');text(s,t,id+'.label-'+i,v,x+30,yy,w-60,48,23,i===1?'#FFFFFF':t.ink,'center');});}
export async function columnsPage(s,t,spec,index){base(s,t,spec,index);for(let i=0;i<3;i++){let o=spec.columns[i],x=48+i*400,w=384;let c=[t.accent,t.colors[1],t.colors[3]][i];text(s,t,'column.heading-'+i,o.heading,x,164,w,45,29,c,'center');rect(s,'column.frame-'+i,x,215,w,434,'#FFFFFF','rect','#CDD9E5');rect(s,'column.bar-'+i,x,215,w,53,c);text(s,t,'column.title-'+i,o.title,x+10,215,w-20,53,26,'#FFFFFF','center');o.bullets.forEach((b,j)=>{let yy=290+j*43;rect(s,'column.bullet-'+i+'-'+j,x+24,yy+11,7,7,c,'ellipse');text(s,t,'column.item-'+i+'-'+j,b,x+44,yy,w-65,35,23);});
    if(o.image){let bytes=await fs.readFile(o.image.path);s.images.add({name:'column.image-'+i,blob:new Uint8Array(bytes),contentType:o.image.path.toLowerCase().endsWith('.png')?'image/png':'image/jpeg',fit:'cover',position:{left:x+18,top:431,width:w-36,height:160}});}else miniDiagram(s,t,'column.diagram-'+i,o.diagram,x+27,427,w-54,172,c);
    text(s,t,'column.caption-'+i,o.caption,x+15,608,w-30,29,18,t.muted,'center',0,false);
  }}
export function pyramidPage(s,t,spec,index){base(s,t,spec,index);let colors=[t.colors[3],t.colors[1],t.accent];for(let i=0;i<3;i++){let y=181+i*153,h=130,c=colors[i],left=221-i*62,right=379+i*62,bLeft=left-52,bRight=right+52;polygon(s,'tier.band-'+i,[[right,y],[1160+i*18,y],[1202+i*12,y+h],[bRight,y+h]],c);polygon(s,'tier.front-'+i,[[left,y],[right,y],[bRight,y+h],[bLeft,y+h]],shade(c,.82));polygon(s,'tier.fold-'+i,[[left,y],[left+30,y],[left+44,y+h],[bLeft,y+h]],shade(c,.84));text(s,t,'tier.number-'+i,String(i+1).padStart(2,'0'),left-25,y+34,right-left+50,66,40,'#FFFFFF','center');text(s,t,'tier.title-'+i,spec.levels[i].title,570,y+15,500,47,31,'#FFFFFF');text(s,t,'tier.body-'+i,spec.levels[i].body,570,y+66,600,51,22,'#FFFFFF','left',0,false);}
  spec.levels.forEach((o,i)=>text(s,t,'tier.key-'+i,o.keyword,1072,190+i*153,125,40,16,'#FFFFFF','center',0,false));}
export async function buildSlide(p,spec,index){validateSpec(spec);let s=p.slides.add(),t=themes[spec.theme||'academic'];if(spec.type==='timeline-six')timelinePage(s,spec,index,{rect,text});if(spec.type==='ribbon-ring')ringPage(s,t,spec,index);if(spec.type==='three-columns')await columnsPage(s,t,spec,index);if(spec.type==='tiered-pyramid')pyramidPage(s,t,spec,index);s.speakerNotes.text=(spec.notes||'')+'\n'+(spec.columns||[]).filter(o=>o.image).map(o=>'图片：'+o.image.source+'；图注：'+o.caption).join('\n');return s;}
