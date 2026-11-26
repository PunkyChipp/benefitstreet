/* The Chippy Circuit. All measurements are world pixels, independent of frame rate. */
(() => {
  'use strict';

  const wheels = [169, 202, 235];
  const riderX = 92;
  const customers = [
    { name: 'Jan', order: 'Egg mayo', coat: '#e294a9' },
    { name: 'Spanner', order: 'Pie & mash', coat: '#9cc779' },
    { name: 'Ceefax', order: 'Gravy chips', coat: '#71b9c3' },
    { name: 'Donna', order: 'Battered sausage', coat: '#e6ae63' },
    { name: 'Father S.', order: 'Peas & scraps', coat: '#b2a4c4' }
  ];
  const stores = ['CHIP FOR BRAINS', 'DOT’S SPIN', 'BS1 OFF LICENCE', 'SHAMBLES TYRES'];
  const shopColors = ['#a05d51', '#527778', '#836c87', '#9b7658'];
  const clamp = (n, min, max) => Math.max(min, Math.min(n, max));
  const between = n => Math.floor(Math.random() * n);

  function create(level) {
    const orders = [];
    const hazards = [];
    const first = between(customers.length);
    for (let i = 0; i < 3; i++) {
      const start = i * 900;
      const lane = (between(2) + i) % 3;
      const dropLane = (lane + 1 + between(2)) % 3;
      orders.push({ pick: start + 205, drop: start + 760, lane, dropLane, person: (first + i) % customers.length });
      // Keep the approaches to both stops clear and leave a way through every obstacle.
      hazards.push({ x: start + 405, lane: dropLane, kind: 'bin' });
      hazards.push({ x: start + 555, lane: (dropLane + 1) % 3, kind: 'puddle' });
      if (level >= 3) hazards.push({ x: start + 405, lane: (dropLane + 2) % 3, kind: 'cone' });
      if (level >= 5) hazards.push({ x: start + 555, lane: dropLane, kind: 'cone' });
    }
    return { level, orders, hazards, x: 0, y: wheels[1], time: 0, jump: 0, bump: 0, carried: false,
      order: 0, heat: 0, bagTaken: false, delivered: 0, damage: 0, notice: '', noticeFor: 0, toss: null };
  }

  function notify(s, message) {
    s.notice = message;
    s.noticeFor = 2.4;
  }

  function update(s, input, dt) {
    const step = clamp(dt, 0, 0.1);
    const order = s.orders[s.order];
    if (!order) {
      return { score: s.delivered, message: s.delivered + '/3 suppers delivered. ' +
        (s.delivered === 3 ? 'Still hot. Jan tips you in exact change and a single onion ring.' :
         s.delivered ? 'The chippy chalks your deliveries up on the till.' : 'Cold chips for the pigeons. The chippy gives you another crack at the round.') };
    }
    s.time += step;
    s.noticeFor = Math.max(0, s.noticeFor - step);
    s.bump = Math.max(0, s.bump - step);
    s.jump = Math.max(0, s.jump - step);
    if (s.toss && (s.toss.time += step) > 0.56) s.toss = null;

    const cruise = 83 + s.level * 7;
    const speed = s.bump > 0 ? cruise * 0.48 : cruise * (input.left ? 0.65 : input.right ? 1.4 : 1);
    s.x += speed * step;
    s.y = clamp(s.y + ((input.down ? 1 : 0) - (input.up ? 1 : 0)) * 108 * step, wheels[0], wheels[2]);
    if (s.carried) {
      s.heat = Math.max(0, s.heat - step);
      if (s.heat === 0) {
        s.carried = false;
        notify(s, 'Stone cold! The pigeons claim this one.');
      }
    }
    const sameLane = lane => Math.abs(s.y - wheels[lane]) <= 15;
    const nearDrop = order.drop - s.x;
    if (input.pressed('action')) {
      if (s.carried && !order.served && nearDrop >= -21 && nearDrop <= 105 && sameLane(order.dropLane)) {
        s.carried = false;
        order.served = true;
        s.delivered++;
        s.toss = { time: 0, fromX: s.x, fromY: s.y - 22, toX: order.drop, toY: wheels[order.dropLane] - 15 };
        notify(s, customers[order.person].name + ' caught it!');
      } else if (s.jump === 0) {
        s.jump = 0.85;
      }
    }
    if (!s.bagTaken && Math.abs(s.x - order.pick) <= 22 && sameLane(order.lane)) {
      s.carried = true;
      s.bagTaken = true;
      s.heat = 8.8 - s.level * 0.18;
      notify(s, customers[order.person].order + ' aboard');
    }
    const inAir = jumpHeight(s) > 9;
    for (const hazard of s.hazards) {
      if (hazard.hit || inAir || Math.abs(s.x - hazard.x) > 15 || !sameLane(hazard.lane)) continue;
      hazard.hit = true;
      s.damage++;
      if(s.carried) s.heat = Math.max(0, s.heat - 1.2);
      s.bump = 0.78;
      notify(s, hazard.kind === 'bin' ? 'Wheelie bin: 1. Front wheel: 0.' : hazard.kind === 'puddle' ? 'Gravy slick!' : 'That cone had right of way.');
    }
    if (s.x > order.drop + 53) {
      s.order++;
      if (!order.served) notify(s, s.carried ? 'Missed the handoff!' : 'That supper stayed at the chippy.');
      s.carried = false;
      s.bagTaken = false;
    }
  }

  function jumpHeight(s) {
    return s.jump > 0 ? Math.sin(Math.PI * s.jump / 0.85) * 32 : 0;
  }

  function draw(ctx, s) {
    const rect = (x,y,w,h,color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x),Math.round(y),w,h);
    };
    const text = (str,x,y,color,size=9) => {
      ctx.fillStyle = color;
      ctx.font = 'bold ' + size + 'px monospace';
      ctx.fillText(str,Math.round(x),Math.round(y));
    };
    const line = (x,y,dx,dy,color,width=2) => {
      ctx.beginPath();
      ctx.strokeStyle=color;
      ctx.lineWidth=width;
      ctx.moveTo(Math.round(x),Math.round(y));ctx.lineTo(Math.round(dx),Math.round(dy));ctx.stroke();
    };
    const at = worldX => Math.round(worldX - s.x + riderX);
    const wheel = (x,y,r,spin) => {
      ctx.lineWidth=3;ctx.strokeStyle='#282532';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();
      ctx.lineWidth=1;ctx.strokeStyle='#c9c7b6';ctx.beginPath();ctx.arc(x,y,r-2,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<3;i++){
        const a = spin + i * Math.PI / 3;
        const w = Math.cos(a)*(r-2),h = Math.sin(a)*(r-2);
        line(x-w,y-h,x+w,y+h,'#aba6a0',1);
      }
    };
    // Evening sky, distant concrete blocks and the shop row move at separate speeds.
    rect(0,0,480,270,'#cf9e9a');
    rect(0,36,480,30,'#dab694');
    rect(354,30,26,26,'#f8ce90');rect(350,35,34,16,'#f8ce90');
    const skyScroll = Math.floor(s.x * 0.09);
    for(let i=Math.floor(skyScroll/70);i<=Math.floor(skyScroll/70)+8;i++){
      const x=i*70-skyScroll,y=34+(i*13%25);
      rect(x,y,58,82,'#7d7882');rect(x+4,y-3,46,3,'#a38b89');
      for(let k=0;k<6;k++)for(let j=0;j<4;j++)rect(x+4+k*9,y+6+j*10,5,4,(k+j+i)%5===0?'#f1c791':'#666b76');
    }
    const scroll = Math.floor(s.x * 0.48);
    for(let i=Math.floor(scroll/124);i<=Math.floor(scroll/124)+4;i++){
      const x=i*124-scroll, style=i%stores.length, y=71+(i%3)*4;
      rect(x,y,122,66,shopColors[style]);rect(x,y-4,122,4,'#504551');
      rect(x+3,y+2,116,12,'#3a4049');text(stores[style],x+7,y+11,'#f6dfa6',9);
      rect(x+4,y+18,86,34,'#273943');rect(x+8,y+21,75,24,'#89a19e');
      rect(x+12,y+24,14,2,'#c8c7a4');rect(x+30,y+29,23,3,'#afbbb0');
      rect(x+48,y+18,4,34,'#4b5558');rect(x+95,y+16,23,51,'#322e37');
      rect(x+98,y+19,17,25,'#749191');rect(x+111,y+47,3,3,'#dbbb87');
      rect(x+5,y+52,85,4,'#c69377');rect(x+14,y+52,3,9,'#71605a');
    }
    rect(0,132,480,12,'#a99c95');rect(0,143,480,5,'#c6b4a1');rect(0,148,480,99,'#676976');
    for(let l=0;l<2;l++){
      const y=(wheels[l]+wheels[l+1])/2;
      for(let x=-(s.x%70);x<480;x+=70)rect(x,y,31,2,'#b7afa9');
    }
    for(let x=-(s.x%98);x<480;x+=98){
      rect(x,151,33,2,'#d4b56a');rect(x,244,33,2,'#ccb16b');
      rect(x+36,198,16,2,'#797884');rect(x+41,200,9,1,'#797884');
    }
    const sprites = [];
    function shadow(x,y,w){rect(x-w/2,y-1,w,3,'#505361')}
    function pin(x,y,str,color) {
      const width = str.length*6+8;
      rect(x-width/2,y-12,width,13,'#282733');rect(x-2,y+1,4,3,color);
      text(str,x-width/2+4,y-3,color,10);
    }
    s.hazards.forEach(h=>{
      const x=at(h.x),y=wheels[h.lane];
      if(x< -20||x>500)return;
      sprites.push({y,paint(){
        shadow(x,y,24);
        if(h.kind==='bin'){
          rect(x-9,y-22,17,20,'#314f4c');rect(x-11,y-25,21,5,'#203d3b');rect(x-7,y-19,3,12,'#588075');
          rect(x+3,y-17,3,5,'#c1b889');rect(x-6,y-2,4,4,'#2c2831');rect(x+3,y-2,4,4,'#2c2831');
        }else if(h.kind==='puddle'){
          rect(x-15,y-3,31,4,'#373e51');rect(x-10,y-5,17,2,'#a6b6b9');rect(x+1,y-2,9,1,'#d0c9c1');
        }else{
          rect(x-10,y-3,20,4,'#3d3540');rect(x-6,y-8,12,6,'#f18759');rect(x-4,y-13,8,5,'#ecd4ad');rect(x-2,y-19,4,6,'#f18759');
        }
      }});
    });
    const order=s.orders[s.order];
    if(order){
      const customer=customers[order.person];
      const px=at(order.pick),py=wheels[order.lane];
      if(!s.bagTaken && px>-28 && px<510)sprites.push({y:py,paint(){
        const top=py-19+Math.round(Math.sin(s.time*4)*2);shadow(px,py,24);
        rect(px-8,top,16,16,'#523d3b');rect(px-7,top+1,14,13,'#ffc56e');rect(px-4,top-4,8,4,'#553e37');
        rect(px-2,top-3,4,4,'#e4a75f');rect(px-5,top+6,10,3,'#c26550');pin(px,top-10,'BAG','#ffdc90');
      }});
      const dx=at(order.drop),dy=wheels[order.dropLane];
      if(dx>-36&&dx<520)sprites.push({y:dy,paint(){
        shadow(dx,dy,20);rect(dx-6,dy-8,4,9,'#31313d');rect(dx+2,dy-8,4,9,'#36303d');
        rect(dx-7,dy-21,14,15,customer.coat);rect(dx-13,dy-20,6,4,'#e7b59a');
        rect(dx-5,dy-32,10,12,'#ddaa8e');rect(dx-6,dy-34,12,5,'#543f49');rect(dx-4,dy-27,2,2,'#423440');
        pin(dx,dy-38,order.served?'TA!':customer.name.toUpperCase(),'#adf0ca');
      }});
    }
    sprites.push({y:s.y,paint(){
      shadow(riderX,s.y,37);
      const x=riderX,y=Math.round(s.y-jumpHeight(s)-(s.bump>0?Math.abs(Math.sin(s.time*40))*3:0));
      const pedals=Math.sin(s.x/7)*4;
      wheel(x-11,y-7,7,s.x/7);wheel(x+14,y-7,7,s.x/7);
      line(x-11,y-7,x-4,y-17,'#e9ad56');line(x-4,y-17,x+2,y-7,'#f1c074');line(x+2,y-7,x-11,y-7,'#d69c50');
      line(x+2,y-7,x+10,y-21,'#f4c665');line(x+10,y-21,x+14,y-7,'#81969c');rect(x+5,y-23,8,2,'#242d39');
      line(x-3,y-17,x+2+pedals,y-10,'#333e52',4);line(x+2+pedals,y-10,x-1+pedals,y-6,'#483e49',3);
      rect(x-7,y-29,12,13,'#b1d76d');rect(x-6,y-24,10,2,'#f8e5a8');rect(x+2,y-27,6,4,'#d7987d');rect(x+6,y-25,4,3,'#e2af91');
      rect(x,y-36,9,9,'#dfaa88');rect(x-2,y-39,12,5,'#3e4050');rect(x+4,y-35,8,2,'#252e38');
      if(s.carried){rect(x-15,y-25,10,10,'#f8b66a');rect(x-13,y-27,6,2,'#855f4b')}
    }});
    sprites.sort((a,b)=>a.y-b.y).forEach(sprite=>sprite.paint());
    if(s.toss){
      const t=clamp(s.toss.time/0.55,0,1);
      const x=at(s.toss.fromX+(s.toss.toX-s.toss.fromX)*t);
      const y=s.toss.fromY+(s.toss.toY-s.toss.fromY)*t-Math.sin(Math.PI*t)*35;
      rect(x-4,y-4,8,9,'#ffcc7f');rect(x-2,y-6,4,3,'#765743');
    }
    rect(0,0,480,22,'#222332');text('CHIPPY CIRCUIT',8,15,'#f6daae',12);
    text('DROP '+Math.min(s.order+1,3)+'/3',183,15,'#f6e7d6',11);
    text('HOT MEALS '+s.delivered+'/3',379,15,'#b9e6ac',11);
    if(s.carried){
      text('HEAT',260,15,'#ffe2ad',9);
      rect(285,8,55,7,'#645056');rect(285,8,Math.ceil(55*s.heat/(8.8-s.level*0.18)),7,s.heat<2.5?'#f08871':'#ebbe6e');
    }
    const approach=order && order.drop-s.x>=-21&&order.drop-s.x<=105&&s.carried&&Math.abs(s.y-wheels[order.dropLane])<=15;
    const passedPickup=order&&s.x>order.pick+22;
    const objective=approach?'ACTION!  THROW THE SUPPER':s.noticeFor>0?s.notice:
      order&&s.carried?'Find '+customers[order.person].name+' · '+['TOP','MIDDLE','BOTTOM'][order.dropLane]+' lane · Action to throw':
      order&&!passedPickup?'Collect '+customers[order.person].order+' · '+['TOP','MIDDLE','BOTTOM'][order.lane]+' lane':'Pedal on to the next order';
    rect(0,248,480,22,approach?'#325445':'#292936');text(objective,8,263,approach?'#d5ffba':'#f2e8d6',12);
    const progress=clamp(s.x/(s.orders[2].drop+53),0,1);
    rect(0,22,480,2,'#6a6877');rect(0,22,Math.round(progress*480),2,'#edb970');
  }

  window.EstateJobs = window.EstateJobs || {};
  window.EstateJobs.bike = {
    title: 'Chippy Circuit',
    hint: 'Up/down steer. Left brakes, right pedals. Ride through each bag. Action hops obstacles or throws supper near the customer. Get it there hot.',
    create, update, draw
  };
})();
