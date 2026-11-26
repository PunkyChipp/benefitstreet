// Each errand spans a week. Players can choose when to fit its stops around rent.
const errands=[
 {name:'Operation street cinema',reward:17,steps:[
 ['office','Get the screening permit','Mo stamps the form “probably outdoors”.'],
 ['shop','Collect Sal’s projector','Sal hands you a projector disguised as a family-size cereal box.'],
 ['street','Run the pavement premiere','The wall beside Bev’s flat becomes a cinema. The opening short is a forty-foot DVD logo.']]},
 {name:'The great kit rescue',reward:23,steps:[
 ['pitch','Collect the muddy kit','Gaz gives you fourteen shirts and a sock that can stand unaided.'],
 ['wash','Rescue the team colours','Dot gets the team back to yellow. One shirt still says “evidence”.'],
 ['pitch','Deliver the clean strip','The squad takes a team photo before anyone is allowed near the grass.']]},
 {name:'The away-day bus',reward:26,steps:[
 ['shop','Pick up the biscuit tin','Sal’s away-day collection is £6.40 and an obsolete arcade token.'],
 ['office','Book the community bus','Mo finds a minibus with twelve seats and one working chorus of Wonderwall.'],
 ['pitch','See the team off','The bus leaves with everyone aboard. The away ground is eleven minutes away.']]},
 {name:'Frequency Shambles',reward:34,steps:[
 ['wash','Record Dot’s spin-cycle jingle','Dot conducts three dryers in B flat. Her debut single is 47 seconds long.'],
 ['shop','Borrow the shop speakers','Sal throws in a mic that smells strongly of pickled onion.'],
 ['street','Broadcast the first show','Radio Shambles goes live. First caller: Bev requesting her extension lead back.']]}
];
const finds=[
 ['📼','A video labelled “Royal Wedding”','It’s Kev’s 1996 karaoke final. The audience deserves witness protection.'],
 ['🪙','An old trolley token','Sal swaps it for £2. The trolley briefly achieves positive equity.'],
 ['🎟️','Two raffle tickets','First prize is an air fryer. Second prize is instructions for an air fryer.'],
 ['🔑','A key marked SHED','Gaz recognises it. His missing trophy cabinet is technically a shed.'],
 ['📻','A pocket radio','One station, one caller, twelve opinions about the ring road.'],
 ['🧤','The missing goalie glove','Gaz signs the wrist in permanent marker. It’s on loan from his mum.'],
 ['📸','A disposable camera','All twenty-seven pictures are of the same pigeon at slightly different distances.'],
 ['📀','Kev’s debut single','The B-side is the instrumental hold music from the council switchboard.']
];

errands.push(
 {name:'Save the night bus',reward:38,steps:[
 ['pitch','Count the stranded fans','Gaz counts twenty passengers and a cardboard cut-out of the keeper.'],
 ['office','Challenge the timetable','Mo finds the consultation. It ran for eight minutes on Boxing Day.'],
 ['street','Ride the first service','The whole estate rides one stop. The driver gets a standing ovation.']]},
 {name:'The lift inquiry',reward:44,steps:[
 ['wash','Find the maintenance ledger','Dot kept it under dryer two to stop the bastard wobbling.'],
 ['office','Read the small print','The lift has been listed as a vertical community garden since 2008.'],
 ['street','Call the engineer','The doors finally open. Inside is a folding chair and a mint-condition Argos catalogue.']]}
);
finds.push(
 ['📟','A pager going berserk','One message from 1999. Kev still wants picking up.'],
 ['🥄','The ceremonial spoon','Dot swears in every new tea monitor with this.'],
 ['📣','A broken megaphone','It only whispers. The library offers you a residency.'],
 ['🦚','A peacock feather','The mayor’s emotional support bird has left the inquiry.']
);
