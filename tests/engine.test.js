import test from 'node:test';
import assert from 'node:assert/strict';
import {hintRoom,hintBattle} from '../engine.js';
import {vertices,faces,projectedFaces,faceNumbers} from '../dice.js';
import {panels} from '../story.js';
import {createState,newRoom,ports,roomConnected,rotateTile,testRoom,solution,choose,check,die,rollDice,neighbors,selectMove,battleAction,restBattle,advance,updateDesign,playPrototype,planText,readSave} from '../engine.js';
const at=id=>({...createState(),started:true,step:panels.findIndex(p=>p.id===id)});
function solve(s){for(const [key,rotation] of Object.entries(solution)){const index=Number(key);while(s.room.tiles[index].rotation!==rotation)s=rotateTile(s,index);}return testRoom(s);}
function act(s,pos,action){return battleAction(selectMove(s,pos),action);}
function winBattle(s){s=act(s,3,'wait');s=act(s,0,'illuminate');s=act(s,1,'wait');s=act(s,2,'strike');s=act(s,5,'wait');return act(s,8,'ward');}

test('corridor puzzle requires reciprocal ports and a connected entrance-to-exit path',()=>{
  const initial=newRoom();assert.equal(roomConnected(initial),false);
  let s=at('room');s=solve(s);assert.equal(s.room.solved,true);assert.ok(s.outcomes.room);assert.equal(advance(s).step,s.step+1);
  const broken=structuredClone(s.room);broken.tiles[12].rotation=1;assert.equal(roomConnected(broken),false);
  const middle=structuredClone(s.room);middle.tiles[5].rotation=3;assert.equal(roomConnected(middle),false);
  assert.throws(()=>rotateTile(s,0));assert.throws(()=>rotateTile(at('room'),16));
  let cycle=at('room');const before=cycle.room.tiles[0].rotation;for(let i=0;i<4;i++)cycle=rotateTile(cycle,0);assert.equal(cycle.room.tiles[0].rotation,before);
  assert.deepEqual(ports({shape:'corner',rotation:3}),[3,0]);
});
test('d20 rolls are real, modifiers meet the target, and advantage keeps the higher die',()=>{
  assert.equal(die(20,()=>0),1);assert.equal(die(20,()=>.999),20);assert.throws(()=>die(20,()=>1));
  assert.equal(check(3,13,false,()=>.45).success,true);assert.equal(check(3,13,false,()=>.4).success,false);
  const rng=[.1,.9];const r=check(3,14,true,()=>rng.shift());assert.deepEqual(r.rolls,[3,19]);assert.equal(r.kept,19);assert.equal(r.total,22);
  let s=at('gate');s.answers.ally='scholar';s=rollDice(s,()=>0);assert.equal(s.outcomes.gate.roll.bonus,5);assert.equal(s.outcomes.gate.roll.success,false);
  assert.doesNotThrow(()=>advance(s));assert.throws(()=>rollDice(s));
  s=rollDice(s,()=>.999,{reroll:true});assert.equal(s.inspiration,false);assert.equal(s.outcomes.gate.roll.kept,20);assert.throws(()=>rollDice(s,()=>0,{reroll:true}));
});
test('encounter enforces adjacent movement, one action, spell costs, and a solvable route',()=>{
  let s=at('battle');const before=JSON.stringify(s);
  assert.deepEqual(neighbors(6),[3,7]);assert.throws(()=>selectMove(s,0));assert.throws(()=>battleAction(s,'ward'));
  s=winBattle(s);assert.equal(s.battle.solved,true);assert.equal(s.battle.slots,0);assert.equal(s.battle.hp,6);assert.deepEqual(s.battle.lit,[0,2,8]);assert.equal(s.battle.turn,7);assert.ok(s.outcomes.battle);assert.doesNotThrow(()=>advance(s));assert.throws(()=>battleAction(s,'strike'));
  assert.equal(JSON.stringify(at('battle')),before);
  assert.throws(()=>battleAction({...at('battle'),battle:{...at('battle').battle,move:0}},'ward'));
});
test('a failed spell test consumes slots; dragon fire and a rest permit a meaningful retry',()=>{
  let s=at('battle');s=act(s,6,'ward');s=act(s,6,'illuminate');assert.equal(s.battle.slots,0);assert.equal(s.battle.lit.length,0);
  assert.throws(()=>battleAction(selectMove(s,6),'ward'));
  s=restBattle(s);assert.equal(s.battle.slots,2);assert.equal(s.battle.hp,6);assert.equal(s.battle.pos,6);
  s=act(s,3,'wait');s=act(s,4,'wait');s=act(s,4,'wait');s=act(s,4,'wait');assert.equal(s.battle.defeated,true);assert.equal(s.battle.hp,0);assert.throws(()=>selectMove(s,3));
  assert.equal(winBattle(restBattle(s)).battle.solved,true);
});
test('the transformation is joyful, chosen names persist, and even failed dice reach the finale',()=>{
  for(const vow of ['rescue','light'])for(const ally of ['scout','scholar'])for(const name of ['madame','monsieur'])for(const launch of ['festival','friends']){
    let s={...createState(),started:true};
    while(panels[s.step].id!=='done'){
      const p=panels[s.step];
      if(p.id==='vow')s=choose(s,vow);else if(p.id==='ally')s=choose(s,ally);else if(p.id==='name')s=choose(s,name);else if(p.id==='launch')s=choose(s,launch);
      else if(p.type==='pipes')s=solve(s);else if(p.type==='dice')s=rollDice(s,()=>0);else if(p.type==='battle')s=winBattle(s);else if(p.type==='test')s=playPrototype(s,'bold',()=>0);
      s=advance(s);
    }
    assert.equal(s.woman,true);assert.equal(s.identity,name==='madame'?'Madame Reiveaux':'Monsieur Reiveaux');assert.equal(s.answers.launch,launch);assert.match(planText(s),/FIRST 20 MINUTES/);
  }
});
test('player-made prototypes use their chosen world, goal, and rule, and export a portable plan',()=>{
  let s=at('test');s=updateDesign(s,'world','garden');s=updateDesign(s,'goal','treasure');s=updateDesign(s,'rule','light');s=updateDesign(s,'title','The Moon Garden');
  s=playPrototype(s,'bold',()=>.99);assert.equal(s.outcomes.test.roll.rolls.length,1);assert.match(s.outcomes.test.text,/lost treasure/);assert.match(planText(s),/The Moon Garden/);assert.match(planText(s),/haunted garden/);assert.throws(()=>playPrototype(s,'safe'));
  const help=playPrototype(at('test'),'bold',()=>.1);assert.equal(help.outcomes.test.roll.rolls.length,2);
  assert.equal(playPrototype(at('test'),'safe').outcomes.test.roll,null);assert.throws(()=>updateDesign(s,'world','unknown'));
});
test('save/resume keeps puzzle rotations and moves; old or malformed saves start clean',()=>{
  let s=rotateTile(at('room'),3);assert.deepEqual(readSave(JSON.stringify(s)),s);
  s=selectMove(at('battle'),3);assert.deepEqual(readSave(JSON.stringify(s)),s);
  assert.deepEqual(readSave('broken'),createState());assert.deepEqual(readSave(JSON.stringify({version:1})),createState());assert.deepEqual(readSave(JSON.stringify({...s,step:100})),createState());
  assert.throws(()=>advance(at('room')));assert.throws(()=>advance(at('gate')));
});

