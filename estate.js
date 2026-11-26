'use strict';
(() => {
 const sites=[
   {id:'bike',name:'Jan’s corner shop',resident:'Jan Two Bellies',x:75,y:108},
   {id:'radio',name:'Rinse FM',resident:'Ceefax',x:236,y:108},
   {id:'repair',name:'Stairwell B',resident:'Spanner',x:407,y:108},
   {id:'keeper',name:'Five-a-side pitch',resident:'Donna Concrete',x:394,y:228},
   {id:'hall',name:'Tenants’ hall',resident:'Father Scratchcard',x:83,y:228}
 ];
 const venue=id=>sites.find(site=>site.id===id);
 const cases=[
   {title:'The chip shop float',body:'Jan’s supplier wants actual money. Apparently “put it on the estate” isn’t a payment method.',jobs:['bike','radio'],rent:16,item:'chip vouchers',colour:'#ffcb72',perk:'The cobbler fits running soles. +15% walking speed.'},
   {title:'Water feature, flat 9',body:'The housing officer calls the leak a water feature. Spanner wants him to come round and see the bloody koi.',jobs:['repair','keeper'],rent:22,item:'repair slips',colour:'#a9eeee',perk:'The tenants negotiate union rates. +£2 on every shift.'},
   {title:'Away-kit appeal',body:'Donna’s lads have one clean shirt between eleven. Jan’s offered bin bags. Away colours are apparently lavender.',jobs:['keeper','bike'],rent:28,item:'kit bags',colour:'#e8a5e6',perk:'Spanner clips a strap to your bag. The trolley can’t knock your parcels loose.'},
   {title:'Cease and desist FM',body:'Ceefax needs a new transmitter. The old one plays the shipping forecast every time number eight flushes.',jobs:['radio','repair'],rent:32,item:'aerial parts',colour:'#f0d290',perk:'The hall starts a hardship fund. Each new week starts with an extra £6.'},
   {title:'Last orders for the 47',body:'Jan booked the last night bus for a wake. The deceased turned up at the stop. He’d quite like his deposit back.',jobs:['bike','keeper','radio'],rent:39,item:'bus tokens',colour:'#b4df83',perk:'The residents chip in for quality work. Three-star shifts earn a £5 tip.'},
   {title:'Keep the hall',body:'The council has listed the hall as vacant. Thirty bingo players, two ferrets and an Elvis impersonator beg to differ.',jobs:['repair','radio','keeper'],rent:45,item:'signed objections',colour:'#ffc6a4',perk:'Estate steward. Your badge, shift ratings and personal records carry into the next circuit.'}
 ];
 const parcelSpots=[[151,128],[326,146],[185,205],[48,185],[296,219],[427,168],[109,153],[231,184]];
 const saveKey='west-shambles-arcade-v1';
 const $=id=>document.getElementById(id);
 const canvas=$('screen'),ctx=canvas.getContext('2d');
 const controls=Array.from(document.querySelectorAll('[data-key]'));
 const keyMap={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',g:'social',e:'action',' ':'action',Enter:'action'};
 const pressed=new Set(),heldSources=new Map();
 let sound=false,audio,paused=false,clock=0,saveClock=0,lastTime=0,walk=false,destination=null,lastPrompt='',dirty=false;
 const activeKeys=()=>new Set(heldSources.values());
 function makeDrops(week){
   const offset=(week*2)%parcelSpots.length;
   return [0,2,5].slice(0,week===0?2:3).map(i=>[...parcelSpots[(offset+i)%parcelSpots.length]]);
 }
 function fresh(){
   return {version:1,x:82,y:132,face:'up',week:0,season:1,cash:6,shifts:0,ratings:{},signed:[],drops:makeDrops(0),carried:0,filed:0,
     trophies:[],splits:[],best:[],visits:[],job:null,ended:false,speaker:'Jan Two Bellies',
     life:EstateLife.fresh(),speech:'“Over here, love. Chips are getting cold.” Walk up to Jan outside the corner shop and press Space.'};
 }
 let game=fresh();
 try{
   const old=JSON.parse(localStorage.getItem(saveKey));
   if(old?.version===1&&Number.isInteger(old.week)&&cases[old.week]&&Array.isArray(old.drops)&&(!old.job||window.EstateJobs[old.job.id]))game=old;
   sound=localStorage.getItem('estate-sound')==='1';
 }catch{}
 game.life??=EstateLife.fresh();game.canal??=ShamblesCanal.fresh();
 const chapter=()=>cases[game.week];
 const tier=()=>Math.min(6,game.week+1+Math.min(2,game.season-1));
 const hasPerk=index=>game.trophies.includes(index);
 const requiredParcels=()=>game.week===0?2:3;
 const hallReady=()=>chapter().jobs.every(id=>game.signed.includes(id))&&game.filed>=requiredParcels()&&game.cash>=chapter().rent;
 function goal(){
   if(game.ended||game.carried||hallReady())return 'hall';
   return chapter().jobs.find(id=>!game.signed.includes(id))||null;
 }
 function save(){
   try{localStorage.setItem(saveKey,JSON.stringify(game));dirty=false}catch{}
 }
 function tone(hz=300){
   if(!sound||!audio||audio.state!=='running')return;
   const oscillator=audio.createOscillator(),gain=audio.createGain();
   oscillator.type='triangle';oscillator.frequency.value=hz;gain.gain.setValueAtTime(.06,audio.currentTime);
   gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);
   oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.13);
 }
 function wakeAudio(){
   if(!sound)return;
   try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}
 }
 function say(who,what){game.speaker=who;game.speech=what}
 function text(id,str){if($(id).textContent!==str)$(id).textContent=str}
 function task(list,description,done){
   const item=document.createElement('li');item.textContent=description;if(done)item.className='done';list.append(item);
 }
 function refresh(){
   const c=chapter(),job=game.job;
   text('heading',job?window.EstateJobs[job.id].title:game.canal.here?'Shambles Cut':game.life.indoors?'Flat 9':'The estate');
   text('district',job?venue(job.id).name.toUpperCase():'BOROUGH OF WEST SHAMBLES');
   text('mode',job?'● ON SHIFT':game.canal.here?'● CANALSIDE':game.life.indoors?'● AT HOME':'● ON THE STREET');text('week','CIRCUIT '+game.season+' · CASE '+(game.week+1)+'/6');
   text('almanac',EstateLife.season(game.life)+' '+((game.life.day-1)%7+1)+' · '+(game.life.evening?'Evening':'Morning')+(game.life.day%4===0?' · Rain':''));text('balance','£'+game.cash);text('caseNo','RENT CASE '+String(game.week+1).padStart(2,'0'));
   text('caseTitle',game.ended?'The hall is yours':c.title);
   text('caseBody',game.ended?'The residents hold the keys. Visit the hall to start another circuit at a higher shift level.':c.body);
   text('pockets','Basket · '+game.life.basket.length+' crop'+(game.life.basket.length===1?'':'s')+' / '+game.canal.creel.length+' fish / '+(game.life.meals?.length||0)+' suppers');
   text('caller',game.speaker);text('voice',game.speech);
   text('use',job?({bike:'Jump / throw',keeper:'Dive',radio:'Beat',repair:'Reset',hall:'Launch'}[job.id]):game.canal.line?'Rod':'Interact');
   $('social').hidden=!!job||game.canal.here||game.life.indoors;
   const list=$('tasks');list.replaceChildren();
   for(const id of c.jobs)task(list,'Help '+venue(id).resident+' · shift star or friendship gift',game.signed.includes(id));
   task(list,'Carry '+c.item+' to the hall · '+game.filed+'/'+requiredParcels(),game.filed>=requiredParcels());
   task(list,'Raise £'+c.rent+' and play hall pinball',game.ended);
   const records=$('records');records.replaceChildren();
   const entry=str=>{const row=document.createElement('div');row.textContent=str;records.append(row)};
   entry('Circuit '+game.season+' · '+game.shifts+' shifts played. Chapter records count shifts, including hall nights.');
   entry('Allotment basket · '+(game.life.basket.map(id=>EstateLife.crops[id].name).join(', ')||'empty'));
   entry('Canal catches · '+ShamblesCanal.fish.map((f,i)=>f.name+' ×'+game.canal.caught[i]).join(' / '));
   entry('Tend the three tubs at the south end. Water, then sleep at flat 9 or finish two shifts to grow a crop. Gift produce to two neighbours twice to unlock all three varieties.');
   for(const site of sites)entry(site.resident+' · '+('♥'.repeat(game.life.bonds[site.id]||0)+'♡'.repeat(3-(game.life.bonds[site.id]||0)))+' · '+site.name+' · '+('★'.repeat(game.ratings[site.id]||0)+'☆'.repeat(3-(game.ratings[site.id]||0))));
   for(const [id,n] of Object.entries(game.life.bonds))if(n===3)entry(EstateLife.keepsakes[id]);
   game.trophies.forEach(i=>entry('✓ '+cases[i].perk));
   game.best.forEach((n,i)=>{if(n!=null)entry(cases[i].title+' · personal best '+n+' shifts')});
   text('bookSummary',game.trophies.length+'/6 improvements');
   text('sound',sound?'Sound on':'Sound off');$('sound').setAttribute('aria-pressed',String(sound));
 }
 function nearest(){
   let closest=null,min=29;
   for(const site of sites){
     const distance=Math.hypot(game.x-site.x,game.y-site.y);
     if(distance<min){min=distance;closest=site}
   }
   return closest;
 }
 function prompt(){
   if(game.job)return window.EstateJobs[game.job.id].hint;
   if(game.life.indoors)return FlatNine.tip(game);
   if(game.canal.here)return ShamblesCanal.tip(game);
   if(ShamblesCanal.nearGate(game.x,game.y))return 'Interact · follow the west passage to Shambles Cut';
   const spot=EstateLife.near(game.x,game.y);
   if(spot)return 'Interact · '+EstateLife.instruction(game.life,spot);
   const site=nearest();
   if(site?.id==='hall'){
     if(game.ended)return 'Interact · start the next circuit with your estate upgrades';
     if(game.carried)return 'Interact · hand in '+game.carried+' '+chapter().item;
     return hallReady()?'Interact · open the rent party pinball table':'Tenants’ hall · Interact to check the rent book';
   }
   if(site)return 'Interact · '+window.EstateJobs[site.id].title+' with '+site.resident+' · G to '+((game.life.meals?.length||game.life.basket.length||game.canal.creel.length)?'give a gift':'chat');
   if(game.ended)return 'The hall is saved. Head back there when you’re ready for the next circuit.';
   if(game.carried)return 'Carrying '+game.carried+' '+chapter().item+' · take them to the hall, bottom left.';
   if(game.drops.length)return 'Walk over the bouncing parcels to collect '+chapter().item+'.';
   const next=goal();return next?'Head to '+venue(next).name+' · arrows or WASD to walk.':'Earn shift pay, then bring the rent pot to the hall.';
 }
 function syncPrompt(){
   const next=prompt();if(next!==lastPrompt){lastPrompt=next;text('prompt',next)}
 }
 function startJob(id){
   const job=window.EstateJobs[id];destination=null;
   if(!game.visits.includes(id))game.visits.push(id);
   game.job={id,state:job.create(tier())};
   say(venue(id).resident,job.hint);tone(430);save();refresh();
 }
 function completeJob(result){
   const id=game.job.id,score=Math.max(0,Math.min(3,Math.round(result.score)));
   EstateLife.advance(game.life);game.shifts++;game.job=null;walk=false;destination=null;
   game.ratings[id]=Math.max(game.ratings[id]||0,score);
   let outcome=result.message;
   if(id==='hall'&&score>0){
     const c=chapter(),index=game.week;
     game.cash-=c.rent;game.splits[index]=game.shifts;
     game.best[index]=Math.min(game.best[index]??Infinity,game.shifts);
     if(!hasPerk(index))game.trophies.push(index);
     outcome+=' £'+c.rent+' paid. '+c.perk;
     if(index===cases.length-1){game.ended=true}
     else{game.week++;newWeek()}
   }else if(id==='hall'){
     outcome+=' The float is safe. Have another go when you’re ready.';
   }else{
     const pay=3+score*4+(id==='radio'&&game.life.bonds.radio===3?3:0)+(hasPerk(1)?2:0)+(score===3&&hasPerk(4)?5:0);
     game.cash+=pay;if(score>0&&!game.signed.includes(id))game.signed.push(id);
     outcome+=' '+score+'/3 stars · £'+pay+' in the rent pot.';
   }
   say(venue(id).resident,outcome);tone(score?630:160);save();refresh();
 }
 function newWeek(){
   game.drops=makeDrops(game.week);game.signed=[];game.carried=0;game.filed=0;
   if(hasPerk(3))game.cash+=6;
   if(game.life.bonds.hall===3)game.cash+=4;
 }
 function interact(){
   if(game.life.indoors){const msg=FlatNine.use(game);if(msg)say('Flat 9',msg);destination=null;save();refresh();return}
   if(game.canal.here){const msg=ShamblesCanal.interact(game);if(msg)say('Shambles Cut',msg);destination=null;save();refresh();return}
   if(ShamblesCanal.nearGate(game.x,game.y)){ShamblesCanal.enter(game);destination=null;say('Shambles Cut','Walk down to the wooden jetty. See if anything here has fewer than three eyes.');save();refresh();return}
   const spot=EstateLife.near(game.x,game.y);
   if(spot){say(spot.kind==='home'?'Flat 9':'Communal allotment',spot.kind==='home'?FlatNine.enter(game):EstateLife.tend(game.life,spot));destination=null;tone(430);save();refresh();return}
   const site=nearest();if(!site)return;
   if(site.id!=='hall'){startJob(site.id);return}
   if(game.ended){
     game.season++;game.week=0;game.shifts=0;game.splits=[];game.cash=6;game.ended=false;newWeek();
     say('Jan Two Bellies','“Back for seconds? Good. They’ve put the rent up again.” Your permanent improvements are ready.');
   }else if(game.carried){
     game.filed+=game.carried;game.carried=0;tone(540);
     say('Father Scratchcard',hallReady()?'“Float’s counted. Flip the switch and let’s have it.” Interact again to play the rent party.':'“I’ll put these somewhere safe.” He opens a biscuit tin labelled OTHER BISCUIT TIN.');
   }else if(hallReady()){startJob('hall');return}
   else{
     const next=chapter().jobs.find(id=>!game.signed.includes(id));
     say(site.resident,next?'“We need someone at '+venue(next).name+'. Earn a star and come find me.”':game.drops.length?'“Found those '+chapter().item+' yet? Look for the little bouncing parcels.”':'“Still £'+Math.max(0,chapter().rent-game.cash)+' short. Give us another shift, love.”');
   }
   save();refresh();
 }
 function trolleyPosition(t){return {x:22+436*(.5+.5*Math.sin(t*.41)),y:174+5*Math.sin(t*.9)}}
 let collisionCooldown=0;
 function street(dt,input){
   if(game.canal.line){
     const msg=ShamblesCanal.update(game,input,dt);dirty=true;
     if(msg){say('Shambles Cut',msg);tone(480);save();refresh()}
     return;
   }
   let dx=Number(input.right)-Number(input.left),dy=Number(input.down)-Number(input.up);
   if(dx||dy)destination=null;
   if(destination){
     dx=destination.x-game.x;dy=destination.y-game.y;
     if(Math.hypot(dx,dy)<2){destination=null;dx=dy=0}
   }
   walk=!!(dx||dy);
   if(walk){
     const dist=Math.hypot(dx,dy),step=Math.min(destination?dist:Infinity,((hasPerk(0)?98:85)+(game.life.bonds.keeper===3?12:0))*dt);
     game.x=Math.min(468,Math.max(12,game.x+dx/dist*step));
     const top=game.canal.here?(game.x>=182&&game.x<=278?130:175):game.life.indoors?140:100;
     game.y=Math.min(245,Math.max(top,game.y+dy/dist*step));
     game.face=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
     dirty=true;
   }
   if(game.canal.here||game.life.indoors){if(input.pressed('action'))interact();return}
   collisionCooldown=Math.max(0,collisionCooldown-dt);
   if(!game.ended){
     const index=game.drops.findIndex(([x,y])=>Math.hypot(game.x-x,game.y-y)<10);
     if(index>=0){game.drops.splice(index,1);game.carried++;tone(780);save();refresh()}
     const trolley=trolleyPosition(clock);
     if(game.carried&&!hasPerk(2)&&collisionCooldown<=0&&Math.hypot(trolley.x-game.x,trolley.y-game.y)<10){
       game.carried--;game.drops.push([Math.min(459,Math.max(20,game.x-18)),Math.min(245,game.y+13)]);collisionCooldown=2;
       say('Street feed','The runaway trolley has clipped your bag. Grab the parcel it knocked loose.');save();refresh();
     }
   }
   if(input.pressed('social')){
     const site=nearest();
     if(site){
       const reply=EstateLife.social(game.life,site.id,game.canal);game.cash+=reply.cash;
       if(!game.ended&&reply.cash&&game.life.bonds[site.id]>=2&&chapter().jobs.includes(site.id)&&!game.signed.includes(site.id)){
         game.signed.push(site.id);reply.message+=' “Here, I’ll sign the case sheet for you.”';
       }
       say(site.resident,reply.message);tone(520);
     }
     else say('West Shambles','Walk up to a resident to chat or give them the first crop in your basket.');
     save();refresh();
   }else if(input.pressed('action'))interact();
 }
 function drawStreet(){
   if(game.life.indoors){FlatNine.draw(ctx,game,clock,walk);return}
   if(game.canal.here){ShamblesCanal.draw(ctx,game,clock,walk);return}
   drawEstate(ctx,{x:game.x,y:game.y,walk,time:clock,face:game.face,day:game.life.day,evening:game.life.evening,life:game.life,improvements:game.trophies,sites,goal:goal(),visited:game.visits});
   ctx.save();ctx.fillStyle='#2f473d';ctx.fillRect(2,139,51,12);ctx.fillStyle='#f5e5bb';ctx.font='bold 8px monospace';ctx.fillText('‹ CANAL',6,148);ctx.restore();
   if(game.ended)return;
   ctx.save();
   game.drops.forEach(([x,y],i)=>{
     const bob=Math.round(Math.sin(clock*4+i)*2);
     ctx.fillStyle='#283b37';ctx.fillRect(x-5,y+1,12,3);
     ctx.fillStyle='#422e32';ctx.fillRect(x-5,y-9+bob,12,10);
     ctx.fillStyle=chapter().colour;ctx.fillRect(x-4,y-8+bob,10,7);
     ctx.fillStyle='#8e6151';ctx.fillRect(x,y-8+bob,2,7);
     ctx.fillStyle='#fff5bd';ctx.fillRect(x+6,y-13+bob,2,4);ctx.fillRect(x+5,y-12+bob,4,2);
   });
   const {x,y}=trolleyPosition(clock),tx=Math.round(x),ty=Math.round(y);
   ctx.fillStyle='#343139';ctx.fillRect(tx-9,ty,17,2);ctx.fillRect(tx-6,ty+2,3,3);ctx.fillRect(tx+4,ty+2,3,3);
   ctx.fillStyle='#b3c6bd';ctx.fillRect(tx-9,ty-7,15,7);ctx.fillRect(tx+6,ty-10,2,10);ctx.fillRect(tx+7,ty-11,4,2);
   ctx.fillStyle='#627977';for(let i=-7;i<6;i+=3)ctx.fillRect(tx+i,ty-6,1,4);
   if(game.carried){ctx.fillStyle='#213b2f';ctx.fillRect(game.x+6,game.y-14,11,10);ctx.fillStyle=chapter().colour;ctx.font='bold 8px monospace';ctx.fillText('×'+game.carried,game.x+7,game.y-6)}
   ctx.restore();
 }
 function clearInput(){heldSources.clear();pressed.clear();for(const b of controls)b.classList.remove('held')}
 function pause(){
   if(paused)return;
   paused=true;clearInput();destination=null;save();$('leave').hidden=!game.job;$('break').showModal();
 }
 $('break').addEventListener('close',()=>{paused=false;lastTime=0;clearInput();canvas.focus({preventScroll:true})});
 $('pause').onclick=pause;
 $('leave').onclick=()=>{game.job=null;say('Street feed','You clocked out early. The shift is open if you want another crack.');save();refresh();$('break').close()};
 $('sound').onclick=()=>{sound=!sound;wakeAudio();tone(450);try{localStorage.setItem('estate-sound',sound?'1':'0')}catch{}refresh();canvas.focus({preventScroll:true})};
 function press(source,key){
   wakeAudio();if(!activeKeys().has(key))pressed.add(key);
   heldSources.set(source,key);controls.find(b=>b.dataset.key===key)?.classList.add('held');
 }
 function release(source){
   const key=heldSources.get(source);heldSources.delete(source);
   if(key&&!activeKeys().has(key))controls.find(b=>b.dataset.key===key)?.classList.remove('held');
 }
 document.addEventListener('keydown',e=>{
   if(e.metaKey||e.ctrlKey||e.altKey||paused)return;
   if(e.key==='Escape'){e.preventDefault();pause();return}
   if(e.target.closest('a,summary,dialog,button:not([data-key])'))return;
   const key=keyMap[e.key]||keyMap[e.key.toLowerCase()];if(!key)return;
   const mapped=(e.key===' '||e.key==='Enter')&&e.target.dataset.key?e.target.dataset.key:key;
   e.preventDefault();if(!e.repeat)press(e.code,mapped);
 });
 document.addEventListener('keyup',e=>release(e.code));
 controls.forEach(b=>{
   b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused)return;b.setPointerCapture(e.pointerId);press('pad'+e.pointerId,b.dataset.key)});
   const up=e=>release('pad'+e.pointerId);
   b.addEventListener('lostpointercapture',up);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
   b.onclick=e=>{if(e.detail===0&&!paused){pressed.add(b.dataset.key);wakeAudio()}};
 });
 canvas.onpointerdown=e=>{
   wakeAudio();canvas.focus({preventScroll:true});
   if(paused||game.job)return;
   const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*480/rect.width,y=(e.clientY-rect.top)*270/rect.height;
   const top=game.canal.here?(x>=182&&x<=278?130:175):game.life.indoors?140:100;
   destination={x:Math.min(468,Math.max(12,x)),y:Math.min(245,Math.max(top,y))};
 };
 window.addEventListener('blur',()=>{clearInput();if((game.job||game.canal.line)&&!paused)pause();else if(dirty)save()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){if((game.job||game.canal.line)&&!paused)pause();else if(dirty)save();clearInput()}lastTime=0});
 window.addEventListener('pagehide',()=>{if(dirty||game.job)save()});
 function frame(now){
   const dt=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;
   if(!paused&&!document.hidden){
     clock+=dt;
     const keys=activeKeys();
     const input={pressed:k=>pressed.has(k),tone};
     for(const k of ['left','right','up','down','action','social'])input[k]=keys.has(k)||pressed.has(k);
     if(game.job){
       const result=window.EstateJobs[game.job.id].update(game.job.state,input,dt);dirty=true;
       if(result)completeJob(result);
     }else street(dt,input);
     pressed.clear();
     saveClock+=dt;if(dirty&&saveClock>1){save();saveClock=0}
     syncPrompt();
   }
   ctx.save();
   if(game.job)window.EstateJobs[game.job.id].draw(ctx,game.job.state);else drawStreet();
   ctx.restore();requestAnimationFrame(frame);
 }
 refresh();syncPrompt();requestAnimationFrame(frame);
})();
