// Each plan has a fuse, a movable parts trolley and a striped service bay.
const liftPlans = [
 ['.........','.P..F....','..T..B.E.','.........','...##....'],
 ['..F......','..#..B.E.','..#......','.P.T.....','......##.'],
 ['.F.......','....#..E.','...T#....','.P....B..','....#....'],
 ['....F....','.##....E.','....T....','.P.#..B..','.........']
];
const liftDirections = {ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0],ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1]};
function liftFloor(plan,flip){
 const rows=liftPlans[plan].map(row=>flip?[...row].reverse().join(''):row);
 const room={plan,flip,walls:[],fused:false,docked:false,moves:0};
 const names={P:'player',T:'trolley',B:'bay',F:'fuse',E:'lift'};
 rows.forEach((row,y)=>[...row].forEach((tile,x)=>{
   const cell=y*9+x;
   if(tile==='#')room.walls.push(cell);
   if(names[tile])room[names[tile]]=cell;
 }));
 return room;
}
function newRepair(){
 return {floor:1,order:[0,...shuffle([1,2,3]).slice(0,2)],room:liftFloor(0,false),total:0};
}
function liftTip(room){
 if(room.fused&&room.docked)return 'Lift powered! Walk into the green lift.';
 if(room.docked)return 'Trolley parked. Pick up the yellow fuse.';
 if(room.fused)return 'Fuse fitted. Push the red trolley onto the striped bay.';
 return 'Grab the yellow fuse. Push the trolley onto the striped bay.';
}
function repairBoard(preview=false){
 const run=preview?newRepair():s.tower.repair;
 let room=run.room;
 const stage=$('stage');stage.hidden=false;
 $('scene').classList.add('repairScene');
 const box=element('div',null,'repairCab'),head=element('div',null,'repairHead');
 const counter=element('span');
 const updateCounter=()=>{counter.textContent=(run.total+room.moves)+' MOVES · '+run.floor+'/3 FLOORS'};
 updateCounter();head.append(element('strong','LIFT RESCUE'),counter);
 const canvas=element('canvas');canvas.width=252;canvas.height=164;canvas.tabIndex=0;
 canvas.setAttribute('aria-label','Lift rescue board. Move with arrow keys or WASD.');
 const hint=element('div',liftTip(room),'repairHint');hint.setAttribute('aria-live','polite');
 const pad=element('div',null,'repairPad');
 box.append(head,canvas,hint,pad);stage.append(box);
 const marquee=element('div',null,'repairMarquee');
 marquee.append(element('small','WEST SHAMBLES  /  MAINTENANCE'),element('strong','LIFT RESCUE'),element('p',preview?'The lift’s packed in. Grab your hi-vis.':'Three floors. One knackered lift.'),element('span','WASD · ARROWS · SWIPE'));
 stage.prepend(marquee);
 function begin(){
   if(!preview)return;
   s.tower={repair:run};preview=false;save();
   render();
 }
 function move(dx,dy){
   if(preview){begin();stepLift(dx,dy);return}
   const advance=cell=>{
     const x=cell%9+dx,y=Math.floor(cell/9)+dy;
     return x<0||x>=9||y<0||y>=5?-1:y*9+x;
   };
   const blocked=cell=>cell===-1||room.walls.includes(cell);
   const dest=advance(room.player);
   if(blocked(dest))return;
   if(dest===room.trolley){
     const beyond=advance(dest);
     if(room.docked||blocked(beyond)||[room.fuse,room.lift].includes(beyond))return;
     room.trolley=beyond;room.docked=beyond===room.bay;
     if(room.docked)tone(true);
   }
   room.player=dest;room.moves++;
   if(dest===room.fuse){room.fused=true;room.fuse=-1;tone(true)}
   if(dest===room.lift&&room.fused&&room.docked){
     run.total+=room.moves;
     if(run.floor===3){
       const c=towerCareer();c.keys+=3;c.repairs=(c.repairs||0)+1;
       c.repairBest=Math.min(c.repairBest||Infinity,run.total);
       s.tower=null;
       finish('Lift back in service','Three floors in '+run.total+' moves. Jan rides it down one floor just to complain about the music. Best repair: '+c.repairBest+' moves. Three caretaker keys banked.',24,2,5);return;
     }
     run.floor++;run.room=liftFloor(run.order[run.floor-1],Math.random()<.5);save();render();return;
   }
   save();updateCounter();hint.textContent=liftTip(room);if($('desc')&&s.tower?.repair)$('desc').textContent=liftTip(room);drawLift(canvas,room,run.floor);
 }
 // The board instance owns movement. Replacing the stage discards its handler.
 canvas.move=move;
 for(const [key,label] of [['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→']]){
   const b=button(pad,label,()=>stepLift(...liftDirections[key]));
   b.setAttribute('aria-label','Move '+key.slice(5).toLowerCase());
 }
 const restart=button(pad,'Reset floor',()=>{
   if(preview)return;
   run.total+=room.moves;run.room=liftFloor(room.plan,room.flip);save();render();
 });restart.disabled=preview;
 canvas.onpointerdown=e=>{canvas.focus();canvas.setPointerCapture(e.pointerId);canvas.startPoint=[e.clientX,e.clientY]};
 canvas.onpointerup=e=>{
   if(!canvas.startPoint)return;
   const [x,y]=canvas.startPoint;canvas.startPoint=null;
   const dx=e.clientX-x,dy=e.clientY-y;
   if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;
   move(...(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]));
 };
 drawLift(canvas,room,run.floor);
}
function stepLift(dx,dy){document.querySelector('.repairCab canvas')?.move(dx,dy)}
document.addEventListener('keydown',event=>{
 const dir=liftDirections[event.key];
 if(!dir||!document.querySelector('.repairCab')||$('guide').open||event.ctrlKey||event.metaKey||event.altKey)return;
 if(!s.tower?.repair&&event.target!==document.body&&!event.target.closest('.repairCab'))return;
 event.preventDefault();stepLift(...dir);
});
function drawLift(canvas,r,floor){
 const g=canvas.getContext('2d');if(!g)return;
 const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
 const centre=cell=>[(cell%9)*28,24+Math.floor(cell/9)*28];
 const mark=(cell,paint)=>paint(...centre(cell));
 rect(0,0,252,164,'#28383e');
 for(let i=0;i<9;i++){
   rect(i*28+4,4,20,14,'#152028');rect(i*28+5,5,8,10,'#63858e');rect(i*28+14,5,8,10,'#4a6c7d');
 }
 rect(0,18,252,6,'#ad7e62');rect(0,21,252,2,'#553e41');
 for(let i=0;i<45;i++)mark(i,(x,y)=>{
   rect(x,y,28,28,(i+floor)%2?'#716470':'#7b6b75');
   rect(x,y+26,28,2,'#514856');rect(x+26,y,2,26,'#625563');
   if(i%4===1)rect(x+5,y+7,6,1,'#8d7b85');
 });
 r.walls.forEach(cell=>mark(cell,(x,y)=>{
   rect(x+1,y+4,26,22,'#34323d');rect(x+1,y+1,26,18,'#aca291');
   rect(x+2,y+3,23,3,'#d0bda3');rect(x+12,y+6,2,12,'#8f887d');
 }));
 mark(r.bay,(x,y)=>{
   rect(x+1,y+1,26,25,'#ecbc54');for(let i=0;i<4;i++)rect(x+3+i*6,y+3,3,21,'#433e42');
 });
 mark(r.lift,(x,y)=>{
   const on=r.fused&&r.docked;
   rect(x+2,y+1,24,26,'#282532');rect(x+4,y+4,20,20,on?'#52775e':'#95a4a8');rect(x+13,y+3,2,21,'#39424b');
   rect(x+7,y,14,4,on?'#c4ff71':'#ffa47f');
   g.font='bold 6px monospace';g.fillStyle='#222';g.fillText('LIFT',x+5,y+18);
 });
 if(!r.fused)mark(r.fuse,(x,y)=>{
   rect(x+7,y+9,14,12,'#493a3b');rect(x+8,y+8,12,11,'#ffe271');rect(x+9,y+4,3,5,'#eeeacb');rect(x+16,y+4,3,5,'#eeeacb');rect(x+12,y+11,4,5,'#925a30');
 });
 mark(r.trolley,(x,y)=>{
   rect(x+3,y+7,23,3,'#ddd4cc');rect(x+5,y+10,19,13,'#9f3544');rect(x+6,y+9,17,4,'#ff8e78');rect(x+10,y+14,10,2,'#ecac93');rect(x+6,y+22,4,4,'#2d2533');rect(x+20,y+22,4,4,'#2d2533');
 });
 mark(r.player,(x,y)=>{
   rect(x+5,y+24,18,3,'#544954');rect(x+7,y+20,5,6,'#242935');rect(x+16,y+20,5,6,'#242935');
   rect(x+6,y+12,15,10,'#35696c');rect(x+8,y+12,11,9,'#d9e664');rect(x+8,y+16,11,2,'#f7efd6');
   rect(x+9,y+5,11,8,'#dc9873');rect(x+8,y+3,12,4,'#312e39');rect(x+15,y+8,2,2,'#312e39');rect(x+20,y+15,3,5,'#dd986d');
 });
 canvas.setAttribute('aria-description','Player column '+(r.player%9+1)+', row '+(Math.floor(r.player/9)+1)+'. '+liftTip(r));
}
