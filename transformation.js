// Suspense comes before the painted reveal; progress commits only on acceptance.
export function transformationSplash(target,{onStart=()=>{},onReveal=()=>{}}={}){
  return new Promise(resolve=>{
    const layer=document.createElement('section');layer.className='transformation-splash';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','transformation-title');layer.tabIndex=-1;
    layer.innerHTML='<div class="suspense-runes" aria-hidden="true"><i></i><i></i><i></i><span>✦</span></div><div class="suspense-copy"><span class="eyebrow">AN UNSCHEDULED SPELL</span><h2 id="transformation-title">You feel yourself<br>turning into…</h2><p class="suspense-guess" role="status" aria-live="polite">Something is definitely happening.</p><small>Reiveaux checks the patch notes. This is absolutely not in the patch notes.</small></div><button class="primary transformation-confirm" disabled>Consulting the mirror… <span aria-hidden="true">✧</span></button>';
    const background=[...target.children].map(el=>[el,el.inert]);background.forEach(([el])=>el.inert=true);
    target.append(layer);layer.focus({preventScroll:true});onStart();
    const guess=layer.querySelector('.suspense-guess'),button=layer.querySelector('button'),timers=[];
    const change=text=>{guess.textContent=text;guess.classList.remove('guess-arrives');void guess.offsetWidth;guess.classList.add('guess-arrives');};
    timers.push(setTimeout(()=>change('A dragon?'),850));
    timers.push(setTimeout(()=>change('A croissant with extremely strong opinions?'),1700));
    timers.push(setTimeout(()=>{change('Non. The mirror has a better idea.');layer.classList.add('ready');button.disabled=false;button.innerHTML='Look in the mirror <span aria-hidden="true">→</span>';button.focus({preventScroll:true});},2900));
    button.addEventListener('click',()=>{timers.forEach(clearTimeout);onReveal();background.forEach(([el,value])=>el.inert=value);layer.remove();resolve();},{once:true});
  });
}
