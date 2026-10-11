// A small canvas renderer: real 20-faced geometry, ballistic throws, bounces,
// rotating numbered faces, shadows, rune rings, and a persistent final result.
const PHI=(1+Math.sqrt(5))/2;
const raw=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]];
export const vertices=raw.map(v=>{const length=Math.hypot(...v);return v.map(n=>n/length);});
export const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
export function rotatePoint([x,y,z],rx,ry,rz){let a=y*Math.cos(rx)-z*Math.sin(rx),b=y*Math.sin(rx)+z*Math.cos(rx);y=a;z=b;a=x*Math.cos(ry)+z*Math.sin(ry);b=-x*Math.sin(ry)+z*Math.cos(ry);x=a;z=b;return [x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];}
export function projectedFaces(rx,ry,rz,radius=1){const points=vertices.map(v=>rotatePoint(v,rx,ry,rz));return faces.map((indices,id)=>{const vs=indices.map(i=>points[i]),center=vs.reduce((s,v)=>s.map((n,i)=>n+v[i]),[0,0,0]).map(n=>n/3);return {id,center,points:vs.map(([x,y,z])=>[x*radius/(1-z*.17),y*radius/(1-z*.17)]),depth:center[2]};}).sort((a,b)=>a.depth-b.depth);}
export function faceNumbers(result){if(!Number.isInteger(result)||result<1||result>20)throw new Error('Expected a d20 result');const list=Array.from({length:20},(_,i)=>i+1),final=projectedFaces(-.24,.38,.08),front=final.at(-1).id;[list[front],list[result-1]]=[list[result-1],list[front]];return list;}
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>1-Math.pow(1-clamp(v),3);
function drawDie(ctx,x,y,radius,angles,result,landed,alpha=1){
  const mesh=projectedFaces(...angles,radius),numbers=faceNumbers(result),front=projectedFaces(-.24,.38,.08).at(-1).id;
  ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
  for(const face of mesh){if(face.depth<-.06)continue;const [a,b,c]=face.points;const light=clamp((face.depth+1)*.5);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.closePath();
    const fill=ctx.createLinearGradient(-radius,-radius,radius,radius);fill.addColorStop(0,`hsl(${landed?43:39} 75% ${38+light*40}%)`);fill.addColorStop(1,`hsl(31 64% ${18+light*26}%)`);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=landed?'#ffe6a0':'#e8bc6a';ctx.lineWidth=1.35;ctx.stroke();
    if(face.depth>.08){const cx=(a[0]+b[0]+c[0])/3,cy=(a[1]+b[1]+c[1])/3;ctx.save();ctx.translate(cx,cy);let angle=Math.atan2(b[1]-a[1],b[0]-a[0]);if(angle>Math.PI/2)angle-=Math.PI;if(angle< -Math.PI/2)angle+=Math.PI;ctx.rotate(angle*.55);ctx.font=`bold ${Math.max(12,radius*(face.id===front&&landed?.40:.23))}px Georgia`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#14242c';ctx.shadowColor='#ffefb080';ctx.shadowBlur=landed&&face.id===front?8:0;ctx.fillText(String(numbers[face.id]),0,0);ctx.restore();}
  }ctx.restore();
}
export function animateDice(target,roll,{reduced=false,onImpact=()=>{}}={}){
  return new Promise(resolve=>{
    const layer=document.createElement('section');layer.className='roll-scene';layer.setAttribute('aria-label','On-screen dice throw');layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.tabIndex=-1;
    layer.innerHTML='<div class="roll-ritual" aria-hidden="true">✧ &nbsp; ✦ &nbsp; ☾ &nbsp; ✦ &nbsp; ✧</div><p class="roll-invocation">LET FORTUNE SPEAK</p><canvas aria-hidden="true"></canvas><div class="landed-roll" role="status" aria-live="polite"></div><button class="primary dice-confirm" disabled>Keep this roll <span aria-hidden="true">→</span></button>';
    const background=[...target.children].map(el=>[el,el.inert]);background.forEach(([el])=>el.inert=true);
    const restore=()=>background.forEach(([el,value])=>el.inert=value);
    target.append(layer);layer.focus({preventScroll:true});const canvas=layer.querySelector('canvas'),ctx=canvas.getContext('2d'),button=layer.querySelector('button'),status=layer.querySelector('.landed-roll');
    if(!ctx){restore();layer.remove();resolve();return;}
    let width=target.clientWidth,height=target.clientHeight,frame,ended=false,impacted=false;
    const resize=()=>{width=target.clientWidth;height=target.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);if(ended)paint(start+duration);};resize();
    const observer=new ResizeObserver(resize);observer.observe(target);
    const motes=Array.from({length:72},(_,i)=>({angle:i*2.39996,speed:45+(i%7)*17,size:1+i%3}));
    const duration=reduced?1:1950,start=performance.now();
    function paint(now){
      const t=clamp((now-start)/duration),landed=t>=1;ctx.clearRect(0,0,width,height);
      const centerY=height*.38,count=roll.rolls.length,radius=Math.min(width*(count===2?.185:.245),count===2?83:111);
      for(let i=0;i<count;i++){
        const landingX=width*(count===2?(i===0?.29:.71):.5),flight=clamp(t/.46),bounce=clamp((t-.46)/.39),settle=ease((t-.80)/.20);
        const x=t<.46?(-width*.35+landingX*ease(flight)+width*.35*ease(flight)):landingX+Math.sin(bounce*9+i)*radius*.30*(1-bounce);
        const y=t<.46?(-radius*2+(centerY+radius*2)*flight*flight):centerY-Math.abs(Math.sin(bounce*Math.PI*2.5))*radius*.65*(1-bounce);
        const spin=(1-settle),angles=[-.24+(t*17+i)*spin,.38+(t*27+i*2)*spin,.08+(t*12-i)*spin];
        const glow=ctx.createRadialGradient(landingX,centerY+radius*.6,0,landingX,centerY+radius*.6,radius*1.8);glow.addColorStop(0,landed?'#f5ce7045':'#56bfce26');glow.addColorStop(1,'#dfbd7000');ctx.fillStyle=glow;ctx.fillRect(landingX-radius*2,centerY-radius,radius*4,radius*3);
        ctx.save();ctx.translate(landingX,centerY+radius*.92);ctx.scale(1,.28);ctx.beginPath();ctx.arc(0,0,radius*(.6+flight*.45),0,Math.PI*2);ctx.fillStyle='#02081075';ctx.fill();ctx.strokeStyle=`rgba(225,194,112,${.15+flight*.5})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,radius*1.35,now/1200,now/1200+Math.PI*1.7);ctx.stroke();ctx.restore();
        drawDie(ctx,x,y,radius,angles,roll.rolls[i],landed,landed&&count===2&&roll.rolls[i]!==roll.kept?.55:1);
        if(t>.48&&!reduced){const p=clamp((t-.48)/.52);for(const m of motes){const distance=m.speed*p*1.8;ctx.globalAlpha=(1-p)*.8;ctx.fillStyle=m.size===1?'#a3e9ff':'#ffe7a4';ctx.beginPath();ctx.arc(landingX+Math.cos(m.angle)*distance,centerY+Math.sin(m.angle)*distance-radius*.15,m.size*(1-p*.7),0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
      }
      if(t>.46&&!impacted){impacted=true;onImpact();layer.classList.add('impact');}
      if(!landed)frame=requestAnimationFrame(paint);else if(!ended){ended=true;layer.classList.add('landed');const dice=roll.rolls.map((n,i)=>`<span class="${roll.rolls.length>1&&n!==roll.kept?'lost':'kept'}"><b>${n}</b><small>${roll.rolls.length>1?(n===roll.kept?'KEEP':'DISCARD'):'D20'}</small></span>`).join('');status.innerHTML=`<div class="landed-numbers">${dice}</div><strong>${roll.kept} + ${roll.bonus} = ${roll.total}</strong><p>Target ${roll.dc} · ${roll.success?'Success':'A setback — the story continues'}</p>${roll.kept===20?'<em>NATURAL 20 ✦</em>':''}`;button.disabled=false;button.focus({preventScroll:true});}
    }
    button.addEventListener('click',()=>{cancelAnimationFrame(frame);observer.disconnect();layer.classList.add('dismissed');if(reduced){restore();layer.remove();resolve();}else setTimeout(()=>{restore();layer.remove();resolve();},240);},{once:true});
    if(reduced)paint(start+duration);else frame=requestAnimationFrame(paint);
  });
}
