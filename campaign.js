'use strict';
const $=id=>document.getElementById(id);
const places={
 street:['The estate','street','Bev','Brew at Bev’s'],
 shop:['Corner shop','shop','Sal','Till takeover'],
 wash:['Laundrette','wash','Dot','Sock detectives'],
 office:['Council office','office','Mo','Stamp duty'],
 pitch:['Football ground','pitch','Gaz','Penalty shootout']
};
const projects=[
 ['Borrow a bunting machine',15,'Bunting crosses the street. Neighbours now give you £2 extra for each favour.'],
 ['Repair the clubhouse urn',24,'Free tea after every shift restores one morale.'],
 ['Start a residents’ fund',30,'The residents chip in £12 towards each remaining rent bill.']
];
const chapters=['Bin wars','The inspection','Cup fever','Estate of the year','Last bus standing','Going up'];
const weeks=[
 ['The great bin amnesty','The council sent one skip. Kev has brought a speedboat. Someone needs to run the queue.','Marshal the queue',16,2,'The speedboat leaves full of broken microwaves.'],
 ['Inspection day','An inspector asks why the lift has a loyalty card. The residents nominate you as spokesperson.','Give the grand tour',20,3,'The inspector stamps the repair order. Bev frames it beside the darts trophy.'],
 ['West Shambles cup final','Rain stopped play. The ref will restart if someone can find the ball in the allotments.','Organise the search',24,3,'Dot returns with two footballs and a prize marrow. The match ends one–nil.'],
 ['Estate of the year','The judges are coming. Sal has already stuck a gold star over the boarded-up cashpoint.','Host the street party',29,4,'Even the parking warden joins the conga. The trophy is a repainted kettle.']
];
weeks.push(
 ['Last bus to Shambles','The route is up for review. Ceefax has wired the stop button to his air horn.','Conduct the midnight service',32,4,'Sixteen passengers and one exhausted hen make the last connection.'],
 ['Grand reopening','The council leader wants to cut the ribbon on the lift. Spanner has already sold tickets to floors two through six.','Run the lift rave',38,5,'Doors closing. Bass dropping. For once every button on this estate does exactly what it bloody says.']
);
const favours={
 street:[['Bev’s missing wheelie bin','It’s on the number 47 bus. The driver says it paid a child fare.','Meet the bus at the depot','You wheel it home to a guard of honour.'],['Committee biscuits','Bev needs someone to keep the bourbons out of the planning meeting until item six.','Guard the biscuit tin','The committee reaches item six for the first time since 1998.'],['Pavement premiere','Kev has fixed his projector. The only screen is a bedsheet on Bev’s washing line.','Set up the chairs','Forty neighbours watch a DVD menu for an hour before anyone notices.']],
 shop:[['Mystery multipack','A delivery of novelty crisps has arrived labelled “probably beef”.','Run a tasting','Local consensus is pencil sharpener with notes of Sunday roast.'],['Sal’s shop cat','The shop cat has fallen asleep on the electronic scales.','Tempt him off','The cat moves. Bananas are no longer £18 a bunch.'],['The one-pence summit','Sal has a jar of coppers and a supplier who believes in exact change.','Count the jar','You find £8, a foreign button and a strong argument for card payments.']],
 wash:[['Duvet diplomacy','Two neighbours claim the same leopard-print duvet. Dot wants a neutral negotiator.','Check the laundry tags','Both duvets belong to Gaz. Nobody asks.'],['Spin cycle disco','Dryer three makes a perfect four-four beat. Dot has a tambourine.','Sell requests','The finale is an unbalanced bath mat. The crowd demands an encore.'],['Curtain call','The community hall curtains are tangled round a trolley. The panto opens at six.','Untangle the velvet','The curtain rises on time. Unfortunately, so does Kev’s Elvis impression.']],
 office:[['Ticket 404','The queue display has skipped from 403 to 405. A small constitutional crisis is brewing.','Find the missing ticket','It was stuck to the bottom of Mo’s mug. Democracy limps on.'],['Photocopier séance','The copier only prints sideways portraits of the previous mayor.','Clear the paper tray','The mayor finally leaves office, thirty-seven copies later.'],['Blue pen emergency','The council orders all forms signed in blue. The stationery cupboard contains one purple felt tip.','Borrow Sal’s biro','Six claims clear by lunch. The biro gets its own staff lanyard.']],
 pitch:[['Lost mascot','The team ferret has gone to ground inside the assistant referee’s coat.','Coax him out','The ferret accepts a custard cream and a one-match touchline ban.'],['The chalk budget','Gaz has enough chalk for one penalty area. There are traditionally two.','Stretch the line paint','The pitch tapers slightly. Home advantage has never been so literal.'],['Away kit clash','Both teams have turned up in yellow. The ref suggests skins. It’s November.','Fetch the bibs','Hi-vis vests save the fixture. Traffic stops every time the midfield presses.']]
};
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const shuffle=a=>{let b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
const sample=a=>a[Math.floor(Math.random()*a.length)];
const runWeeks=()=>s.duration||4;
const week=()=>Math.min(runWeeks()-1,Math.floor(s.turn/14)),period=()=>s.turn%2?'Evening':'Morning',day=()=>days[Math.floor(s.turn/2)%7],bill=()=>[63,77,92,108,119,132][week()]+s.debt;
function fresh(){return {duration:6,steps:[0,0,0,0,0,0],finds:[],turn:0,cash:32,morale:8,cred:0,debt:0,place:'street',friends:{},projects:0,stories:shuffle(encounters.map((_,i)=>i)),storyIndex:0,news:'Local pigeon banned from Greggs. More as it develops.',journal:[],result:null,mini:null,totalPaid:0,paidWeeks:0}}
const key='west-shambles-month-v1';let s=fresh(),sound=false,ctx,timer;
try{let old=JSON.parse(localStorage.getItem(key));if(old&&Number.isInteger(old.turn)&&old.turn>=0&&old.turn<=(old.duration===6?84:56)&&places[old.place])s=old;sound=localStorage.getItem('estate-sound')==='1'}catch{}
function save(){try{localStorage.setItem(key,JSON.stringify(s))}catch{}}
function tone(high=false){if(!sound)return;try{ctx??=new AudioContext();ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=high?720:410;g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.13)}catch{}}
function element(tag,str,cls){let el=document.createElement(tag);if(str!=null)el.textContent=str;if(cls)el.className=cls;return el}
function button(parent,label,fn,disabled=false){const b=element('button',label,parent===$('choices')?'action':'');b.disabled=disabled;b.onclick=()=>{tone();fn()};parent.append(b);return b}
function line(title,body,tag){$('title').textContent=title;$('desc').textContent=body;$('type').textContent=tag}
function log(text){s.journal.unshift('W'+(week()+1)+' '+day().slice(0,3)+' · '+text);s.journal.length=Math.min(56,s.journal.length);s.news=text}
function finish(title,text,cash,morale,cred){const prior=s.morale;s.cash=Math.max(0,s.cash+cash);s.morale=Math.min(10,Math.max(0,s.morale+morale));s.cred+=cred;
 const gains=[cash?(cash>0?'+£':'−£')+Math.abs(cash):'',s.morale!==prior?(s.morale>prior?'+':'')+(s.morale-prior)+' morale':'',cred?'+'+cred+' cred':''].filter(Boolean).join(' · ');
 log(title+(gains?' · '+gains:''));let extra='';
 if(s.turn%14===13){const due=bill(),fund=s.projects>=3?12:0,pay=Math.min(s.cash,Math.max(0,due-fund));s.cash-=pay;s.totalPaid+=pay;s.debt=Math.max(0,due-pay-fund);if(!s.debt)s.paidWeeks++;
 extra=' Rent night: £'+pay+' paid'+(fund?' plus £12 from the fund':'')+'. '+(s.debt?'£'+s.debt+' in arrears.':'All square.');log(extra.trim())}
 s.turn++;recordMilestones();s.mini=null;s.result={title,text:text+(gains?' '+gains+'.':'')+extra};save();render()}
