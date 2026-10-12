// Dependency-free 3D D20 renderer and a four-second fantasy tabletop throw.
const PHI=(1+Math.sqrt(5))/2;
const raw=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]];
export const vertices=raw.map(v=>{const length=Math.hypot(...v);return v.map(n=>n/length);});
export const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
export function rotatePoint([x,y,z],rx,ry,rz){let a=y*Math.cos(rx)-z*Math.sin(rx),b=y*Math.sin(rx)+z*Math.cos(rx);y=a;z=b;a=x*Math.cos(ry)+z*Math.sin(ry);b=-x*Math.sin(ry)+z*Math.cos(ry);x=a;z=b;return [x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];}
export function projectedFaces(rx,ry,rz,radius=1){const points=vertices.map(v=>rotatePoint(v,rx,ry,rz));return faces.map((indices,id)=>{const vs=indices.map(i=>points[i]),center=vs.reduce((s,v)=>s.map((n,i)=>n+v[i]),[0,0,0]).map(n=>n/3);return {id,center,points:vs.map(([x,y,z])=>[x*radius/(1-z*.17),y*radius/(1-z*.17)]),depth:center[2]};}).sort((a,b)=>a.depth-b.depth);}
export function faceNumbers(result){if(!Number.isInteger(result)||result<1||result>20)throw new Error('Expected a d20 result');const list=Array.from({length:20},(_,i)=>i+1),front=FRONT;[list[front],list[result-1]]=[list[result-1],list[front]];return list;}
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>1-Math.pow(1-clamp(v),3);
export const THROW_DURATION=4400;
const FINAL=[-.24,.38,.08];
const FRONT=projectedFaces(...FINAL).at(-1).id;
const FACET_COLORS=Array.from({length:32},(_,i)=>`hsl(211 43% ${14+i*.72}%)`);
const glyphCache=new Map();
function glyph(value,dark=false){const key=String(value)+dark;if(glyphCache.has(key))return glyphCache.get(key);const c=document.createElement('canvas');c.width=80;c.height=88;const g=c.getContext('2d');g.font='bold 44px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillStyle=dark?'#18222c':'#ffe8ae';g.fillText(String(value),40,40);glyphCache.set(key,c);return c;}
const IMPACTS=[.40,.54,.65,.92];
const lerp=(a,b,t)=>a+(b-a)*t;

// Position, altitude, scale and three-axis orientation share one timeline.
// The last frame is stable and always agrees with faceNumbers(result).
export function throwPose(progress,index=0,count=1){
  const t=clamp(progress),landing=count===2?(index===0?.28:.72):.5;
  const direction=index===1?-1:1;
  let x,y,scale;
  if(t<.16){
    const p=t/.16;x=landing-direction*.23;y=-.55-Math.sin(p*Math.PI)*.18;scale=lerp(.45,.78,ease(p));
  }else if(t<.40){
    const p=(t-.16)/.24;x=landing+direction*lerp(-.23,.10,p);y=-.55*(1-p)-1.25*Math.sin(p*Math.PI);scale=lerp(.78,1,p);
  }else if(t<.54){
    const p=(t-.40)/.14;x=landing+direction*lerp(.10,.15,p);y=-.46*Math.sin(p*Math.PI);scale=1;
  }else if(t<.65){
    const p=(t-.54)/.11;x=landing+direction*lerp(.15,.075,p);y=-.23*Math.sin(p*Math.PI);scale=1;
  }else{
    const p=clamp((t-.65)/.35);x=landing+direction*.075*(1-ease(p));y=0;scale=1;
  }
  if(count===2)x=landing+(x-landing)*.25;
  const remaining=Math.pow(1-t,3),wobble=t>.82?Math.sin((t-.82)*80)*Math.pow((1-t)/.18,2)*.14:0;
  const angles=FINAL.map((angle,axis)=>angle+direction*Math.PI*2*([3.8,2.7,2.1][axis]+index*.35)*remaining+(axis===2?wobble:0));
  return {x,y,scale,angles,phase:t<.16?'summon':t<.4?'flight':t<.65?'bounce':t<.92?'roll':t<1?'settle':'landed'};
}

function polygon(ctx,points){ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();}
function drawDie(ctx,x,y,radius,angles,numbers,landed,alpha=1){
  const mesh=projectedFaces(...angles,radius),front=FRONT;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
  ctx.shadowBlur=0;
  for(const face of mesh){
    if(face.depth<-.03)continue;
    const [a,b,c]=face.points,light=clamp((face.depth+1)*.5),highlight=landed&&face.id===front;
    polygon(ctx,face.points);
    ctx.fillStyle=highlight?'#d7b16a':FACET_COLORS[Math.min(31,Math.floor(light*31))];ctx.fill();
    ctx.strokeStyle=highlight?'#fff1bc':'#d3b46c';ctx.lineWidth=Math.max(1,radius*.015);ctx.stroke();
    const cx=(a[0]+b[0]+c[0])/3,cy=(a[1]+b[1]+c[1])/3;
    polygon(ctx,face.points.map(p=>[lerp(cx,p[0],.80),lerp(cy,p[1],.80)]));
    ctx.strokeStyle=highlight?'#67482180':'#f6d38d45';ctx.lineWidth=.6;ctx.stroke();
    if(face.depth>.10){
      ctx.save();ctx.translate(cx,cy);
      let angle=Math.atan2(b[1]-a[1],b[0]-a[0]);if(angle>Math.PI/2)angle-=Math.PI;if(angle< -Math.PI/2)angle+=Math.PI;
      ctx.rotate(angle*.55);const fontSize=Math.max(10,radius*(highlight?.39:.22)),factor=fontSize/44;ctx.drawImage(glyph(numbers[face.id],highlight),-40*factor,-40*factor,80*factor,88*factor);
      if(face.depth>.3){ctx.fillStyle=highlight?'#735225':'#ccb47b';ctx.beginPath();ctx.arc(0,radius*.16,1.25,0,Math.PI*2);ctx.fill();}
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawSigil(ctx,x,y,radius,clock,alpha=1){
  ctx.save();ctx.translate(x,y);ctx.scale(1,.37);ctx.globalAlpha=alpha;
  const glow=ctx.createRadialGradient(0,0,radius*.2,0,0,radius*1.55);
  glow.addColorStop(0,'#73d9ec35');glow.addColorStop(.65,'#5ed2e315');glow.addColorStop(1,'#58cce000');
  ctx.fillStyle=glow;ctx.fillRect(-radius*1.6,-radius*1.6,radius*3.2,radius*3.2);
  for(let ring=0;ring<3;ring++){
    ctx.save();ctx.rotate(clock*(ring%2?-.15:.1));ctx.strokeStyle=ring===1?'#80cbd48a':'#e4c58580';ctx.lineWidth=ring===1?2:1;
    ctx.setLineDash(ring===1?[4,13]:[]);ctx.beginPath();ctx.arc(0,0,radius*(.9+ring*.23),0,Math.PI*2);ctx.stroke();
    if(ring===0){for(let i=0;i<6;i++){const a=i*Math.PI/3,b=a+Math.PI*2/3;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.88,Math.sin(a)*radius*.88);ctx.lineTo(Math.cos(b)*radius*.88,Math.sin(b)*radius*.88);ctx.stroke();}}
    if(ring===2){ctx.fillStyle='#efd18f';ctx.font=`${radius*.13}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';const runes=['✦','ᚠ','ᚱ','ᚷ','ᛟ','ᚹ','☾','ᛞ','ᚨ','ᛉ','ᛏ','ᛒ'];for(let i=0;i<12;i++){ctx.save();ctx.rotate(i*Math.PI/6);ctx.translate(0,-radius*1.24);ctx.fillText(runes[i],0,0);ctx.restore();}}
    ctx.restore();
  }
  ctx.restore();
}

let atmosphereCache;
function drawAtmosphere(ctx,w,h,clock,motion){
  if(!atmosphereCache||atmosphereCache.width!==w||atmosphereCache.height!==h){
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  const center=h*.40;
  const glow=g.createRadialGradient(w*.5,center,15,w*.5,center,w*.7);
  glow.addColorStop(0,'#254258');glow.addColorStop(.55,'#102432');glow.addColorStop(1,'#071019');
  g.fillStyle=glow;g.fillRect(0,0,w,h);
  g.save();g.strokeStyle='#bb9b5435';g.lineWidth=1;
  g.strokeRect(14,17,w-28,h-34);
  for(const [x,y,sx,sy] of [[14,17,1,1],[w-14,17,-1,1],[14,h-17,1,-1],[w-14,h-17,-1,-1]]){
    g.save();g.translate(x,y);g.scale(sx,sy);g.beginPath();g.moveTo(0,42);g.lineTo(0,10);g.quadraticCurveTo(0,0,10,0);g.lineTo(42,0);g.stroke();g.beginPath();g.moveTo(6,25);g.lineTo(14,14);g.lineTo(25,6);g.stroke();g.fillStyle='#e2bd6b';g.fillRect(9,9,3,3);g.restore();
  }
    g.restore();atmosphereCache=c;
  }
  ctx.drawImage(atmosphereCache,0,0,w,h);ctx.save();
  for(let i=0;i<45;i++){
    const x=(i*97.13)%w,y=(i*53.71+clock*(motion?5+i%4:0))%(h*.7),alpha=.2+(Math.sin(clock*.7+i)+1)*.16;
    ctx.globalAlpha=alpha;ctx.fillStyle=i%3?'#e3c889':'#98d7e3';ctx.beginPath();ctx.arc(x,y,i%4===0?1.4:.7,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

export function animateDice(target,roll){
  return new Promise(resolve=>{
    const layer=document.createElement('section');layer.className='roll-scene';layer.setAttribute('aria-label','On-screen dice throw');layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.tabIndex=-1;
    layer.innerHTML='<canvas aria-hidden="true"></canvas><div class="roll-heading"><span class="ritual-eyebrow">REIVEAUX: MÉTAMORPHOSE</span><p class="roll-invocation">LET FORTUNE SPEAK</p><span class="ritual-subtitle">A twenty-sided fate, cast in starlight.</span></div><div class="roll-phase" aria-hidden="true">Summoning the D20…</div><div class="landed-roll" role="status" aria-live="polite"></div><div class="dice-controls"><button class="small-button dice-replay" disabled>Replay the throw ↺</button><button class="primary dice-confirm" disabled>Keep this roll <span aria-hidden="true">→</span></button></div>';
    const background=[...target.children].map(el=>[el,el.inert]);background.forEach(([el])=>el.inert=true);
    const restore=()=>{background.forEach(([el,value])=>el.inert=value);target.classList.remove('dice-active');};
    target.classList.add('dice-active');target.append(layer);layer.focus({preventScroll:true});
    const canvas=layer.querySelector('canvas'),ctx=canvas.getContext('2d'),button=layer.querySelector('.dice-confirm'),replay=layer.querySelector('.dice-replay'),status=layer.querySelector('.landed-roll'),phaseLabel=layer.querySelector('.roll-phase');
    if(!ctx){restore();layer.remove();resolve();return;}
    const count=roll.rolls.length,numbers=roll.rolls.map(faceNumbers);
    let width=target.clientWidth,height=target.clientHeight,frame,ended=false,start=0,lastPhase='',frameCount=0,paintTotal=0,frameStart=0;
    const resize=()=>{width=target.clientWidth;height=target.clientHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(ended)paint(start+THROW_DURATION);};resize();
    const observer=new ResizeObserver(resize);observer.observe(target);
    const keptIndex=roll.rolls.indexOf(roll.kept);
    const dice=roll.rolls.map((n,i)=>`<span class="${i===keptIndex?'kept':'lost'}"><b>${n}</b><small>${count>1?(i===keptIndex?'KEEP':'DISCARD'):'D20'}</small></span>`).join('');
    const resultMarkup=`<div class="landed-numbers">${dice}</div><strong>${roll.kept} + ${roll.bonus} = ${roll.total}</strong><p>Target ${roll.dc} · ${roll.success?'Success':'A setback — the story continues'}</p>${roll.kept===20?'<em>NATURAL 20 ✦</em>':''}`;

    function paint(now){
      const paintStart=performance.now();if(!frameCount)frameStart=now;frameCount++;
      const t=clamp((now-start)/THROW_DURATION),landed=t>=1,clock=(now-start)/1000;
      const centerY=height*(height<=600?.37:.40),radius=Math.min(width*(count===2?.18:.25),height*.17,count===2?85:118),spread=1;
      drawAtmosphere(ctx,width,height,clock,true);
      drawSigil(ctx,width*.5,centerY+radius*.9,width*.37,clock,landed?.75:.95);
      for(let i=0;i<count;i++){
        const pose=throwPose(t,i,count),x=(pose.x-.5)*width*spread+width*.5,y=centerY+pose.y*radius;
        const landingX=width*(count===2?(i===0?.28:.72):.5);
        // Summoning light and a ribbon follow the airborne, rotating solid.
        if(t<.40){
          ctx.save();ctx.globalAlpha=.6*(1-clamp((t-.22)/.18));
          const aura=ctx.createRadialGradient(x,y,0,x,y,radius*1.75);aura.addColorStop(0,'#abe9ff75');aura.addColorStop(.4,'#56bcdd30');aura.addColorStop(1,'#5acbe000');
          ctx.fillStyle=aura;ctx.fillRect(x-radius*2,y-radius*2,radius*4,radius*4);ctx.restore();
        }
        if(t>.16&&t<.9){
          for(let j=12;j>0;j--){const old=throwPose(Math.max(.16,t-j*.007),i,count);ctx.globalAlpha=(1-j/13)*.25*(1-t);ctx.fillStyle=j%3?'#b6edff':'#ffdf92';ctx.beginPath();ctx.arc((old.x-.5)*width*spread+width*.5,centerY+old.y*radius,Math.max(1,radius*.07*(1-j/13)),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
        }
        ctx.save();ctx.translate(x,centerY+radius*.87);ctx.scale(1,.21);ctx.globalAlpha=.65/(1+Math.abs(pose.y));
        const shadow=ctx.createRadialGradient(0,0,0,0,0,radius*1.1);shadow.addColorStop(0,'#000c');shadow.addColorStop(1,'#0000');ctx.fillStyle=shadow;ctx.fillRect(-radius*1.15,-radius*1.15,radius*2.3,radius*2.3);ctx.restore();
        // Each real contact gets a shockwave and a shower of gold/ice sparks.
        for(const impact of IMPACTS){
          const p=(t-impact)/.18;if(p<0||p>1)continue;
          const at=throwPose(impact,i,count),ix=(at.x-.5)*width*spread+width*.5,iy=centerY+radius*.85;
          ctx.save();ctx.translate(ix,iy);ctx.scale(1,.4);ctx.globalAlpha=(1-p)*.7;ctx.strokeStyle=impact===.92?'#fff0aa':'#98e7f7';ctx.lineWidth=2*(1-p)+.5;ctx.beginPath();ctx.arc(0,0,radius*(.5+p*1.7),0,Math.PI*2);ctx.stroke();ctx.restore();
          for(let j=0;j<24;j++){const a=j*2.39996,d=(18+j%5*10)*p*2.4;ctx.globalAlpha=(1-p)*.8;ctx.fillStyle=j%3?'#ffd98b':'#a4eeff';ctx.beginPath();ctx.arc(ix+Math.cos(a)*d,iy+Math.sin(a)*d*.5-p*35,1+j%3,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
        }
        drawDie(ctx,x,y,radius*pose.scale,pose.angles,numbers[i],landed,landed&&i!==keptIndex?.5:1);
        if(landed){
          ctx.save();ctx.strokeStyle=i===keptIndex?'#ffe4a8':'#a0b2be55';ctx.lineWidth=1;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(landingX-radius*.4,centerY+radius*1.25);ctx.lineTo(landingX+radius*.4,centerY+radius*1.25);ctx.stroke();ctx.restore();
        }
      }
      const phase=throwPose(t).phase;
      if(phase!==lastPhase){lastPhase=phase;layer.dataset.phase=phase;phaseLabel.textContent={summon:'Summoning the D20…',flight:'Cast into the unknown',bounce:'Stone. Starlight. A little chaos.',roll:'The fates are still turning…',settle:'Fortune takes its breath…',landed:'FATE HAS SPOKEN'}[phase];}
      paintTotal+=performance.now()-paintStart;
      if(!landed)frame=requestAnimationFrame(paint);
      else if(!ended){ended=true;layer.dataset.fps=String(Math.round((frameCount-1)*1000/Math.max(1,now-frameStart)));layer.dataset.paintMs=(paintTotal/frameCount).toFixed(2);layer.classList.add('landed');status.innerHTML=resultMarkup;button.disabled=false;replay.disabled=false;replay.textContent='Replay the throw ↺';button.focus({preventScroll:true});}
    }
    function launch(){cancelAnimationFrame(frame);ended=false;frameCount=0;paintTotal=0;lastPhase='';layer.classList.remove('landed');status.textContent='';button.disabled=true;replay.disabled=true;layer.focus({preventScroll:true});start=performance.now();paint(start);}
    replay.addEventListener('click',()=>launch());
    button.addEventListener('click',()=>{cancelAnimationFrame(frame);observer.disconnect();layer.classList.add('dismissed');setTimeout(()=>{restore();layer.remove();resolve();},240);},{once:true});
    launch();
  });
}