test('a corridor hint automatically fixes one next tile, and repeated hints finish disturbed boards',()=>{
  for(let seed=0;seed<16;seed++){
    let s=at('room');s.room.tiles.forEach((tile,i)=>tile.rotation=(seed+i*3)%4);
    let clicks=0;
    while(!s.room.solved&&clicks<10){const old=structuredClone(s);s=hintRoom(s);const changed=s.room.tiles.filter((tile,i)=>tile.rotation!==old.room.tiles[i].rotation);assert.ok(changed.length<=1);clicks++;}
    assert.equal(s.room.solved,true);assert.ok(s.outcomes.room);assert.throws(()=>hintRoom(s));
  }
  const initial=at('room'),snapshot=JSON.stringify(initial);hintRoom(initial);assert.equal(JSON.stringify(initial),snapshot);
});

test('encounter hints perform safe legal turns from every location and partial progress, recovering depleted resources',()=>{
  for(let pos=0;pos<9;pos++)for(let mask=0;mask<7;mask++)for(let slots=0;slots<=2;slots++)for(const hp of [1,6]){
    let s=at('battle');s.battle.pos=pos;s.battle.hp=hp;s.battle.slots=slots;s.battle.lit=[0,2,8].filter((_,i)=>mask&(1<<i));
    let steps=0;
    while(!s.battle.solved&&steps<15){const before=s;s=hintBattle(s);assert.ok(s.battle.hp>0);assert.ok(s.battle.slots>=0);assert.equal(s.battle.move,null);if(s.battle.turn>before.battle.turn){assert.ok(s.battle.pos===before.battle.pos||neighbors(before.battle.pos).includes(s.battle.pos));assert.notEqual(s.battle.pos,4);}steps++;}
    assert.equal(s.battle.solved,true,`position ${pos}, mask ${mask}, slots ${slots}, health ${hp}`);
  }
  const lost=at('battle');lost.battle.defeated=true;lost.battle.hp=0;const restored=hintBattle(lost);assert.equal(restored.battle.hp,6);assert.equal(restored.battle.slots,2);
  assert.throws(()=>hintBattle(winBattle(at('battle'))));
});

test('the animated die is a 20-face solid and its final front face always shows the actual rolled value',()=>{
  assert.equal(vertices.length,12);assert.equal(faces.length,20);
  for(const v of vertices)assert.ok(Math.abs(Math.hypot(...v)-1)<1e-12);
  const edges=new Set();for(const face of faces){assert.equal(new Set(face).size,3);for(let i=0;i<3;i++)edges.add([face[i],face[(i+1)%3]].sort((a,b)=>a-b).join(','));}assert.equal(edges.size,30);
  const front=projectedFaces(-.24,.38,.08).at(-1).id;
  for(let result=1;result<=20;result++){const numbers=faceNumbers(result);assert.equal(numbers[front],result);assert.equal(new Set(numbers).size,20);}
  for(const face of projectedFaces(12,24,36,100))for(const point of face.points)assert.ok(point.every(Number.isFinite));
  assert.throws(()=>faceNumbers(0));assert.throws(()=>faceNumbers(21));
});