function visit(k){if(s.tower||s.mini||s.booking||s.result||s.turn>=runWeeks()*14)return;s.place=k;save();render()}
function favour(){const p=s.place,n=s.friends[p]||0,story=favours[p][n%3];line(story[0],story[1],places[p][2].toUpperCase()+' · FAVOUR '+(n+1));$('choices').replaceChildren();
 button($('choices'),story[2],()=>{s.friends[p]=n+1;const bonus=(n+1)%3===0;finish(story[0],story[3]+(bonus?' Your neighbour slips you an £8 thank-you.':''),5+(s.projects?2:0)+(bonus?8:0),1,2)});
 button($('choices'),'Back',render)}
function story(){const e=encounters[s.stories[s.storyIndex%s.stories.length]];line(e[1],e[2],e[0]);$('choices').replaceChildren();e[3].forEach(([label,c,m,r,txt,req])=>button($('choices'),label+(req?' · '+req+' cred':''),()=>{s.storyIndex++;finish(e[1],txt,c,m,r)},s.cash+c<0||(req&&s.cred<req)));button($('choices'),'Back',render)}
const goods=[['custard creams',135],['a pint of milk',145],['a Freddo',65],['a sausage roll',175],['washing powder',395],['six eggs',210],['bog roll',285],['a scratchy sponge',85],['tea bags',235],['a tin of mushy peas',55]];
const money=p=>'£'+(p/100).toFixed(2);
function question(m){
 if(m.kind==='shop'){const items=shuffle(goods).slice(0,week()>0?2:1),cost=items.reduce((v,i)=>v+i[1],0),paid=cost<=500?500:1000,answer=paid-cost;
 return {prompt:items.map(([n,c])=>n+' '+money(c)).join(' + '),task:'Customer pays '+money(paid)+'. Give their change.',answer:money(answer),opts:shuffle([answer,answer+25,answer>=50?answer-50:answer+50].map(money))}}
 const district=sample(['BS1','BS2','BS3']),code=sample(['bus pass','rent rebate','repair grant']),okPost=Math.random()>.33,okForm=Math.random()>.32,shown=okPost?district:district+'X',form=okForm?code:sample(['skip permit','pond licence']);
 return {prompt:shown+' • '+form,task:'Accept only '+district+' / '+code+'. Check both fields.',answer:okPost&&okForm?'Stamp it':'Return it',opts:['Stamp it','Return it']}}
