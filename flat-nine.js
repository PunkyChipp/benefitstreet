// Flat 9. Furniture is against the back wall, with a clear path between it and the door.
const FlatNine=(()=>{
 const stations=[
   {kind:'bed',x:85,y:150,label:'Sleep until morning'},
   {kind:'stove',x:232,y:145,label:'Cook a fish supper · one fish + one crop'},
   {kind:'telly',x:369,y:150,label:'Read today’s Ceefax'},
   {kind:'exit',x:437,y:221,label:'Go downstairs'}
 ];
 function station(g){return stations.find(s=>Math.hypot(g.x-s.x,g.y-s.y)<34)}
 function enter(g){g.life.indoors=true;g.x=413;g.y=215;g.face='left';return 'Home, sweet leasehold. Bed on the left, Baby Belling in the middle. The telly only gets Ceefax.'}
 function tip(g){const s=station(g);return s?'Interact · '+s.label:'Walk up to the bed, cooker or telly. The door is on the right.'}
 function use(g){
   const s=station(g);if(!s)return '';
   if(s.kind==='exit'){g.life.indoors=false;g.x=437;g.y=128;g.face='down';return 'Back downstairs. Someone’s nicked the lift button again.'}
   if(s.kind==='bed'){EstateLife.advance(g.life,true);return 'Morning. '+(g.life.day%4===0?'Rain rattles the meter box. The tubs have had a drink.':'The boiler coughs twice and agrees to live another day.')}
   if(s.kind==='telly'){
     const ripe=g.life.plots.filter(p=>p&&p.growth>=EstateLife.crops[p.crop].days).length;
     return 'P. 170 · '+EstateLife.season(g.life)+' forecast. '+((g.life.day+1)%4===0?'Rain tomorrow.':'Dry tomorrow.')+' '+ripe+' ripe tubs. Summer grows tomatoes faster. Autumn is marrow season.';
   }
   if(!g.life.basket.length||!g.canal.creel.length)return 'Empty frying pan. Bring any homegrown crop and a canal fish.';
   const veg=EstateLife.crops[g.life.basket.shift()],fish=ShamblesCanal.fish[g.canal.creel.shift()];
   g.life.meals??=[];g.life.meals.push(veg.value+fish.value+4);
   return fish.name+' with '+veg.name+'. Wrapped in yesterday’s Gazette. Give it to a neighbour for two hearts.';
 }
 function draw(ctx,g,t,walk){
   ctx.save();
   const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
   const text=(msg,x,y,c,size=8)=>{ctx.font='bold '+size+'px monospace';ctx.fillStyle=c;ctx.fillText(msg,x,y)};
   const label=(msg,x,y)=>{ctx.font='bold 7px monospace';const w=ctx.measureText(msg).width+8;r(x-w/2,y-8,w,11,'#3d4139');text(msg,x-w/2+4,y,'#f5e6bd',7)};
   r(0,0,480,270,'#b9a186');
   for(let i=0;i<30;i++){r(i*17,0,4,123,'#c5b094');for(let k=0;k<8;k++)r(i*17+7,8+k*16,2,3,'#a79683')}
   r(0,116,480,10,'#695c53');r(0,126,480,144,'#a78a70');
   for(let i=0;i<11;i++){r(0,126+i*14,480,1,'#8c7766');for(let j=0;j<6;j++)r(j*98+(i%2)*41,127+i*14,1,12,'#917964')}
   // Rain-stained view across the estate and a pair of curtains that once matched.
   r(30,18,97,67,'#efe3bc');r(34,22,89,59,g.life.evening?'#ac8594':'#a5c6bd');
   for(let i=0;i<5;i++){const y=38+(i%3)*7;r(35+i*18,y,16,81-y,'#7e8c83');for(let j=0;j<6;j++)r(38+i*18+7*(j%2),y+4+9*Math.floor(j/2),4,5,'#d7ca9f')}
   r(76,22,4,59,'#eee1c4');r(34,56,89,3,'#eee1c4');r(24,15,108,4,'#5d5148');r(24,19,13,68,'#94777b');r(117,19,13,68,'#94777b');
   // Bed, patched quilt, slippers.
   r(14,87,131,50,'#6b514a');r(18,94,122,37,'#d4c7a9');r(23,96,28,20,'#f1e5c7');r(56,92,85,39,'#718d83');
   for(let i=0;i<8;i++)r(57+i*11,93,3,38,'#9baa91');for(let i=0;i<3;i++)r(56,96+i*13,84,2,'#b4b69d');
   r(16,133,7,8,'#5e4b44');r(133,133,7,8,'#5e4b44');r(45,142,9,4,'#71676b');r(55,144,9,4,'#71676b');
   // Fitted kitchen, egg-yellow kettle and electric rings.
   r(170,59,129,35,'#d0c5a5');for(let i=0;i<11;i++)r(170+i*12,60,1,33,'#a6a68e');r(170,76,129,1,'#a6a68e');
   r(173,90,127,45,'#71857b');r(170,87,132,5,'#ead9b5');r(177,95,34,35,'#abb49c');r(265,95,30,35,'#abb49c');
   r(218,85,39,49,'#ded8bd');r(222,105,30,23,'#514d4c');r(224,108,26,17,'#817770');
   for(const x of [225,242]){r(x,84,9,3,'#353d38');r(x,95,5,4,'#4e584f')}
   r(181,79,10,8,'#dcaa5d');r(179,77,12,3,'#726357');r(192,81,3,4,'#e3c480');
   // Family TV. Earned project rosettes hang above it.
   r(327,71,80,55,'#685951');r(332,75,54,40,'#353e39');r(336,79,46,32,'#5c7866');text('CEEFAX',339,98,'#d8e8ac',10);
   r(389,80,9,6,'#b59d7e');r(389,91,9,6,'#b59d7e');r(323,125,88,5,'#7c624f');r(327,130,5,10,'#6c5547');r(400,130,5,10,'#6c5547');
   g.trophies.forEach((_,i)=>{const x=317+i*20;r(x,24,13,17,'#79634e');r(x+2,26,9,13,'#e7d3a4');r(x+4,29,5,5,'#a7664f')});
   r(143,169,172,57,'#74685e');r(146,172,166,51,'#9a655b');r(153,177,152,41,'#b98d72');r(157,181,144,33,'#8d635a');
   for(let i=0;i<9;i++)r(160+i*16,193+(i%2)*3,8,8,'#bfa381');
   label('BED',85,144);label('COOKER',232,142);label('TELLY',369,145);label('STAIRS →',444,218);
   window.drawEstatePlayer(ctx,g.x,g.y,g.face,walk,t);
   ctx.restore();
 }
 return {enter,tip,use,draw};
})();
