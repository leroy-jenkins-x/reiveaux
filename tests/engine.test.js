import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,check,die,resolveChoice,rerollGate,advance,readSave,blueprintText} from '../engine.js';
import {scenes} from '../story.js';

function next(s,c,p={},rng=()=>.5){return advance(resolveChoice(s,c,p,rng));}
function gateState(party='scout') {
  let s={...createState(),started:true};s=next(s,'rescue');s=next(s,party);return s;
}
test('d20 checks meet the target, and advantage/disadvantage choose the correct die',()=>{
  assert.equal(die(20,()=>0),1);assert.equal(die(20,()=>.999),20);
  assert.equal(check({bonus:3,dc:13},()=>.45).success,true);
  assert.equal(check({bonus:3,dc:13},()=>.4).success,false);
  let rolls=[.1,.9];assert.equal(check({mode:'advantage'},()=>rolls.shift()).kept,19);
  rolls=[.1,.9];assert.equal(check({mode:'disadvantage'},()=>rolls.shift()).kept,3);
  assert.throws(()=>die(20,()=>1));
});
test('gate applies relevant proficiency and a failed check opens a fallback',()=>{
  const s=gateState(),original=JSON.stringify(s);
  const skilled=resolveChoice(s,'scout',{},()=>.4);
  const unskilled=resolveChoice(s,'scholar',{},()=>.4);
  assert.equal(skilled.outcomes.gate.roll.bonus,5);assert.equal(skilled.hp,12);
  assert.equal(unskilled.outcomes.gate.roll.bonus,3);assert.equal(unskilled.hp,10);
  assert.equal(advance(unskilled).scene,3);assert.equal(JSON.stringify(s),original);
  assert.throws(()=>resolveChoice(skilled,'scout'));
});
test('Heroic Inspiration must use the new die, consumes once, and corrects gate damage',()=>{
  let s=resolveChoice(gateState(),'scout',{},()=>0);assert.equal(s.hp,10);
  s=rerollGate(s,()=>.99);assert.equal(s.hp,12);assert.equal(s.inspiration,false);
  assert.throws(()=>rerollGate(s));
  const passed=resolveChoice(gateState(),'scout',{},()=>.99);
  const failed=rerollGate(passed,()=>0);assert.equal(failed.hp,10);assert.equal(failed.outcomes.gate.roll.success,false);
});
test('spell slots, Hit Dice, legal actions, and both rests maintain resource limits',()=>{
  let s=next(gateState(),'scout');s=next(s,'help');
  assert.throws(()=>resolveChoice(s,'plan',{move:'teleport',action:'help'}));
  s=next(s,'plan',{move:'bridge',action:'help'});s=next(s,'step');
  assert.equal(s.slots,0);
  const short=resolveChoice(s,'short',{},()=>.99);assert.equal(short.slots,0);assert.equal(short.hitDice,0);assert.equal(short.hp,12);
  const long=resolveChoice(s,'long');assert.equal(long.slots,2);assert.equal(long.hitDice,1);assert.equal(long.hp,12);
});
test('all branches reach the female maker’s success and the player’s notebook, even with the lowest dice',()=>{
  let traversed=0;
  function visit(s) {
    const scene=scenes[s.scene];
    if(scene.type==='blueprint') {
      assert.equal(s.woman,true);assert.ok(s.gold>1000000);assert.ok(s.admiration>=52000);
      assert.equal(s.notebook.length,11);assert.ok(s.hp>=1&&s.hp<=12);assert.ok(s.slots>=0&&s.slots<=2);
      assert.match(blueprintText(s),/FIRST 20 MINUTES/);traversed++;return;
    }
    const choices=scene.type==='turn'?[['plan',{move:'cover',action:'help'}],['plan',{move:'cover',action:'attack'}],['plan',{move:'bridge',action:'help'}],['plan',{move:'bridge',action:'attack'}]]:scene.choices.map(c=>[c.id,{}]);
    for(const [c,p] of choices) visit(next(s,c,p,()=>0));
  }
  visit({...createState(),started:true});assert.equal(traversed,10368);
});
test('save/resume preserves outcomes, malformed saves recover, and blueprint exports the player’s words',()=>{
  const s=resolveChoice(gateState(),'scout',{},()=>.99);
  assert.deepEqual(readSave(JSON.stringify(s)),s);assert.deepEqual(readSave('broken'),createState());
  assert.deepEqual(readSave(JSON.stringify({...s,scene:99})),createState());
  assert.deepEqual(readSave(JSON.stringify({...s,outcomes:{...s.outcomes,gate:{title:'Broken',text:'Bad data',implemented:'Missing roll'}}})),createState());
  assert.throws(()=>advance({...createState(),started:true}));
  s.blueprint={title:'My own game',fantasy:'A lost astronomer',choice:'Save the stars or the city',mechanic:'Spend one star to light a path.'};
  assert.match(blueprintText(s),/A lost astronomer/);assert.match(blueprintText(s),/Save the stars or the city/);
});
