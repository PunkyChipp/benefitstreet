/* Service trolleys lock into position when they reach a striped hoist bay. */
(() => {
  const plans = [
    ['.........','.P..F....','..T..B.E.','.........','...##....'],
    ['..F......','..#..B.E.','..#......','.P.T.....','......##.'],
    ['.F.......','....#..E.','...T#....','.P....B..','....#....'],
    ['....F....','.##....E.','....T....','.P.#..B..','.........'],
    ['E...#...F','.#..#.B..','....T....','..#.##...','..P......'],
    ['..#....E.','.F...#.B.','...##....','...T.....','.....P...'],
    ['..F.....E','...#..B..','..T....B.','...T.#...','.P.......'],
    ['.E....F..','..B#.....','....T..B.','.#...T...','..P......'],
    ['..F...#.E','..B...#..','....T....','..T.##.B.','.P.......'],
    ['E..#.....','B..#..B.F','...T..#..','..#..T...','.P.......']
  ];
  const names = ['Meter room','Parcels landing','Tank room','Drying room','Plant room',
    'Service duct','Trolley store','Boiler landing','Pump house','Roof access'];
  const directions = {left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
  function shuffled(items) {
    const copy = items.slice();
    for (let i=copy.length-1; i>0; i--) {
      const j=Math.floor(Math.random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  }
  function layout(id, flip) {
    const room = {id,flip,player:0,fuse:0,exit:0,walls:[],carts:[],bays:[]};
    plans[id].forEach((row,y) => [...row].forEach((symbol,x) => {
      const position = (flip?8-x:x) + y*9;
      if(symbol==='P') room.player=position;
      if(symbol==='F') room.fuse=position;
      if(symbol==='E') room.exit=position;
      if(symbol==='#') room.walls.push(position);
      if(symbol==='T') room.carts.push(position);
      if(symbol==='B') room.bays.push(position);
    }));
    return room;
  }
  function create(level) {
    const standard=shuffled([1,2,3,4,5]), doubles=shuffled([6,7,8,9]);
    const itinerary = level===1 ? [0,standard[0],standard[1]] : level<3 ?
      [standard[0],standard[1],standard[2]] : level<5 ?
      [standard[0],standard[1],doubles[0]] : [standard[0],doubles[0],doubles[1]];
    return {itinerary,floor:0,room:layout(itinerary[0],level!==1&&Math.random()<.5),
      moves:0,clock:145,repeat:0,lastKey:'',time:0,feedback:'',flash:0,brief:1};
  }
  function neighbour(cell,key) {
    const [dx,dy]=directions[key],x=cell%9+dx,y=Math.floor(cell/9)+dy;
    return x<0||y<0||x>=9||y>=5 ? -1 : x+y*9;
  }
  const parked = room => room.carts.filter(cell=>room.bays.includes(cell)).length;
  const powered = room => room.fuse<0&&parked(room)===room.carts.length;
  function result(state,score) {
    return {score,message:score===3 ?
      'Three landings cleared in '+state.moves+' steps. Jan takes the lift down one floor just to complain about the music.' :
      'Shift bell! '+score+' of 3 landings cleared. Spanner signs off the work order.'};
  }
  function update(state,input,dt) {
    if (state.floor>=3) return result(state,3);
    state.time+=dt;
    state.clock=Math.max(0,state.clock-dt);
    if(state.clock===0) return result(state,state.floor);
    state.repeat-=dt;
    state.flash=Math.max(0,state.flash-dt);
    state.brief=Math.max(0,state.brief-dt);
    const room=state.room;
    if(input.pressed('action')) {
      state.room=layout(room.id,room.flip);
      state.feedback='Caretaker has put everything back.'; state.flash=1.6;
      state.repeat=.2; state.lastKey=''; return;
    }
    const keys=Object.keys(directions);
    const key=keys.find(k=>input.pressed(k)) || keys.find(k=>input[k]);
    if(!key){state.repeat=0;state.lastKey='';return}
    if(state.repeat>0&&state.lastKey===key&&!input.pressed(key)) return;
    state.repeat=state.lastKey===key ? .13 : .21; state.lastKey=key;
    const next=neighbour(room.player,key);
    const blocked=cell=>cell<0||room.walls.includes(cell);
    if(blocked(next)) return;
    const cart=room.carts.indexOf(next);
    if(cart>=0) {
      const beyond=neighbour(next,key);
      if(room.bays.includes(next)||blocked(beyond)||room.carts.includes(beyond)||beyond===room.fuse||beyond===room.exit) return;
      room.carts[cart]=beyond;
      if(room.bays.includes(beyond)) {input.tone?.(440);state.feedback='Wheel brake on.';state.flash=.8}
    }
    room.player=next;state.moves++;
    if(room.fuse===next){room.fuse=-1;state.feedback='Fuse seated.';state.flash=1;input.tone?.(660)}
    if(next!==room.exit||!powered(room)) return;
    input.tone?.(880);state.floor++;
    if(state.floor===3) return result(state,3);
    state.room=layout(state.itinerary[state.floor],Math.random()<.5);
    state.lastKey=key;state.repeat=.33;state.flash=0;state.brief=1.4;
  }

  // Perspective is suggested by the wall plinth, floor joints and object shadows.
  function draw(g,state) {
    const r=state.room, active=powered(r), t=state.time;
    const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h)};
    function text(str,x,y,color,size=9) {
      g.fillStyle=color;g.font='bold '+size+'px monospace';g.fillText(str,x,y);
    }
    const paint=(cell,drawCell)=>drawCell(8+(cell%9)*42,49+Math.floor(cell/9)*37);
    const theme=[['#587675','#607f7b','#739591'],['#847465','#8c7c6b','#a19683'],['#6f7187','#797a90','#948da1']][state.floor%3];
    g.save();g.textAlign='left';g.textBaseline='alphabetic';
    rect(0,0,480,270,'#1d252a');rect(0,0,480,28,'#19222a');
    rect(7,8,4,13,'#ffb25b');text('SHAMBLES HOUSING  /  LIFT CREW',17,19,'#f7ead1',12);
    text(Math.ceil(state.clock)+'s',438,19,state.clock<20?'#ff9d83':'#f4d28b',13);
    rect(5,28,385,208,'#35424a');rect(8,30,378,16,'#53606a');
    for(let i=0;i<13;i++) {
      rect(11+i*29,31,26,8,'#616f77');rect(10+i*29,43,5,3,'#404954');
    }
    rect(8,39,378,3,'#d6b492');rect(8,42,378,2,'#665e5d');
    for(let i=0;i<45;i++)paint(i,(x,y)=>{
      rect(x,y,42,37,theme[i%2]);rect(x,y+35,42,2,'#475559');
      rect(x+40,y,2,35,'#526163');
      if(i%5===1){rect(x+9,y+22,8,1,theme[2]);rect(x+15,y+21,5,1,theme[2])}
      if(i%9===0){rect(x+3,y+4,2,1,theme[2]);rect(x+10,y+8,2,1,theme[2])}
    });
    r.walls.forEach((cell,i)=>paint(cell,(x,y)=>{
      rect(x+2,y+5,38,30,'#414953');rect(x+3,y+1,36,29,'#aaae9f');
      rect(x+3,y+2,36,4,'#d6d3bc');rect(x+7,y+8,28,18,'#8b948d');
      for(let j=0;j<4;j++)rect(x+10,y+10+j*3,22,1,'#52615d');
      rect(x+5,y+25,4,3,i%2?'#edb771':'#cc9b8c');
    }));
    r.bays.forEach(cell=>paint(cell,(x,y)=>{
      rect(x+2,y+2,38,32,'#f4c567');rect(x+5,y+5,32,26,'#4b4b4a');
      for(let j=0;j<4;j++) {
        rect(x+7+j*7,y+6,3,7,'#ffcc62');rect(x+8+j*7,y+13,3,8,'#ffcc62');
        rect(x+9+j*7,y+21,3,8,'#ffcc62');
      }
    }));
    paint(r.exit,(x,y)=>{
      rect(x+2,y+1,38,34,'#30363e');rect(x+5,y+4,32,27,active?'#243d38':'#acb9bb');
      rect(x+6,y+4,active?4:14,26,active?'#6e9188':'#879ba0');
      rect(x+33,y+4,3,26,'#6c7c83');rect(x+7,y+30,28,3,active?'#b3ef87':'#728085');
      rect(x+12,y,18,4,active?'#c0ff8a':'#e8a76d');text('LIFT',x+8,y+21,active?'#cdffae':'#2f454d');
    });
    if(r.fuse>=0)paint(r.fuse,(x,y)=>{
      const bob=Math.round(Math.sin(t*4));
      rect(x+10,y+27,22,2,'#50615e');rect(x+13,y+10+bob,17,15,'#5a4630');
      rect(x+14,y+11+bob,15,11,'#ffd35e');rect(x+15,y+6+bob,4,6,'#fff2ba');
      rect(x+24,y+6+bob,4,6,'#fff2ba');rect(x+20,y+13+bob,4,6,'#ad682b');
    });
    r.carts.forEach(cell=>paint(cell,(x,y)=>{
      const locked=r.bays.includes(cell);
      rect(x+6,y+29,32,4,'#4b5153');rect(x+8,y+9,27,18,'#8c494d');
      rect(x+8,y+10,27,5,'#f28d70');rect(x+9,y+16,25,8,'#b75c59');
      rect(x+6,y+6,3,18,'#e4dace');rect(x+5,y+6,7,3,'#ede7cf');
      rect(x+9,y+27,5,5,'#31323b');rect(x+29,y+27,5,5,'#31323b');
      rect(x+18,y+17,10,3,locked?'#b7e282':'#f8d093');
    }));
    paint(r.player,(x,y)=>{
      const left=state.lastKey==='left';
      rect(x+8,y+31,28,3,'#47585a');rect(x+13,y+26,6,7,'#263541');rect(x+24,y+26,5,7,'#263541');
      rect(x+11,y+15,20,13,'#355f63');rect(x+14,y+15,14,12,'#d9e56f');rect(x+13,y+21,17,2,'#ffefbf');
      rect(x+15,y+5,13,11,'#cd9a7b');rect(x+14,y+5,15,5,'#463c42');
      rect(x+15,y+3,12,4,'#f7bd48');rect(x+12,y+7,19,2,'#ffdc83');
      rect(x+(left?16:25),y+10,2,2,'#41383d');rect(x+(left?10:29),y+20,3,6,'#e9b28a');
    });
    rect(394,28,80,207,'#303c40');rect(399,35,70,193,'#172a30');
    text('SERVICE',407,51,'#dfcdac',11);
    text('FLOOR '+(state.floor+1)+'/3',404,70,'#fff4d3',11);
    for(let i=0;i<3;i++)rect(407+i*17,78,12,4,i<=state.floor?'#7dc5ae':'#364b4d');
    const light=(y,label,on)=>{rect(406,y-7,6,6,on?'#a9f095':'#5d5e57');text(label,418,y,on?'#e3f3d4':'#dbcab3',10)};
    light(109,'FUSE',r.fuse<0);light(128,'BAY',parked(r)===r.carts.length);light(147,'LIFT',active);
    text('STEPS',406,181,'#95a6a4');text(String(state.moves),406,203,'#fcce87',18);
    rect(6,240,469,23,'#36434b');
    const message=state.brief>0?names[r.id].toUpperCase()+' / '+r.carts.length+' SERVICE BAY'+(r.carts.length===1?'':'S'):
      active?'POWER ON! WALK INTO THE LIFT.':state.flash>0?state.feedback:
      r.fuse<0?'Push each trolley onto a striped bay.':parked(r)===r.carts.length?'Bays locked. Collect the yellow fuse.':'Collect the fuse and park the trolley.';
    text(message,12,256,active?'#c4f5a7':'#fff0d8',12);g.restore();
  }
  window.EstateJobs ||= {};
  window.EstateJobs.repair={title:'Lift rescue',hint:'Move to collect the fuse. Push trolleys onto stripes, then enter the lift. Action resets the floor.',create,update,draw};
})();
