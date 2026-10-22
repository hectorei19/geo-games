/* Geomingo: Mingo, the shared header, the streak and the list of games.
   Every page loads it in its <head> (before its own scripts) from ../geo-games/brand/mingo.js, so the saved
   light/dark choice is applied before anything is drawn. Everything lives in window.Geomingo. */
(function(){
'use strict';
const SRC=document.currentScript&&document.currentScript.src||location.href;
const HOME=new URL('../',SRC).href;          // the Geomingo home page (hectorei19.github.io/geo-games/)
const ROOT=new URL('../../',SRC).href;       // where the games live, side by side

/* ---------- light / dark: the choice is kept for every game (gm-theme) ---------- */
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
function applyTheme(){const t=store.get('gm-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme')}
applyTheme();
function currentTheme(){const t=document.documentElement.getAttribute('data-theme');return t||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function toggleTheme(){const next=currentTheme()==='dark'?'light':'dark';store.set('gm-theme',next);applyTheme();
  document.querySelectorAll('[data-gm-theme]').forEach(b=>b.setAttribute('aria-pressed',String(next==='dark')))}
addEventListener('storage',e=>{if(e.key==='gm-theme')applyTheme()});

/* ---------- the games ----------
   id: the id each game already uses for its saves (Countries kept Borderline's), soon: shown as "Coming soon" */
const GAMES=[
  {id:'borderline',name:'Countries',path:'country-grid/',hint:'Fill the grid with countries'},
  {id:'citygrid',name:'Cities',path:'city-grid/',hint:'Fill the grid with cities'},
  {id:'connections',name:'Connections',path:'connections/',hint:'16 countries, 4 hidden groups'},
  {id:'top10',name:'Top 10',path:'top10/',hint:'Name a ranking. 3 lives.'},
  {id:'silhouette',name:'Silhouette',path:'silhouette/',hint:'Name the country from its shape'}];
GAMES.forEach(g=>g.href=ROOT+g.path);
const live=()=>GAMES.filter(g=>!g.soon);

// Spain's calendar day: every daily puzzle changes at midnight, Madrid time
function madridParts(t){const o={};new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(t).forEach(p=>o[p.type]=p.value);return o}
function dayKey(t){const p=madridParts(t==null?Date.now():t);return p.year+'-'+p.month+'-'+p.day}
function msToMidnight(){const p=madridParts(Date.now());return (24*3600-(+p.hour*3600+ +p.minute*60+ +p.second))*1000}
const json=k=>{try{return JSON.parse(store.get(k)||'null')}catch(e){return null}};
const fmt=n=>Number(n||0).toLocaleString('en');

/* today's result of each game, read from the game's own save on this device (the keys never change):
   {done:true, label:'1,240'} once today's daily is over */
function result(id,k){k=k||dayKey();
  if(id==='borderline'||id==='citygrid'){const p=id==='borderline'?'bl':'cc',h=json(p+'-hist')||{},e=h[k];
    if(e&&e.f!==0)return {done:true,label:fmt(e.s)};
    const d=json(p+'-daily');if(d&&d.date===k&&d.S&&d.S.over)return {done:true,label:fmt(d.S.players&&d.S.players[0]?d.S.players[0].score:0)};
    return {done:false}}
  if(id==='connections'){const d=json('cx-daily');if(!(d&&d.date===k&&d.over))return {done:false};
    const s=d.S||{};return {done:true,label:s.won?'Solved':((s.found||[]).length+'/4')}}
  if(id==='top10'){const d=json('t10-daily');if(!(d&&d.date===k&&d.over))return {done:false};
    return {done:true,label:((d.S&&d.S.found||[]).length)+'/10'}}
  if(id==='silhouette'){const d=json('sil-daily');if(!(d&&d.date===k&&d.over))return {done:false};
    const day=(json('sil-hist')||{})[k]||{},v=Object.values(day).filter(x=>typeof x==='number');
    return {done:true,label:v.length?Math.max(...v)+'/9':'Done'}}
  return {done:false}}
const playedToday=id=>result(id).done;
// the next game of the day not played yet, in list order after this one (null when all are done)
function nextGame(cur){const L=live(),i=L.findIndex(g=>g.id===cur);
  for(let s=1;s<=L.length;s++){const g=L[(i+s)%L.length];if(g.id!==cur&&!playedToday(g.id))return g}return null}

/* ---------- streak: days in a row with at least one daily game played (gm-days) ----------
   The first time, it is filled in from the games' own histories on this device, so nobody starts from zero. */
function days(){let d=json('gm-days');
  if(!Array.isArray(d)){const s=new Set();
    ['bl-hist','cc-hist'].forEach(k=>{const h=json(k)||{};Object.keys(h).forEach(x=>{if(h[x]&&h[x].f!==0)s.add(x)})});
    ['cx-hist','t10-hist','sil-hist'].forEach(k=>Object.keys(json(k)||{}).forEach(x=>s.add(x)));
    d=[...s].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort()}
  const k=dayKey();
  if(!d.includes(k)&&GAMES.some(g=>playedToday(g.id)))d.push(k);
  d=d.sort().slice(-400);store.set('gm-days',JSON.stringify(d));return d}
function streak(){const n=k=>Math.round(Date.parse(k+'T12:00Z')/864e5),set=new Set(days().map(n)),t=n(dayKey());
  let x=set.has(t)?t:t-1,c=0;while(set.has(x)){c++;x--}return c}

/* ---------- Mingo, the flamingo explorer: poses hello, think, happy, sad ---------- */
function mingo(pose,w){w=w||64;const h=Math.round(w*260/160);
  let eye='<circle class="m-eye" cx="80" cy="32" r="4"/><circle cx="81.5" cy="30.5" r="1.3" fill="#fff"/>';
  let wing='<path class="m-deep" d="M92 146 C110 126 146 128 162 146 C144 166 112 168 92 146 Z"/>';
  if(pose==='happy'){eye='<path class="m-eyel" d="M76 33 Q80 27 84 33" stroke-width="3" stroke-linecap="round"/>';wing='<path class="m-deep" d="M100 140 C112 100 140 96 160 108 C150 130 124 146 100 140 Z"/>'}
  if(pose==='think')eye='<path class="m-eyel" d="M75 32 L85 32" stroke-width="3" stroke-linecap="round"/>';
  if(pose==='sad')eye='<circle class="m-eye" cx="80" cy="34" r="3.5"/><path class="m-eyel" d="M74 27 L86 30" stroke-width="3" stroke-linecap="round"/>';
  return '<svg class="mingo" viewBox="30 0 160 260" width="'+w+'" height="'+h+'" aria-hidden="true" focusable="false">'+
  '<path class="m-leg" d="M122 176 L136 202 L116 208" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path class="m-leg" d="M108 180 L108 246" stroke-width="6" stroke-linecap="round"/>'+
  '<path class="m-leg" d="M94 248 L124 248" stroke-width="6" stroke-linecap="round"/>'+
  '<path class="m-deep" d="M150 140 L184 128 L172 150 L186 156 L156 166 Z"/>'+
  '<ellipse class="m-body" cx="114" cy="152" rx="50" ry="33"/>'+wing+
  '<path class="m-neck" d="M76 150 C46 130 44 96 66 82 C86 70 92 52 78 40" stroke-width="15" stroke-linecap="round"/>'+
  '<circle class="m-body" cx="76" cy="36" r="17"/>'+
  '<path class="m-beak" d="M61 30 C48 30 40 38 41 50 C44 48 48 44 54 43 C58 42 61 41 64 40 Z"/>'+
  '<path class="m-eye" d="M41 50 C40 44 42 40 46 37 C46 42 46 46 41 50 Z"/>'+eye+
  '<path class="m-cap" d="M62 24 C64 9 90 7 94 24 Z"/><path class="m-brim" d="M48 24 L94 24" stroke-width="5" stroke-linecap="round"/></svg>'}

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
// Mingo with a speech bubble. The bubble pops only when what he says changes (pages redraw often)
const said={};
function hello(pose,title,sub,o){o=o||{};const key=o.key||'main',txt=pose+title,pop=said[key]!==undefined&&said[key]!==txt;said[key]=txt;
  return '<section class="gm-hello" aria-live="polite">'+mingo(pose,o.size||56)+'<div class="gm-bubble'+(pop?' pop':'')+'"><b>'+esc(title)+'</b>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</div></section>'}

/* ---------- the shared header ----------
   header({game:'Countries', coord:'Daily #12', menu:'<button…>'}): "‹ geomingo", streak and theme on top,
   then the game's own bar (its name goes to the game's home screen, id="brand"). Without game: the home page. */
const ICO={back:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  flame:'<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 2 1 3 3 3 3s1-3 0-7z" fill="none" stroke-width="2" stroke-linejoin="round"/></svg>',
  moon:'<svg class="moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  sun:'<svg class="sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'};
const logo='<span class="gm-logo"><span>geo</span>mingo</span>';
function pill(){const n=streak();return n>0?'<span class="gm-pill" role="img" aria-label="'+n+'-day streak" title="Days in a row with a daily game played">'+ICO.flame+'<span aria-hidden="true">'+n+'<span class="gm-pl">-day streak</span></span></span>':''}
const themeBtn=()=>'<button class="gm-icon gm-theme" data-gm-theme aria-pressed="'+(currentTheme()==='dark')+'" aria-label="Dark mode" title="Light or dark">'+ICO.moon+ICO.sun+'</button>';
function header(o){o=o||{};
  if(!o.game)return '<header class="gm-top"><h1 class="gm-logo" style="margin:0"><span>geo</span>mingo</h1><span class="gm-spacer"></span>'+pill()+themeBtn()+'</header>';
  return '<header class="gm-top"><a class="gm-home" href="'+HOME+'" aria-label="All Geomingo games">'+ICO.back+logo+'</a><span class="gm-spacer"></span>'+pill()+themeBtn()+'</header>'+
    '<div class="gm-bar"><h2 class="gm-title" id="brand" role="link" tabindex="0" title="'+esc(o.game)+' home">'+esc(o.game)+(o.coord?'<small>'+esc(o.coord)+'</small>':'')+'</h2><span class="gm-spacer"></span>'+(o.menu||'')+'</div>'}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gm-theme]');if(b){e.preventDefault();toggleTheme()}});

/* ---------- result window: Mingo, the score, share, next game ----------
   resultWindow({pose,title,num,unit,sub,mini,share:fn,next:'connections'|game|null,close:'See the grid'}) */
let lastFocus=null;
function closeWindow(){const w=document.getElementById('gm-window');if(w)w.remove();if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
function resultWindow(o){closeWindow();lastFocus=document.activeElement;
  const nx=o.next===undefined?null:o.next;
  const box=document.createElement('div');box.id='gm-window';box.className='gm-scrim center';
  box.innerHTML='<div class="gm-box" role="dialog" aria-modal="true" aria-labelledby="gm-wt"><div class="gm-result">'+mingo(o.pose||'happy',90)+
    '<h3 id="gm-wt">'+esc(o.title)+'</h3>'+(o.num!=null?'<span class="gm-num">'+esc(o.num)+'</span>':'')+(o.unit?'<span class="gm-note">'+esc(o.unit)+'</span>':'')+(o.mini||'')+(o.sub?'<p class="gm-note" style="max-width:32ch">'+esc(o.sub)+'</p>':'')+'</div>'+
    (o.share?'<button class="gm-big pink" data-gm-act="share">'+esc(o.shareLabel||'Share result')+'</button>':'')+
    (nx?'<a class="gm-big ghost" href="'+esc(nx.href)+'">Next game: '+esc(nx.name)+'</a>':(o.allDone?'<p class="gm-note">You have played all of today\'s games. New ones at midnight, Spain time.</p>':''))+
    '<button class="gm-text" data-gm-act="close">'+esc(o.close||'Close')+'</button></div>';
  document.body.appendChild(box);
  box.addEventListener('click',e=>{const a=e.target.closest('[data-gm-act]');
    if(e.target===box||(a&&a.dataset.gmAct==='close')){closeWindow();if(o.onClose)o.onClose();return}
    if(a&&a.dataset.gmAct==='share'&&o.share)o.share()});
  const first=box.querySelector('[data-gm-act="share"]')||box.querySelector('a,button');if(first)first.focus()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('gm-window')){e.stopPropagation();closeWindow()}},true);
// result window for the next game of the day after this one
const resultNext=cur=>{const g=nextGame(cur);return g};

/* a little grid of squares for the result window (true = got it) */
function mini(list,cols){return '<div class="gm-mini" style="grid-template-columns:repeat('+cols+',20px)" aria-hidden="true">'+list.map(x=>'<i class="'+(x?'ok':'')+'"></i>').join('')+'</div>'}

// "Good morning" by Spain's clock
function greeting(){const h=+madridParts(Date.now()).hour;return h<6?'Up late, explorer?':h<13?'Good morning, explorer!':h<20?'Good afternoon, explorer!':'Good evening, explorer!'}

window.Geomingo={HOME,GAMES,live,game:id=>GAMES.find(g=>g.id===id),dayKey,madridParts,msToMidnight,result,playedToday,nextGame,resultNext,
  days,streak,mingo,hello,header,pill,themeBtn,toggleTheme,currentTheme,resultWindow,closeWindow,mini,greeting,esc,
  share:name=>'Geomingo · '+name};
})();
