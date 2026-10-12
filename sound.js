// Real, locally hosted clips. Unlock media on the first tap for mobile browsers.
export class SoundBank {
  constructor(root,{AudioClass=Audio}={}){
    this.enabled=true;this.unlocked=false;this.active=new Set();this.tracks={};
    for(const name of ['chime','dice','transformation']){
      const clip=new AudioClass(`./assets/audio/${name}.mp3`);
      clip.preload='auto';clip.volume=name==='dice'?.85:.7;
      clip.hidden=true;clip.setAttribute('playsinline','');clip.setAttribute('data-sound-track',name);
      clip.addEventListener('ended',()=>this.active.delete(name));root?.append(clip);this.tracks[name]=clip;
    }
  }
  unlock(){
    if(!this.enabled||this.unlocked)return;
    this.unlocked=true;
    for(const [name,clip] of Object.entries(this.tracks)){
      clip.muted=true;
      Promise.resolve(clip.play()).then(()=>{
        if(!this.active.has(name)){clip.pause();clip.currentTime=0;}
        clip.muted=!this.enabled;
      }).catch(()=>{clip.muted=false;this.unlocked=false;});
    }
  }
  play(name,{volume}={}){
    if(!this.enabled)return Promise.resolve(false);
    const clip=this.tracks[name];if(!clip)return Promise.resolve(false);
    this.active.add(name);clip.muted=false;
    if(volume!==undefined)clip.volume=Math.max(0,Math.min(1,volume));
    clip.currentTime=0;
    return Promise.resolve(clip.play()).then(()=>{clip.muted=!this.enabled;return this.enabled;}).catch(()=>{this.active.delete(name);this.unlocked=false;return false;});
  }
  stop(name){const clip=this.tracks[name];if(clip){clip.pause();clip.currentTime=0;this.active.delete(name);}}
  setEnabled(value){this.enabled=Boolean(value);if(!this.enabled){for(const name of Object.keys(this.tracks))this.stop(name);}else this.unlock();}
}
