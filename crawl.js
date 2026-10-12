// An original, Zelda-inspired temple vignette. No libraries or copied assets.
export const TEMPLE=[
  '###D###',
  '#.....#',
  '#.#.#.#',
  '#.....#',
  '###.###',
  '#.....#',
  '#.#.#.#',
  '#.....#',
  '###S###'
];
export const SHRINES=[47,15,19];
export const ENTRANCE=59,EXIT=3;
export const directions={up:-7,right:1,down:7,left:-1};
export const walkable=cell=>Number.isInteger(cell)&&cell>=0&&cell<63&&TEMPLE[Math.floor(cell/7)][cell%7]!=='#';
export function newCrawl(){return {pos:ENTRANCE,collected:[],steps:0,solved:false,pulses:0,stumbles:0,message:'Tap a rune or a path to walk there. Tap a wisp to cast magic.'};}
export function crawlNeighbors(cell){return Object.values(directions).map(d=>cell+d).filter(n=>walkable(n)&&Math.abs(n%7-cell%7)+Math.abs(Math.floor(n/7)-Math.floor(cell/7))===1);}
export function crawlPath(from,to){
  if(!walkable(from)||!walkable(to))return [];
  const queue=[[from]],seen=new Set([from]);
  while(queue.length){const path=queue.shift(),cell=path.at(-1);if(cell===to)return path;for(const next of crawlNeighbors(cell)){if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}}}
  return [];
}
export function moveCrawl(previous,direction){
  if(previous.solved||!Object.hasOwn(directions,direction))return previous;
  const next=previous.pos+directions[direction];if(!crawlNeighbors(previous.pos).includes(next))return {...previous,message:'A temple wall. Try another direction.'};
  const s=structuredClone(previous);s.pos=next;s.steps++;
  if(SHRINES.includes(next)&&!s.collected.includes(next)){s.collected.push(next);s.message=s.collected.length===3?'Three runes! The northern door is open.':'A rescued rune joins your game. Keep exploring.';}
  else s.message=s.collected.length===3?'Follow the starlight to the northern door.':'Collect the glowing runes. Pulse magic to stun the wisps.';
  if(next===EXIT){if(s.collected.length===3){s.solved=true;s.message='The temple is alive. The rescued rune awakens the mirror.';}else s.message='The door needs all three runes.';}
  return s;
}
export function hintCrawl(previous){
  if(previous.solved)return previous;
  const targets=SHRINES.filter(c=>!previous.collected.includes(c));if(!targets.length)targets.push(EXIT);
  const queue=[[previous.pos]],seen=new Set([previous.pos]);
  while(queue.length){const path=queue.shift(),cell=path.at(-1);if(targets.includes(cell)&&path.length>1){const delta=path[1]-previous.pos,direction=Object.keys(directions).find(d=>directions[d]===delta);return {...moveCrawl(previous,direction),message:'A violet spark guides your next step.'};}for(const next of crawlNeighbors(cell)){if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}}}
  return previous;
}
export function stumbleCrawl(previous){return {...previous,pos:previous.collected.at(-1)??ENTRANCE,stumbles:previous.stumbles+1,message:'A wisp nudges you back to your last rune. Your runes are safe. Pulse, then try again.'};}

const mix=(a,b,p)=>a+(b-a)*p;
const smooth=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
function orb(ctx,x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function star(ctx,x,y,r,rotation=0){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.24,-r*.24);ctx.lineTo(r,0);ctx.lineTo(r*.24,r*.24);ctx.lineTo(0,r);ctx.lineTo(-r*.24,r*.24);ctx.lineTo(-r,0);ctx.lineTo(-r*.24,-r*.24);ctx.closePath();ctx.fill();ctx.restore();}

