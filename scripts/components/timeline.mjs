// MAT-020: colors sampled from flat regions, not an inferred Office theme.
export const timelinePalette={background:'#FFFFFF',title:'#002060',axis:'#0069B8',emphasis:'#C00000',node:'#404040',nodeBorder:'#D9D9D9',text:'#000000'};
export function validateTimeline(spec){
  if(spec.milestones?.length!==6)throw Error('timeline-six requires 6 ordered milestones');
  if(spec.theme&&spec.theme!=='reference-mat020')throw Error('timeline-six preserves reference-mat020 colors; do not apply another theme');
  for(const m of spec.milestones){
    if(typeof m.label!=='string'||!m.label.trim()||[...m.label].length>8)throw Error('Milestone label needs 1–8 characters');
    if(!m.top&&!m.bottom)throw Error('Each milestone needs an event');
    for(const key of ['top','bottom'])if(m[key]!==undefined&&(typeof m[key]!=='string'||[...m[key].replace(/\s/g,'')].length>28))throw Error('Event text exceeds 28 characters');
  }
}
export function timelinePage(s,spec,index,{rect,text}){
  const c=timelinePalette,t={font:'Microsoft YaHei',ink:c.text};s.background.fill=c.background;
  text(s,t,'page.title',spec.title,48,36,1184,66,42,c.title);
  rect(s,'page.rule',48,124,1184,2,c.title);
  rect(s,'timeline.axis',0,371,1250,22,c.axis);
  rect(s,'timeline.arrow',1234,360,44,44,c.axis,'triangle','none',90);
  const border=(id,x,y,w,h)=>{
    rect(s,id+'.fill',x,y,w,h,c.background);
    for(let a=0;a<w;a+=11){rect(s,id+'.top-'+a,x+a,y,Math.min(6,w-a),1,c.text);rect(s,id+'.bottom-'+a,x+a,y+h,Math.min(6,w-a),1,c.text);}
    for(let a=0;a<h;a+=11){rect(s,id+'.left-'+a,x,y+a,1,Math.min(6,h-a),c.text);rect(s,id+'.right-'+a,x+w,y+a,1,Math.min(6,h-a),c.text);}
  };
  spec.milestones.forEach((m,i)=>{
    const cx=120+i*208;
    for(const [key,y] of [['top',190],['bottom',466]]){
      if(!m[key])continue;const w=184,h=120;
      rect(s,`timeline.connector-${i}-${key}`,cx-1,key==='top'?y+h:445,2,key==='top'?371-y-h:y-445,c.node);
      border(`timeline.box-${i}-${key}`,cx-w/2,y,w,h);
      text(s,t,`timeline.event-${i}-${key}`,m[key],cx-w/2+10,y+8,w-20,h-16,23,m.emphasis===key?c.emphasis:c.text,'center');
    }
    rect(s,'timeline.node-border-'+i,cx-18,364,36,36,c.nodeBorder,'ellipse',c.node);
    rect(s,'timeline.node-'+i,cx-13,369,26,26,c.node,'ellipse');
    text(s,t,'timeline.label-'+i,m.label,cx-78,407,156,38,26,c.text,'center');
  });
  rect(s,'page.footer',48,690,1130,1,c.nodeBorder);
  text(s,t,'page.number',String(index).padStart(2,'0'),1190,683,42,25,14,c.node,'right',0,false);
}
