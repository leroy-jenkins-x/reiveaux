import {scenes,imageAlts,coreIdeas} from './story.js';
import {createState,resolveChoice,rerollGate,advance,readSave,blueprintText} from './engine.js';

const KEY='reiveaux-makers-spell-v1';
const app=document.querySelector('#app'),journal=document.querySelector('#journal');
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon='<svg class="die-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="m24 3 19 13-6 23H11L5 16Zm0 0-10 20h20ZM5 16l9 7-3 16m32-23-9 7 3 16m-23-16 10 16 10-16"/></svg>';
const arrow='<span aria-hidden="true">↗</span>';
let state,playing=false,busy=false,sound=false,audioContext;
try {state=readSave(localStorage.getItem(KEY));} catch {state=createState();}
function save() {
  try {localStorage.setItem(KEY,JSON.stringify(state));} catch {toast('This browser cannot save progress. You can still play this session.');}
}
function toast(message) {
  const t=document.querySelector('#toast');t.textContent=message;t.classList.add('visible');
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),3500);
}
function chime() {
  if(!sound) return;
  try {
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();
    const gain=audioContext.createGain(),osc=audioContext.createOscillator(),now=audioContext.currentTime;
    gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.035,now+.03);gain.gain.exponentialRampToValueAtTime(.001,now+.55);
    osc.type='sine';osc.frequency.setValueAtTime(523.25,now);osc.frequency.linearRampToValueAtTime(783.99,now+.4);
    osc.connect(gain).connect(audioContext.destination);osc.start();osc.stop(now+.6);
  } catch {sound=false;toast('Sound is unavailable in this browser.');}
}
function header() {
  return `<header class="topbar"><button class="brand" data-action="home" aria-label="Story cover">${icon}<span>REIVEAUX</span></button><div class="header-actions"><button class="icon-button" data-action="sound" aria-label="${sound?'Mute':'Enable'} gentle sound effects" aria-pressed="${sound}">${sound?'♪':'♫'}<span class="sound-label">${sound?'ON':'OFF'}</span></button><button class="journal-button" data-action="journal">Notebook <span aria-hidden="true">✧</span></button></div></header>`;
}
function cover() {
  app.innerHTML=`<section class="cover">${header()}<img class="cover-art" src="./assets/atelier.webp" alt="${escape(imageAlts.atelier)}" fetchpriority="high" width="1024" height="1536"><div class="cover-shade"></div><div class="cover-copy"><div class="eyebrow"><span class="line"></span> AN INTERACTIVE FANTASY</div><h1>The Maker’s<br><em>Spell.</em></h1><p class="cover-subtitle">A legend begins with<br>one playable room.</p><p class="cover-description">Build a game. Defy the darkness.<br>Discover who you can become.</p><div class="cover-meta"><span>◷ &nbsp; ABOUT 10 MIN</span><span>12 CHAPTERS</span></div><button class="primary" data-action="start">${state.started?`Continue chapter ${state.scene+1}`:'Enter the atelier'} ${arrow}</button><p class="cover-footnote">A tale of Monsieur Reiveaux<br>and the game only you can make.</p></div></section>`;
}
function rollMarkup(roll) {
  if(!roll) return '';
  const isHealing=roll.mode==='healing';
  return `<div class="roll-readout"><div class="dice" aria-label="${roll.rolls.map(n=>`d${roll.sides||20} rolled ${n}`).join(', ')}">${roll.rolls.map((n,i)=>`<span class="die ${roll.rolls.length===2&&n!==roll.kept?'discarded':''}"><small>d${roll.sides||20}</small><b>${n}</b>${roll.rolls.length===2&&n===roll.kept?'<small>KEEP</small>':''}</span>`).join('')}</div><div class="roll-math"><span>${isHealing?'HEALING':roll.mode==='advantage'?'ADVANTAGE':'D20 TEST'}</span><strong>${roll.kept} + ${roll.bonus} = ${roll.total}</strong><small>${isHealing?'Health is capped at 12':`Target ${roll.dc} · ${roll.success?'passed':'setback'}`}</small></div></div>`;
}
function outcome(scene,out) {
  return `<section class="result" aria-labelledby="result-title"><div class="eyebrow">✧ THE STORY ANSWERS</div>${rollMarkup(out.roll)}${out.rerolled?`<p class="reroll-note">Inspiration spent. Original die: ${out.previousRoll}. The new result is used.</p>`:''}<h2 id="result-title" tabindex="-1">${escape(out.title)}</h2><p>${escape(out.text)}</p><div class="implemented"><span>ADDED TO THE GAME</span><p>${escape(out.implemented)}</p></div>${scene.id==='gate'&&state.inspiration&&!out.roll.success?'<button class="secondary" data-action="inspiration">Use Heroic Inspiration · reroll the d20</button><p class="small-note">One use. You must keep the new roll.</p>':''}<button class="primary" data-action="next">${scene.id==='fortune'?'Open your notebook':'Turn the page'} <span aria-hidden="true">→</span></button></section>`;
}
function turnForm() {
  return `<form id="turn-form" class="turn-planner"><div class="initiative"><span>INITIATIVE</span><b>Reiveaux 16</b><span>→</span><b>Sentinel 11</b></div><fieldset><legend><span>01</span> Movement</legend><label class="radio-choice"><input type="radio" name="move" value="cover" required checked><span><b>Take cover</b><small>Reduce the return attack to 3 damage.</small></span></label><label class="radio-choice"><input type="radio" name="move" value="bridge" required><span><b>Advance onto the bridge</b><small>A bold position; the return attack deals 6.</small></span></label></fieldset><fieldset><legend><span>02</span> One action</legend><label class="radio-choice"><input type="radio" name="action" value="help" required checked><span><b>Help your adjacent companion</b><small>Give their next attack advantage.</small></span></label><label class="radio-choice"><input type="radio" name="action" value="attack" required><span><b>Attack the sentinel</b><small>Force it to retreat with a direct strike.</small></span></label></fieldset><div class="bonus-feature"><span>03</span><p><b>Bonus action: Signalcraft</b><small>Your original class feature marks the escape path.</small></p><span class="tick" aria-hidden="true">✓</span></div><button class="primary" type="submit">Play this turn <span aria-hidden="true">→</span></button></form>`;
}
function blueprintMarkup() {
  const b=state.blueprint,idea=coreIdeas[state.answers.vow||'rescue'];
  return `<form id="blueprint-form" class="blueprint-form"><label for="game-title">YOUR GAME’S WORKING TITLE</label><input id="game-title" name="title" maxlength="70" value="${escape(b.title||'My first adventure')}" autocomplete="off"><label for="fantasy">WHO DOES THE PLAYER GET TO BE?</label><input id="fantasy" name="fantasy" maxlength="140" value="${escape(b.fantasy||'A brave explorer with one precious lantern')}" autocomplete="off"><label for="choice">ONE INTERESTING CHOICE</label><textarea id="choice" name="choice" rows="3" maxlength="350">${escape(b.choice||idea.rule)}</textarea><label for="mechanic">ONE RULE TO TRY</label><select id="mechanic" name="mechanic">${['When a friend helps, roll two d20s and keep the higher.','Each turn gives one main action: attack, help, or explore.','Spend a lantern charge to reveal a safe path.','A failed check opens a harder route instead of stopping play.'].map(v=>`<option ${b.mechanic===v?'selected':''}>${escape(v)}</option>`).join('')}</select><div class="prototype-plan"><div class="eyebrow">YOUR FIRST 20 MINUTES</div>${[{id:'room',text:'Draw one room and two exits.',time:'5 min'},{id:'costs',text:'Give each exit a reward and a cost.',time:'5 min'},{id:'play',text:'Write one rule. Play it with a friend.',time:'10 min'}].map((t,i)=>`<label class="task"><input type="checkbox" name="task" value="${t.id}" ${state.tasks.includes(t.id)?'checked':''}><span><b>${String(i+1).padStart(2,'0')}</b> ${t.text}</span><small>${t.time}</small></label>`).join('')}<p id="task-message">${state.tasks.length===3?'You made something playable. Change one thing, then play again.':'Start with paper, a die, and a curious friend.'}</p></div><button type="button" class="primary" data-action="download">Keep my game plan <span aria-hidden="true">↓</span></button><button type="button" class="secondary" data-action="copy">Copy my game plan</button><p class="small-note">Your notes stay in this browser. Download them to keep a copy.</p><div class="ending-note"><span aria-hidden="true">✧</span><h2>The next page is yours.</h2><p>You made decisions that shaped a game.<br>Now make one of those decisions playable.</p><button class="text-button" type="button" data-action="journal">Revisit Reiveaux’s design lessons →</button></div></form>`;
}
function render() {
  if(!playing) {cover();return;}
  const scene=scenes[state.scene],out=state.outcomes[scene.id];
  const support=state.gold?`<section class="fortune"><div><strong>${state.gold.toLocaleString('en-US')}</strong><span>GOLD CROWNS EARNED</span></div><div><strong>${state.admiration.toLocaleString('en-US')}</strong><span>ADMIRING PLAYERS</span></div></section>`:'';
  app.innerHTML=`${header()}<div class="chapter-progress" role="progressbar" aria-label="Story chapter" aria-valuemin="1" aria-valuemax="12" aria-valuenow="${state.scene+1}">${scenes.map((s,i)=>`<span class="${i<state.scene?'complete':i===state.scene?'current':''}"></span>`).join('')}</div><article class="chapter"><button class="scene-art ${scene.image}" data-action="art" aria-label="View full illustration"><img src="./assets/${scene.image}.webp" alt="${escape(imageAlts[scene.image])}" width="1024" height="1536"><span class="art-hint">VIEW ART <span aria-hidden="true">⤢</span></span></button><div class="chapter-content"><div class="chapter-meta"><span class="eyebrow">${escape(scene.act)}</span><span>${String(state.scene+1).padStart(2,'0')} / 12</span></div><h1 id="chapter-title" tabindex="-1">${escape(scene.title)}</h1>${scene.id==='blueprint'?support:''}<div class="prose">${scene.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}</div><blockquote>${escape(scene.quote)}</blockquote>${scene.type==='blueprint'?blueprintMarkup():`<section class="decision"><div class="eyebrow">YOUR MOVE</div><h2>${escape(scene.prompt)}</h2>${scene.mechanic?`<details class="mechanic"><summary>The rule at the table <span aria-hidden="true">+</span></summary><p>${escape(scene.mechanic)}</p></details>`:''}${out?outcome(scene,out):scene.type==='turn'?turnForm():`<div class="choices">${scene.choices.map(c=>`<button class="choice" data-choice="${c.id}"><span><strong>${escape(c.title)}</strong><small>${escape(c.detail)}${scene.id==='gate'?` · bonus +${c.id===state.answers.party?5:3}`:''}</small></span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div><p class="choice-hint">${['gate','advantage','playtest'].includes(scene.id)?'Your choice rolls the dice. Every result continues the story.':'Your choice becomes part of the game.'}</p>`}</section>`}<footer class="chapter-footer"><span>✧ &nbsp; ${state.craft} rules brought to life</span><button class="text-button" data-action="journal">Notebook</button></footer>${scene.type==='blueprint'?'<details class="credits"><summary>About this story &amp; its inspirations</summary><p>A fictional tale of creative possibility. Original story and world; four AI-generated fantasy illustrations.</p><p>Inspired by Dungeons &amp; Dragons: d20 tests, proficiency, advantage, action economy, spell slots, Hit Dice, Heroic Inspiration, and concentration. This is an independent, simplified experience, with original spells and narrative outcomes.</p><p>Rules references: <a href="https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game" target="_blank" rel="noopener noreferrer">Playing the Game</a> and <a href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary" target="_blank" rel="noopener noreferrer">Rules Glossary</a>. Dungeons &amp; Dragons belongs to Wizards of the Coast; this story is not affiliated with them.</p><p><a href="https://github.com/leroy-jenkins-x/reiveaux" target="_blank" rel="noopener noreferrer">View the source on GitHub</a></p></details>':''}</div></article>`;
  const next=scenes[state.scene+1];if(next&&next.image!==scene.image){const i=new Image();i.src=`./assets/${next.image}.webp`;}
}
function top() {window.scrollTo({top:0,behavior:'instant'});document.querySelector('#chapter-title')?.focus({preventScroll:true});}
function showJournal() {
  journal.innerHTML=`<div class="dialog-header"><div><div class="eyebrow">THE BUILDER’S NOTEBOOK</div><h2 id="journal-title">${escape(state.gameTitle||'A first spark')}</h2></div><button class="icon-button" data-action="close" aria-label="Close notebook">×</button></div><p class="journal-identity">${escape(state.identity)} · ${state.craft} rules implemented</p><div class="resources"><span><b>${state.hp}/12</b> Health</span><span><b>${state.slots}/2</b> Spell slots</span><span><b>${state.hitDice}</b> Hit Die</span></div>${state.notebook.length?`<ol class="journal-entries">${state.notebook.map((e,i)=>`<li><span class="entry-number">${String(i+1).padStart(2,'0')}</span><div><h3>${escape(e.title)}</h3><p>${escape(e.rule)}</p><em>${escape(e.lesson)}</em></div></li>`).join('')}</ol>`:'<p class="journal-empty">Each choice will add a rule here. Enter the atelier to write the first page.</p>'}<details class="restart"><summary>Begin the story again</summary><p>Your current story choices and game notes will be cleared from this browser.</p><button class="secondary" data-action="restart">Clear progress and restart</button></details><button class="primary" data-action="close">Return to the story <span aria-hidden="true">→</span></button>`;
  journal.showModal();
}
async function choose(choice,payload={}) {
  if(busy) return;busy=true;
  const diceScene=['gate','advantage','playtest'].includes(scenes[state.scene].id);
  app.querySelectorAll('button[data-choice], #turn-form button').forEach(b=>b.disabled=true);
  if(diceScene) {toast('The dice are rolling…');app.querySelector('.decision').classList.add('rolling');}
  try {
    if(diceScene&&!matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(r=>setTimeout(r,550));
    state=resolveChoice(state,choice,payload);save();chime();render();
    if(diceScene) toast('The dice have spoken. Your next page is ready.');
    document.querySelector('#result-title').focus({preventScroll:true});document.querySelector('.result').scrollIntoView({behavior:'smooth',block:'start'});
  } catch(e) {toast(e.message);render();} finally {busy=false;}
}
document.addEventListener('click',async event=>{
  const choice=event.target.closest('[data-choice]');if(choice){choose(choice.dataset.choice);return;}
  const button=event.target.closest('[data-action]');if(!button) return;
  switch(button.dataset.action) {
    case 'start':state.started=true;playing=true;save();chime();render();top();break;
    case 'home':if(!busy){playing=false;render();window.scrollTo(0,0);}break;
    case 'next':if(!busy){state=advance(state);save();chime();render();top();}break;
    case 'sound':sound=!sound;chime();button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',`${sound?'Mute':'Enable'} gentle sound effects`);button.innerHTML=`${sound?'♪':'♫'}<span class="sound-label">${sound?'ON':'OFF'}</span>`;break;
    case 'journal':showJournal();break;
    case 'close':journal.close();break;
    case 'restart':state=createState();save();playing=false;journal.close();render();window.scrollTo(0,0);break;
    case 'inspiration':state=rerollGate(state);save();chime();render();document.querySelector('.result').scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('#result-title').focus({preventScroll:true});break;
    case 'art':{const scene=scenes[state.scene];journal.innerHTML=`<div class="dialog-header"><h2 id="journal-title">${escape(scene.title)}</h2><button class="icon-button" data-action="close" aria-label="Close illustration">×</button></div><img class="full-art" src="./assets/${scene.image}.webp" alt="${escape(imageAlts[scene.image])}"><button class="primary" data-action="close">Return to the story</button>`;journal.showModal();break;}
    case 'copy':
      collectBlueprint();try{await navigator.clipboard.writeText(blueprintText(state));toast('Your game plan is copied. Make its first room real.');}catch{toast('Copy is unavailable here. Use “Keep my game plan” to download it.');}break;
    case 'download':{
      collectBlueprint();const url=URL.createObjectURL(new Blob([blueprintText(state)],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='my-first-game-plan.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Your game plan is ready. Start with one room.');break;
    }
  }
});
function collectBlueprint() {
  const form=document.querySelector('#blueprint-form');if(!form) return;
  const data=new FormData(form);state.blueprint={title:data.get('title').trim(),fantasy:data.get('fantasy').trim(),choice:data.get('choice').trim(),mechanic:data.get('mechanic')};state.tasks=data.getAll('task');save();
  document.querySelector('#task-message').textContent=state.tasks.length===3?'You made something playable. Change one thing, then play again.':'Start with paper, a die, and a curious friend.';
}
document.addEventListener('input',e=>{if(e.target.closest('#blueprint-form')) collectBlueprint();});
document.addEventListener('submit',e=>{e.preventDefault();if(e.target.id==='turn-form'){const data=new FormData(e.target);choose('plan',{move:data.get('move'),action:data.get('action')});}});
journal.addEventListener('click',e=>{if(e.target===journal){const r=journal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) journal.close();}});
render();
