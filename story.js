export const scenes = [
  {
    id: 'vow', act: 'I · The first spark', title: 'One room against the dark.', image: 'atelier',
    alt: 'Monsieur Reiveaux builds a miniature dungeon and sketches its rules in a candlelit atelier.',
    paragraphs: [
      'Above the sleeping city of Bellebrume, Monsieur Reiveaux is still awake. Rain claws at the windows. A dragon’s shadow crosses the moon. On his desk: a battered notebook, a glowing machine, and the dungeon game he has promised himself he will finally make.',
      'For seven years, the Ashen King has drained stories from the kingdom. Every unfinished idea becomes another stone in his fortress. At dawn, his soldiers will close the last theatre. Reiveaux could hide his notebook. Instead, he opens a fresh page.',
      'He sketches one chamber, places two doors, and makes both lead somewhere interesting. No sprawling world yet. Just a choice that makes someone lean forward. His first line of working logic flickers across the machine; the tiny doors swing open.',
      'The dragon outside turns toward the light. A working game, however small, is a story the King cannot swallow. Reiveaux steadies his ink-stained hand. What should the player have to choose?'
    ], quote: '“Bon. Let us give the darkness something to play.”',
    prompt: 'Choose the heart of his game.',
    choices: [
      {id:'rescue',title:'Save a stranger or claim a relic',detail:'Make the player care about a difficult sacrifice.'},
      {id:'trust',title:'Trust an enemy or seize their power',detail:'Make courage mean more than swinging a sword.'},
      {id:'light',title:'Spend your last light or brave the dark',detail:'Make every precious resource tell a story.'}
    ], lesson:'A game begins with a decision the player cares about.'
  },
  {
    id:'party',act:'I · The first spark',title:'Nobody builds a legend alone.',image:'atelier',
    paragraphs:[
      'The miniature chamber works. Then its ceiling falls through its floor. Reiveaux laughs once, fixes the collision, and writes the problem in the margin. A broken prototype has already taught him more than seven immaculate plans.',
      'Someone knocks. Three rebels have followed the light to his atelier: a scout with lockpicks, a scholar carrying banned books, and an envoy who remembers every name in the city. They do not ask whether his game is perfect. They ask whether they may try it.',
      'He places three little figures on the board. Each gets a different talent. In the first test, the scholar sees a rune the scout missed; the scout finds a passage the envoy never noticed. Their differences turn a hallway into a conversation.',
      'A messenger brings a deadline: tomorrow’s secret Festival of Embers is the kingdom’s last chance to gather. Reiveaux needs one companion to test the dungeon with him tonight. Their specialty will help at the gate.'
    ],quote:'“Show me where you get stuck. That is where I shall build.”',prompt:'Invite your first playtester.',
    choices:[
      {id:'scout',title:'Élodie, the scout',detail:'Dexterity +3 · proficient with thieves’ tools +2'},
      {id:'scholar',title:'Lucien, the scholar',detail:'Intelligence +3 · Arcana proficiency +2'},
      {id:'envoy',title:'Solène, the envoy',detail:'Charisma +3 · Persuasion proficiency +2'}
    ],lesson:'Distinct strengths create teamwork. A playtester makes your blind spots visible.'
  },
  {
    id:'gate',act:'II · Into the prototype',title:'The door that says no.',image:'dungeon',
    alt:'Reiveaux repairs a glowing dungeon prototype inside an immense ruined cathedral.',
    paragraphs:[
      'He carries the prototype beneath the ruined cathedral, where the Festival’s power sleeps behind a sealed gate. As he lays the board on a stone table, his drawn doorway rises into the real wall. The game has become a key.',
      'Reiveaux implements three ways through it: pick its lock, decipher its rune, or persuade the bound guardian to remember whom it served. The player’s approach chooses the skill. A twenty-sided die supplies uncertainty; talent and training supply the modifier.',
      'The target is 13. Meet or beat that number after adding the bonus, and the gate opens. Miss it, and something changes: the guardian wakes, a tool breaks, or a rune burns out. Reiveaux has written a second route through the crypt, but it costs time and a bruised knee.',
      'His companion studies the options. “You let us choose how to solve it.” Reiveaux smiles. That is the first compliment he will keep. Now test the rule they have built.'
    ],quote:'“The dice may say no. The story need not stop there.”',prompt:'Choose an approach, then roll.',
    choices:[
      {id:'scout',title:'Pick the lock',detail:'Dexterity · tools check · target 13'},
      {id:'scholar',title:'Decode the rune',detail:'Intelligence (Arcana) · target 13'},
      {id:'envoy',title:'Appeal to the guardian',detail:'Charisma (Persuasion) · target 13'}
    ],mechanic:'d20 + ability modifier + relevant proficiency ≥ target. Your chosen companion gives their approach +5; the others have +3.',lesson:'Give the player several approaches, and make setbacks create new decisions.'
  },
  {
    id:'advantage',act:'II · Into the prototype',title:'A second chance, by design.',image:'dungeon',
    paragraphs:[
      'Beyond the gate hangs a bridge of golden glass. Its far end has no anchor. Reiveaux’s companion points at the notebook: the bridge was drawn beautifully, but never told what to connect to. He kneels and implements the missing attachment.',
      'The repair must happen while the bridge sways above the abyss. He could balance alone. Or his companion could hold the rope, turning a dangerous task into a shared one. Reiveaux adds a rule that makes help matter without adding a page of arithmetic.',
      'With advantage, roll two twenty-sided dice and keep the higher. Without it, roll one. Here, a +3 bonus against target 14 gives a lone attempt a 50% chance. With advantage, that becomes 75%. The fiction has changed the probability.',
      'He also adds disadvantage for treacherous footing: two dice, keep the lower. If both apply, they cancel. Tonight the repaired rope gives safe footing, so only advantage applies if he asks for help. The choice is yours.'
    ],quote:'“A friend is not a decoration on the character sheet.”',prompt:'Test the bridge repair.',
    choices:[
      {id:'help',title:'Ask your companion to steady the rope',detail:'Advantage · roll two d20s, keep the higher'},
      {id:'alone',title:'Balance and repair it alone',detail:'Normal check · roll one d20'}
    ],mechanic:'Advantage keeps the higher of two d20s. Disadvantage keeps the lower. They cancel each other and do not stack.',lesson:'Use a simple rule to reward behavior you want players to discover.'
  },
  {
    id:'turn',act:'II · Into the prototype',title:'Six seconds to make a choice.',image:'dungeon',type:'turn',
    paragraphs:[
      'The Ashen King’s sentinel steps onto the bridge. Its blade scrapes sparks from the stone. Reiveaux is still at work: he gives the enemy a turn, writes a clear warning before its attack, and makes the turn order visible. A threat the player can read becomes a threat they can answer.',
      'Initiative decides who goes first. For this test, Reiveaux’s 16 beats the sentinel’s 11. He has movement, one action, and a bonus action only because his original Signalcraft feature grants one. A reaction will be available if its trigger occurs; there is none in this turn.',
      'He can move behind cover or onto the bridge. His action can attack the sentinel or Help his adjacent companion, giving their next attack advantage. His Signalcraft bonus action marks the escape path. It cannot become a second main action.',
      'Three small decisions make a plan. The companion watches his hand hover over the board. Reiveaux is not merely telling them that they are clever. He is building a place where cleverness has consequences.'
    ],quote:'“Give the player limits, and they will give you ingenuity.”',prompt:'Build one legal turn.',
    mechanic:'Movement + one action + an available bonus action. Initiative sets turn order. Signalcraft is an original feature for this prototype.',lesson:'Limited actions make timing, positioning, and cooperation meaningful.'
  },
  {
    id:'slots',act:'II · Into the prototype',title:'Power becomes precious.',image:'dungeon',
    paragraphs:[
      'The sentinel falls back. Ahead, the dragon’s breath heats the cathedral walls. Reiveaux adjusts his prototype so the danger arrives as a visible wave, not an invisible punishment. His companion can see how many turns remain.',
      'He implements two level-one spell slots. A slot is a charge spent to cast a spell of that level; it is not the spell itself. Knowing a hundred spells would not give this character a hundred casts. The empty circles on the sheet make that distinction visible.',
      'For this tiny game he writes two original spells. Lantern Ward spends one slot to shield the crossing. Ember Step spends one slot to carry its caster across. One cast now leaves one slot for later; two casts across two turns spend the whole reserve.',
      'The grandest effect is not automatically the best choice. Reiveaux tests whether the player feels the cost before spending it. He sets the remaining slots beside the turn counter, where nobody can miss them.'
    ],quote:'“Magic is more interesting when you cannot do everything.”',prompt:'Choose how to spend two slots.',
    choices:[
      {id:'ward',title:'Cast Lantern Ward once',detail:'Spend 1 slot · protect the crossing · keep 1 in reserve'},
      {id:'step',title:'Cast Ember Step twice, over two turns',detail:'Spend 2 slots · cross and retrieve the lost notebook'}
    ],mechanic:'These are original prototype spells. Both use level-one slots. A long rest will restore this character’s slots; a short rest will not.',lesson:'A visible resource cost creates tension before the player presses a button.'
  },
  {
    id:'rest',act:'III · A different kind of magic',title:'The courage to pause.',image:'atelier',
    paragraphs:[
      'Back in the atelier, the machine hums with a dungeon that can actually be played. Reiveaux is bruised, hungry, and tempted to replace every sketch with a masterpiece before morning. He reaches for the next tile. His hand trembles.',
      'His companion puts a cup of tea beside it. A pause is not surrender. He implements a safe room, then two kinds of recovery: a short rest spends a limited Hit Die to heal; a long rest restores his health and spell slots. The timetable advances in the fiction, without making you wait in real life.',
      'The short rest takes an hour and lets him roll his one remaining d8 Hit Die, adding +2 Constitution. The long rest takes eight hours; he asks the Festival’s courier for an afternoon demonstration. She agrees, provided he brings something playable.',
      'He has learned to design limits. Now he must live with them. Tomorrow’s audience needs one finished room more than it needs an exhausted maker with a thousand unfinished ones.'
    ],quote:'“Même les héros need a cup of tea.”',prompt:'Choose a recovery rhythm.',
    choices:[
      {id:'short',title:'Take a short rest',detail:'Spend 1 Hit Die · heal 1d8 + 2 · slots stay spent'},
      {id:'long',title:'Take a long rest',detail:'Restore health, Hit Die, and both spell slots · demo in the afternoon'}
    ],lesson:'Recovery and scope are design decisions. Protect the energy needed to finish.'
  },
  {
    id:'mirror',act:'III · A different kind of magic',title:'The spell he never wrote.',image:'mirror',
    alt:'Transformed into a woman, Reiveaux joyfully recognizes herself in a magical mirror, still holding her game notebook.',
    paragraphs:[
      'At the back of the atelier, an old mirror lights up. Reiveaux has coded no transformation into his dungeon. Yet the rune he brought home from the cathedral unfolds into a spell of its own. Golden light wraps around him; the glass rings like a struck bell.',
      'When the light clears, a woman is standing at the workbench. The same hazel eyes. The same unruly chestnut hair. The same ink on her fingers. Reiveaux touches her cheek, turns toward the mirror, and lets out a delighted, astonished laugh.',
      '“Oh,” she says. “Oh, I like this.” Her companion asks whether she wants the spell reversed. She considers the reflection, then shakes her head with a smile. The surprise has become a possibility she chooses to keep.',
      'She pulls her coat closer, sits at the machine, and fixes the bridge’s last flickering tile. Her game, her talent, and the work she loves are still hers. The next page waits for the title she wishes to write above it.'
    ],quote:'“C’est moi. And there is still so much I want to make.”',prompt:'How does she sign the next page?',
    choices:[
      {id:'madame',title:'Madame Reiveaux',detail:'She embraces a new title with a delighted flourish.'},
      {id:'monsieur',title:'Monsieur Reiveaux',detail:'She keeps the familiar title as her creative pen name.'},
      {id:'reiveaux',title:'Simply, Reiveaux',detail:'Her name is enough. The next chapter belongs to her.'}
    ],lesson:'Surprise can open a new direction. Let the character choose what it means.'
  },
  {
    id:'playtest',act:'IV · The world plays back',title:'Listen where the magic breaks.',image:'mirror',
    paragraphs:[
      'The first public tester reaches the bridge and casts Lantern Ward. Reiveaux watches rather than explains. The tester takes a glancing hit, loses the ward, and looks bewildered. The danger was fair on paper. On screen, its rule was invisible.',
      'She adds concentration: one ongoing effect at a time. Casting a second concentration spell would end the first. Damage asks for a Constitution saving throw; its target is 10 or half the damage, whichever is higher, capped at 30. For this test, two damage means target 10, with a +2 bonus.',
      'Now you will roll that save and decide what she improves. Passing keeps the ward active. Failing makes it fade. Either result tells her something about the experience. She asks, “What did you expect would happen?” and writes down the answer before touching the code.',
      'The crowd begins to gather around her workbench. They admire how quickly she turns their confusion into a clearer game. The Ashen King’s distant towers crack whenever someone says, “Let me try again.”'
    ],quote:'“A playtest is a conversation, not a verdict.”',prompt:'Roll the concentration save and ship one improvement.',
    choices:[
      {id:'signal',title:'Add a clear concentration indicator',detail:'Show which effect is active and why it can end.'},
      {id:'choice',title:'Add a safe route with a smaller reward',detail:'Give cautious players an alternative to the risky bridge.'}
    ],mechanic:'Constitution save: d20 + 2 versus target 10. Only one concentration effect at a time. The prototype uses original spells.',lesson:'Make rules legible. Improve what players actually struggle with.'
  },
  {
    id:'launch',act:'IV · The world plays back',title:'Open the door.',image:'triumph',
    alt:'Female Reiveaux demonstrates her completed dungeon game to an admiring crowd, with chests of gold beside the worktable.',
    paragraphs:[
      'The Festival’s curtain rises. Reiveaux can hear the Ashen King beyond the walls, calling for silence. Her machine contains one room, one bridge, a handful of rules, and several repaired mistakes. There is no perfect version waiting elsewhere. There is this playable one.',
      'A noble offers to buy the idea if she will keep it locked away until it is flawless. She closes his velvet contract and opens the game instead. A child chooses a door. A scout asks a stranger for help. The room erupts when the second die saves the crossing.',
      'Reiveaux explains the rules in a few sentences, then lets the players surprise her. The King’s soldiers lower their weapons to watch. For the first time in seven years, the city is making its own stories faster than he can steal them.',
      'She writes version one beneath the title. Beyond the first release, there will be feedback, new rooms, and more work. Tonight, finishing means giving someone a real thing to play. Choose the first invitation.'
    ],quote:'“Voilà. It is small. It works. It is yours to explore.”',prompt:'Release the first playable version.',
    choices:[
      {id:'demo',title:'Let the whole Festival play the demo',detail:'A public first room, with a place to leave feedback.'},
      {id:'table',title:'Start with a small, hosted play session',detail:'Guide six strangers, listen closely, then share the build.'}
    ],lesson:'Finish a small loop, put it in someone’s hands, and learn from their choices.'
  },
  {
    id:'fortune',act:'V · The legend you make',title:'A fortune. A following. A fresh page.',image:'triumph',
    paragraphs:[
      'Months pass. Reiveaux keeps implementing: a second dungeon, clearer enemy warnings, a level where rivals must cooperate. Her companion becomes her first collaborator. Each update carries a little of the feedback gathered at that first wooden table.',
      'The Ashen King’s fortress has become a theatre. Adventurers arrive from every province to play her game. They cheer her name, send drawings of their favorite rooms, and tell her that her little bridge helped them be brave. Admiration fills the hall before the royal treasury carts arrive.',
      'Sales and royal commissions bring more than a million gold crowns. She buys the atelier, pays her collaborators generously, and funds other makers’ first prototypes. There is money enough for comfort and time enough to keep making. She is delighted by both.',
      'At the feast held in her honor, she is still sketching a new encounter on a napkin. Then she notices you. She slides a blank notebook across the table. “You have already made choices, balanced a turn, and changed a rule. Tell me what you would build.”'
    ],quote:'“My first room was two doors and a question. Yours can be, too.”',prompt:'Take the notebook.',
    choices:[{id:'begin',title:'I want to make my own game',detail:'Turn a spark into one playable room.'}],lesson:'The next legend begins with a small thing you can finish.'
  },
  {
    id:'blueprint',act:'Your first chapter',title:'Now, make it yours.',image:'triumph',type:'blueprint',
    paragraphs:['Reiveaux returns to her workbench. The cheers still echo, but your notebook is quiet, open, and waiting. You do not need an entire kingdom tonight. Give one player one interesting choice.'],
    quote:'“Twenty minutes. Two doors. A beginning.”'
  }
];

export const imageAlts = Object.fromEntries(scenes.filter(s=>s.alt).map(s=>[s.image,s.alt]));
export const coreIdeas = {
 rescue: {title:'The Last Lantern',rule:'Rescue a trapped stranger or take a relic; either choice changes the next room.'},
 trust: {title:'The Oath Beneath',rule:'An enemy offers help; accepting it opens a shortcut but places a precious relic in their hands.'},
 light: {title:'Embers of Bellebrume',rule:'Spend a lantern charge to reveal a safe path, or save it and enter an uncertain room.'}
};