function startMini(){const kind=s.place;const m={kind,round:0,hits:0,total:3+Number(week()>1),msg:'',seed:Math.random()*6};if(kind==='wash'){const symbols=['🍋','🧦','🦆','🍄','🪩','🐟'].slice(0,3+week());m.deck=shuffle([...symbols,...symbols]);m.open=[];m.found=[];m.tries=0;m.max=symbols.length*2+1}else if(kind!=='pitch')m.q=question(m);s.mini=m;save();render();$('stage').scrollIntoView({block:'nearest'});}
function payout(){const m=s.mini,count=m.kind==='wash'?m.found.length/2:m.hits;
 const remarks={shop:'Sal counts the float twice and lets you take the least dented tin.',wash:'Dot clips the surviving pairs to a commemorative washing line.',office:'Mo adds your stamp tally to a spreadsheet called FINAL_final_6.',pitch:'Gaz records the official result on the back of a chip receipt.'};
 finish(places[m.kind][3],remarks[m.kind]+' '+count+' / '+(m.kind==='wash'?m.deck.length/2:m.total)+' scored.',3+(hasLegacy('stamp')?4:0)+count*(week()+2),s.projects>=2?0:-1,count>=2?2:0)}
function advanceMini(correct,feedback){const m=s.mini;m.round++;if(correct){m.hits++;tone(true)}m.msg=feedback;if(m.round<m.total&&m.kind!=='pitch')m.q=question(m);save();render()}
function pair(i){const m=s.mini;if(m.open.length===2||m.open.includes(i)||m.found.includes(i))return;m.open.push(i);if(m.open.length===2){m.tries++;const [a,b]=m.open;if(m.deck[a]===m.deck[b]){m.found.push(a,b);m.open=[];m.msg='A perfect pair.';tone(true)}else m.msg='Odd socks. Remember where they landed.'}save();render()}
function arcade(){const m=s.mini,stage=$('stage');stage.hidden=false;const box=element('div',null,'machine');stage.append(box);box.append(element('h3',places[m.kind][3].toUpperCase()));
 const complete=m.kind==='wash'?(m.found.length===m.deck.length||m.tries>=m.max):m.round>=m.total;
 if(complete){box.append(element('p',m.msg),element('div',m.kind==='wash'?m.found.length/2+' pairs reunited':m.hits+' / '+m.total+' scored','readout'));button(box,'Collect shift pay',payout);return}
 if(m.kind==='wash'){box.append(element('p','Find matching socks · '+(m.max-m.tries)+' attempts left'));const keys=element('div',null,'keys socks');box.append(keys);m.deck.forEach((symbol,i)=>{const up=m.open.includes(i)||m.found.includes(i);const b=button(keys,up?symbol:String(i+1),()=>pair(i),up||m.open.length===2);b.setAttribute('aria-label','Sock '+(i+1)+(up?' '+symbol:''))});if(m.open.length===2)button(box,'Turn them over',()=>{m.open=[];save();render()});}
 else if(m.kind==='pitch'){box.append(element('p','Shoot away from the orange keeper · Kick '+(m.round+1)+'/'+m.total));const g=element('div',null,'goal'),k=element('div','GK','keeper'),b=element('div','●','ball');g.append(k,b);box.append(g);let x=50,y=50;
 const tick=()=>{const t=performance.now()/1000;x=50+44*Math.sin(t*(1.9+week()*.25)+m.seed);y=50+34*Math.sin(t*1.13+m.round);b.style.left=x+'%';k.style.left=y+'%'};tick();timer=setInterval(tick,32);button(box,'Shoot!',()=>{const hit=Math.abs(x-y)>13;advanceMini(hit,hit?'Top bins! Gaz loses his hat.':'Saved! The keeper celebrates like it’s Wembley.')});}
 else{box.append(element('p',m.q.task),element('div',m.q.prompt,'readout'));const keys=element('div',null,'keys');box.append(keys);m.q.opts.forEach(v=>button(keys,v,()=>advanceMini(v===m.q.answer,v===m.q.answer?'Spot on.':'Missed it. Correct call: '+m.q.answer+'.')));box.append(element('small','Ticket '+(m.round+1)+' / '+m.total))}
 if(m.msg)box.append(element('p',m.msg,'resultLine'))
}
function render(){
 clearInterval(timer);const p=s.place,loc=places[p],w=week(),over=s.turn>=runWeeks()*14,finale=!over&&s.turn%14===13;
 $('choices').replaceChildren();$('controls').replaceChildren();$('stage').replaceChildren();$('stage').hidden=true;
 $('backdrop').style.backgroundImage='url('+loc[1]+'.webp)';$('scene').className='scene'+(s.turn%2?' evening':'')+(p==='street'||p==='pitch'?(Math.floor(s.turn/2)%5===3?' rain':''):'');
 $('scene').setAttribute('aria-label',loc[0]+', '+period());$('sceneName').textContent=loc[0].toUpperCase();$('clock').textContent=over?'CAMPAIGN COMPLETE':day().toUpperCase()+' · '+period().toUpperCase();
 document.querySelector('.sign').hidden=p!=='street';$('decor').replaceChildren();
 if(p==='street'){if(s.projects)$('decor').append(element('span',null,'flags'));$('decor').append(passerBy(s.turn))}
 $('day').textContent=over?'DAY '+(runWeeks()*7)+' / '+(runWeeks()*7):'W'+(w+1)+' · '+day().slice(0,3).toUpperCase()+' · '+period().toUpperCase();$('sectionName').textContent=chapters[w].toUpperCase();
 $('map').replaceChildren();Object.entries(places).forEach(([k,v])=>{let b=button($('map'),v[0],()=>visit(k),!!s.tower||!!s.mini||!!s.booking||!!s.result||over);b.setAttribute('aria-current',k===p)});
 $('cash').textContent='£'+s.cash;$('cred').textContent=s.cred;$('morale').textContent=s.morale+'/10';$('pot').textContent=over?'£'+s.debt+' owed':'£'+s.cash+' / £'+bill();$('fill').style.width=Math.min(100,s.cash/bill()*100)+'%';$('feed').textContent=s.news;
 $('project').replaceChildren(element('strong','WEEK '+(w+1)+' / '+runWeeks()+' · '+chapters[w].toUpperCase()),element('div','Estate projects: '+s.projects+'/3 · Rent weeks cleared: '+s.paidWeeks+'/'+runWeeks()),element('div',loc[2]+' · '+(s.friends[p]||0)+' favours'));
 showMilestones();
 $('journal').replaceChildren(...(s.journal.length?s.journal:['Your first morning on Benefit Street.']).map(n=>element('li',n)));
 const chain=errands[w],step=s.steps[w],next=chain.steps[step];
 $('errand').replaceChildren(element('strong','NEIGHBOURHOOD ERRAND'),element('h3',chain.name),element('div',next?step+'/3 · '+next[1]+' at '+places[next[0]][0]+'. Reward: £'+chain.reward+'.':'Complete · £'+chain.reward+' collected.'),element('small','Street finds: '+s.finds.length+' / '+(runWeeks()*2)));
 $('discovery').replaceChildren();
 const idx=Math.floor(s.turn/7),target=Object.keys(places)[idx%5];
 if(!s.tower&&!s.result&&!s.mini&&!s.booking&&!over&&!finale&&p===target&&!s.finds.includes(idx)){
 const [icon,item,caption]=finds[idx],b=button($('discovery'),icon,()=>{s.finds.push(idx);s.cash+=2;s.cred++;log(item+' · +£2 · +1 cred');s.result={title:item,text:caption+' +£2 · +1 cred. Searching takes no time.'};save();render()});b.setAttribute('aria-label','Inspect '+item);b.title='Inspect '+item;
 b.style.left=(48+idx*7%34)+'%';b.style.top=(52+idx*6%18)+'%';
 }
 const act=(label,fn,locked)=>button($('choices'),label,fn,locked);
 if(s.result){line(s.result.title,s.result.text,'STREET DIARY');act(over?'See the estate verdict':'Continue · '+day()+' '+period().toLowerCase(),()=>{s.result=null;save();render()});return}
 if(over){const title=s.debt?'On the payment plan':s.projects===3&&s.cred>=24?'Mayor of Benefit Street':'Rent paid. Kettle on.';line(title,runWeeks()+' weeks on the estate. You put £'+s.totalPaid+' into rent, completed '+s.projects+' community projects and did '+Object.values(s.friends).reduce((a,b)=>a+b,0)+' favours. '+(s.debt?'£'+s.debt+' rolls into next month. Bev saves you a chair.':'Your rent account reads £0 owed. Sal puts your picture in the window.'),'ESTATE IN REVIEW');seasonRewards(act);return}
 if(s.tower){towerScene();return}
 if(s.booking){bookingScene();return}
 if(s.mini){line(loc[3],'Play the shift in the scene above. Your progress saves after each move.','ON SHIFT · '+loc[0].toUpperCase());arcade();act('Clock out with current score',payout);return}
 if(finale){const e=weeks[w];line(e[0],e[1],'SUNDAY SPECIAL · RENT NIGHT');act(e[2]+' · earn £'+e[3],()=>finish(e[0],e[5],e[3],-1,e[4]));const required=3+w*4;act('Rally the residents · '+required+' cred',()=>finish(e[0],e[5]+' The whole street chips in.',e[3]+12,2,e[4]),s.cred<required);return}
 if(p==='street'){
 const e=encounters[s.stories[s.storyIndex%s.stories.length]];line(e[1],e[2],'ON YOUR DOORSTEP · '+period().toUpperCase());act('Take the stairs · lift petition',renderTowerDesk);act('Get involved',story);
 }else{
 const descriptions={shop:'Sal slides the cash drawer across. The queue is already arguing about who was next.',wash:'Dot tips a basket of odd socks onto the folding table. Every reunited pair earns a bounty.',office:'Mo points at the applications tray. Read the rule on each ticket and stamp the matching claims.',pitch:'Gaz has chalked a goal on the training ground. Watch the ball and pick your moment to shoot.'};
 line(loc[3],descriptions[p],'SHIFT AVAILABLE · '+loc[2].toUpperCase());act(s.morale?'Start shift · earn up to £'+(3+(hasLegacy('stamp')?4:0)+(p==='wash'?Math.min(6,3+w):3+Number(w>1))*(w+2)):'Too knackered · take a break',startMini,!s.morale)
 }
 if(bookings[p])act(bookings[p].host+' · '+bookings[p].name+((s.gigs?.[p]||0)>=2?' · headline gig':' · '+(s.gigs?.[p]||0)+'/2 to headline'),startBooking,!s.morale);
 act('Help '+loc[2]+' · '+favours[p][(s.friends[p]||0)%3][0],favour);
 if(p==='street'&&s.projects<3){const [name,cost,txt]=projects[s.projects];act(name+' · £'+cost,()=>{s.projects++;finish(name,txt,-cost,2,3)},s.cash<cost)}
 if(next&&next[0]===p)act('Errand · '+next[1],()=>{s.steps[w]++;const done=s.steps[w]===3;finish(chain.name,next[2]+(done?' Errand complete!':''),done?chain.reward:0,1,done?4:1)});
 act('Take a brew break · +3 morale',()=>finish('Kettle’s on',sample(['Bev reads a one-star review of the bus stop aloud.','Ten quiet minutes and a biscuit with structural integrity.','Gaz tells the same joke twice. Better the second time.']),0,3,0))
}
$('sound').onclick=()=>{sound=!sound;try{localStorage.setItem('estate-sound',sound?'1':'0')}catch{}showSound();tone()};function showSound(){$('sound').textContent='♪ SOUND '+(sound?'ON':'OFF');$('sound').setAttribute('aria-pressed',String(sound))}
$('help').onclick=()=>$('guide').showModal();$('got').onclick=$('close').onclick=()=>$('guide').close();showSound();render();
document.addEventListener('keydown',event=>{
 if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||$('guide').open||!/^[1-9]$/.test(event.key))return;
 const buttons=s.mini?$('stage').querySelectorAll('button'):$('choices').children;
 buttons[Number(event.key)-1]?.click();
});
