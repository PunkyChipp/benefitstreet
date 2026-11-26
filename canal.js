// The canal is reached through the west passage. Fishing is part of the day cycle.
const ShamblesCanal=(()=>{
 const fish=[
   {name:'canal roach',value:4,col:'#d9b57b',pull:.13},
   {name:'shopping-trolley perch',value:6,col:'#adcf7d',pull:.19},
   {name:'mirror carp',value:9,col:'#d99473',pull:.26},
   {name:'the ASBO tench',value:14,col:'#9eaea1',pull:.34}
 ];
 function fresh(){return {here:false,line:null,creel:[],caught:[0,0,0,0]}}
 function enter(g){g.canal.here=true;g.x=431;g.y=187;g.face='left'}
 function exit(g){g.canal.here=false;g.x=42;g.y=153;g.face='right'}
 function nearGate(x,y){return x<31&&y>132&&y<165}
 const atJetty=g=>g.x>176&&g.x<280&&g.y<191;
 const atExit=g=>g.x>410&&g.y>170&&g.y<210;
 function tip(g){
   const l=g.canal.line;
   if(l?.phase==='reel')return 'Hold Action to reel. Release when the tension rises. Keep the line out of the red.';
   if(l?.phase==='bite')return 'BITE! Press Action to hook it!';
   if(l)return 'Watch the float. Strike when it dips.';
   if(atExit(g))return 'Interact · back to the estate';
   if(atJetty(g))return 'Interact · cast a line from the jetty';
   return 'Walk to the wooden jetty to fish · the estate is through the east gate.';
 }
 function cast(g){
   const catchCount=g.canal.caught.reduce((a,b)=>a+b,0);
   const pool=Math.min(4,2+Math.floor(catchCount/2));
   g.canal.line={phase:'wait',elapsed:0,wait:1.5+Math.random()*2.4,id:Math.floor(Math.random()*pool),progress:.24,tension:.25,seed:Math.random()*6};
 }
 function interact(g){
   if(atExit(g)){exit(g);return 'Back on Benefit Street.'}
   if(atJetty(g)){cast(g);return 'The float lands just past a submerged traffic cone.'}
   return '';
 }
 function update(g,input,dt){
   const l=g.canal.line;l.elapsed+=dt;
   const end=msg=>{g.canal.line=null;return msg};
   if(l.phase==='wait'){
     if(input.pressed('action'))return end('Too early. The hook comes back with a Greggs wrapper.');
     if(l.elapsed>l.wait){l.phase='bite';l.elapsed=0;input.tone?.(580)}
   }else if(l.phase==='bite'){
     if(input.pressed('action')){l.phase='reel';l.elapsed=0;input.tone?.(380)}
     else if(l.elapsed>1.6)return end('The float pops back up. Whatever that was, it’s nicked your bait.');
   }else{
     const pull=fish[l.id].pull*(1+.8*Math.sin(l.seed+l.elapsed*2));
     l.tension=Math.max(.03,l.tension+dt*(input.action ? .29+pull : -.55+pull*.3));
     l.progress+=dt*(input.action ? .25 : -.065);
     if(l.tension>=1)return end('Ping. The line goes slack. Somewhere under the A-road a fish is taking the piss.');
     if(l.progress<=0)return end('It shakes the hook. The lad on the far bank gives you a slow clap.');
     if(l.progress>=1){g.canal.creel.push(l.id);g.canal.caught[l.id]++;return end('Landed a '+fish[l.id].name+'! Take it to a resident for £'+fish[l.id].value+' towards the rent.')}
   }
   return '';
 }
 function draw(ctx,g,t,walk){
   ctx.save();
   const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
   function text(msg,x,y,col='#f3e6bd',size=8){ctx.fillStyle=col;ctx.font='bold '+size+'px monospace';ctx.fillText(msg,x,y)}
   const dusk=g.life.evening;
   rect(0,0,480,270,dusk?'#bf9890':'#a9c5b9');
   for(let i=0;i<12;i++){const x=i*44-6,y=10+(i*13)%24;rect(x,y,40,55,'#798d80');rect(x-1,y-2,43,3,'#63796e');for(let n=0;n<15;n++)rect(x+3+(n%5)*7,y+4+Math.floor(n/5)*9,4,5,(i+n)%3?'#93a699':'#c3b895')}
   rect(0,57,480,17,'#8e705d');for(let i=0;i<40;i++)rect(i*15,62+i%2*5,12,2,'#ac8871');
   rect(0,74,480,88,dusk?'#4f7774':'#66958f');
   for(let i=0;i<95;i++){const x=(i*97+Math.sin(t+i)*4)%480,y=76+(i*23)%83;rect(x,y,4+(i%14),1,i%3?'#8faf9b':'#527e7e')}
   // Far-bank barge with chimney, portholes and washing on its roof.
   const bx=40+Math.sin(t*.23)*2;
   rect(bx,86,105,8,'#493d40');rect(bx+6,93,95,3,'#3d5a56');rect(bx+10,70,83,16,'#965e53');rect(bx+8,68,87,3,'#e4ba82');
   for(let i=0;i<5;i++)rect(bx+16+i*15,74,8,7,'#adc7b1');
   rect(bx+14,60,4,9,'#564549');rect(bx+33,64,22,3,'#83925e');text('DAMP EXPECTATIONS',bx+4,92,'#e4caa2',6);
   rect(0,160,480,110,'#9da47a');rect(0,158,480,6,'#61594c');rect(0,176,480,61,'#b59b80');rect(0,181,480,2,'#c6af91');
   for(let i=0;i<75;i++)rect((i*61)%480,182+(i*7)%49,2+i%4,1,'#aa9079');
   for(let i=0;i<17;i++){if(i>=6&&i<=9)continue;rect(i*30,149,3,24,'#615b4d');rect(i*30,151,30,2,'#827866')}
   for(let i=0;i<10;i++){rect(180+i*10,125,9,54,'#aa8260');rect(180+i*10,129,1,45,'#775e4f')}
   rect(179,124,103,4,'#624d42');rect(181,178,99,3,'#735b4d');
   for(const x of [178,279]){rect(x,116,4,22,'#665444');rect(x+1,116,2,3,'#c2af89')}
   for(let i=0;i<12;i++)rect(6+i*40,237,2,18,'#728362');
   rect(394,165,74,14,'#344b41');text('ESTATE WALK →',399,175,'#e7e1b6');
   rect(14,225,101,19,'#344b41');text('SHAMBLES CUT',23,238,'#e7e1b6',10);
   const x=Math.round(g.x),y=Math.round(g.y);
   window.drawEstatePlayer(ctx,x,y,g.face,walk,t);
   const l=g.canal.line;
   if(l){
     const fx=x-27,fy=111+Math.sin(t*3)*2+(l.phase==='bite'?5:0);
     ctx.strokeStyle='#4a413e';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y-10);ctx.lineTo(x-12,y-26);ctx.stroke();
     ctx.strokeStyle='#c7c7ac';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-12,y-26);ctx.lineTo(fx,fy);ctx.stroke();
     rect(fx-1,fy-5,3,5,'#ffe2ab');rect(fx-1,fy-6,3,3,'#dc6145');
     if(l.phase==='bite'){rect(fx-9,fy-25,21,13,'#3f382e');text('!!',fx-6,fy-15,'#ffcc69',11)}
     if(l.phase==='reel'){rect(120,4,240,29,'#263c35');text('LINE',127,15);text('CATCH',127,26);
       rect(160,8,188,7,'#624b49');rect(160,8,188*Math.min(l.tension,1),7,l.tension>.78?'#ef885c':'#e1c471');
       rect(160,20,188,6,'#46584d');rect(160,20,188*Math.min(l.progress,1),6,'#badb91')}
   }
   ctx.restore();
 }
 return {fresh,fish,nearGate,enter,atJetty,interact,update,draw,tip};
})();
