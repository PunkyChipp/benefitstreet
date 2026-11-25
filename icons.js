const sprites={
pad:['....ww........','.....ww.......','..gggggggggg..','.gGGGGGGGGGGg.','gGGkGGGGGGpGGg','gGkkkGGGGlGGGg','gGGkGGGGGGGGGg','gGGGg....gGGGg','.ggg......ggg.'],
coin:['...yyyy...','..yYYYYy..','.yYYyYWWy.','yYYyyYWWYy','yYYYyYYYYy','yYYYyYYYYy','yYYyyyYYYy','.yYYYYYYy.','..yyyyyy..'],
heart:['.ppp..ppp.','pPPWppPPWp','pPWWPPPPWp','pPPPPPPPPp','.pPPPPPPp.','..pPPPPp..','...pPPp...','....pp....'],
star:['....yy....','....YY....','...yYYy...','yyyYYYYyyy','.YYYYYYYY.','..YYYYYY..','..YYYyYY..','.yYY..YYy.','.yy....yy.']};
const colors={w:'#aaa0b0',g:'#719f48',G:'#b8f76c',k:'#28232e',p:'#b45986',P:'#f49ec7',W:'#ffedcc',l:'#fca0cb',y:'#bd8734',Y:'#ffce62'};
document.querySelectorAll('[data-icon]').forEach(el=>{const rows=sprites[el.dataset.icon],c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;c.style.width=c.width*(el.dataset.icon==='pad'?2.6:2.3)+'px';const ctx=c.getContext('2d');rows.forEach((r,y)=>[...r].forEach((v,x)=>{if(colors[v]){ctx.fillStyle=colors[v];ctx.fillRect(x,y,1,1)}}));el.append(c)});
