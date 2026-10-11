import {scenes, coreIdeas} from './story.js';

export const VERSION = 1;
export function createState() {
  return {version:VERSION,started:false,scene:0,answers:{},outcomes:{},notebook:[],hp:12,maxHp:12,slots:2,hitDice:1,inspiration:true,craft:0,admiration:0,gold:0,identity:'Monsieur Reiveaux',woman:false,blueprint:{},tasks:[]};
}
export function die(sides=20,rng=Math.random) {
  const value=rng();
  if (!Number.isFinite(value) || value<0 || value>=1) throw new Error('Random value must be in [0, 1).');
  return Math.floor(value*sides)+1;
}
export function check({bonus=0,dc=10,mode='normal'}={},rng=Math.random) {
  const rolls=[die(20,rng)];
  if (mode==='advantage'||mode==='disadvantage') rolls.push(die(20,rng));
  const kept=mode==='advantage'?Math.max(...rolls):mode==='disadvantage'?Math.min(...rolls):rolls[0];
  return {rolls,kept,bonus,dc,total:kept+bonus,success:kept+bonus>=dc,mode};
}
function gateResult(roll) {
  return {roll,damage:roll.success?0:2,title:roll.success?'The gate opens.':'A setback. A new route.',text:roll.success?'The guardian yields. Reiveaux implements the chosen route and names it after the companion who helped make it work.':'The gate holds, but the crypt route works. Reiveaux loses 2 health on the rough descent and implements a clue that helps the next player recover from a failed check.',implemented:'Three approaches to one obstacle, each with a visible skill check and a meaningful fallback.'};
}
export function resolveChoice(previous,choice,payload={},rng=Math.random) {
  const state=structuredClone(previous), scene=scenes[state.scene];
  if (!state.started || !scene || scene.type==='blueprint' || state.outcomes[scene.id]) throw new Error('This chapter cannot be resolved now.');
  if (scene.type==='turn') {
    if (choice!=='plan'||!['cover','bridge'].includes(payload.move)||!['help','attack'].includes(payload.action)) throw new Error('Choose one movement and one action.');
  } else if (!scene.choices.some(c=>c.id===choice)) throw new Error('Unknown choice.');
  state.answers[scene.id]=choice;
  let out={title:'A rule becomes real.',text:'',implemented:''};
  switch(scene.id) {
    case 'vow':
      state.gameTitle=coreIdeas[choice].title;
      out={title:`${state.gameTitle} begins.`,text:'Reiveaux connects both doors to a consequence. The first playable decision is ready. Your bold idea also earns one Heroic Inspiration: a single die reroll you may use at the gate.',implemented:coreIdeas[choice].rule}; break;
    case 'party': {
      const names={scout:'Élodie',scholar:'Lucien',envoy:'Solène'};
      state.companion=names[choice];
      out={title:`${state.companion} joins the workbench.`,text:'Together they test the first room, notice a missing clue, and put it where a new player will see it. Reiveaux adds a specialty to each character sheet.',implemented:`${state.companion} lends a +2 proficiency bonus to their specialty, on top of its +3 ability modifier.`}; break;
    }
    case 'gate':
      out=gateResult(check({bonus:choice===state.answers.party?5:3,dc:13},rng));
      state.hp-=out.damage; break;
    case 'advantage': {
      const roll=check({bonus:3,dc:14,mode:choice==='help'?'advantage':'normal'},rng);
      if(!roll.success) state.hp-=1;
      out={roll,title:roll.success?'The golden bridge holds.':'The bridge slips. The fix stays.',text:roll.success?'The attachment clicks into place. Reiveaux records the circumstances that made the check easier, turning teamwork into a visible rule.':'Reiveaux catches the ledge, loses 1 health, and his companion pulls him up. He adds a safety catch to the next revision. The failed test has revealed exactly what to improve.',implemented:'Situational advantage and disadvantage: two dice, one result, no pile of small modifiers.'}; break;
    }
    case 'turn': {
      const damage=payload.move==='cover'?3:6;
      state.hp=Math.max(1,state.hp-damage);
      state.turn={...payload,bonus:'signal'};
      out={title:payload.action==='help'?'A companion gets the winning strike.':'The sentinel retreats.',text:`Reiveaux ${payload.move==='cover'?'takes cover':'advances onto the bridge'}, ${payload.action==='help'?'Helps his companion land the next attack with advantage':'uses his action to strike'}, and signals the escape path with Signalcraft. The sentinel’s return attack costs ${damage} health. The turn has one main action, not two.`,implemented:`Movement: ${payload.move}. Action: ${payload.action}. Bonus action: Signalcraft. Every choice uses its own legal part of the turn.`}; break;
    }
    case 'slots':
      state.slots-=choice==='ward'?1:2;
      out={title:choice==='ward'?'One slot saved for the unknown.':'Two casts. One rescued notebook.',text:choice==='ward'?'Lantern Ward shields the crossing. The remaining slot is a promise of another possible solution. Reiveaux makes spent and available slots easy to distinguish.':'Ember Step carries the caster across, then back to retrieve the notebook on a second turn. Both slots are now spent. Reiveaux preserves this thrilling choice and its visible cost.',implemented:`Two level-one spell slots; ${choice==='ward'?'one cast, one slot remains':'two casts over two turns, no slots remain'}. Original spells each spend one slot.`}; break;
    case 'rest': {
      const before=state.hp;
      if(choice==='short') {
        const rolled=die(8,rng); state.hitDice-=1; state.hp=Math.min(state.maxHp,state.hp+rolled+2);
        out={roll:{rolls:[rolled],kept:rolled,bonus:2,total:rolled+2,mode:'healing',sides:8},title:'An hour. A breath. A better build.',text:`The Hit Die rolls ${rolled}, plus 2 Constitution. Reiveaux recovers ${state.hp-before} health, reaching ${state.hp}/${state.maxHp}. Spell slots stay at ${state.slots}/2. He returns to the machine with a steadier hand.`,implemented:'A safe room offers short-rest healing through a limited Hit Die; it does not refill this character’s spell slots.'};
      } else {
        state.hp=state.maxHp;state.slots=2;state.hitDice=1;
        out={title:'Dawn brings a fresh reserve.',text:'Eight hours pass in the story. Health, both spell slots, and the Hit Die return. The courier moves the demonstration to the afternoon. Reiveaux trims a decorative corridor rather than losing the playable core.',implemented:'Long-rest recovery restores the prototype character’s health and magic, at a clear fictional time cost.'};
      } break;
    }
    case 'mirror':
      state.woman=true;state.identity={madame:'Madame Reiveaux',monsieur:'Monsieur Reiveaux',reiveaux:'Reiveaux'}[choice];
      out={title:`${state.identity}. Still the maker.`,text:'She signs her chosen name and smiles. The spell was unexpected; embracing her new life is her decision. She adds a character portrait to the game, then returns to the dungeon she is building.',implemented:'A character moment that preserves identity, invites a chosen response, and changes the next chapter.'}; break;
    case 'playtest': {
      const roll=check({bonus:2,dc:10},rng);
      state.hp=Math.max(1,state.hp-2);
      out={roll,title:roll.success?'The ward stays. The feedback matters.':'The ward fades. The feedback matters.',text:`After 2 damage, ${roll.success?'the Constitution save preserves the active ward':'the failed Constitution save ends the active ward'}. ${state.identity} ${choice==='signal'?'implements a luminous indicator that explains concentration and its loss':'implements a safer passage with a smaller treasure'}. The next tester immediately understands the choice.`,implemented:choice==='signal'?'One concentration effect at a time; show its active state and explain the saving throw after damage.':'A safe route offers a smaller reward; the risky bridge keeps its concentration save and richer treasure.'}; break;
    }
    case 'launch':
      out={title:'Version one is in the world.',text:choice==='demo'?'The Festival’s public demo fills with delighted players. Reiveaux adds a feedback page and fixes the first confusing doorway that evening. People begin sharing the game beyond the city.':'Six strangers play around her table. She listens, revises the first room, and shares the build before sunset. Their stories bring the next wave of players to her door.',implemented:'A complete first room, a clear invitation to play, and a feedback channel for the next revision.'};break;
    case 'fortune':
      state.admiration=state.answers.launch==='demo'?75000:52000;state.gold=1240000;
      out={title:'The blank page is yours.',text:'The kingdom celebrates her game. Reiveaux has earned 1,240,000 gold crowns and the admiration of thousands, and she is still happily implementing the next dungeon. She hands you the same invitation that started everything: make one interesting choice playable.',implemented:'A first release becomes a living game through playtests, iteration, and care for its players.'};break;
  }
  state.craft+=1;
  if(scene.id!=='fortune') state.admiration+=scene.id==='launch'?1200:scene.id==='playtest'?150:12;
  state.outcomes[scene.id]=out;
  state.notebook.push({id:scene.id,title:scene.title,rule:out.implemented,lesson:scene.lesson});
  return state;
}
export function rerollGate(previous,rng=Math.random) {
  if(scenes[previous.scene]?.id!=='gate'||!previous.inspiration||!previous.outcomes.gate) throw new Error('Heroic Inspiration is not available.');
  const state=structuredClone(previous),old=state.outcomes.gate;
  const roll=check({bonus:old.roll.bonus,dc:13},rng);
  state.outcomes.gate={...gateResult(roll),rerolled:true,previousRoll:old.roll.rolls[0]};
  state.hp+=old.damage-state.outcomes.gate.damage;
  state.inspiration=false;
  const entry=state.notebook.find(e=>e.id==='gate');entry.rule=state.outcomes.gate.implemented;
  return state;
}
export function advance(previous) {
  const scene=scenes[previous.scene];
  if(!previous.outcomes[scene?.id]||previous.scene>=scenes.length-1) throw new Error('Finish this chapter first.');
  return {...previous,scene:previous.scene+1};
}
export function readSave(raw) {
  try {
    const s=JSON.parse(raw);
    if(s?.version!==VERSION||typeof s.started!=='boolean'||!Number.isInteger(s.scene)||s.scene<0||s.scene>=scenes.length||!s.answers||!s.outcomes||!Array.isArray(s.notebook)||!Array.isArray(s.tasks)||!s.blueprint||!Number.isInteger(s.hp)||s.hp<1||s.hp>12||s.maxHp!==12||!Number.isInteger(s.slots)||s.slots<0||s.slots>2||!Number.isInteger(s.hitDice)||s.hitDice<0||s.hitDice>1||typeof s.identity!=='string'||!Number.isInteger(s.craft)||!Number.isInteger(s.admiration)||!Number.isInteger(s.gold)||typeof s.inspiration!=='boolean') return createState();
    for(let i=0;i<s.scene;i++) if(!s.outcomes[scenes[i].id]) return createState();
    if(s.notebook.some(e=>typeof e.title!=='string'||typeof e.rule!=='string')) return createState();
    for(const out of Object.values(s.outcomes)) {
      if(!out||typeof out.title!=='string'||typeof out.text!=='string'||typeof out.implemented!=='string') return createState();
      if(out.roll&&(!Array.isArray(out.roll.rolls)||out.roll.rolls.length<1||out.roll.rolls.length>2||out.roll.rolls.some(n=>!Number.isInteger(n)||n<1||n>20)||!Number.isFinite(out.roll.kept)||!Number.isFinite(out.roll.bonus)||!Number.isFinite(out.roll.total))) return createState();
    }
    for(const id of ['gate','advantage','playtest']) if(s.outcomes[id]&&!s.outcomes[id].roll) return createState();
    return s;
  } catch {return createState();}
}
export function blueprintText(state) {
  const b=state.blueprint;
  return `${b.title||'My first game'}\n\nPLAYER FANTASY\n${b.fantasy||'Be a brave explorer in a mysterious place.'}\n\nONE INTERESTING CHOICE\n${b.choice||coreIdeas[state.answers.vow||'rescue'].rule}\n\nA RULE TO TRY\n${b.mechanic||'When a friend helps, roll two d20s and keep the higher.'}\n\nFIRST 20 MINUTES\n1. Draw one room and two exits (5 minutes).\n2. Give each exit a reward and a cost (5 minutes).\n3. Write one rule and play it with a friend (10 minutes).\n\nAsk: What did you want to do? What was confusing?\nChange one thing. Play again.\n\nInspired by The Maker’s Spell · reiveaux\n`;
}
