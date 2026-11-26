// Local residents run side jobs. Each booking spends one campaign turn.
const bookings = {
 street: {host:'Ceefax', name:'Pirate radio', bio:'Retired traffic warden. Still drops the air horn when someone parks on a double yellow.'},
 shop: {host:'Jan Two Bellies', name:'Mystery bag auction', bio:'Runs the boot sale from a mobility scooter. Her auction hammer is a frozen baguette.'},
 wash: {host:'Spanner', name:'Spin-cycle soundcheck', bio:'Tours the laundrettes with a sampler. Played a rinse cycle at his own divorce party.'}
};
const samples = ['KICK', 'CLANK', 'HONK', 'SPIN'];
function startBooking(){
 const kind=s.place;
 const headline=(s.gigs?.[kind]||0)>=2;
 s.booking={kind, headline, pot:hasLegacy('aerial')?11:5, spins:0, value:sample([8,12,16,20]), sequence:shuffle(samples).slice(0,headline?4:3), heard:false, note:0};
 save();render();
}
function bookingScene(){
 const job=s.booking, local=bookings[job.kind], choices=$('choices');
 const complete=(text,pay,cred)=>{
   s.gigs??={};
   s.gigs[job.kind]=(s.gigs[job.kind]||0)+1;
   s.booking=null;
   finish(local.name,text,pay,-1,cred);
 };
 const update=()=>{save();render()};
 const act=(label,fn)=>button(choices,label,fn);
 if(job.kind==='street'){
   line(job.headline?'Ceefax’s drive-time takeover':local.name,local.bio+' Sponsors have pledged £'+job.pot+'. Each extra track adds £'+(job.headline?8:5)+'. Chance of getting cut off on the next track: '+(job.spins+1)+' in 6.',local.host);
   act('Cut to adverts · bank £'+job.pot,()=>complete('Ceefax reads an advert for the bloke who lost his ladder.',job.pot,job.spins+1));
   act('Drop another track',()=>{
     if(Math.random()*6<job.spins+1)complete('Dead air. Ceefax has plugged the transmitter into a bloody lamp timer.',2,1);
     else {job.spins++;job.pot+=job.headline?8:5;update()}
   });
 }else if(job.kind==='shop'){
   const clues={8:'Something ticks. The bag smells of boiled eggs.',12:'A plug sticks out. There are crumbs in the handle.',16:'A microphone lead trails out. The bag hums Careless Whisper.',20:'It weighs a ton. A tiny disco ball pokes through the plastic.'};
   const float=job.headline?22:16;
   line(job.headline?'Jan’s after-dark auction':local.name,local.bio+' '+clues[job.value]+' The rival bid is £'+(job.value-4)+'. Bid from your £'+float+' stall float. Win and keep the resale margin plus a £'+(job.headline?9:5)+' fee. A tied bid goes to the regular.',local.host);
   for(const bid of (job.headline?[6,10,14,18]:[6,10,14,16]))act('Bid £'+bid,()=>bid>job.value-4?complete('Sold! Jan flips the lot for £'+job.value+'.',(job.headline?9:5)+job.value-bid,2):complete('The regular takes it. Jan pays you £3 to put the chairs away.',3,1));
   act('Take the £6 packing shift',()=>complete('Jan hands you six quid and a bag labelled “miscellaneous lids”.',6,1));
 }else{
   line(job.headline?'Spanner goes double platinum':local.name,job.heard?'Play the sample back in order. Beat '+(job.note+1)+' of '+job.sequence.length+'.':local.bio+' Memorise his intro: '+job.sequence.join(' / '),local.host);
   if(!job.heard)act('Cover the setlist',()=>{job.heard=true;update()});
   else for(const beat of samples)act(beat,()=>{
     if(beat!==job.sequence[job.note])complete('You sample the wrong dryer. Spanner calls it experimental.',3+job.note*3,1);
     else if(++job.note===job.sequence.length)complete('The bass drops. Dryer four spits a pound coin across the dance floor.',job.headline?22:14,3);
     else update();
   });
 }
}
const milestones=[
 ['First booking',run=>Object.keys(run.gigs||{}).length>=1],
 ['Local regular',run=>Object.keys(run.gigs||{}).length>=3],
 ['Committee menace',run=>run.projects>=2 && run.steps.some(n=>n>=3)],
 ['Street legend',run=>run.projects===3 && run.paidWeeks>=3 && run.cred>=40]
];
function recordMilestones(){
 s.splits??=[];
 while(s.splits.length<milestones.length && milestones[s.splits.length][1](s)){
   log(milestones[s.splits.length][0]+' · reached on turn '+s.turn);
   s.splits.push(s.turn);
 }
}
function showMilestones(){
 const stamps=s.splits||[], goals=['Finish a resident booking','Work with Ceefax, Jan and Spanner','Finish a weekly errand and fund two projects','Fund all three projects, clear three rent weeks and earn 40 cred'];
 const list=element('ol');
 milestones.forEach(([name],i)=>list.append(element('li',name+' · '+(stamps[i]!=null?'turn '+stamps[i]:goals[i])+(s.best?.[i]!=null?' · previous best T'+s.best[i]:''))));
 $('milestones').replaceChildren(element('strong','ESTATE REPUTATION'),element('div','Season '+(s.season||1)+' · turn '+s.turn+' · '+stamps.length+'/4 ranks'),list,element('div', 'Permanent upgrades · '+((s.legacy||[]).map(id=>legacies.find(item=>item.id===id).name).join(', ')||'Finish the season to choose your first.')));
}

const legacies=[
 {id:'float',name:'Biscuit-tin float',effect:'Start each season with an extra £18'},
 {id:'aerial',name:'Rooftop aerial',effect:'Start every pirate broadcast with £6 extra pledged'},
 {id:'stamp',name:'Union rate',effect:'Collect £4 extra on every arcade shift'}
];
function hasLegacy(id){return (s.legacy||[]).includes(id)}
function startSeason(reward){
 const legacy=[...(s.legacy||[])];
 if(reward)legacy.push(reward.id);
 const best=milestones.map((_,i)=>{
   const times=[s.best?.[i],s.splits?.[i]].filter(Number.isInteger);
   return times.length?Math.min(...times):null;
 });
 const season=(s.season||1)+1;
 const career=s.towerCareer;
 s=Object.assign(fresh(),{season,legacy,best,towerCareer:career});
 if(hasLegacy('float'))s.cash+=18;
 save();render();
}
function seasonRewards(act){
 const remaining=legacies.filter(item=>!hasLegacy(item.id));
 for(const item of remaining){
   act('Keep '+item.name+' · '+item.effect+' · begin season '+((s.season||1)+1),()=>startSeason(item));
 }
 if(!remaining.length)act('Begin season '+((s.season||1)+1),()=>startSeason());
}
