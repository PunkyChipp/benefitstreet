// The reclaimed tubs at the south end of the square survive every circuit.
const EstateLife=(()=>{
 const beds=[{x:185,y:230},{x:214,y:230},{x:243,y:230}],home={x:458,y:113};
 const crops=[
   {name:'chives',days:1,value:3,colour:'#8bcc70'},
   {name:'plum tomatoes',days:2,value:6,colour:'#ff805f'},
   {name:'prize marrows',days:3,value:10,colour:'#d8eb81'}
 ];
 const residents={
   bike:['“Council called this a food desert. I’ve been knee-deep in mushy peas since 1987.”','“I’ve still got the old shop sign. My mum painted the pound mark backwards. Wouldn’t change it.”'],
   radio:['“I’ve got three listeners. Four if you count the lift alarm.”','“Listen after midnight. That dedication to ‘the block’ is for my dad. He wired the first aerial.”'],
   repair:['“Have a look at that damp patch. Looks exactly like the bloke they sent to inspect it.”','“Used to think nobody noticed me grafting. Kept the first thank-you card in my tool tin.”'],
   keeper:['“Actual grass, that. Council tried to charge us a garden waste subscription for the pitch.”','“My first pair of boots came from this hall. I keep the small sizes for whoever comes next.”'],
   hall:['“That bingo blower’s a hairdryer taped to a salad spinner. Lottery people still want a licence.”','“First winter I moved in, the whole block ate in here. Put your chair anywhere, love.”']
 };
 const keepsakes={
   bike:'Jan gives you the key to her chutney cupboard. Every future veg gift earns £2 extra.',
   radio:'Ceefax plays your allotment jingle on air. Rinse FM shifts now pay a £3 appearance fee.',
   repair:'Spanner rigs a header tank over the tubs. Your crops grow every night.',
   keeper:'Donna digs out her lucky boots. You move faster around the estate.',
   hall:'Father Scratchcard writes your name in the bingo fund. Future weeks start with £4 extra.'
 };
 const seasons=['Spring','Summer','Autumn','Winter'];
 function season(life){return seasons[Math.floor((life.day-1)/7)%4]}
 function fresh(){return {day:1,evening:false,plots:[{crop:0,growth:1,wet:false},null,null],basket:[],bonds:{},gifts:{},chats:{}}}
 function advance(life,overnight=false){
   if(!overnight&&!life.evening){life.evening=true;return}
   const growingSeason=season(life);life.evening=false;life.day++;
   for(const plot of life.plots)if(plot){
     if(plot.wet||life.bonds.repair===3)plot.growth=Math.min(crops[plot.crop].days,plot.growth+(plot.crop===1&&growingSeason==='Summer'||plot.crop===2&&growingSeason==='Autumn'?2:1));
     plot.wet=life.day%4===0;
   }
 }
 function near(x,y){
   const index=beds.findIndex(b=>Math.hypot(x-b.x,y-b.y)<14);
   if(index!==-1)return {kind:'bed',index};
   if(Math.hypot(x-home.x,y-home.y)<16)return {kind:'home'};
 }
 function unlocked(life){return 1+Math.min(2,Object.values(life.bonds).filter(n=>n>=2).length)}
 function sowType(life,i){return Math.min(i,unlocked(life)-1)}
 function instruction(life,spot){
   if(spot.kind==='home')return 'Enter Flat 9 · sleep, cook or check Ceefax';
   const i=spot.index,p=life.plots[i];
   if(!p)return 'Sow '+crops[sowType(life,i)].name+' in tub '+(i+1);
   const c=crops[p.crop];
   if(p.growth>=c.days)return 'Harvest '+c.name+' · give them to a neighbour';
   return (p.wet?'Watered':'Water '+c.name)+' · '+(c.days-p.growth)+' more growing night'+(c.days-p.growth===1?'':'s');
 }
 function tend(life,spot){
   const i=spot.index,p=life.plots[i];
   if(!p){life.plots[i]={crop:sowType(life,i),growth:0,wet:life.day%4===0};return 'Seeds in. Give the soil a drink before bed.'}
   const c=crops[p.crop];
   if(p.growth>=c.days){life.basket.push(p.crop);life.plots[i]=null;return c.name+' in the basket. Take them to a neighbour and use Give.'}
   if(p.wet)return 'The soil is damp. Come back tomorrow.';
   p.wet=true;return 'One watering can, half a Quality Street tin and a decent chance of '+c.name+'.';
 }
 function social(life,id,canal){
   const bond=life.bonds[id]||0;
   if((life.meals?.length||life.basket.length||canal.creel.length)&&life.gifts[id]!==life.day){
     const veg=life.basket.length>0;
     const supper=!!life.meals?.length;
     const crop=supper?{name:'fish supper',value:life.meals.shift()}:veg?crops[life.basket.shift()]:ShamblesCanal.fish[canal.creel.shift()],next=Math.min(3,bond+(supper?2:1));life.gifts[id]=life.day;life.bonds[id]=next;
     const value=crop.value+(veg&&!supper&&life.bonds.bike===3?2:0);
     return {cash:value,message:'“Local '+crop.name+'? Get in.” £'+value+' towards the rent.'+(next===2&&bond<2?' You’re a regular now. Check the seed tubs for new varieties.':next===3&&bond<3?' '+keepsakes[id]:'')};
   }
   if(life.chats[id]===life.day)return {cash:0,message:'“Pop back tomorrow, love.”'};
   life.chats[id]=life.day;return {cash:0,message:residents[id][bond>=2?1:0]};
 }
 function draw(ctx,life){
   const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
   const label=(x,y,msg)=>{ctx.font='bold 7px monospace';const w=ctx.measureText(msg).width+6;rect(x-w/2,y-7,w,9,'#293b34');ctx.fillStyle='#f5e6b8';ctx.fillText(msg,x-w/2+3,y)};
   beds.forEach(({x,y},i)=>{
     const p=life.plots[i];rect(x-12,y-4,25,10,'#433c38');rect(x-12,y-4,25,7,'#a89a80');rect(x-10,y-3,21,4,p?.wet?'#483a35':'#71503b');
     if(p){const c=crops[p.crop],ripe=p.growth>=c.days;
       for(const dx of [-6,0,6]){const stem=ripe?9:3+p.growth*2;rect(x+dx,y-stem,2,stem,'#789849');rect(x+dx-2,y-stem+1,2,3,'#a9cb63');if(ripe)rect(x+dx+1,y-stem-1,3,3,c.colour)}
     }
   });label(214,246,'ALLOTMENT');label(home.x,99,'FLAT 9');
 }
 return {fresh,season,advance,near,instruction,tend,social,draw,crops,keepsakes};
})();
