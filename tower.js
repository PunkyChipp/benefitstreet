// The lift is out again. Collect signatures upstairs before the clerk clocks off.
const tenants = [
 {name:'Spanner',door:'Blue door · a CB aerial through the letterbox',quote:'“I was off my tits when I signed for that parcel, yeah. Still remember the serial number. Do YOU remember the serial number?”',
  ask:'Hear him out',reply:'He opens a shoebox of repair slips in date order. “Six years they said the damp was condensation. What, am I boiling a fucking lake?”',
  deal:'Photocopy his receipts',payoff:'Spanner staples his receipts to the petition. The earliest one is older than his kid.'},
 {name:'Jan Two Bellies',door:'Yellow door · two doorbells marked DINNER',quote:'“One bell for dinner, one for second dinner. Ring them both and you’d better be my divorce solicitor.”',
  ask:'Ask what’s cooking',reply:'“Funeral buffet. Nobody’s dead. You get the hall cheaper.” Jan needs someone to label sixty tubs of egg mayo.',
  deal:'Label the buffet',payoff:'Jan puts the petition between the ham and the pickle. The whole buffet queue signs.'},
 {name:'Ceefax',door:'Red door · subtitles on every window',quote:'“Page 302. Pools. Page 888. Subtitles. Page 404. Your bloody repair appointment.”',
  ask:'Read his telly',reply:'The screen shows a tiny pixel drawing of the leak upstairs. He has animated every drip and given it a weather forecast.',
  deal:'Put his forecast on air',payoff:'Ceefax runs your petition along the bottom of the screen during the racing.'},
 {name:'Donna Concrete',door:'Grey door · a gold spirit level',quote:'“That wall is load-bearing. So am I. Difference is the wall gets an annual inspection.”',
  ask:'Ask about the hard hat',reply:'Donna shows you the tender for repainting the stairwell. Twelve grand for “vertical corridor mood enhancement”. She nearly eats the page.',
  deal:'Minute the meeting',payoff:'Donna reads out the quote. The entire landing demands a pen.'},
 {name:'Father Scratchcard',door:'Green door · silver dust on the mat',quote:'“It’s a clerical collar if you look from a distance. Up close it says VETS4PETS.”',
  ask:'Ask for a blessing',reply:'“Blessed are the tenants with a working extractor fan.” He’s running bingo to buy one for number twelve.',
  deal:'Call the bingo',payoff:'Two fat ladies, eighty-eight. Eighty-eight is also the number of days the fan’s been knackered.'}
];
const kit = {
 pen:['Four-colour biro','Every direct appeal gets one extra name.'],
 flask:['Flask of builder’s tea','Recover two patience now and after every second landing.'],
 badge:['Committee lanyard','Bargains cost one less patience.']
};
function towerCareer(){
 return s.towerCareer??={keys:0,best:0,bag:false,pass:false,wins:0};
}
function nextLanding(run){
 const doors=shuffle(tenants.map((_,i)=>i));
 run.doors=doors.slice(0,2);
 run.tenant=null;run.talking=false;
}
function startTower(night=false){
 const career=towerCareer();
 s.tower={target:night?15:12,floor:1,names:0,patience:career.bag?8:6,trust:[],gear:[],draft:null,
   note:night?'Night shift. Security locks the office at ten. The appeal needs 15 names and pays double keys.':'The lift has been out for eleven weeks. Get 12 names upstairs before housing shuts the repair ticket.'};
 nextLanding(s.tower); save();render();
}
function endTower(won,busted){
 const r=s.tower,c=towerCareer(),keys=won?(r.target===15?6:3):r.names>=6?1:0;
 c.keys+=keys;c.best=Math.max(c.best,r.names);if(won)c.wins++;
 s.tower=null;
 finish(won?'Repair order signed':busted?'Petition bounced':'Petition filed',
   (won?'The clerk stamps it. Upstairs, a tiny green G lights up for the first time since February.':busted?'The shutter rattles down in your face. Spanner has already written the appeal.':'You leave a copy with the caretaker before the office shuts.')+
   ' '+r.names+' signatures. '+keys+' caretaker keys banked.'+(won&&c.wins===1?' Night shift unlocked: collect 15 names for a double key payout.':''),won?(r.target===15?36:24):busted?2:r.names,won?2:-1,won?5:1);
}
function towerScene(){
 const r=s.tower,choices=$('choices'),c=towerCareer();
 const act=(label,fn,locked=false)=>button(choices,label,fn,locked);
 const update=()=>{save();render()};
 const status='LANDING '+r.floor+'/6 · '+r.names+'/'+r.target+' NAMES · '+r.patience+' PATIENCE';
 $('controls').append(element('p',r.gear.length?'In your pocket · '+r.gear.map(k=>kit[k][0]).join(', '):'In your pocket · a damp petition','towerPocket'));
 if(r.draft){
   line('Caretaker’s cupboard',r.note+' Pick something for the remaining landings.',status);
   r.draft.forEach(id=>act(kit[id][0]+' · '+kit[id][1],()=>{
     r.gear.push(id);if(id==='flask')r.patience+=2;r.draft=null;nextLanding(r);update();
   }));return;
 }
 function knock(signatures,cost,message){
   r.names+=signatures;r.patience-=cost;r.note=message;
   if(r.names>=r.target){endTower(true,false);return}
   if(r.patience<=0||r.floor===6){endTower(false,true);return}
   if(r.floor%2===0&&r.gear.includes('flask'))r.patience+=2;
   if(r.floor===2||r.floor===4)r.draft=shuffle(Object.keys(kit).filter(k=>!r.gear.includes(k))).slice(0,2);
   r.floor++;nextLanding(r);update();
 }
 if(r.tenant==null){
   line('Who’s in on this landing?',r.note,status);
   r.doors.forEach((id,i)=>{
     const door=act(tenants[id].door+(r.trust.includes(id)?' · owes you one':''),()=>{r.tenant=id;update()});
     door.classList.add('landingDoor','door'+id);
     door.dataset.flat='FLAT '+(r.floor*10+i+1);
   });
   if(r.names)act('File early · £'+r.names+' · '+(r.names>=6?'1 key':'0 keys'),()=>endTower(false,false));
   return;
 }
 const id=r.tenant,t=tenants[id],friendly=r.trust.includes(id),cost=r.gear.includes('badge')?1:2;
 line(t.name,r.talking?t.reply:t.quote,status);
 if(!r.talking)act(t.ask,()=>{r.talking=true;update()});
 if(r.talking)act(t.deal+' · 3 names / −'+cost+' patience',()=>{
   if(!friendly)r.trust.push(id);knock(3,cost,t.payoff);
 });
 if(id===1&&r.talking)act('Stop for egg mayo · recover 2 patience',()=>knock(0,-2,'Jan sends you upstairs full of egg and suspicious optimism.'));
 if(id===0&&r.talking&&r.names>=2)act('Give Spanner the clipboard · trade 2 names for 3 patience',()=>knock(-2,-3,'Spanner handles the phone queue. Two names smudge in his pocket.'));
 const names=(friendly?2:1)+Number(r.gear.includes('pen'));
 act((friendly?'Call in the favour':'Ask for a signature')+' · '+names+(names===1?' name':' names')+' / −1 patience',()=>knock(names,1,t.name+(friendly?' gets the neighbours to sign too.':' signs on the back of the gas bill.')));
 if(c.pass&&!r.usedPass)act('Use caretaker pass · 2 names, free',()=>{r.usedPass=true;knock(2,0,'The caretaker countersigns and lets you through the fire door.')});
}
function towerDesk(act){
 const c=towerCareer();
 line('Lift’s fucked. Again.','Six landings. Two doors on each. Get 12 signatures before your patience runs out. File early to keep your takings. Six names bank a caretaker key, a successful petition banks three. The whole trip takes one campaign turn.','TENANTS’ ASSOCIATION');
 $('controls').append(element('p','Best petition · '+c.best+' names   /   Repairs won · '+c.wins+'   /   Keys · '+c.keys,'towerPocket'));
 act('Take the stairs',()=>startTower());
 if(c.wins)act('Night shift · 15 names / 6 keys',()=>startTower(true));
 for(const [id,name,price] of [['bag','Big shopping bag · start with +2 patience',2],['pass','Caretaker pass · one free appeal per trip',3]]){
   if(!c[id])act(name+' · '+price+' keys',()=>{c.keys-=price;c[id]=true;save();renderTowerDesk()},c.keys<price);
   else $('controls').append(element('small',name+' · owned','towerPocket'));
 }
 act('Back to the estate',render);
}
function renderTowerDesk(){
 $('choices').replaceChildren();$('controls').replaceChildren();
 towerDesk((label,fn,locked)=>button($('choices'),label,fn,locked));
}
