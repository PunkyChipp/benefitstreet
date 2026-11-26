(() => {
  'use strict';

  const pads = [
    {key: 'left', label: 'KICK', colour: '#f99a64', frequency: 82},
    {key: 'down', label: 'BASS', colour: '#a6ee99', frequency: 147},
    {key: 'right', label: 'CLAP', colour: '#7ae4e2', frequency: 330}
  ];
  // Dots are eighth-note rests. Uppercase bass notes sustain into the next beat.
  const sections = [
    ['k...c...', 'b...c...', 'k.b.c...', 'k...b.c.'],
    ['k.b.c...', 'b...c.k.', 'k...c.b.', 'b.k.c...'],
    ['k..bc...', 'b...c.k.', 'k.c.b..c', 'k...B...'],
    ['k.b.c..b', 'B...c.k.', 'k..bc..k', 'c.b.k.c.'],
    ['k.bcc..b', 'B...c.kb', 'k..bck.c', 'c.kbB...'],
    ['kbc.k.bc', 'B...ck.b', 'k.cbck.b', 'c.kbB...']
  ];
  const titles = [
    'Spin Cycle Dub', 'The Service Charge', 'Lint Trap Anthem',
    'Rinse & Repeat FM', 'Last Bus Bootleg', 'The Final Spin'
  ];
  const laneX = [12, 106, 200];
  const targetY = 211;

  function create(level) {
    level = Math.min(6, Math.max(1, Math.floor(level) || 1));
    const bpm = 82 + level * 5 + Math.floor(Math.random() * 5);
    const beat = 60 / bpm;
    const bars = 6 + Math.floor(level / 2);
    const intro = beat * 4;
    const bank = sections[level - 1];
    const start = Math.floor(Math.random() * bank.length);
    const notes = [];
    for (let bar = 0; bar < bars; bar++) {
      const pattern = bar === 0 ? 'k...b.c.' : bank[(bar + start) % bank.length];
      for (let slot = 0; slot < pattern.length; slot++) {
        const letter = pattern[slot];
        if (letter === '.') continue;
        notes.push({
          time: intro + (bar * 4 + slot / 2) * beat,
          lane: 'kbc'.indexOf(letter.toLowerCase()),
          length: letter === 'B' ? beat * 0.88 : 0,
          status: 'waiting'
        });
      }
    }
    return {
      level, bpm, beat, bars, intro, notes, elapsed: 0, lastBeat: -1,
      end: intro + bars * 4 * beat + beat * 0.4,
      hits: 0, perfect: 0, slips: 0, misses: 0, holds: 0, combo: 0, best: 0,
      flashes: [0, 0, 0], feedback: '', feedbackUntil: 0
    };
  }

  function report(s, text) {
    s.feedback = text;
    s.feedbackUntil = s.elapsed + 0.6;
  }

  function update(s, input, dt) {
    if (s.result) return s.result;
    s.elapsed += dt;
    const beatNumber = Math.floor((s.elapsed + 0.00001) / s.beat);
    // The station ident is also the count-in and backing pulse.
    if (beatNumber !== s.lastBeat) {
      s.lastBeat = beatNumber;
      input.tone?.(beatNumber < 4 ? (beatNumber === 3 ? 392 : 262) : [98, 73, 98, 110][beatNumber % 4]);
    }
    const window = 0.195 - s.level * 0.005;
    for (let lane = 0; lane < pads.length; lane++) {
      const pad = pads[lane];
      const tapped = input.pressed(pad.key) || (lane === 1 && input.pressed('action'));
      const held = input[pad.key] || (lane === 1 && input.action);
      s.flashes[lane] = Math.max(0, s.flashes[lane] - dt * 4);
      if (tapped) {
        s.flashes[lane] = 1;
        input.tone?.(pad.frequency);
        let nearest = null;
        let gap = window;
        for (const note of s.notes) {
          const distance = Math.abs(note.time - s.elapsed);
          if (note.lane === lane && note.status === 'waiting' && distance <= gap) {
            nearest = note;
            gap = distance;
          }
        }
        if (nearest) {
          nearest.status = nearest.length ? 'holding' : 'hit';
          s.hits++;
          s.combo++;
          s.best = Math.max(s.best, s.combo);
          if (gap <= 0.085) s.perfect++;
          report(s, nearest.length ? 'Hold the bass!' : gap <= 0.085 ? 'Bang on!' : 'In the mix');
        } else if (s.elapsed >= s.intro - window && s.elapsed <= s.notes.at(-1).time + window) {
          s.combo = 0;
          s.slips++;
          report(s, 'Off beat');
        }
      }
      for (const note of s.notes) {
        if (note.lane !== lane || note.status !== 'holding') continue;
        if (s.elapsed >= note.time + note.length - 0.09) {
          note.status = 'hit';
          s.holds++;
          report(s, 'Bass locked!');
        } else if (!held && !tapped) {
          note.status = 'hit';
          s.combo = 0;
          report(s, 'Bass cut short');
        }
      }
    }
    for (const note of s.notes) {
      if (note.status === 'waiting' && s.elapsed > note.time + window) {
        note.status = 'miss';
        s.misses++;
        s.combo = 0;
        report(s, 'Dead air');
      }
    }
    if (s.elapsed < s.end) return;
    const possible = s.notes.length + s.notes.filter(n => n.length).length * 0.5;
    const accuracy = Math.max(0, Math.round(100 * (s.hits + s.holds * 0.5 - s.slips * 0.5) / possible));
    const score = accuracy >= 84 ? 3 : accuracy >= 53 ? 2 : s.hits ? 1 : 0;
    const reviews = [
      'The dryers played to themselves.',
      'Flat 6 rang in. Apparently that was jazz.',
      'Ceefax wants that mix on both sides of a C90.',
      'Every light in the tower came on for the reload.'
    ];
    s.result = {score, message: reviews[score] + ' ' + s.hits + '/' + s.notes.length + ' beats. Best streak ' + s.best + '.'};
    return s.result;
  }

  function draw(ctx, s) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    function rect(x, y, w, h, colour) {
      ctx.fillStyle = colour;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }
    function label(text, x, y, size, colour, align = 'left') {
      ctx.textAlign = align;
      ctx.fillStyle = colour;
      ctx.font = 'bold ' + size + 'px monospace';
      ctx.fillText(text, x, y);
    }
    const phase = (s.elapsed / s.beat) % 1;
    const pulse = 1 - phase;
    const bar = Math.min(s.bars, Math.max(1, 1 + Math.floor((s.elapsed - s.intro) / (4 * s.beat))));
    rect(0, 0, 480, 270, '#181b27');
    rect(0, 0, 480, 33, '#233740');
    rect(8, 9, 9, 9, pulse > 0.5 ? '#ff885c' : '#a44c44');
    label('RINSE FM', 23, 21, 17, '#f8f2d5');
    label(titles[s.level - 1], 142, 20, 13, '#f3bc95');
    label(s.bpm + ' BPM', 469, 20, 12, '#abf0bd', 'right');
    rect(0, 31, 480 * Math.min(1, s.elapsed / s.end), 2, '#f6d599');

    // A boarded-up laundry window, speaker stack, decks and the resident DJ.
    rect(305, 39, 167, 199, '#394253');
    for (let y = 40; y < 192; y += 10) {
      rect(307, y, 164, 1, '#535660');
      for (let x = 309 + (y % 20 ? 13 : 0); x < 470; x += 27) rect(x, y, 1, 10, '#50515e');
    }
    rect(318, 48, 103, 40, '#222735');
    rect(321, 51, 97, 34, '#506c81');
    for (let i = 0; i < 5; i++) {
      const h = [17, 23, 14, 28, 20][i];
      rect(322 + i * 19, 84 - h, 16, h, '#323747');
      for (let j = 0; j < 3; j++) rect(324 + i * 19 + j * 4, 88 - h, 2, 3, j % 2 ? '#a8b6aa' : '#ddbd7f');
    }
    rect(365, 50, 3, 34, '#222735');
    rect(422, 51, 44, 22, '#1e252b');
    label('ON AIR', 444, 65, 10, '#ff976f', 'center');
    for (const x of [311, 440]) {
      rect(x, 115, 26, 65, '#202333');
      rect(x + 2, 117, 22, 61, '#4e505c');
      for (const y of [124, 150]) {
        rect(x + 5, y, 16, 16, '#252530');
        rect(x + 8, y + 3, 10, 10, '#656878');
        rect(x + 10, y + 5, 6, 6, pulse > 0.8 ? '#c9b99a' : '#373747');
      }
    }
    const nod = Math.round(pulse * 3);
    rect(367, 102 + nod, 31, 27, '#242632');
    rect(371, 106 + nod, 24, 23, '#bd866f');
    rect(373, 108 + nod, 19, 13, '#dda383');
    rect(367, 100 + nod, 30, 8, '#627e73');
    rect(371, 96 + nod, 21, 6, '#8b9a7e');
    rect(371, 111 + nod, 9, 4, '#3a343d');
    rect(384, 111 + nod, 9, 4, '#3a343d');
    rect(394, 107 + nod, 5, 12, '#252b37');
    rect(366, 107 + nod, 5, 12, '#252b37');
    rect(359, 133, 50, 35, '#596779');
    rect(370, 130, 24, 37, '#c6aa72');
    rect(376, 131, 12, 32, '#414552');
    rect(350, 146 + nod, 18, 14, '#697b88');
    rect(345, 157 + nod, 16, 8, '#dda383');
    rect(405, 143 - nod, 12, 17, '#697b88');
    rect(409, 157 - nod, 14, 9, '#dda383');
    rect(318, 166, 141, 16, '#b49a89');
    rect(321, 178, 136, 30, '#594956');
    for (const x of [333, 405]) {
      rect(x, 165, 34, 9, '#252531');
      rect(x + 10, 168, 12, 3, '#c3d9bd');
    }
    for (let i = 0; i < 5; i++) rect(372 + i * 5, 166, 3, 4, i % 2 ? '#ca917a' : '#89ccaf');
    rect(319, 186, 140, 19, '#2f3541');
    label('94.6 • CEEFAX', 389, 200, 12, '#f0d8ac', 'center');
    rect(311, 213, 155, 21, '#222833');
    for (let i = 0; i < 25; i++) {
      const amp = 2 + Math.floor(Math.abs(Math.sin(s.elapsed * 4 + i * 0.9)) * (5 + pulse * 5));
      rect(314 + i * 6, 230 - amp, 4, amp, ['#84d8b6', '#f9a377', '#89ced8'][i % 3]);
    }

    // Three independent instrument strips with an always-visible strike point.
    const speed = 65 + s.level * 3;
    ctx.save();
    ctx.beginPath();
    ctx.rect(9, 39, 283, 186);
    ctx.clip();
    pads.forEach((pad, lane) => {
      rect(laneX[lane], 39, 90, 186, lane === 1 ? '#243039' : '#202932');
      rect(laneX[lane] + 44, 40, 1, 184, '#35404b');
    });
    for (let n = Math.floor(s.elapsed / s.beat) - 1; n < s.elapsed / s.beat + 8; n++) {
      const y = targetY + (s.elapsed - n * s.beat) * speed;
      rect(12, y, 278, n % 4 === 0 ? 2 : 1, n % 4 === 0 ? '#71717b' : '#43515b');
    }
    rect(10, targetY - 3, 282, 7, '#7e806f');
    rect(10, targetY, 282, 1, '#fff1ba');
    for (const note of s.notes) {
      if (note.status !== 'waiting' && note.status !== 'holding') continue;
      const y = targetY + (s.elapsed - note.time) * speed;
      if (y < 32 || y - note.length * speed > 222) continue;
      const x = laneX[note.lane] + 15;
      const colour = pads[note.lane].colour;
      if (note.length) {
        const top = y - note.length * speed;
        rect(x + 20, top, 20, Math.max(0, Math.min(y, targetY) - top), colour);
      }
      const head = Math.min(y, targetY + 10);
      rect(x, head - 5, 60, 10, '#141922');
      rect(x + 2, head - 4, 56, 7, colour);
      rect(x + 7, head - 3, 46, 1, '#fff0cf');
    }
    ctx.restore();
    pads.forEach((pad, lane) => {
      const x = laneX[lane];
      rect(x, 226, 90, 20, s.flashes[lane] ? pad.colour : '#343d45');
      rect(x, 226, 90, 2, pad.colour);
      const direction = ['←', '↓', '→'][lane];
      label(direction + ' ' + pad.label, x + 45, 241, 13, s.flashes[lane] ? '#171c24' : '#f3ecd4', 'center');
    });
    const beforeStart = s.elapsed < s.intro - 0.17;
    const cue = beforeStart ? 'Count in  ' + Math.ceil((s.intro - s.elapsed) / s.beat)
      : s.feedbackUntil > s.elapsed ? s.feedback : 'Bar ' + bar + ' / ' + s.bars;
    rect(0, 250, 480, 20, '#252b37');
    label(cue, 12, 264, 13, '#f7d08f');
    label(s.hits + '/' + s.notes.length + ' BEATS', 184, 264, 12, '#d4e0de');
    label(s.combo + ' STREAK', 467, 264, 12, '#9adfbc', 'right');
    ctx.restore();
  }

  window.EstateJobs ??= {};
  window.EstateJobs.radio = {
    title: 'Rinse FM',
    hint: 'Tap ← kick, ↓ bass or → clap as each note crosses the stripe. Hold long bass notes. Action also plays bass.',
    create, update, draw
  };
})();