export function mountCrawl(container,initial,{onMove,onPulse,onHit,reduced=false}={}){
  const canvas=container.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return {destroy(){},setState(){}};
  let state=initial,width=container.clientWidth,height=container.clientHeight,frame,alive=true,held=null,lastMove=0,clock=0,previous=initial.pos,moveAt=performance.now(),pulseAt=-10000,protectedUntil=0,facing=0,targetCell=null;
  const start=performance.now(),keys=new Set();
  const resize=()=>{width=container.clientWidth;height=container.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};resize();const observer=new ResizeObserver(resize);observer.observe(container);
  function setState(next,{guided=false,pulse=false}={}){if(next.pos!==state.pos){previous=state.pos;moveAt=performance.now();const d=next.pos-state.pos;facing=d===-7?0:d===1?Math.PI/2:d===7?Math.PI:-Math.PI/2;}if(next.collected.length>state.collected.length)protectedUntil=performance.now()+1300;state=next;if(guided)protectedUntil=performance.now()+900;if(pulse){pulseAt=performance.now();protectedUntil=pulseAt+3000;}if(state.solved)protectedUntil=Infinity;}
  function requestMove(direction){if(!alive||state.solved)return;onMove?.(direction);lastMove=performance.now();}
  const keyDirection={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left'};
  function keydown(e){if(document.querySelector('dialog[open]')||e.target.matches('input,textarea'))return;const direction=keyDirection[e.key];if(direction){e.preventDefault();keys.add(direction);if(!e.repeat)requestMove(direction);}if(e.code==='Space'){e.preventDefault();if(!e.repeat)onPulse?.();}}
  function keyup(e){if(keyDirection[e.key])keys.delete(keyDirection[e.key]);}
  function clearInput(){held=null;keys.clear();targetCell=null;}
  function tapCanvas(e){
    if(state.solved||document.querySelector('dialog[open]'))return;
    e.preventDefault();
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*width/r.width,y=(e.clientY-r.top)*height/r.height;
    const tile=Math.min(width/7.5,height/9.45),ox=(width-tile*7)/2,oy=(height-tile*9)/2;
    for(const [row,column] of [[5,3+Math.sin(clock*1.15)*1.75],[3,3+Math.cos(clock*.95)*1.75]]){
      if(Math.hypot(x-(ox+(column+.5)*tile),y-(oy+(row+.5)*tile))<tile*.38){onPulse?.();return;}
    }
    const col=Math.floor((x-ox)/tile),row=Math.floor((y-oy)/tile),cell=row*7+col;
    if(col<0||col>6||row<0||row>8||!walkable(cell))return;
    held=null;keys.clear();targetCell=cell;lastMove=0;
  }
  canvas.addEventListener('pointerdown',tapCanvas);
  const controls=container.closest('#app').querySelector('.crawl-controls');
  function pointerdown(e){const button=e.target.closest('[data-crawl]');if(!button||state.solved)return;e.preventDefault();held=button.dataset.crawl;button.setPointerCapture(e.pointerId);requestMove(held);}
  function pointerup(){held=null;}
  controls?.addEventListener('pointerdown',pointerdown);controls?.addEventListener('pointerup',pointerup);controls?.addEventListener('pointercancel',pointerup);
  document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);window.addEventListener('blur',clearInput);
  function paint(now){
    if(!alive)return;clock=reduced?0:(now-start)/1000;
    if(!document.querySelector('dialog[open]')){
      let direction=held||[...keys].at(-1);
      if(direction)targetCell=null;
      else if(targetCell!==null){const path=crawlPath(state.pos,targetCell);if(path.length>1){const delta=path[1]-state.pos;direction=Object.keys(directions).find(d=>directions[d]===delta);}else targetCell=null;}
      if(direction&&now-lastMove>185)requestMove(direction);
    }else clearInput();
    const tile=Math.min(width/7.5,height/9.45),ox=(width-tile*7)/2,oy=(height-tile*9)/2;
    const point=cell=>({x:ox+(cell%7+.5)*tile,y:oy+(Math.floor(cell/7)+.5)*tile});
    ctx.fillStyle='#091b29';ctx.fillRect(0,0,width,height);
    // Water, breathing mist, and streaks of moonlight beneath a floating ruin.
    const sky=ctx.createLinearGradient(0,0,width,height);sky.addColorStop(0,'#102935');sky.addColorStop(.5,'#163b46');sky.addColorStop(1,'#07141e');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
    for(let i=0;i<28;i++){const y=(i*23+clock*10)%height,x=(i*53+Math.sin(clock*.5+i)*16)%width;ctx.strokeStyle=i%3?'#77b7c61c':'#b6e9e025';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+35+Math.sin(i)*15,y-3);ctx.stroke();}
    for(let cell=0;cell<63;cell++){
      const p=point(cell),x=p.x-tile*.47,y=p.y-tile*.47;
      if(walkable(cell)){
        ctx.fillStyle='#030c16a0';ctx.fillRect(x+tile*.07,y+tile*.15,tile*.94,tile*.94);
        const stone=ctx.createLinearGradient(x,y,x+tile,y+tile);stone.addColorStop(0,cell%3?'#69767a':'#7b8278');stone.addColorStop(1,'#344652');ctx.fillStyle=stone;ctx.fillRect(x,y,tile*.94,tile*.94);
        ctx.strokeStyle='#b5bc9970';ctx.lineWidth=.7;ctx.strokeRect(x+2,y+2,tile*.94-4,tile*.94-4);
        ctx.strokeStyle='#202e3550';ctx.beginPath();ctx.moveTo(x+tile*.17,y+tile*.25);ctx.lineTo(x+tile*.45,y+tile*.31);ctx.lineTo(x+tile*.56,y+tile*.16);ctx.stroke();
        if(cell%5===0){ctx.fillStyle='#48735b';ctx.beginPath();ctx.ellipse(x+5,y+tile*.8,tile*.16,3,-.5,0,Math.PI*2);ctx.fill();}
      }else if(crawlNeighbors(cell).length&&Math.floor(cell/7)>0){
        ctx.fillStyle='#192b37';ctx.fillRect(x,y+tile*.20,tile*.94,tile*.77);
        ctx.fillStyle='#3d5158';ctx.fillRect(x,y,tile*.94,tile*.25);ctx.strokeStyle='#83917c55';ctx.strokeRect(x,y,tile*.94,tile*.25);
      }
    }
    // Four living braziers. Every flame has its own phase.
    if(targetCell!==null){
      const path=crawlPath(state.pos,targetCell),destination=point(targetCell);ctx.save();ctx.strokeStyle='#f5d699a0';ctx.lineWidth=1.5;ctx.setLineDash([3,7]);ctx.beginPath();for(let i=0;i<path.length;i++){const p=point(path[i]);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(destination.x,destination.y,tile*.32,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe1a1';star(ctx,destination.x,destination.y,tile*.09,clock);ctx.restore();
    }
    for(const cell of [8,12,36,40]){
      const p=point(cell);p.x-=tile*.32;p.y-=tile*.32;orb(ctx,p.x,p.y,tile*.95,'#efb24e38');ctx.fillStyle='#4a392b';ctx.fillRect(p.x-3,p.y,6,8);
      for(let j=0;j<3;j++){const flicker=1+Math.sin(clock*7+cell+j)*.15;ctx.fillStyle=['#bd592b','#f6b442','#ffe7a4'][j];ctx.beginPath();ctx.ellipse(p.x+Math.sin(clock*5+j)*1.3,p.y-4-j*1.5,(4-j)*flicker,(7-j)*flicker,Math.sin(clock*4)*.1,0,Math.PI*2);ctx.fill();}
    }
    // Collectible runes orbit above their stone plinths, then fly to the maker.
    for(const cell of SHRINES){const p=point(cell),found=state.collected.includes(cell);orb(ctx,p.x,p.y,tile*.8,found?'#f0cc6735':'#6ad5ea60');ctx.fillStyle=found?'#a59054':'#bbf2f6';star(ctx,p.x,p.y+(found?0:Math.sin(clock*2+cell)*3),tile*(found?.12:.22),clock*.7);if(!found){ctx.strokeStyle='#7adced90';ctx.beginPath();ctx.ellipse(p.x,p.y+tile*.25,tile*.24,tile*.08,clock*.2,0,Math.PI*2);ctx.stroke();}}
    // Patrolling wisps make the corridor a small timing/combat challenge.
    const stunned=now-pulseAt<3000;
    const wisps=[{row:5,x:3+Math.sin(clock*1.15)*1.75},{row:3,x:3+Math.cos(clock*.95)*1.75}];
    const moving=now-moveAt<160,progress=reduced?1:smooth((now-moveAt)/160),from=point(previous),to=point(state.pos),hero={x:mix(from.x,to.x,progress),y:mix(from.y,to.y,progress)};
    for(let i=0;i<wisps.length;i++){const w=wisps[i],x=ox+(w.x+.5)*tile,y=oy+(w.row+.5)*tile+Math.sin(clock*4+i)*2;orb(ctx,x,y,tile*.65,stunned?'#ca9cf32f':'#ff8f6850');ctx.fillStyle=stunned?'#a990c8':'#ffc391';ctx.beginPath();ctx.ellipse(x,y,tile*.16,tile*.12,Math.sin(clock*3)*.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#652a40';ctx.fillRect(x-4,y-1,2,2);ctx.fillRect(x+2,y-1,2,2);if(!stunned&&!state.solved&&now>protectedUntil&&Math.hypot(hero.x-x,hero.y-y)<tile*.27){protectedUntil=now+1800;onHit?.();}}
    if(now-pulseAt<650){const p=(now-pulseAt)/650;ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle='#e0baff';ctx.lineWidth=3*(1-p)+.5;ctx.beginPath();ctx.arc(hero.x,hero.y,tile*(.3+p*2),0,Math.PI*2);ctx.stroke();ctx.restore();}
    // The maker: a crimson coat, fluttering cape, gold trim and a glowing quill.
    ctx.save();ctx.translate(hero.x,hero.y);const bob=moving&&!reduced?Math.sin(now/48)*1.6:Math.sin(clock*2)*.6;
    ctx.fillStyle='#020b1580';ctx.beginPath();ctx.ellipse(0,tile*.22,tile*.22,tile*.09,0,0,Math.PI*2);ctx.fill();ctx.translate(0,bob);ctx.rotate(facing*.16);
    const scale=tile/44;ctx.scale(scale,scale);const stride=moving?Math.sin(now/45)*3:0;
    ctx.strokeStyle='#282630';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-4,4);ctx.lineTo(-4-stride,12);ctx.moveTo(4,4);ctx.lineTo(4+stride,12);ctx.stroke();
    ctx.fillStyle='#671d35';ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(9,-7);ctx.lineTo(12+Math.sin(clock*4)*2,12);ctx.quadraticCurveTo(0,17,-12,11);ctx.closePath();ctx.fill();ctx.strokeStyle='#dab773';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle='#a33848';ctx.beginPath();ctx.ellipse(0,0,7,9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffe2bb';ctx.beginPath();ctx.arc(0,-10,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#432725';ctx.beginPath();ctx.arc(0,-12,6,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-6,-12,2,7);ctx.fillRect(4,-12,2,6);
    ctx.strokeStyle='#efc877';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(7,1);ctx.lineTo(14,-8);ctx.stroke();ctx.fillStyle='#c4f7ff';star(ctx,14,-9,4,clock);
    if(now<protectedUntil&&!state.solved){ctx.strokeStyle='#bd9ff6a0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();}ctx.restore();
    // The doorway blooms once all three rules have become a playable loop.
    const door=point(EXIT),open=state.collected.length===3;orb(ctx,door.x,door.y,tile*1.5,open?'#e2c67965':'#91c5d32f');ctx.fillStyle='#16222b';ctx.fillRect(door.x-tile*.35,door.y-tile*.4,tile*.7,tile*.85);ctx.strokeStyle=open?'#ffe1a1':'#92a7ae';ctx.lineWidth=2;ctx.strokeRect(door.x-tile*.35,door.y-tile*.4,tile*.7,tile*.85);
    if(open){const g=ctx.createLinearGradient(door.x,door.y-tile*.3,door.x,door.y+tile*.3);g.addColorStop(0,'#fff0bcd0');g.addColorStop(1,'#79e5dc90');ctx.fillStyle=g;ctx.fillRect(door.x-tile*.28,door.y-tile*.33,tile*.56,tile*.7);for(let i=0;i<14;i++){const a=i*2.399+clock*.6,r=tile*(.3+(i%4)*.15);ctx.fillStyle='#fff2bb';star(ctx,door.x+Math.cos(a)*r,door.y+Math.sin(a)*r,tile*.03,clock);}}
    if(state.solved){orb(ctx,door.x,door.y,tile*3,'#ffe9b55f');ctx.fillStyle='#fff4c4';star(ctx,door.x,door.y,tile*.22,clock*.4);}
    for(let i=0;i<32;i++){const x=(i*61.7+Math.sin(clock*.4+i)*13)%width,y=(i*43.3-clock*(3+i%4)+height*10)%height;ctx.globalAlpha=.2+(Math.sin(clock*2+i)+1)*.2;ctx.fillStyle=i%2?'#ffde91':'#8edeea';star(ctx,x,y,i%5===0?2.4:1,clock);}ctx.globalAlpha=1;
    frame=requestAnimationFrame(paint);
  }
  frame=requestAnimationFrame(paint);
  return {setState,destroy(){alive=false;cancelAnimationFrame(frame);observer.disconnect();canvas.removeEventListener('pointerdown',tapCanvas);controls?.removeEventListener('pointerdown',pointerdown);controls?.removeEventListener('pointerup',pointerup);controls?.removeEventListener('pointercancel',pointerup);document.removeEventListener('keydown',keydown);document.removeEventListener('keyup',keyup);window.removeEventListener('blur',clearInput);}};
}
