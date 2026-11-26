/* The parish hall's fruit machine has been rebuilt as a pin table.
   Coordinates are shared by the rails, flippers and their painted surfaces. */
(() => {
  'use strict';
  const ballRadius = 4;
  const leftHinge = 86, rightHinge = 206, hingeY = 213, arm = 54;
  const tableRails = [
    [18,164,18,46], [18,46,44,18], [44,18,244,18], [244,18,294,59],
    [294,59,294,252], [272,252,272,69], [18,164,leftHinge,hingeY],
    [272,163,rightHinge,hingeY]
  ];
  const kits = [
    {name:'BIN NIGHT', offsets:[0,0,0], colour:'#ef9b47'},
    {name:'TEA DANCE', offsets:[16,4,-10], colour:'#df84a7'},
    {name:'DAMP PROOF', offsets:[-6,-8,12], colour:'#67b3bf'},
    {name:'LOCK IN', offsets:[22,-6,5], colour:'#b1c46d'},
    {name:'LAST ORDERS', offsets:[4,10,-13], colour:'#cc9ce0'},
    {name:'HOUSE PARTY', offsets:[-12,4,8], colour:'#f4bb64'}
  ];
  const labels = ['URN','BIN','TV'];
  const rent = 'RENT';
  const railInk = '#242336', gold = '#f9c65c', mint = '#adf5c5';
  function create(level) {
    level = Math.max(1, Math.min(6, Math.round(level) || 1));
    return {
      level, time:0, remaining:75, balls:3, pot:0, quota:160+(level-1)*30,
      x:283, y:235, vx:0, vy:0, mode:'serve', delay:0, bumps:[0,0,0],
      tagged:[false,false,false,false], banks:0, flash:0, call:'PLUNGER READY',
      flip:[0,0], trail:[], trailTick:0, stalled:0
    };
  }
  function bumper(s, i) {
    const off = kits[s.level-1].offsets[i];
    const sway = s.level>=3 && i===2 ? Math.sin(s.time*1.15)*10 : 0;
    const x = [77,211,143][i]+off+sway;
    return [x, [88,87,127][i]+(i===1?(s.level%3)*3:0), i===2?14:16];
  }
  function flipper(side, lift) {
    const x = side===0?leftHinge:rightHinge;
    const tilt = .39-lift*.98;
    return [x,hingeY,x+(side===0?1:-1)*Math.cos(tilt)*arm,hingeY+Math.sin(tilt)*arm];
  }
  function hitSegment(s, line, radius, bounce, velocity) {
    const [ax,ay,bx,by]=line, dx=bx-ax, dy=by-ay;
    const t=Math.max(0,Math.min(1,((s.x-ax)*dx+(s.y-ay)*dy)/(dx*dx+dy*dy)));
    const ox=s.x-(ax+t*dx), oy=s.y-(ay+t*dy), gap=Math.hypot(ox,oy);
    if (gap>=radius) return false;
    const nx=gap>0?ox/gap:0, ny=gap>0?oy/gap:-1;
    s.x+=nx*(radius-gap+.03); s.y+=ny*(radius-gap+.03);
    const [ux,uy]=velocity ? velocity(t) : [0,0];
    const into=(s.vx-ux)*nx+(s.vy-uy)*ny;
    if(into>=0) return false;
    s.vx-=(1+bounce)*into*nx; s.vy-=(1+bounce)*into*ny;
    return true;
  }
  function say(s, line) {s.call=line; s.flash=1.15;}
  function sound(input,hz) {if(input.tone) input.tone(hz);}
  function pulseBumper(s,i,input) {
    const [x,y,r]=bumper(s,i), dx=s.x-x, dy=s.y-y, gap=Math.hypot(dx,dy);
    if(gap>=r+ballRadius) return;
    const nx=gap?dx/gap:0, ny=gap?dy/gap:-1;
    s.x=x+nx*(r+ballRadius+.1); s.y=y+ny*(r+ballRadius+.1);
    const inward=s.vx*nx+s.vy*ny;
    if(inward>=0) return;
    s.vx+=nx*(105-1.35*inward); s.vy+=ny*(105-1.35*inward);
    if(s.bumps[i]>0) return;
    s.bumps[i]=.18; s.pot+=20;
    say(s,['URN BOILING +20','BIN LID +20','TELLY TAX +20'][i]); sound(input,230+i*90);
  }
  function hitLetters(s,input) {
    for(let i=0;i<4;i++) {
      const x=81+i*38;
      if(!hitSegment(s,[x-10,39,x+10,39],ballRadius+3,.88)) continue;
      if(s.tagged[i]) continue;
      s.tagged[i]=true; s.pot+=40; say(s,rent[i]+' LIT +40'); sound(input,520+i*100);
      if(s.tagged.every(Boolean)) {
        s.banks++; s.tagged.fill(false); s.pot+=120;
        say(s,'FULL RENT +120'); sound(input,920);
      }
    }
  }
  function prepareServe(s) {
    s.mode='serve'; s.x=283; s.y=235; s.vx=0; s.vy=0; s.trail=[]; s.stalled=0;
    say(s,'NEXT BALL READY');
  }
  function result(s) {
    const score=s.pot>=s.quota*2?3:s.pot>=s.quota?2:s.pot>0?1:0;
    const verdict=['The treasurer counts a very lonely washer.','Half the hall is banging on the glass.','The rent pot is full. The hall goes feral.','The tea urn gets its own victory lap.'][score];
    return {score,message:s.pot+' points. '+verdict};
  }
  function update(s,input,dt) {
    const h=Math.min(.1,Math.max(0,dt));
    s.time+=h; s.remaining-=h; s.flash=Math.max(0,s.flash-h);
    for(let i=0;i<3;i++) s.bumps[i]=Math.max(0,s.bumps[i]-h);
    if(s.remaining<=0) return result(s);
    if(s.mode==='drain') {
      s.delay-=h;
      if(s.delay<=0) {if(!s.balls) return result(s); prepareServe(s);}
      return;
    }
    const controls=[input.left,input.right];
    if(s.mode==='serve' && (input.pressed('action') || input.pressed('up'))) {
      s.mode='play'; s.vy=-335-power(s)*57; say(s,'BALL IN PLAY'); sound(input,157);
    }
    const steps=Math.max(1,Math.ceil(h*180)), step=h/steps;
    for(let tick=0;tick<steps;tick++){
      const old=s.flip.slice();
      for(let i=0;i<2;i++) s.flip[i]=Math.max(0,Math.min(1,s.flip[i]+(controls[i]?10:-7)*step));
      if(s.mode!=='play') continue;
      s.vy+=215*step;
      s.x+=s.vx*step; s.y+=s.vy*step;
      for(const rail of tableRails) hitSegment(s,rail,ballRadius+2,.74);
      hitLetters(s,input);
      for(let i=0;i<3;i++) pulseBumper(s,i,input);
      for(let side=0;side<2;side++){
        const line=flipper(side,s.flip[side]);
        const before=flipper(side,old[side]);
        hitSegment(s,line,ballRadius+3,.72,t=>step?[(line[2]-before[2])*t/step,(line[3]-before[3])*t/step]:[0,0]);
      }
      const speed=Math.hypot(s.vx,s.vy);
      if(speed>455) {s.vx*=455/speed; s.vy*=455/speed;}
      // A slow ball which has rolled back down the launch lane can be served again.
      if(s.x>273 && s.y>232 && s.vy>0) {prepareServe(s); break;}
      if(s.y>260) {
        s.mode='drain'; s.balls--; s.delay=.8; s.trail=[];
        say(s,s.balls?'DOWN THE DRAIN':'LAST BALL DRAINED'); sound(input,88);
        break;
      }
      s.stalled=speed<12?s.stalled+step:0;
      if(s.stalled>.85) {s.vx+=s.x<147?58:-58; s.vy-=70; s.stalled=0; say(s,'WONKY TABLE!');}
    }
    if(s.mode==='play' && (s.trailTick+=h)>.032) {
      s.trailTick=0; s.trail.push([Math.round(s.x),Math.round(s.y)]);
      if(s.trail.length>5) s.trail.shift();
    }
  }
  function power(s) {return .5+.5*Math.sin(s.time*3.6);}
  function draw(g,s){
    const theme=kits[s.level-1];
    function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);}
    function line(coords,w,c){
      g.beginPath(); g.strokeStyle=c; g.lineWidth=w; g.lineCap='round';g.lineJoin='round';
      g.moveTo(coords[0],coords[1]);
      for(let i=2;i<coords.length;i+=2) g.lineTo(coords[i],coords[i+1]);
      g.stroke();
    }
    function disc(x,y,r,c){g.fillStyle=c;g.beginPath();g.arc(Math.round(x),Math.round(y),r,0,Math.PI*2);g.fill();}
    function text(str,x,y,size,c,align='left'){
      g.fillStyle=c;g.textAlign=align;g.font='bold '+size+'px monospace';g.fillText(str,x,y);
    }
    g.save(); g.clearRect(0,0,480,270);
    rect(0,0,480,270,'#202332');
    for(let y=3;y<270;y+=9) {rect(0,y,480,1,'#423946');for(let x=(y%2)*17;x<480;x+=34)rect(x,y,1,9,'#463d48');}
    rect(6,5,301,261,'#171c26');rect(9,6,294,254,'#9e7752');rect(13,11,286,246,'#2b665e');
    for(let y=14;y<255;y+=7)rect(16,y,281,1,'#325f5d');
    // Painted terrace, windows and drying lines beneath the ball.
    for(let i=0;i<6;i++){
      const x=37+i*37,y=140+(i%3)*5;
      rect(x,y,28,32,'#3b7570');rect(x-2,y-2,32,4,'#3b7570');
      for(let k=0;k<6;k++)rect(x+3+(k%3)*8,y+6+Math.floor(k/3)*9,4,4,'#326460');
    }
    text('WEST SHAMBLES',147,68,9,'#8fb7a1','center');
    text('TENANTS CLUB',146,171,12,'#91b79d','center');
    for(const rail of tableRails){line(rail,7,railInk);line(rail,4,'#bac9b9');line(rail,1,'#f3dfb3');}
    rect(275,181,16,62,'#244947');
    for(let i=0;i<10;i++)rect(277,186+i*5,12,2,'#58827b');
    line([277,245,289,245],5,'#cb9273');
    for(let i=0;i<4;i++){
      const x=81+i*38, on=s.tagged[i];
      rect(x-12,29,24,15,railInk);rect(x-10,29,20,12,on?gold:'#a14756');
      text(rent[i],x,39,10,on?railInk:'#fff4d3','center');
    }
    for(let i=0;i<3;i++){
      const [x,y,r]=bumper(s,i),lit=s.bumps[i]>0;
      disc(x+1,y+4,r+2,'#223f42');disc(x,y,r+2,railInk);
      disc(x,y,r,lit?'#fff5cc':theme.colour);disc(x,y-1,r-4,lit?'#f0a970':'#87435b');
      rect(x-5,y-10,10,2,'#efc9a0');text(labels[i],x,y+4,9,'#fff2cf','center');
    }
    for(let i=0;i<2;i++) {
      const f=flipper(i,s.flip[i]);line(f,9,railInk);line(f,6,theme.colour);
      disc(f[0],f[1],4,'#f3cf8e');disc(f[0],f[1],2,railInk);
    }
    if(s.mode!=='drain'){
      for(let i=0;i<s.trail.length;i++)disc(...s.trail[i],1+i*.29,'#a5cbc2');
      disc(s.x+1,s.y+1,5,railInk);disc(s.x,s.y,4,'#c6dce5');rect(s.x-2,s.y-3,3,2,'#fff9e7');
    }
    rect(311,6,163,255,'#191c2b');rect(313,9,159,3,theme.colour);
    text('RENT PARTY',324,34,19,'#fff1d5');text('P I N B A L L',324,48,11,theme.colour);
    rect(323,57,139,38,'#080f19');text('RENT POT',329,69,9,mint);
    text(String(s.pot).padStart(5,'0'),455,88,21,gold,'right');
    text('TARGET '+s.quota,324,110,11,'#f6dfb9');
    text('BALLS',324,130,10,'#bdc7cf');
    for(let i=0;i<3;i++){disc(375+14*i,126,5,i<s.balls?'#c3dee3':'#414553');if(i<s.balls)rect(372+14*i,123,3,2,'#fff');}
    text(Math.ceil(Math.max(0,s.remaining))+'s',461,130,11,'#dfbb80','right');
    rect(323,142,139,2,'#4e4b58');
    text(theme.name,324,161,13,theme.colour);
    text('L / R   FLIPPERS',324,182,11,'#f5e8d8');
    text('ACTION  LAUNCH',324,199,11,'#f5e8d8');
    if(s.mode==='serve'){
      rect(324,209,130,6,'#444353');rect(324,209,Math.round(130*power(s)),6,gold);
      text('PRESS TO SERVE',324,237,12,mint);
    }else{
      text(s.flash>0?s.call:'LIGHT R E N T',324,228,10,mint);
      text('JACKPOT +120',324,248,9,'#b5b0bf');
    }
    g.restore();
  }
  window.EstateJobs=window.EstateJobs||{};
  window.EstateJobs.hall={create,update,draw,title:'Rent Party Pinball',hint:'Action launches. Left and right work the flippers. Hit bumpers and spell RENT.'};
})();
