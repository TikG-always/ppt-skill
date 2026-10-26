// Native editable framing for academic slides. Supply the selected template palette.
// The caller owns semantics, image selection, node placement and visual inspection.
export function academicLayout(p,{palette,roles,font='Microsoft YaHei',referenceId='default'}={}) {
  const C={ink:'#163D6B',body:'#111111',red:'#A61B29',bar:'#EFF4FB',barText:'#163D6B',line:'#163D6B',pale:'#EFF4FB',...palette};
  const R={title:42,summary:26,module:26,body:23,metric:40,...roles};
  const manifest=[];
  let seq=0;
  function shape(s,id,x,y,w,h,fill='none',line='none',geometry='rect'){
    return s.shapes.add({name:id,geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:line==='none'?0:1.3}});
  }
  function tx(s,id,value,x,y,w,h,role='body',color=C.ink,bold=true,align='left'){
    if(!(role in R)) throw Error(`Unregistered text role ${role}`);
    const o=shape(s,id,x,y,w,h);
    o.text=value;o.text.insets=0;
    o.text.style={fontSize:R[role],typeface:font,color,bold,alignment:align,verticalAlignment:'middle'};
    o.text.autoFit='none';
    manifest.push({id,slide:s.__academicIndex,role,text:value,font,size:R[role],color,bounds:[x,y,w,h]});
    return o;
  }
  function panel(s,id,title,x,y,w,h){
    shape(s,id+'.frame',x,y,w,h,'#FFFFFF',C.line,'roundRect');
    shape(s,id+'.bar',x,y,w,44,C.bar,'none','roundRect');
    tx(s,id+'.heading',title,x+12,y+2,w-24,40,'module',C.barText,true,'center');
  }
  function node(s,id,value,x,y,w,h,{fill=C.pale,color=C.ink,bold=true}={}){
    shape(s,id+'.frame',x,y,w,h,fill,C.line,'roundRect');
    return tx(s,id+'.text',value,x+12,y+4,w-24,h-8,'body',color,bold,'center');
  }
  function arrow(s,id,x,y,w,h,direction='right'){
    return shape(s,id,x,y,w,h,C.ink,'none',direction==='down'?'downArrow':'rightArrow');
  }
  function page(title,top,bottom){
    const s=p.slides.add();s.__academicIndex=++seq;s.background.fill='#FFFFFF';
    tx(s,'page.title',title,40,25,1200,64,'title');
    shape(s,'page.rule',40,99,1200,1.5,C.line);
    if(top) tx(s,'page.top',top,40,112,1200,50,'summary',C.ink,true,'center');
    if(bottom) tx(s,'page.bottom',bottom,40,631,1200,59,'summary',C.ink,true,'center');
    return s;
  }
  return {C,R,manifest,referenceId,page,tx,shape,panel,node,arrow};
}
