import test from 'node:test';
import assert from 'node:assert/strict';
import {crawlPath,crawlNeighbors,SHRINES,ENTRANCE,EXIT} from '../crawl.js';
import {createState,tapBattle} from '../engine.js';
import {panels} from '../story.js';

test('a tapped temple destination has a connected path through legal tiles',()=>{
  for(const destination of [...SHRINES,EXIT]){
    const path=crawlPath(ENTRANCE,destination);assert.equal(path[0],ENTRANCE);assert.equal(path.at(-1),destination);
    for(let i=1;i<path.length;i++)assert.ok(crawlNeighbors(path[i-1]).includes(path[i]));
  }
  assert.equal(crawlPath(ENTRANCE,47).length,5);assert.deepEqual(crawlPath(ENTRANCE,ENTRANCE),[ENTRANCE]);
  assert.deepEqual(crawlPath(ENTRANCE,0),[]);assert.deepEqual(crawlPath(ENTRANCE,-1),[]);assert.deepEqual(crawlPath(0,EXIT),[]);
});

test('one battle tap moves and acts, preserves spell limits, and finishes the encounter',()=>{
  let s={...createState(),started:true,step:panels.findIndex(p=>p.id==='battle')};
  assert.throws(()=>tapBattle(s,0));const original=JSON.stringify(s);
  for(const cell of [3,0,1,2,5,8])s=tapBattle(s,cell);
  assert.equal(s.battle.solved,true);assert.equal(s.battle.hp,6);assert.equal(s.battle.slots,0);assert.equal(s.battle.move,null);assert.ok(s.outcomes.battle);
  assert.equal(JSON.stringify({...createState(),started:true,step:panels.findIndex(p=>p.id==='battle')}),original);
  let again={...createState(),started:true,step:panels.findIndex(p=>p.id==='battle')};again=tapBattle(tapBattle(again,3),0);assert.equal(again.battle.slots,1);again=tapBattle(again,0);assert.equal(again.battle.slots,1);
});
