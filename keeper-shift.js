// In goal for Shambles Athletic, looking out through the floodlit five-a-side cage.
(() => {
  const leftPost = 49;
  const rightPost = 431;
  const goalLine = 212;
  const lanes = [76, 126, 183, 240, 297, 354, 404];
  const shooters = [
    ['Donna Concrete', '#e0786e', '#d79873'],
    ['Father Scratchcard', '#efb44d', '#9e624e'],
    ['Spanner', '#8fbcc0', '#cd906a']
  ];
  const kinds = {
    drive: {name: 'LOW DRIVE', speed: 0.85, arc: 0},
    curl: {name: 'BANANA BALL', speed: 1.03, arc: 21},
    chip: {name: 'CHEEKY LOB', speed: 1.16, arc: 60}
  };
  const clamp = (x,low,high) => Math.max(low, Math.min(high,x));

  function serve(s) {
    const laneStep = 1 + Math.floor(Math.random()*5);
    s.lane = (s.lane + laneStep) % lanes.length;
    s.target = lanes[s.lane];
    s.origin = 165 + Math.floor(Math.random()*150);
    const pattern = ['drive', 'curl', 'chip', 'drive', 'chip', 'curl', 'drive', 'chip'];
    s.kind = pattern[(s.round + Math.floor((s.level - 1) / 2)) % pattern.length];
    s.bend = s.target > 240 ? -1 : 1;
    s.windup = Math.max(1.15, 1.8 - s.level * .08, Math.abs(s.target - s.x) / 170 + .25);
    s.flight = kinds[s.kind].speed - .036 * (s.level - 1);
    s.phase = 'windup';
    s.time = 0;
  }

  function create(level) {
    const s = {
      level: clamp(Math.floor(level)||1,1,6), x:240, lane:2, round:0,
      saves:0, streak:0, best:0, results:[], clock:0, glove:0, recharge:0,
      diveDir:0, lastSaved:false
    };
    s.total = 5 + Math.floor(s.level / 2);
    serve(s);
    return s;
  }

  function update(s, input, dt) {
    s.clock += dt;
    s.time += dt;
    const side = Number(!!input.right) - Number(!!input.left);
    s.recharge = Math.max(0,s.recharge-dt);
    s.glove = Math.max(0,s.glove-dt);
    if ((input.pressed('action') || input.pressed('up')) && !s.recharge && s.phase !== 'reaction') {
      s.glove = .50;
      s.recharge = .83;
      s.diveDir = side;
    }
    const velocity = s.glove > .21 && s.diveDir ? s.diveDir * 286 : side * 174;
    s.x = clamp(s.x + velocity * dt, leftPost+9, rightPost-9);
    if (s.phase === 'windup' && s.time >= s.windup) {
      s.phase = 'flight';
      s.time = 0;
      input.tone?.(137);
    } else if (s.phase === 'flight' && s.time >= s.flight) {
      const range = s.glove > 0 ? 35 : 21;
      s.lastSaved = Math.abs(s.target-s.x) <= range && (s.kind !== 'chip' || s.glove > 0);
      s.results.push(s.lastSaved);
      input.tone?.(s.lastSaved ? 659 : 110);
      if (s.lastSaved) {
        s.saves++;
        s.best = Math.max(s.best, ++s.streak);
      } else s.streak = 0;
      s.phase = 'reaction';
      s.time = 0;
    } else if (s.phase === 'reaction' && s.time >= 1.12) {
      s.round++;
      if (s.round < s.total) serve(s);
      else {
        const score = s.saves === 0 ? 0 : s.saves >= Math.ceil(s.total*.75) ? 3 : s.saves >= Math.ceil(s.total*.45) ? 2 : 1;
        const quote = ['Gaz blames the goalposts. Both of them.', 'Gaz pays you in change from the gravy boat.', 'Donna wants your gloves checked for Velcro.', 'Jan wants you between the posts at her next divorce.'][score];
        return {score, message:s.saves+' saves from '+s.total+' shots. '+quote};
      }
    }
  }

  function draw(ctx,s) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    const rect = (x,y,w,h,color) => {
      ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
    };
    function stroke(x,y,x2,y2,color,width=1) {
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
    }
    function text(str,x,y,color,size=10,align='left') {
      ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';
      ctx.font='bold '+size+'px monospace';ctx.fillText(str,x,y);
    }

    // Rows of lit maisonettes, canal sky and two floodlight pylons.
    rect(0,0,480,90,'#43435e');
    rect(0,30,480,35,'#78607b');rect(0,51,480,32,'#ac7a83');
    rect(364,27,14,15,'#f4d49c');rect(360,31,22,7,'#f4d49c');
    for (let block=0;block<10;block++) {
      const x=block*52-9, h=19+((block*53)%32), top=83-h;
      rect(x+3,top-2,46,3,'#333447');rect(x+6,top-6,7,4,'#383a4d');rect(x,top,48,h,'#4d495b');
      rect(x+42,top,6,h,'#393a4b');
      for(let row=0;row<h/9-1;row++)for(let win=0;win<5;win++){
        const lit=(win+row*3+block*7)%5;
        rect(x+4+win*8,top+4+row*9,4,4,lit<2?'#e3b887':lit===2?'#918991':'#393947');
      }
    }
    for(const x of [22,451]){
      rect(x,32,2,71,'#353344');stroke(x+1,44,x+9,36,'#393748',2);
      rect(x-4,29,18,7,'#322e40');rect(x-2,30,6,4,'#fcdd9f');rect(x+6,30,6,4,'#fff1c2');
    }

    // Terraces and spectators in team scarves.
    rect(0,77,480,26,'#4a4350');rect(0,87,480,3,'#8f7a79');
    const shirts=['#6e9ca2','#b96068','#dca75d','#798967','#716784'];
    for(let n=0;n<37;n++){
      const x=n*13+3, cheer=s.phase==='reaction'&&s.lastSaved && n%3;
      const y=83+((n*7)%4)-(cheer?Math.round(Math.abs(Math.sin(s.time*9+n))*3):0);
      rect(x+2,y,4,4,n%3?'#d19b78':'#ac755d');
      rect(x+2,y-1,4,1,'#453e4b');rect(x,y+4,8,8,shirts[n%5]);
      if(cheer){rect(x-2,y+1,2,5,shirts[n%5]);rect(x+8,y,2,6,shirts[n%5]);}
    }
    rect(0,96,480,12,'#3e414a');
    for(let n=0;n<17;n++)rect(n*30,72,1,35,'#66616b');
    stroke(0,74,480,74,'#665c68');
    rect(159,94,162,13,'#e1bb76');
    text('SHAMBLES ATHLETIC • 5-A-SIDE',240,104,'#393342',9,'center');

    // Striped astroturf and a foreshortened penalty area.
    const turf=['#557d65','#4c765e','#4a725d','#426b56','#3e664f','#395e4c'];
    let row=107;
    for(let i=0;i<turf.length;i++){const h=10+i*5;rect(0,row,480,h,turf[i]);row+=h;}
    rect(0,row,480,270-row,'#334f42');
    for(let n=0;n<63;n++){
      const x=(n*73)%480,y=110+(n*31)%119;
      rect(x,y,2+(n%3),1,'#729079');
    }
    stroke(111,156,369,156,'#c0c9a3',2);
    stroke(111,156,47,212,'#c0c9a3',2);stroke(369,156,433,212,'#c0c9a3',2);
    rect(47,goalLine,387,2,'#e3d5ae');
    // Side netting marks the near goal, leaving the aiming lanes open.
    for(const [post,edge] of [[leftPost,18],[rightPost,462]]) {
      stroke(post,140,edge,148,'#adc1b5',2);stroke(edge,148,edge,230,'#83998c');
      for(let i=0;i<7;i++)stroke(post,145+i*10,edge,150+i*12,'#829487');
      for(let i=1;i<=3;i++){const x=post+(edge-post)*i/4;stroke(x,142+i*2,x,214+i*4,'#86998b');}
      rect(post-2,139,4,75,'#f2e6ca');
    }

    const shooter=shooters[s.round%shooters.length];
    rect(6,27,shooter[0].length*6+16,15,'#373343');
    rect(6,27,3,15,shooter[1]);
    text(shooter[0].toUpperCase(),13,38,'#f3e6d2',10);
    const approach=s.phase==='windup'?Math.min(1,s.time/s.windup):1;
    const sx=Math.round(s.origin-11*(1-approach)), sy=Math.round(111+8*approach);
    rect(sx-6,sy+11,13,2,'#355647');
    rect(sx-4,sy-10,7,7,shooter[2]);rect(sx-4,sy-12,7,3,'#403444');
    rect(sx-5,sy-3,10,10,shooter[1]);rect(sx-7,sy-2,2,6,shooter[2]);rect(sx+5,sy-2,3,6,shooter[2]);
    rect(sx-4,sy+6,8,3,'#292737');rect(sx-4,sy+9,3,4,'#e4d7bb');
    rect(sx+2,sy+(s.phase==='flight'?5:9),3,4,'#e4d7bb');

    // A band on the goal line telegraphs the final destination, including curlers.
    const chip=s.kind==='chip';
    const cue=chip?'#f8b6d4':'#fff29b';
    if(s.phase!=='reaction') {
      const target=s.target;
      rect(target-14,209,28,4,'#293b39');rect(target-14,207,28,3,cue);
      rect(target-14,202,2,6,cue);rect(target+12,202,2,6,cue);
      if(chip){text('↑',target,181,cue,15,'center');}
    }

    const p=s.phase==='flight'?clamp(s.time/s.flight,0,1):s.phase==='reaction'?1:0;
    const bend=s.kind==='curl'?Math.sin(Math.PI*p)*47*s.bend:0;
    const bx=s.origin+(s.target-s.origin)*p+bend, by=134+72*p;
    const arc=Math.sin(Math.PI*p)*kinds[s.kind].arc;
    const ballY=by-arc-(chip?20*p:0);
    const radius=2+Math.floor(p*3);
    rect(bx-radius,by+3,radius*2+2,2,'#304c3e');

    // Keeper viewed from behind. A jump/dive visibly extends the reach.
    const x=Math.round(s.x), raised=s.glove>0, extension=raised?12:3;
    const lift=raised?Math.round(5+Math.sin(Math.PI*s.glove/.5)*9):0;
    const y=207-lift;
    rect(x-10,209,22,3,'#2a4339');
    rect(x-7,y-7,5,9,'#242e39');rect(x+2,y-7,5,9,'#242e39');
    rect(x-8,y-1,6,4,'#d5d7ae');rect(x+2,y-1,7,4,'#d5d7ae');
    rect(x-8,y-24,16,17,'#bdc559');rect(x-6,y-23,12,3,'#f3e580');
    const handY=y-(raised?26:18);
    rect(x-8-extension,handY,extension+2,5,'#b9c94e');rect(x+6,handY,extension+2,5,'#b9c94e');
    rect(x-11-extension,handY-1,4,6,'#fff1d3');rect(x+8+extension,handY-1,4,6,'#fff1d3');
    rect(x-5,y-31,10,8,'#c68b6c');rect(x-6,y-34,11,5,'#463644');rect(x-4,y-31,8,3,'#534251');
    text('1',x,y-11,'#3c4b37',10,'center');
    if(s.phase!=='reaction' || !s.lastSaved) {
      rect(bx-radius,ballY-radius,radius*2,radius*2,'#fcf1d5');
      rect(bx-1,ballY-1,Math.max(2,radius-1),Math.max(2,radius-1),'#37374b');
    }

    rect(0,0,480,21,'#22222e');rect(0,20,480,2,'#ab895f');
    text('SHAMBLES ATHLETIC',10,14,'#e5c98d',12);
    text('PEN '+Math.min(s.total,s.round+1)+'/'+s.total,257,14,'#fff0d3',11);
    text('SAVES '+s.saves,469,14,'#c6ec9a',11,'right');
    rect(0,232,480,38,'#242530');
    const windup=s.phase==='windup';
    const cueText=s.phase==='reaction'?(s.lastSaved?'GLOVES ON IT!':'BACK OF THE NET.'):kinds[s.kind].name;
    text(cueText,10,247,s.phase==='reaction'&&!s.lastSaved?'#ef9c91':cue,13);
    const advice=s.phase==='reaction'?(s.lastSaved?'The chip van erupts.':chip?'Meet the marker and jump just before arrival.':'Get in line with the landing strip.') :
      chip?'Line up. Jump as the lob drops.':'Cover the stripe. Dive for extra reach.';
    text(advice,10,262,'#e4ddce',10);
    const hudX=367;
    const meter=s.phase==='flight'?p:windup?s.time/s.windup:1-s.time/1.12;
    text(windup?'WIND-UP':s.phase==='flight'?'IN FLIGHT':'NEXT BALL',hudX,245,'#cfc7bc',10);
    rect(hudX,250,99,7,'#534951');rect(hudX+1,251,97*clamp(meter,0,1),5,cue);
    ctx.restore();
  }

  window.EstateJobs ??= {};
  window.EstateJobs.keeper = {
    title: 'Sunday League Keeper',
    hint: 'Move left/right to the stripe. Action dives or jumps for a lob.',
    create,update,draw
  };
})();
