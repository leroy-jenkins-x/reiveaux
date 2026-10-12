import test from 'node:test';
import assert from 'node:assert/strict';
import {SoundBank} from '../sound.js';

class AudioFixture {
  constructor(src){this.src=src;this.currentTime=0;this.paused=true;this.muted=false;this.playCount=0;}
  setAttribute(){}
  addEventListener(){}
  play(){this.paused=false;this.playCount++;return Promise.resolve();}
  pause(){this.paused=true;}
}

test('sound defaults on; gesture unlock must not pause a requested effect or leave it muted',async()=>{
  const bank=new SoundBank(null,{AudioClass:AudioFixture});assert.equal(bank.enabled,true);
  bank.unlock();await bank.play('chime');
  assert.equal(bank.tracks.chime.paused,false);assert.equal(bank.tracks.chime.muted,false);
  assert.equal(bank.tracks.dice.paused,true);assert.equal(bank.tracks.transformation.paused,true);
  await bank.play('dice',{volume:.7});assert.equal(bank.tracks.dice.paused,false);assert.equal(bank.tracks.dice.muted,false);assert.equal(bank.tracks.dice.volume,.7);
  bank.setEnabled(false);for(const clip of Object.values(bank.tracks))assert.equal(clip.paused,true);
  const count=bank.tracks.chime.playCount;assert.equal(await bank.play('chime'),false);assert.equal(bank.tracks.chime.playCount,count);
  bank.setEnabled(true);await bank.play('chime');assert.equal(bank.tracks.chime.paused,false);assert.equal(bank.tracks.chime.muted,false);
});

test('a blocked media request is handled and permits a later gesture retry',async()=>{
  class Blocked extends AudioFixture{play(){this.playCount++;return Promise.reject(new Error('User gesture required'));}}
  const bank=new SoundBank(null,{AudioClass:Blocked});bank.unlock();assert.equal(await bank.play('chime'),false);assert.equal(bank.unlocked,false);assert.equal(bank.enabled,true);
});
