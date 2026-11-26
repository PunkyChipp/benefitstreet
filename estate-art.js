(() => {
  'use strict';

  const W = 480, H = 270;
  const ink = '#302c3d';
  const paper = '#fff1c8';
  const cached = new Map();

  function paint(ctx) {
    function box(x, y, w, h, colour) {
      ctx.fillStyle = colour;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }
    function label(words, x, y, size, colour, align = 'left') {
      ctx.fillStyle = colour;
      ctx.font = 'bold ' + size + 'px monospace';
      ctx.textAlign = align;
      ctx.textBaseline = 'top';
      ctx.fillText(words, Math.round(x), Math.round(y));
    }
    function line(x1, y1, x2, y2, colour) {
      const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
      for (let i = 0; i <= length; i++) box(x1 + (x2 - x1) * i / length, y1 + (y2 - y1) * i / length, 1, 1, colour);
    }
    return { box, label, line };
  }

  function skyline(p, dusk) {
    const { box, line } = p;
    box(0, 0, W, 43, dusk ? '#c395ac' : '#99caca');
    box(0, 15, W, 25, dusk ? '#f0b99d' : '#c5ded0');
    box(271, 7, 18, 8, dusk ? '#ffe3ae' : '#fff0c0');
    box(274, 4, 12, 14, dusk ? '#ffe3ae' : '#fff0c0');
    for (const [x, y, w] of [[1, 7, 32], [118, 3, 22], [186, 12, 28], [307, 6, 23]]) {
      box(x, y, w, 2, '#f2decd'); box(x + 6, y - 2, w / 2 | 0, 2, '#f2decd');
    }
    for (const [x, w, y] of [[-8, 56, 13], [48, 25, 25], [111, 31, 16], [147, 47, 6], [200, 40, 26], [285, 25, 16], [323, 43, 10], [455, 47, 17]]) {
      box(x, y, w, 40, '#8b9599'); box(x + w - 5, y, 5, 40, '#74828d');
      box(x - 1, y, w + 2, 2, '#a2a7a6'); box(x + 4, y - 3, 9, 3, '#919d9e');
      for (let wy = y + 5; wy < 40; wy += 6)
        for (let wx = x + 4; wx < x + w - 6; wx += 8)
          box(wx, wy, 4, 3, (wx + wy) % 3 ? '#748391' : '#cec4b3');
    }
    line(2, 8, 44, 20, '#67797c'); line(44, 20, 88, 10, '#67797c');
    line(204, 17, 265, 24, '#6b797e'); line(265, 24, 311, 14, '#6b797e');
  }

  function shop(p) {
    const { box, label } = p;
    box(0, 33, 143, 63, ink); box(0, 35, 139, 58, '#b47664');
    for (let y = 37; y < 90; y += 6)
      for (let x = (y % 12 ? 0 : 6); x < 140; x += 14) box(x, y, 9, 1, '#cf8e72');
    box(0, 29, 141, 5, '#5e5054'); box(0, 29, 141, 2, '#b0a798');
    box(5, 39, 129, 17, ink); box(7, 41, 125, 13, '#ae4042');
    label('JAN’S OFF-LICENCE', 69, 41, 11, paper, 'center');
    box(8, 63, 85, 23, '#34464b'); box(10, 65, 81, 16, '#688b8a');
    for (let i = 0; i < 12; i++) {
      const x = 12 + i * 6, h = 3 + (i * 3) % 5;
      box(x, 80 - h, 3, h, ['#e7ca8a', '#c47c61', '#d5ad70', '#91b19f'][i % 4]);
      box(x + 1, 78 - h, 1, 2, '#e1ce9d');
    }
    for (const x of [29, 56, 81]) box(x, 64, 2, 18, '#4c575a');
    box(97, 61, 26, 33, ink); box(100, 64, 20, 26, '#598582');
    box(102, 65, 16, 13, '#aec4ab'); box(115, 81, 3, 2, paper);
    for (let i = 0; i < 17; i++) {
      const col = i % 2 ? '#e6c694' : '#bf4d50';
      box(4 + i * 8, 55, 8, 7, col); box(4 + i * 8, 62, 7, 3, col);
    }
    for (const x of [4, 20, 36]) {
      box(x, 84, 14, 10, '#775449'); box(x + 1, 85, 12, 6, '#ad754e');
      for (let i = 0; i < 3; i++) box(x + 2 + i * 4, 82 + (i % 2), 3, 4, x === 20 ? '#e9b14d' : '#b4c968');
    }
    box(127, 77, 9, 16, '#45414a'); box(128, 78, 7, 12, '#e5bd73'); label('£1', 128, 80, 6, ink);
  }

  function laundry(p) {
    const { box, label } = p;
    box(163, 28, 146, 67, '#484451'); box(165, 30, 140, 62, '#b7ac94');
    box(163, 26, 145, 5, '#666575'); box(163, 26, 145, 2, '#d2bfa5');
    box(171, 18, 27, 8, '#737783'); box(173, 19, 22, 4, '#899297');
    for (let x = 175; x < 194; x += 3) box(x, 20, 1, 3, '#58626b');
    box(171, 34, 129, 18, '#3a4d55'); box(173, 36, 125, 14, '#527f7d');
    label('SPIN CITY FM', 236, 35, 14, '#fff1b7', 'center');
    box(169, 54, 133, 4, '#dd9d94'); box(169, 55, 133, 1, '#f2c7aa');
    box(173, 59, 81, 27, '#465766'); box(175, 61, 77, 22, '#84a9aa');
    for (let i = 0; i < 4; i++) {
      const x = 177 + 18 * i;
      box(x, 68, 15, 14, '#efd2a8'); box(x + 2, 69, 9, 1, '#9b9387');
      box(x + 4, 73, 7, 7, '#86b8ab'); box(x + 3, 74, 9, 5, '#45616c'); box(x + 5, 74, 4, 3, '#9bced1');
      box(x + 12, 70, 1, 1, '#bf5956');
    }
    box(258, 57, 25, 36, '#424954'); box(261, 60, 19, 32, '#689490');
    box(263, 62, 15, 16, '#a9c6b5'); box(274, 82, 4, 2, paper);
    box(288, 60, 9, 17, paper); box(290, 63, 5, 2, '#aa485d'); box(289, 69, 7, 1, '#8b8482');
    box(181, 87, 64, 3, '#968d80');
  }

  function tower(p) {
    const { box, label, line } = p;
    box(330, 0, 150, 94, '#786763');
    for (let story = 0; story < 3; story++) {
      const y = -6 + story * 19;
      box(330, y + 1, 150, 15, '#a89b86');
      for (let x = 336; x < 480; x += 28) {
        box(x, y + 3, 20, 10, '#696672'); box(x + 2, y + 4, 8, 6, '#769295');
        box(x + 11, y + 4, 7, 6, x % 3 ? '#d4b48e' : '#769295');
      }
      box(329, y + 14, 151, 4, '#656372'); box(329, y + 14, 151, 1, '#d7c4a5');
    }
    box(327, 55, 153, 37, '#ac876f'); box(326, 53, 154, 4, '#d3b290');
    box(334, 62, 41, 18, '#6e6768'); box(336, 64, 37, 14, '#bdad9c');
    label('BLOCK', 354, 64, 7, '#544e55', 'center'); label('B', 354, 70, 8, '#544e55', 'center');
    box(384, 58, 47, 36, '#343745'); box(389, 62, 37, 30, '#697682');
    box(391, 64, 14, 26, '#798b8b'); box(409, 64, 14, 26, '#798b8b');
    box(401, 58, 11, 3, '#eaca70'); box(378, 70, 4, 8, '#414550'); box(379, 71, 2, 2, '#c9a162');
    box(439, 58, 2, 33, '#7c7569'); box(441, 58, 1, 33, '#cabba0');
    box(447, 65, 28, 12, '#debfa0'); label('REPAIRS', 461, 68, 6, '#6a524e', 'center');
    line(344, 15, 370, 18, ink);
    for (const [x, y, c] of [[347, 16, '#e8b7b9'], [357, 17, '#7fa5b6'], [365, 17, paper]]) box(x, y, 5, 5, c);
  }

  function road(p, dusk) {
    const { box, label, line } = p;
    box(0, 93, W, 177, '#b9aba0');
    for (let y = 94; y < 248; y += 11) {
      box(0, y, W, 1, '#a89c94');
      for (let x = (y % 2) * 17; x < W; x += 36) box(x, y + 1, 1, 10, '#ab9e94');
    }
    box(0, 94, W, 3, '#a4968e');
    box(0, 125, W, 83, '#5f606c'); box(0, 124, W, 2, '#e7d5ae');
    box(0, 207, W, 3, '#938c84'); box(0, 209, W, 1, '#e8d1ac');
    for (let i = 0; i < 225; i++) {
      const x = (i * 127 + i * i * 13) % W, y = 128 + i * 47 % 77;
      box(x, y, i % 6 === 0 ? 3 : 1, 1, i % 7 ? '#676671' : '#545762');
    }
    for (let x = 7; x < W; x += 51) box(x, 165, 23, 2, '#b8b4a3');
    for (let i = 0; i < 6; i++) {
      box(201, 130 + i * 13, 28, 6, '#d4ccac'); box(223 - (i % 4), 133 + i * 13, 3, 1, '#bdb8a1');
    }
    for (const y of [128, 131, 200, 203]) {
      box(0, y, 145, 1, '#c5a96e'); box(296, y, W - 296, 1, '#c5a96e');
    }
    for (const [x, y] of [[45, 139], [358, 185]]) {
      box(x, y, 11, 3, '#a8a69d'); line(x + 7, y - 3, x + 13, y + 2, '#a8a69d');
      line(x + 7, y + 6, x + 13, y + 2, '#a8a69d');
    }
    for (const [x, y] of [[145, 131], [338, 198], [14, 130]]) {
      box(x, y, 12, 4, '#484853'); for (let i = 0; i < 5; i++) box(x + 1 + i * 2, y + 1, 1, 2, '#8a8683');
    }
    // The bus lay-by and faded road paint are flush with the walkable ground.
    for (let x = 238; x < 338; x += 11) box(x, 143, 7, 1, '#baa36e');
    label('BUS STOP', 254, 130, 10, '#c2ae77');
    for (let i = 0; i < 3; i++) {
      const x = 109 + 10 * i, y = 217 + (i % 2) * 5;
      box(x, y, 8, 1, '#f1c7ba'); box(x, y + 5, 8, 1, '#e1c4c7');
      box(x, y, 1, 5, '#dfc3c4'); box(x + 7, y, 1, 5, '#f2d6c6');
    }
    if (dusk) box(0, 93, W, 152, 'rgba(157,98,120,.06)');
  }

  function bike(p, x, y) {
    const { box, line } = p;
    for (const dx of [0, 12]) {
      box(x + dx, y + 1, 6, 5, ink); box(x + dx + 1, y, 4, 7, ink);
      box(x + dx + 1, y + 2, 4, 3, '#b3a59b');
    }
    line(x + 3, y + 4, x + 8, y - 2, '#bf514b');
    line(x + 8, y - 2, x + 11, y + 4, '#bf514b');
    line(x + 11, y + 4, x + 14, y - 3, '#bf514b');
    line(x + 14, y - 3, x + 15, y + 3, ink); box(x + 6, y - 3, 5, 2, ink); box(x + 12, y - 4, 5, 1, ink);
  }

  function foreground(p) {
    const { box, label, line } = p;
    // Nearest buildings run along the lower edge, leaving the full pavement accessible.
    box(0, 247, 148, 23, '#905855'); box(0, 244, 150, 5, '#5d5058');
    box(0, 243, 150, 2, '#d7a481'); box(10, 250, 127, 15, '#334e54');
    label('TENANTS’ HALL', 73, 250, 12, '#f3d5a4', 'center');
    box(151, 254, 144, 16, '#75825e');
    for (let x = 153; x < 297; x += 14) {
      box(x, 251 + x % 3, 10, 10, '#627858'); box(x + 2, 252 + x % 3, 5, 3, '#9ba676');
    }
    box(305, 243, 175, 27, '#768b66'); box(314, 260, 160, 2, '#c8cab0');
    for (let x = 310; x < 480; x += 6) {
      line(x, 242, x + 7, 250, '#899384'); line(x, 250, x + 7, 242, '#899384');
    }
    box(305, 240, 175, 2, '#525969'); box(305, 251, 175, 2, '#525969');
    for (const x of [305, 345, 375, 419, 455]) box(x, 238, 2, 18, '#4c5360');
    box(354, 251, 87, 13, '#35575b'); label('FIVE-A-SIDE', 397, 251, 10, paper, 'center');
  }

  function streetFurniture(p) {
    const { box, line } = p;
    bike(p, 39, 101);
    box(148, 77, 12, 17, '#416b5a'); box(146, 77, 16, 3, '#344e48');
    box(150, 81, 2, 10, '#75916d'); box(149, 93, 3, 2, ink); box(157, 93, 3, 2, ink);
    box(307, 83, 14, 11, '#445d59'); box(306, 82, 16, 3, '#87917b');
    for (const x of [5, 315]) {
      box(x, 69, 2, 35, '#565866'); box(x - 2, 67, 7, 4, '#5c5662'); box(x - 2, 68, 6, 2, '#ead5a1');
    }
    line(63, 239, 97, 239, '#b8a291');
    for (const [x, y] of [[146, 115], [311, 231], [27, 217]]) {
      box(x, y, 6, 3, '#dad3ba'); box(x + 2, y + 1, 3, 1, '#a89f94');
    }
  }

  function staticMap(ctx, dusk) {
    const p = paint(ctx);
    skyline(p, dusk);
    // Narrow passages between the shops reveal the rear service yards.
    for (const [x, width] of [[139, 25], [306, 25]]) {
      p.box(x, 37, width, 58, '#6a706d');
      for (let n = 0; n < width; n += 4) {
        p.box(x + n, 48 + n % 3, 3, 32, n % 8 ? '#6c7164' : '#767b6c');
        p.box(x + n, 81, 3, 12, '#7a776d');
      }
      p.box(x, 60, width, 2, '#555d58'); p.box(x, 77, width, 2, '#555d58');
      p.box(x, 91, width, 3, '#837e75');
    }
    shop(p); laundry(p); tower(p); road(p, dusk); streetFurniture(p); foreground(p);
  }

  function passingCat(p, t) {
    // A ginger cat patrols the kerb, turning back beside the bus stop.
    const phase = t % 27;
    const backwards = phase >= 13.5;
    const distance = (backwards ? 27 - phase : phase) * 3.3;
    const x = Math.round(292 + distance), y = 118;
    const dx = backwards ? -1 : 1;
    const stride = Math.sin(t * 8) > 0 ? 1 : 0;
    p.box(x - 5, y, 11, 1, '#93887e');
    p.box(x - 4, y - 5, 9, 4, '#b77855');
    p.box(x - 4 + stride, y - 2, 2, 3, '#885c4e'); p.box(x + 2 - stride, y - 2, 2, 3, '#885c4e');
    p.box(x + dx * 4 - 1, y - 7, 4, 4, '#d89a65'); p.box(x + dx * 4, y - 8, 1, 2, '#885c4e');
    p.box(x + dx * -5, y - 7, 2, 4, '#ad7356'); p.box(x + dx * -6, y - 9, 2, 3, '#b67c5b');
  }

  const cast = [
    { coat: '#bb5355', light: '#e87768', skin: '#b97a54', hair: '#40363a', hat: 'visor' },
    { coat: '#6a5883', light: '#ab87aa', skin: '#d59c76', hair: '#dee0cb', hat: 'cans' },
    { coat: '#517073', light: '#94a99a', skin: '#946751', hair: '#56434b', hat: 'hardhat' },
    { coat: '#40696e', light: '#74ac96', skin: '#d69b77', hair: '#644943', hat: 'keeper' },
    { coat: '#9e5e6c', light: '#cb8890', skin: '#ba8364', hair: '#e0c3a2', hat: 'bun' }
  ];
  const player = { coat: '#a2bc4b', light: '#def979', skin: '#d39873', hair: '#47343c', hat: 'player' };
  function drawPerson(p, x, y, outfit, step, face) {
    const { box } = p;
    x = Math.round(x); y = Math.round(y);
    const left = face === 'left', away = face === 'up', dx = left ? -1 : face === 'right' ? 1 : 0;
    box(x - 8, y - 1, 16, 2, '#776e74'); box(x - 5, y + 1, 10, 1, '#8d8081');
    box(x - 5, y - 7, 4, 6 + step, '#393a48'); box(x + 1, y - 7, 4, 6 - step, '#393a48');
    box(x - 6, y - 2 + step, 6, 2, ink); box(x + 1, y - 2 - step, 6, 2, ink);
    const bob = step === 0 ? 0 : -1; y += bob;
    box(x - 6, y - 13, 12, 7, ink); box(x - 5, y - 15, 10, 9, outfit.coat);
    box(x - 4, y - 15, 7, 7, outfit.light);
    box(x - 7, y - 13 + step, 3, 5, outfit.coat); box(x + 4, y - 13 - step, 3, 5, outfit.coat);
    box(x - 7, y - 8 + step, 3, 2, outfit.skin); box(x + 4, y - 8 - step, 3, 2, outfit.skin);
    box(x - 4 + dx, y - 22, 8, 7, outfit.hair);
    if (!away) {
      box(x - 3 + dx, y - 20, 7, 5, outfit.skin); box(x - 2 + dx, y - 15, 4, 1, outfit.skin);
      box(x + (left ? -2 : 2), y - 19, 1, 1, ink);
    }
    switch (outfit.hat) {
      case 'player':
        box(x - 4, y - 23, 8, 2, '#dc7758'); box(x - 5, y - 21, 10, 2, '#e98d62');
        box(x - 5, y - 10, 10, 2, '#edf0c5'); box(x + dx, y - 14, 1, 8, '#607756'); break;
      case 'visor': box(x - 4, y - 22, 8, 3, '#f1ca7d'); box(x - 5, y - 20, 12, 1, '#ad4949'); break;
      case 'cans': box(x - 5, y - 23, 10, 2, '#3a3e53'); box(x - 5, y - 21, 2, 5, '#46516c'); box(x + 3, y - 21, 2, 5, '#46516c'); break;
      case 'hardhat': box(x - 4, y - 24, 8, 5, '#e1a750'); box(x - 5, y - 20, 11, 2, '#f4c36c'); break;
      case 'keeper': box(x - 7, y - 9 + step, 3, 4, '#e3d5aa'); box(x + 4, y - 9 - step, 3, 4, '#e3d5aa'); break;
      case 'bun': box(x - 4, y - 25, 5, 4, '#ddcbb1'); box(x - 4, y - 10, 9, 5, '#dac3a8'); break;
    }
  }
  function marker(p, x, y, goal, visited, time) {
    const { box } = p;
    const dy = goal ? Math.floor(Math.sin(time * 4) + 1) : 0;
    y = Math.round(y - 31 + dy); x = Math.round(x);
    const colour = goal ? '#ffce67' : visited ? '#b3d1ae' : '#f1dec0';
    box(x - 4, y - 4, 9, 7, ink); box(x - 2, y + 3, 5, 1, ink); box(x, y + 4, 1, 1, ink);
    if (goal) { box(x, y - 3, 2, 3, colour); box(x, y + 1, 2, 1, colour); }
    else { box(x - 2, y - 1, 1, 1, colour); box(x, y - 1, 1, 1, colour); box(x + 2, y - 1, 1, 1, colour); }
  }
  function pigeon(p, x, y, peck) {
    p.box(x - 2, y + 2, 7, 1, '#857d7b'); p.box(x, y - 1, 4, 3, '#899197');
    p.box(x - 2, y - 1, 3, 2, '#596472'); p.box(x + 3, y - (peck ? 0 : 3), 2, 3, '#555f6b');
    p.box(x + 5, y - (peck ? 0 : 2), 1, 1, '#d4ab77');
  }

  window.drawEstatePlayer = (ctx,x,y,face,walk,time)=>drawPerson(paint(ctx),x,y,player,walk?[0,1,0,-1][Math.floor(time*12)%4]:0,face);
  window.drawEstate = function drawEstate(ctx, world) {
    ctx.save(); ctx.imageSmoothingEnabled = false;
    const dusk = world.evening;
    if (typeof OffscreenCanvas === 'function') {
      if (!cached.has(dusk)) {
        const surface = new OffscreenCanvas(W, H);
        staticMap(surface.getContext('2d'), dusk); cached.set(dusk, surface);
      }
      ctx.drawImage(cached.get(dusk), 0, 0);
    } else staticMap(ctx, dusk);
    const p = paint(ctx), t = world.time;
    const fixed = world.improvements;
    const season = EstateLife.season(world.life);
    if (fixed.includes(0)) {
      // Jan finally puts out a proper striped canopy.
      for (let i=0;i<12;i++) p.box(18+i*7,55,7,4+i%2,i%2?'#d68164':'#ead7aa');
    }
    if (fixed.includes(1)) {
      p.box(410,58,25,8,'#344d42');p.box(412,60,3,3,'#abdc74');
      ctx.fillStyle='#e3e3c4';ctx.font='bold 5px monospace';ctx.fillText('LIFT OK',416,64);
    }
    if (fixed.includes(2)) {
      for (const x of [333,456]) {p.box(x,229,2,13,'#5e615c');p.box(x-4,226,10,4,'#ece3a0')}
    }
    if (fixed.includes(3)) {p.box(230,22,2,12,'#535960');for(let i=0;i<3;i++)p.box(223+i,22+i*3,16-i*2,1,'#535960')}
    if (fixed.includes(4)) {p.box(304,140,3,18,'#565952');p.box(299,137,14,5,'#d9c68d');p.box(292,156,23,2,'#8a6553')}
    if (fixed.includes(5)) {
      for(let i=0;i<19;i++) {const y=225+Math.round(Math.sin(i/18*Math.PI)*4);
        p.box(7+i*8,y,8,1,'#65594f');p.box(9+i*8,y+1,4,3,i%2?'#db8964':'#a9cf89')}
    }
    if(season==='Autumn'||season==='Winter'){
      const col=season==='Winter'?'#dedfcd':'#bc8657';
      for(let i=0;i<39;i++)p.box((i*59)%480,114+(i*29)%122,season==='Winter'?3:2,1,col);
    }
    EstateLife.draw(ctx,world.life);
    passingCat(p, t);
    const machine = 177 + 18 * (Math.floor(t / 3) % 4);
    p.box(machine + 7, 75 + Math.floor((Math.sin(t * 5) + 1) * 1.3), 3, 1, '#c1dfd3');
    pigeon(p, 274 + Math.round(Math.sin(t * .33) * 3), 214, Math.sin(t * 2.1) > .6);
    pigeon(p, 288, 217, Math.sin(t * 1.7) > .65);
    const actors = world.sites.map(site => {
      const top = site.y < 150;
      const index = top ? (site.x < 150 ? 0 : site.x < 320 ? 1 : 2) : (site.x > 250 ? 3 : 4);
      return { x: site.x, y: site.y, outfit: cast[index], site };
    });
    actors.push({x: world.x, y: world.y, outfit: player});
    actors.sort((a, b) => a.y - b.y);
    for (const a of actors) {
      if (a.site) {
        drawPerson(p, a.x, a.y, a.outfit, 0, 'down');
        marker(p, a.x, a.y, a.site.id === world.goal, world.visited.includes(a.site.id), t);
      } else drawPerson(p, a.x, a.y, a.outfit, world.walk ? [0, 1, 0, -1][Math.floor(t * 12) % 4] : 0, world.face);
    }
    if(world.life.day%4===0) {
      ctx.fillStyle='#b7d2cf';ctx.globalAlpha=.45;
      for(let i=0;i<50;i++){const y=(i*53+t*86)%270;ctx.fillRect(Math.floor((i*71-y*.18+480)%480),Math.floor(y),1,3)}
    }
    ctx.restore();
  };
})();
