import {panels,worlds,goals,rules} from './story.js';
import {newCrawl,SHRINES,EXIT,walkable} from './crawl.js';
export const VERSION=3;
export const route=[12,8,9,5,6,10,11,7,3];
export const solution={12:3,8:1,9:3,5:1,6:2,10:0,11:3,7:1,3:1};
export function newRoom(){return {tiles:Array.from({length:16},(_,i)=>({shape:i===7||[0,4,13].includes(i)?'straight':'corner',rotation:((solution[i]??i)+(i%3)+1)%4})),attempts:0,hint:false,solved:false};}
export function newBattle(){return {pos:6,move:null,slots:2,hp:6,turn:1,lit:[],defeated:false,solved:false,message:'Tap a neighboring tile, then choose one action.'};}
export function createState(){return {version:VERSION,started:false,step:0,beat:0,answers:{},outcomes:{},notebook:[],room:newRoom(),battle:newBattle(),crawl:newCrawl(),inspiration:true,identity:'Monsieur Reiveaux',woman:false,diceApproach:'arcana',help:true,design:{title:'My first adventure',world:'sky',goal:'rescue',rule:'help'},test:null};}
export function die(sides=20,rng=Math.random){const v=rng();if(!Number.isFinite(v)||v<0||v>=1)throw new Error('Invalid random value');return Math.floor(v*sides)+1;}
export function check(bonus,dc,advantage=false,rng=Math.random){const rolls=[die(20,rng)];if(advantage)rolls.push(die(20,rng));const kept=Math.max(...rolls);return {rolls,kept,bonus,dc,total:kept+bonus,success:kept+bonus>=dc,advantage};}
export function ports(tile){return (tile.shape==='straight'?[1,3]:[0,1]).map(p=>(p+tile.rotation)%4);}
export function roomConnected(room){
  if(!ports(room.tiles[12]).includes(3))return false;
  const visited=new Set(),queue=[12];
  while(queue.length){const i=queue.shift();if(visited.has(i))continue;visited.add(i);const p=ports(room.tiles[i]);if(i===3&&p.includes(1))return true;
    for(const direction of p){const r=Math.floor(i/4),c=i%4;const nr=r+[-1,0,1,0][direction],nc=c+[0,1,0,-1][direction];if(nr<0||nr>3||nc<0||nc>3)continue;const next=nr*4+nc;if(ports(room.tiles[next]).includes((direction+2)%4))queue.push(next);}
  }return false;
}
function addLesson(s,id,text){const lesson=text||panels.find(p=>p.id===id)?.lesson;if(lesson&&!s.notebook.some(n=>n.id===id))s.notebook.push({id,text:lesson});}
export function rotateTile(previous,index){if(panels[previous.step]?.id!=='room'||previous.room.solved||!Number.isInteger(index)||index<0||index>15)throw new Error('Tile unavailable');const s=structuredClone(previous);s.room.tiles[index].rotation=(s.room.tiles[index].rotation+1)%4;return s;}
export function testRoom(previous){const s=structuredClone(previous);s.room.attempts++;s.room.solved=roomConnected(s.room);if(s.room.solved){s.outcomes.room={title:'A working dungeon!',text:'Reiveaux connects your map to the game. The first room is playable.'};addLesson(s,'room');}return s;}
export function hintRoom(previous){
  if(panels[previous.step]?.id!=='room'||previous.room.solved)throw new Error('No corridor step to play');
  if(roomConnected(previous.room))return testRoom(previous);
  const s=structuredClone(previous);s.room.hint=true;
  for(const index of route){
    const wanted=ports({...s.room.tiles[index],rotation:solution[index]}).sort().join(',');
    if(ports(s.room.tiles[index]).sort().join(',')!==wanted){s.room.tiles[index].rotation=solution[index];s.room.assistTile=index;s.room.assistMessage='Magic turns the next corridor into place.';break;}
  }
  return roomConnected(s.room)?testRoom(s):s;
}
export function choose(previous,id){const s=structuredClone(previous),p=panels[s.step];if(!p?.choices?.some(c=>c.id===id)||s.outcomes[p.id])throw new Error('Choice unavailable');s.answers[p.id]=id;
  const text={vow:id==='rescue'?'A stranger or a relic. Both doors now have a consequence.':'A lantern charge becomes a precious choice.',ally:id==='scout'?'Élodie joins the playtest. Her tools bonus is +5.':'Lucien joins the playtest. His Arcana bonus is +5.',name:'She signs the build, smiles, and fixes one more dungeon tile.',launch:'Version one is playable. The first players gather around her workbench.'}[p.id];
  if(p.id==='name'){s.woman=true;s.identity=id==='madame'?'Madame Reiveaux':'Monsieur Reiveaux';}
  s.outcomes[p.id]={title:p.id==='launch'?'Version one is out.':'Added to the game.',text};addLesson(s,p.id);return s;
}
export function rollDice(previous,rng=Math.random,{reroll=false}={}){
  const s=structuredClone(previous),p=panels[s.step];if(p?.type!=='dice')throw new Error('No dice here');
  if(s.outcomes[p.id]&&!reroll)throw new Error('Already rolled');
  if(reroll&&(p.id!=='gate'||!s.inspiration||!s.outcomes.gate))throw new Error('No Inspiration');
  const bonus=p.id==='focus'?2:p.id==='bridge'?3:(s.diceApproach==='arcana'?(s.answers.ally==='scholar'?5:3):(s.answers.ally==='scout'?5:3));
  const roll=check(bonus,p.dc,p.id==='bridge'&&s.help,rng);if(reroll)s.inspiration=false;
  const title=roll.success?{gate:'The guardian yields.',bridge:'The golden bridge holds.',focus:'The ward stays active.'}[p.id]:{gate:'The crypt offers another way.',bridge:'The safety catch works.',focus:'The ward fades. The lesson stays.'}[p.id];
  const text=roll.success?'A real roll. A visible rule. Reiveaux implements your result.':'A setback reveals a better design. Reiveaux fixes the confusing part and keeps building.';
  s.outcomes[p.id]={title,text,roll,rerolled:reroll};addLesson(s,p.id);return s;
}
export function neighbors(pos){const r=Math.floor(pos/3),c=pos%3;return Array.from({length:9},(_,i)=>i).filter(i=>Math.abs(Math.floor(i/3)-r)+Math.abs(i%3-c)===1);}
export function selectMove(previous,pos){if(panels[previous.step]?.id!=='battle'||previous.battle.solved||previous.battle.defeated||!(pos===previous.battle.pos||neighbors(previous.battle.pos).includes(pos)))throw new Error('Move to an adjacent tile');const s=structuredClone(previous);s.battle.move=pos;return s;}
export function battleAction(previous,action){
  const s=structuredClone(previous),b=s.battle;if(panels[s.step]?.id!=='battle'||b.solved||b.defeated||!['illuminate','ward','strike','wait'].includes(action))throw new Error('Action unavailable');
  if(b.move===null)throw new Error('Choose a neighboring tile, or tap yourself to hold position.');
  if(!(b.move===b.pos||neighbors(b.pos).includes(b.move)))throw new Error('Move to an adjacent tile');
  if(['illuminate','ward'].includes(action)&&b.slots===0)throw new Error('No spell slots. Rest and revise the encounter.');
  b.pos=b.move;b.move=null;
  if(['illuminate','ward'].includes(action))b.slots--;
  const target={illuminate:0,ward:8,strike:2}[action];
  const correct=b.pos===target&&!b.lit.includes(target);
  if(correct)b.lit.push(target);
  if(b.pos===4)b.hp=Math.max(0,b.hp-2);
  b.message=correct?'A seal lights. Your rule works.':action==='wait'?'You move. A fresh turn begins.':'The action spends its cost, but there is no matching seal here.';
  if(b.pos===4)b.message+=' Dragon fire costs 2 health.';
  b.turn++;b.defeated=b.hp===0;b.solved=b.lit.length===3;
  if(b.solved){s.outcomes.battle={title:'Three seals. One finished encounter.',text:'Movement, one action per turn, and two spell slots. You made the dungeon work.'};addLesson(s,'battle');}
  if(b.defeated)b.message='The test failed. Reiveaux catches you. Revise the encounter and try again.';
  return s;
}
export function restBattle(previous){const s=structuredClone(previous);s.battle=newBattle();s.battle.message='A long rest restores health and slots. Try a new route.';return s;}
export function hintBattle(previous){
  if(panels[previous.step]?.id!=='battle'||previous.battle.solved)throw new Error('No encounter step to play');
  const b=previous.battle,required=[0,8].filter(i=>!b.lit.includes(i)).length;
  if(b.defeated||b.hp===0||b.slots<required){const s=restBattle(previous);s.battle.message='Hint: a long rest restores the resources needed to finish.';s.battle.assisted=true;return s;}
  const bit=i=>i===0?1:i===2?2:i===8?4:0;
  const initial=b.lit.reduce((mask,i)=>mask|bit(i),0),queue=[{pos:b.pos,mask:initial,first:null}],seen=new Set();
  while(queue.length){const node=queue.shift(),key=node.pos+':'+node.mask;if(seen.has(key))continue;seen.add(key);
    if(node.mask===7&&node.first){let s=selectMove(previous,node.first.pos);s=battleAction(s,node.first.action);s.battle.assisted=true;return s;}
    for(const pos of [node.pos,...neighbors(node.pos)]){
      if(pos===4)continue;
      const fresh=bit(pos)&&!(node.mask&bit(pos));
      const action=fresh?{0:'illuminate',2:'strike',8:'ward'}[pos]:'wait';
      queue.push({pos,mask:node.mask|bit(pos),first:node.first||{pos,action}});
    }
  }
  throw new Error('No safe next step found');
}
export function advance(previous){
  const s=structuredClone(previous),p=panels[s.step];if(!s.started||s.step>=panels.length-1)throw new Error('No next panel');
  if(['choice','dice','pipes','battle','crawl','test'].includes(p.type)&&!s.outcomes[p.id])throw new Error('Play this panel first');
  if(p.lines&&s.beat<p.lines.length-1){s.beat++;if(p.id==='mirror'&&s.beat>=1)s.woman=true;return s;}
  addLesson(s,p.id);s.step++;s.beat=0;return s;
}
export function finishCrawl(previous){if(panels[previous.step]?.id!=='temple'||!previous.crawl.solved)throw new Error('Reach the temple door first');const s=structuredClone(previous);s.outcomes.temple={title:'Your creation is alive.',text:'Reiveaux connects movement, runes, and a working doorway. One rescued rune wakes a spell beyond the screen.'};addLesson(s,'temple');return s;}
export function updateDesign(previous,field,value){const s=structuredClone(previous);if(field==='title')s.design.title=String(value).slice(0,60);else{const choices={world:worlds,goal:goals,rule:rules}[field];if(!choices?.some(c=>c.id===value))throw new Error('Unknown design');s.design[field]=value;}return s;}
export function playPrototype(previous,door,rng=Math.random){
  if(panels[previous.step]?.id!=='test'||!['safe','bold'].includes(door)||previous.outcomes.test)throw new Error('Prototype choice unavailable');
  const s=structuredClone(previous),roll=door==='bold'?check(3,13,s.design.rule==='help',rng):null;
  const goal=s.design.goal==='rescue'?'the missing traveler':'the lost treasure';
  const place=s.design.world==='sky'?'floating shelves':'moonlit hedges';
  s.outcomes.test={title:door==='safe'?'A careful choice. A real game.':roll.success?'Your brave choice pays off.':'A setback opens a new path.',text:door==='safe'?`You spend your lantern to follow the ${place} and find ${goal}.`:roll.success?`You brave the dark, keep your lantern, and find ${goal}.`:`A hidden passage among the ${place} leads you onward. Your game keeps the story moving.`,roll};addLesson(s,'test','You made a player choose, applied a rule, and produced a consequence.');return s;
}
export function planText(s){const find=(arr,id)=>arr.find(v=>v.id===id)?.name||'';return `${s.design.title||'My first adventure'}\n\nWORLD: ${find(worlds,s.design.world)}\nGOAL: ${find(goals,s.design.goal)}\nRULE: ${find(rules,s.design.rule)}\n\nFIRST ROOM\nTwo exits: spend a lantern for a safe route, or brave a risky route.\n${s.design.rule==='help'?'A companion helps on the risky route: roll two d20s, keep the higher, add +3, and meet target 13.':'The lantern has one charge. A safe route spends it. A risky route keeps it: roll d20 + 3 against target 13.'}\nA setback opens a harder passage instead of ending the story.\n\nFIRST 20 MINUTES\n5 min: draw one room and two doors.\n5 min: give both doors a reward and a cost.\n10 min: write this rule and play with a friend.\nAsk what was confusing. Change one thing. Play again.\n\nThe Maker’s Spell · reiveaux\n`;}
export function readSave(raw){try{const s=JSON.parse(raw);if(s?.version===2&&Number.isInteger(s.step)&&s.step>=0&&s.step<15&&s.outcomes){s.version=VERSION;s.crawl=newCrawl();if(s.step>=7){s.step++;s.crawl={...s.crawl,pos:EXIT,collected:[...SHRINES],solved:true};s.outcomes.temple={title:'Your creation is alive.',text:'The maker’s temple leads to the mirror.'};}}if(s?.version!==VERSION||!Number.isInteger(s.step)||s.step<0||s.step>=panels.length||!Number.isInteger(s.beat)||s.beat<0||s.beat>2||typeof s.started!=='boolean'||!s.answers||!s.outcomes||!Array.isArray(s.notebook)||!s.room||s.room.tiles?.length!==16||!s.battle||!s.crawl||!s.design||typeof s.identity!=='string')return createState();
  if(s.room.tiles.some(t=>!['corner','straight'].includes(t.shape)||!Number.isInteger(t.rotation)||t.rotation<0||t.rotation>3)||!Number.isInteger(s.battle.pos)||s.battle.pos<0||s.battle.pos>8||!Number.isInteger(s.battle.slots)||s.battle.slots<0||s.battle.slots>2||!Number.isInteger(s.battle.hp)||s.battle.hp<0||s.battle.hp>6||!Array.isArray(s.battle.lit)||typeof s.design.title!=='string'||!worlds.some(x=>x.id===s.design.world)||!goals.some(x=>x.id===s.design.goal)||!rules.some(x=>x.id===s.design.rule))return createState();
  if(s.notebook.some(n=>typeof n.text!=='string'))return createState();
  if(!walkable(s.crawl.pos)||!Number.isInteger(s.crawl.steps)||s.crawl.steps<0||!Array.isArray(s.crawl.collected)||s.crawl.collected.some(c=>!SHRINES.includes(c))||new Set(s.crawl.collected).size!==s.crawl.collected.length||typeof s.crawl.solved!=='boolean'||(s.crawl.solved&&(s.crawl.pos!==EXIT||s.crawl.collected.length!==3)))return createState();
  for(const out of Object.values(s.outcomes)){if(typeof out.title!=='string'||typeof out.text!=='string')return createState();if(out.roll&&(!Array.isArray(out.roll.rolls)||out.roll.rolls.some(n=>!Number.isInteger(n)||n<1||n>20)||!Number.isFinite(out.roll.total)||!Number.isFinite(out.roll.bonus)))return createState();}
  return s;}catch{return createState();}}
