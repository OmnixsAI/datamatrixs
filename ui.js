/* NEON desk. Real figures only, except ?preview=1 which is labeled sample data. */
const $=(q,el=document)=>el.querySelector(q);
const $$=(q,el=document)=>[...el.querySelectorAll(q)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f2=(x,d=2)=>Number(x).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=(x,d=2)=>(x>=0?'+':'')+(x*100).toFixed(d)+'%';
const cl=x=>x>=0?'up':'dn';
const fv=n=>{n=Math.abs(n);return n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':String(Math.round(n))};
const hm=d=>d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
const pill=(t,k)=>`<span class="pill ${k}">${t}</span>`;
const KIND={BULLISH:'p-up',BEARISH:'p-dn',NEUTRAL:'p-nt',CAUTION:'p-wn'};
const bias=b=>pill(b,KIND[b]||'p-nt');
const note=t=>`<p class="note">${t}</p>`;
const SEL=['SPY','QQQ','NVDA','AAPL','MSFT','TSLA','AMZN','META','GOOGL','BTC','ETH'];
const TFS=[['1H','1H'],['4H','4H'],['1D','1D'],['1W','1W'],['1M','1M']];
const ICO={
  grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  web:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2 2.5 2 13.5 0 16M12 4c-2 2.5-2 13.5 0 16"/>',
  agents:'<circle cx="8" cy="9" r="2.4"/><circle cx="16" cy="9" r="2.4"/><path d="M4 18c.6-2.4 2.2-3.6 4-3.6s3.4 1.2 4 3.6M12 18c.6-2.4 2.2-3.6 4-3.6s3.4 1.2 4 3.6"/>',
  opt:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/>',
  scan:'<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  sig:'<path d="M4 16l4-5 3 3 5-7 4 4"/>',
  cal:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  fed:'<path d="M4 18V9l8-5 8 5v9"/><path d="M9 18v-5h6v5"/>',
  strat:'<path d="M4 18V6M4 18h16"/><path d="M7 14l3-4 3 2 4-6"/>',
  risk:'<path d="M12 3l8 4v6c0 5-3.5 7.5-8 8-4.5-.5-8-3-8-8V7z"/>',
  exec:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  book:'<path d="M6 4h11a2 2 0 012 2v14H8a2 2 0 01-2-2z"/>',
  perf:'<path d="M4 18h16M7 15v-3M12 15V7M17 15v-5"/>',
  bell:'<path d="M6 16V10a6 6 0 1112 0v6H6z"/><path d="M10 18a2 2 0 004 0"/>',
  lab:'<path d="M9 3v6L5 18a3 3 0 002.6 4h8.8A3 3 0 0019 18l-4-9V3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'
};
const NAV=[
  ['INTELLIGENCE',[['home','Dashboard','grid'],['web','Market Web','web'],['agents','AI Agents','agents'],['options','Options','opt'],['scanner','Scanner','scan'],['signals','Signals','sig']]],
  ['MACRO',[['calendar','Econ Calendar','cal'],['fed','Fed News','fed']]],
  ['RESEARCH',[['strategies','Strategies','strat'],['lab','Research Lab','lab'],['performance','Performance','perf']]],
  ['RISK & TRADE',[['risk','Risk','risk'],['execute','Execute','exec'],['journal','Journal','book'],['automation','Automation','bell']]],
  ['SYSTEM',[['settings','Settings','gear']]]
];
const VIEWS={};
const LAT={market:null,news:null,options:null};
const S={view:'home',sel:'QQQ',tf:'1D',gtf:'1D',preview:false,calF:'all',calK:'all',fedId:'monetary',
  sf:'all',ss:'score',sg:'all',cmpA:'NVDA',cmpB:'QQQ',cmpTf:'1D',journal:[],
  book:null,strats:[],sid:null,msg:'',del:null,
  ticket:{symbol:'QQQ',side:'buy',qty:1,limit:'',phrase:''},
  kd:{ak:'',as:''},touching:false,scrollUntil:0};

function loadUI(){
  try{
    const j=JSON.parse(localStorage.getItem('omnixs.ui.v2')||'{}');
    if(j.sel&&BY[j.sel])S.sel=j.sel;
    if(Array.isArray(j.journal))S.journal=j.journal;
    if(j.who)CFG.who=j.who;
  }catch(e){}
  try{S.book=JSON.parse(localStorage.getItem('omnixs.book.v1')||'null')}catch(e){}
  if(!S.book||typeof S.book.cash!=='number')S.book=NeonEngines.newBook(100000);
  S.book.limits=Object.assign(NeonEngines.newBook().limits,S.book.limits||{});
  try{S.strats=JSON.parse(localStorage.getItem('omnixs.strat.v1')||'[]')}catch(e){S.strats=[]}
  if(!Array.isArray(S.strats))S.strats=[];
}
function saveBook(){try{localStorage.setItem('omnixs.book.v1',JSON.stringify(S.book))}catch(e){}}
function saveStrats(){try{localStorage.setItem('omnixs.strat.v1',JSON.stringify(S.strats))}catch(e){}}
function saveUI(){try{localStorage.setItem('omnixs.ui.v2',JSON.stringify({sel:S.sel,journal:S.journal,who:CFG.who||''}))}catch(e){}}

function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.className='on';clearTimeout(toast.h);toast.h=setTimeout(()=>{t.className=''},2200)}
function chips(items,cur,act){return `<div style="display:flex;gap:6px;flex-wrap:wrap">${items.map(([v,l])=>`<button class="chip" aria-pressed="${String(v)===String(cur)}" data-act="${act}" data-v="${esc(v)}">${esc(l==null?v:l)}</button>`).join('')}</div>`}
function symChips(list,act,cur){return chips(list.map(s=>[s,s]),cur,act)}
function nbar(l,v,cls=''){return `<div class="nb"><span>${l}</span><div class="bar ${cls}"><i style="width:${Math.max(0,Math.min(100,v)).toFixed(0)}%"></i></div><b>${Math.round(v)}</b></div>`}

function cv(){const g=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();return{up:g('--up')||'#2ee59a',dn:g('--dn')||'#ff4d6d',cy:g('--cyan')||'#3ad7ff',dim:g('--dim')||'#8ea6cc',vio:g('--vio')||'#b07cff',wn:g('--warn')||'#ffc14d'}}
function setup(c){const dpr=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;if(!w||!h)return null;if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);return{x,w,h}}
function lineChart(el,series,o={}){
  if(!el)return;const k=setup(el);if(!k)return;const{x,w,h}=k,C=cv();
  const pl=8,pr=o.noY?8:46,pt=8,pb=8,iw=w-pl-pr,ih=h-pt-pb;
  let mn=1e18,mx=-1e18;series.forEach(s=>s.a.forEach(v=>{if(v<mn)mn=v;if(v>mx)mx=v}));
  if(!isFinite(mn))return;const pad=(mx-mn||1)*.08;mn-=pad;mx+=pad;
  const X=(i,n)=>pl+iw*i/Math.max(1,n-1),Y=v=>pt+ih*(1-(v-mn)/(mx-mn));
  x.font='10px IBM Plex Mono,monospace';
  for(let g=0;g<4;g++){const v=mn+(mx-mn)*g/3,yy=Y(v);x.strokeStyle='rgba(60,120,180,.25)';x.beginPath();x.moveTo(pl,yy);x.lineTo(pl+iw,yy);x.stroke();if(!o.noY){x.fillStyle=C.dim;x.fillText(o.fmt?o.fmt(v):f2(v,o.d==null?1:o.d),pl+iw+4,yy)}}
  series.forEach(s=>{const n=s.a.length;x.beginPath();s.a.forEach((v,i)=>i?x.lineTo(X(i,n),Y(v)):x.moveTo(X(i,n),Y(v)));x.strokeStyle=s.col;x.lineWidth=s.w||1.8;x.stroke();
    if(s.fill){x.lineTo(X(n-1,n),pt+ih);x.lineTo(X(0,n),pt+ih);x.closePath();const gr=x.createLinearGradient(0,pt,0,pt+ih);gr.addColorStop(0,s.col+'55');gr.addColorStop(1,s.col+'00');x.fillStyle=gr;x.fill()}});
}

const GNODES=[
  ['QQQ'],['SPY'],['NVDA'],['AAPL'],['MSFT'],['TSLA'],['AMZN'],['META'],['GOOGL'],['VIXY'],
  ['BTC'],['ETH'],['XLK'],['XLF'],['XLV'],['XLY'],['XLE'],['XLI']
];
// Fibonacci lattice: every ticker gets an evenly spaced, stable home on the sphere.
const GPOS=(()=>{const n=GNODES.length,ga=Math.PI*(3-Math.sqrt(5)),P={};GNODES.forEach(([s],i)=>{const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*ga;P[s]=[Math.cos(a)*r,y*.92,Math.sin(a)*r]});return P})();
const GDUST=(()=>{let n=11;const rnd=()=>{n=n*16807%2147483647;return (n-1)/2147483646};return Array.from({length:520},()=>{const u=rnd()*2-1,a=rnd()*Math.PI*2,r=Math.sqrt(1-u*u),k=rnd()<.7?1:1.12+rnd()*.5;return[Math.cos(a)*r*k,u*k,Math.sin(a)*r*k,rnd()]})})();
const GLOGO=(()=>{if(typeof Image==='undefined')return null;const i=new Image();i.src='logo-320.png';return i})();
const GSPIN={off:0,drag:null,moved:false,M:null,key:''};
function corrColor(r){if(r>=.8)return'#3dff9a';if(r>=.5)return'#2ee6ff';if(r>=.2)return'#3d7cff';if(r<=-.5)return'#ff2d8a';if(r<=-.2)return'#ff7ad1';return'rgba(80,120,180,.15)'}
function corrTf(syms,tf){
  const live=syms.filter(ready);if(live.length<2)return{};
  if(tf==='1W'||tf==='1M'){
    const n=tf==='1W'?8:22,R={};
    live.forEach(s=>{const a=(D[s]||[]).slice(-n);R[s]=[];for(let i=1;i<a.length;i++)if(a[i-1]>0)R[s].push(Math.log(a[i]/a[i-1]))});
    const M={};live.forEach(a=>{M[a]={};live.forEach(b=>{M[a][b]=a===b?1:corr(R[a]||[],R[b]||[])})});return M}
  return corrMatrix(live,tf==='1H'?'1H':tf==='4H'?'4H':'1D')}
function sphereCorr(syms){const key=S.gtf+'|'+syms.join(',')+'|'+Math.floor(Date.now()/5000);if(GSPIN.key!==key){GSPIN.key=key;GSPIN.M=corrTf(syms,S.gtf)}return GSPIN.M}
function spinAngle(){const still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;return (still?0:Date.now()/1000*.16)+GSPIN.off}
function drawIntel(el){
  const k=setup(el);if(!k)return;const{x,w,h}=k,C=cv();
  const cx=w*.5,cy=h*.5,R=Math.min(w*.42,h*.38),rot=spinAngle(),tilt=-.32,ct=Math.cos(tilt),st=Math.sin(tilt),cr=Math.cos(rot),sr=Math.sin(rot),F=3.2;
  const pj=([px,py,pz])=>{const x1=px*cr+pz*sr,z1=-px*sr+pz*cr,y2=py*ct-z1*st,z2=py*st+z1*ct,s=F/(F-z2);return[cx+x1*R*s,cy-y2*R*s,z2,s]};
  const halo=x.createRadialGradient(cx,cy,R*.2,cx,cy,R*1.5);halo.addColorStop(0,'rgba(40,110,255,.22)');halo.addColorStop(.7,'rgba(30,60,200,.08)');halo.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=halo;x.fillRect(0,0,w,h);
  const globe=x.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R*1.05);globe.addColorStop(0,'rgba(60,130,255,.20)');globe.addColorStop(1,'rgba(6,10,40,.55)');
  x.beginPath();x.arc(cx,cy,R*1.02,0,7);x.fillStyle=globe;x.fill();x.strokeStyle='rgba(90,160,255,.45)';x.lineWidth=1.2;x.shadowColor='#3d7cff';x.shadowBlur=14;x.stroke();x.shadowBlur=0;
  {const tr=Math.max(-1,Math.min(1,mctx().us||0)),col=tr>.15?'46,245,154':tr<-.15?'255,77,109':'120,215,255',sp=1.4+Math.abs(tr)*2.2,pu=.5+.5*Math.sin(Date.now()/1000*sp),L=R*(.16+.06*pu);
    document.documentElement.style.setProperty('--trend',col);
    const sg=x.createRadialGradient(cx,cy,0,cx,cy,L*2.6);sg.addColorStop(0,`rgba(255,255,255,${.85})`);sg.addColorStop(.18,`rgba(${col},.75)`);sg.addColorStop(1,`rgba(${col},0)`);x.fillStyle=sg;x.beginPath();x.arc(cx,cy,L*2.6,0,7);x.fill();
    x.save();x.translate(cx,cy);x.rotate(Date.now()/4000);x.fillStyle=`rgba(${col},${.55+.4*pu})`;x.beginPath();for(let i=0;i<8;i++){const r=i%2?L*.28:L*(1.2+.5*pu),a=i*Math.PI/4;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.restore()}
  // Latitude and longitude grid, faded on the far side.
  const seg=(pts)=>{for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],z=(a[2]+b[2])/2;x.strokeStyle=`rgba(90,150,255,${(.05+.16*(z+1)/2).toFixed(3)})`;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke()}};
  x.lineWidth=1;
  for(let m=0;m<12;m++){const lo=m*Math.PI/6,pts=[];for(let i=0;i<=24;i++){const la=-Math.PI/2+i*Math.PI/24;pts.push(pj([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]))}seg(pts)}
  for(let l=1;l<6;l++){const la=-Math.PI/2+l*Math.PI/6,pts=[];for(let i=0;i<=36;i++){const lo=i*Math.PI/18;pts.push(pj([Math.cos(la)*Math.cos(lo),Math.sin(la),Math.cos(la)*Math.sin(lo)]))}seg(pts)}
  GDUST.forEach(d=>{const p=pj(d),a=(.12+.5*(p[2]+1)/2)*(.5+.5*Math.sin(Date.now()/700+d[3]*40));x.fillStyle=d[3]<.25?`rgba(255,170,90,${a.toFixed(3)})`:d[3]<.5?`rgba(120,230,255,${a.toFixed(3)})`:`rgba(180,215,255,${a.toFixed(3)})`;x.fillRect(p[0],p[1],1.4*p[3],1.4*p[3])});
  const nodes=GNODES.filter(([s])=>ready(s)),syms=nodes.map(n=>n[0]),M=sphereCorr(syms);
  const P={};syms.forEach(s=>{P[s]=pj(GPOS[s])});
  // Edges arc just outside the shell so the web wraps the globe.
  for(let i=0;i<syms.length;i++)for(let j=i+1;j<syms.length;j++){
    const a=syms[i],b=syms[j],r=M[a]&&M[a][b];if(r==null||Math.abs(r)<.2)continue;
    const A=GPOS[a],B=GPOS[b],m=[(A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2],ml=Math.hypot(...m)||1,q=pj(m.map(v=>v/ml*1.18)),pa=P[a],pb=P[b],z=(pa[2]+pb[2]+q[2])/3;
    x.beginPath();x.moveTo(pa[0],pa[1]);x.quadraticCurveTo(q[0],q[1],pb[0],pb[1]);
    x.strokeStyle=corrColor(r);x.globalAlpha=Math.min(1,Math.abs(r))*(.25+.75*(z+1)/2);x.lineWidth=Math.abs(r)>.7?1.8:1;x.stroke();x.globalAlpha=1}
  const cols={QQQ:'#3ad7ff',SPY:'#2ef59a',NVDA:'#2ef59a',AAPL:'#c06bff',MSFT:'#3d9bff',TSLA:'#ff3d8a',AMZN:'#2ef5c8',META:'#3ad7ff',GOOGL:'#c06bff',VIXY:'#5f8bff',BTC:'#ff9a2e',ETH:'#ff9a2e'};
  x.textAlign='center';x.textBaseline='middle';el._pts={};
  syms.slice().sort((a,b)=>P[a][2]-P[b][2]).forEach(s=>{
    const[px,py,pz,sc]=P[s],col=cols[s]||C.cy,front=(pz+1)/2,c=chgOf(s),sector=BY[s]&&BY[s].t==='sector',lab=BY[s]&&BY[s].lab?BY[s].lab:s;
    x.globalAlpha=.3+.7*front;
    if(sector){
      // Sector ETFs render as amber tags, like map labels on the globe.
      x.font=`700 ${Math.round(11.5*sc)}px Rajdhani,Outfit,sans-serif`;const tw=x.measureText(lab).width+16*sc,th=19*sc;
      x.shadowColor='#f59e0b';x.shadowBlur=6+6*front;x.fillStyle='rgba(20,12,2,.85)';x.strokeStyle=s===S.sel?'#fff':'#f5a524';x.lineWidth=s===S.sel?2:1.2;
      x.beginPath();x.roundRect?x.roundRect(px-tw/2,py-th/2,tw,th,4*sc):x.rect(px-tw/2,py-th/2,tw,th);x.fill();x.stroke();x.shadowBlur=0;
      x.fillStyle='#ffe2a8';x.fillText(lab,px,py+.5);
      x.globalAlpha=1;if(pz>-.35)el._pts[s]=[px,py];return}
    const rad=(s===S.sel?30:s==='QQQ'?29:23)*sc;
    const glow=x.createRadialGradient(px,py,rad*.6,px,py,rad*1.9);glow.addColorStop(0,col+'66');glow.addColorStop(1,col+'00');
    x.fillStyle=glow;x.beginPath();x.arc(px,py,rad*1.9,0,7);x.fill();
    const core=x.createRadialGradient(px,py-rad*.3,rad*.1,px,py,rad);core.addColorStop(0,'#16224a');core.addColorStop(1,'#070b1e');
    x.shadowColor=col;x.shadowBlur=10+14*front;x.fillStyle=core;x.strokeStyle=col;x.lineWidth=(s===S.sel?3.4:2.6)*sc;
    x.beginPath();x.arc(px,py,rad,0,7);x.fill();x.stroke();
    x.shadowBlur=0;x.lineWidth=1;x.strokeStyle='rgba(255,255,255,.35)';x.beginPath();x.arc(px,py,rad-3*sc,Math.PI*1.1,Math.PI*1.6);x.stroke();
    if(s===S.sel){x.strokeStyle='rgba(255,255,255,.6)';x.setLineDash([3,4]);x.beginPath();x.arc(px,py,rad+7,0,7);x.stroke();x.setLineDash([])}
    x.fillStyle='#ffffff';x.shadowColor=col;x.shadowBlur=6;x.font=`700 ${Math.round((s==='QQQ'?17:14)*sc)}px Rajdhani,Outfit,sans-serif`;
    x.fillText(lab,px,py+1);x.shadowBlur=0;
    if(front>.45&&isFinite(c)){x.font=`700 ${Math.round(11.5*sc)}px Rajdhani,Outfit,sans-serif`;x.fillStyle=c>=0?C.up:C.dn;x.fillText(pct(c),px,py+rad+11*sc)}
    x.globalAlpha=1;if(pz>-.35)el._pts[s]=[px,py]});
}
function graphClick(ev){
  if(GSPIN.moved){GSPIN.moved=false;return}
  const c=ev.currentTarget,r=c.getBoundingClientRect(),P=c._pts||{};
  let best=null,bd=28;Object.keys(P).forEach(s=>{const d=Math.hypot(P[s][0]-(ev.clientX-r.left),P[s][1]-(ev.clientY-r.top));if(d<bd){bd=d;best=s}});
  if(best){S.sel=best;saveUI();render()}}
// Animate whichever sphere canvas is on screen; the 1s re-render swaps the element, so look it up each frame.
(function spin(){
  if(typeof window==='undefined'||!window.requestAnimationFrame)return;
  document.addEventListener('pointerdown',e=>{if(e.target&&e.target.id==='cvIntel'){GSPIN.drag=[e.clientX,GSPIN.off];GSPIN.moved=false}});
  document.addEventListener('pointermove',e=>{if(!GSPIN.drag)return;const dx=e.clientX-GSPIN.drag[0];if(Math.abs(dx)>4)GSPIN.moved=true;GSPIN.off=GSPIN.drag[1]+dx/140});
  const end=()=>{GSPIN.drag=null};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
  const frame=()=>{const c=document.getElementById('cvIntel');if(c&&!document.hidden){try{drawIntel(c)}catch(e){}}requestAnimationFrame(frame)};
  requestAnimationFrame(frame);
})();

function universe(){
  const readyN=INST.filter(i=>ready(i.s)).length;
  const chains=Object.keys(OPT).filter(s=>OPT[s]&&OPT[s].stats).length;
  let pts=0;const start=new Date();start.setHours(0,0,0,0);
  INST.forEach(i=>{(T[i.s]||[]).forEach(t=>{if(t>=start)pts++})});
  return{tracked:INST.length,active:readyN,chains,pts};
}
function accWindow(days){
  const cut=Date.now()-days*864e5,hist=SIG.hist||[];
  return AGENT_DEFS.map((d,k)=>{
    const xs=hist.filter(x=>x.k===k&&x.t>=cut);
    if(xs.length>=8)return xs.filter(x=>x.hit).length/xs.length;
    if(SIG.n[k]>=8)return SIG.hit[k]/SIG.n[k];
    return null});
}
function focusSym(){return ready(S.sel)?S.sel:(ready('QQQ')?'QQQ':SEL.find(ready)||'SPY')}
function bestOpt(){
  const now=new Date();
  const top=scanOptions(now)[0];
  if(top)return top;
  const s=focusSym(),key=scanKey(now),c=OPT[s]&&OPT[s].ch&&OPT[s].ch[key];
  if(c&&c.rows)return bestContractFrom(s,c.rows,expiries(now).find(x=>x.key===key)||expiries(now)[0],c.S);
  return null}

function home(){
  const s=focusSym();if(!ready(s))return connectCard();
  const z=analyze(s),f=z.f,rg=regimeInfo(),u=universe(),sess=NeonEngines.sessionInfo(new Date());
  const nxt=upcomingCal(new Date()).find(ev=>ev.at>new Date()&&ev.impact==='high');
  const sigs=SIG.list.slice(0,8);
  const bo=bestOpt();
  const g=bo&&bo.g;
  const fac=z.neon.fac;
  const acc=accWindow(7);
  const priced=acc.map((v,i)=>v==null?null:v).filter(v=>v!=null);
  const overall=priced.length?priced.reduce((a,b)=>a+b,0)/priced.length:null;
  const ins=AGENT_DEFS.filter(d=>['te','op','ma','se','ri'].includes(d.id)).map(d=>z.ag.find(a=>a.id===d.id)).filter(Boolean);
  const rv=realizedVol('SPY');
  return `${S.preview?'<div class="banner">PREVIEW — sample tape for layout only. Not live market data. Connect Alpaca to replace every figure.</div>':''}
  <div class="dash">
    <section class="panel graph">
      <h3><span>Market intelligence graph</span><span class="r">${pill(S.preview?'SAMPLE':'LIVE',S.preview?'p-wn':'p-up')} ${esc(S.gtf)}</span></h3>
      <div class="legend"><div><b style="color:#3dff9a">Strong</b> 0.8–1.0</div><div><b style="color:#2ee6ff">Moderate</b> 0.5–0.8</div><div><b style="color:#3d7cff">Weak</b> 0.2–0.5</div><div><b style="color:#ff7ad1">Inverse</b> −0.2–−0.5</div><div><b style="color:#ff2d8a">Strong inverse</b> −0.5–−1</div></div>
      <div class="tfs">${TFS.map(([v])=>`<button class="chip" aria-pressed="${S.gtf===v}" data-act="gtf" data-v="${v}">${v}</button>`).join('')}</div>
      <canvas id="cvIntel" aria-label="Correlation graph"></canvas>
      <div class="callouts">
        <div class="call">Options<br>${bo?bo.score:'—'}</div>
        <div class="call">Sentiment<br>${Math.round((f.sent+1)*50)}</div>
        <div class="call">Macro<br>${esc(rg.label.split(' ')[0])}</div>
        <div class="call">Breadth<br>${Math.round(mctx().breadth*100)}%</div>
      </div>
    </section>
    <section class="panel intel">
      <h3>Market intelligence</h3>
      <div class="th">Data engine</div>
      ${engineRows()}
      <div class="th" style="margin-top:8px">Data latency</div>
      <div class="kv"><div><small>Market</small><b>${LAT.market==null?'—':LAT.market+' ms'}</b></div><div><small>Options</small><b>${LAT.options==null?'—':LAT.options+' ms'}</b></div><div><small>News</small><b>${LAT.news==null?'—':LAT.news+' ms'}</b></div><div><small>Session</small><b>${esc(sess.label)}</b></div></div>
      <div class="th" style="margin-top:8px">Market universe</div>
      <div class="kv"><div><small>Tracked</small><b>${u.tracked}</b></div><div><small>With bars</small><b>${u.active}</b></div><div><small>Option chains</small><b>${u.chains}</b></div><div><small>Prints today</small><b>${u.pts.toLocaleString('en-US')}</b></div></div>
      <div class="th" style="margin-top:8px">Next high-impact release</div>
      <div>${nxt?`<b>${esc(nxt.title)}</b><div class="ago">${esc(nxt.d)} ${esc(nxt.t)} ET · ${esc(nxt.src)}</div>`:'<span class="dim">None left in the loaded calendar.</span>'}</div>
      <div class="th" style="margin-top:8px">Desk consensus · ${esc(s)}</div>
      ${nbar('Bullish',z.bull,'g')}${nbar('Bearish',z.bear,'r')}${nbar('Neutral',z.neu)}
      ${z.coord&&z.coord.conflicts[0]?note(esc(z.coord.conflicts[0])):''}
    </section>
    <section class="panel signals">
      <h3><span>Live signals</span><button class="chip" data-go="signals">View all</button></h3>
      <div class="row th" style="--c:42px 1fr 70px 36px"><span>Time</span><span>Symbol</span><span>Type</span><span class="r">Sc</span></div>
      ${sigs.map(g=>`<div class="row tap" data-act="sela" data-v="${g.sym}" style="--c:42px 1fr 70px 36px"><span class="ago">${hm(new Date(g.ts))}</span><b>${g.sym}</b><span>${pill(g.dir>0?'BULL':'BEAR',g.dir>0?'p-up':'p-dn')}</span><span class="r m">${g.score}</span></div>`).join('')||'<div class="empty">No signals yet. They fire at a score of 70+ or 30− while the tape is live.</div>'}
    </section>
    <section class="panel opts">
      <h3><span>Options opportunity</span>${bo?pill(bo.score>=70?'HIGH CONVICTION':'WATCH',bo.score>=70?'p-up':'p-cy'):''}</h3>
      ${bo&&g?`<div style="display:flex;justify-content:space-between;align-items:baseline"><b class="m" style="font-size:18px">${bo.s} ${bo.K} ${bo.side==='C'?'CALL':'PUT'}</b><span class="m cy">${bo.score}/100</span></div>
        <div class="kv" style="margin-top:8px"><div><small>Delta</small><b>${g.delta==null?'—':g.delta.toFixed(2)}</b></div><div><small>Volume</small><b>${g.vol==null?'—':fv(g.vol)}</b></div>
        <div><small>Gamma</small><b>${g.gamma==null?'—':g.gamma.toFixed(3)}</b></div><div><small>IV</small><b>${g.iv==null?'—':(g.iv*100).toFixed(1)+'%'}</b></div>
        <div><small>Theta</small><b>${g.theta==null?'—':g.theta.toFixed(2)}</b></div><div><small>Spread</small><b>${g.sp==null?'—':f2(g.sp)}</b></div>
        <div><small>Vega</small><b>${g.vega==null?'—':g.vega.toFixed(2)}</b></div><div><small>Mid</small><b>${f2(g.mid)}</b></div></div>
        ${probLine(bo)}
        <button class="btn gh sm" style="margin-top:8px" data-go="options">View details</button>`
        :note('Chain loads from Alpaca after connect. Free accounts use the indicative feed.')}
    </section>
    <section class="panel score">
      <h3><span>OAMI score</span>${pill(z.neon.label.includes('HIGH')?'HIGH CONVICTION':z.dir,z.neon.score>=58?'p-up':z.neon.score<=42?'p-dn':'p-cy')}</h3>
      <div class="big ${z.neon.score>=58?'up':z.neon.score<=42?'dn':'cy'}">${z.neon.score}<small style="font-size:16px;color:var(--dim)"> /100</small></div>
      ${fac.map(([l,v])=>nbar(l,v)).join('')}
    </section>
    <section class="panel regime">
      <h3><span>Market regime</span><span class="r">${esc(rg.label)}</span></h3>
      <canvas id="cvReg" class="cv" style="height:72px;min-height:72px"></canvas>
      ${nbar('Trend',rg.trend)}${nbar('Momentum',rg.mom)}${nbar('Volatility',rg.vol,'w')}${nbar('Liquidity',rg.liq)}${nbar('Breadth',rg.br,'g')}
      <div class="ago" style="margin-top:4px">SPY 20-day realized vol ${rv==null?'—':rv.toFixed(1)+'%'} · not the VIX index</div>
    </section>
    <section class="panel perf">
      <h3><span>Agent performance</span>${chips([[7,'7D'],[30,'30D'],[90,'90D']],S.win||7,'win')}</h3>
      ${AGENT_DEFS.slice(0,8).map((d,i)=>`<div class="nb"><span>${d.name}</span><div class="bar"><i style="width:${acc[i]==null?0:(acc[i]*100).toFixed(0)}%"></i></div><b>${acc[i]==null?'—':(acc[i]*100).toFixed(0)+'%'}</b></div>`).join('')}
      <div class="ago">Overall ${overall==null?'needs resolved calls':(overall*100).toFixed(1)+'%'} · 30-minute horizon, logged on this device</div>
    </section>
    <section class="panel analysis">
      <h3><span>Recent analysis</span><span class="r">${esc(s)} · 30 min range</span></h3>
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:end">
        <div>${bias(z.dir)}<div class="m" style="font-size:18px;margin-top:6px">${pct(z.fc.lo)} to ${pct(z.fc.hi)}</div></div>
        <div class="m cy" style="font-size:28px">${z.conf}%</div>
      </div>
      <ul class="note" style="padding-left:16px">${z.ag.find(a=>a.id==='te').why.slice(0,3).map(w=>`<li>${esc(w)}</li>`).join('')}</ul>
      ${note('A volatility band around the agent consensus. Not a price target.')}
    </section>
    <section class="panel sent">
      <h3><span>Tape</span><span class="r">Price · volume · momentum</span></h3>
      <canvas id="cvSent" class="cv" style="height:150px;min-height:140px"></canvas>
    </section>
    <section class="panel insights">
      <h3>Agent insights</h3>
      <div class="cards">${ins.map(a=>`<div class="inscard"><b>${esc(a.name)}</b><span>${esc(a.why[0]||'')}</span><div class="ago" style="margin-top:6px">${bias(a.bias)} ${a.conf}%</div></div>`).join('')}</div>
    </section>
    <section class="panel history">
      <h3><span>Signal history</span><button class="chip" data-go="signals">View all</button></h3>
      <div class="row th" style="--c:42px 52px 1fr 36px"><span>Time</span><span>Sym</span><span>Result</span><span class="r">Sc</span></div>
      ${SIG.list.slice(0,6).map(g=>`<div class="row" style="--c:42px 52px 1fr 36px"><span class="ago">${hm(new Date(g.ts))}</span><b>${g.sym}</b><span>${pill(g.status,g.status==='WIN'?'p-up':g.status==='LOSS'?'p-dn':'p-wn')}</span><span class="r">${g.score}</span></div>`).join('')||'<div class="empty">Empty until a score extreme prints.</div>'}
    </section>
  </div>`}

function engineRows(){
  const st=(ok,label)=>`<div class="stat"><span><i style="background:${ok?'var(--up)':'var(--warn)'}"></i>${label}</span><span class="${ok?'up':'warn'}">${ok?'LIVE':'WAIT'}</span></div>`;
  const mkt=LIVE.stocks==='live'||(LIVE.crypto==='live');
  return st(mkt,'Alpaca tape')+st(Object.keys(OPT).some(s=>OPT[s]&&OPT[s].stats),'Options')+st(NEWS.items.length>0,'News')+st(true,'Agents '+AGENT_DEFS.length)+st(!S.preview,'Quotes');
}
function probLine(bo){
  const iv=bo.g.iv,S0=bo.S||last(bo.s),dte=bo.ex?bo.ex.dte:18;
  if(!(iv>0&&S0>0))return '';
  const th=NeonEngines.bs(S0,bo.K,dte/365,iv,bo.side);
  const em=NeonEngines.expectedMove(S0,iv,dte);
  if(!th)return '';
  const edge=bo.g.mid-th.price;
  return `<div class="ago" style="margin-top:6px">Model P(ITM) ${(th.probITM*100).toFixed(0)}% · expected move ${f2(em)} · mid vs model ${edge>=0?'+':''}${f2(edge)}</div>`;
}

function page(title,sub,body){return `<div class="pagehead"><h2>${title}</h2><span>${sub||''}</span></div>${body}`}
function connectCard(){
  return page('Connect Alpaca', 'Keys stay on this device', `<section class="panel stack">
    <p class="note" style="margin:0">Prices, chains, news, and the paper broker route use your Alpaca keys. This app does not invent quotes. The economics calendar and Fed tab work without a key.</p>
    <label class="f">API key ID<input class="in" id="kAk" autocomplete="off" value="${esc(S.kd.ak||'')}"></label>
    <label class="f">Secret<input class="in" id="kAs" type="password" autocomplete="off" value="${esc(S.kd.as||'')}"></label>
    <div class="th">Account for portfolio and routed orders</div>${chips([['paper','Paper'],['live','Live']],CFG.env,'env')}
    <div class="th">Stock feed</div>${chips([['iex','IEX (free)'],['sip','SIP']],CFG.feed,'feed')}
    <div class="th">Options feed</div>${chips([['indicative','Indicative'],['opra','OPRA']],CFG.ofeed,'ofeed')}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="savekeys">Save and connect</button><button class="btn gh" data-act="preview">Preview layout</button></div>
    ${LOAD.err?`<p class="dn">${esc(LOAD.err)}</p>`:''}
  </section>`)}

function needData(inner){if(!hasKeys()&&!S.preview)return connectCard();if(LOAD.state==='error')return page('Feed error', '', `<section class="panel"><p class="dn">${esc(LOAD.err)}</p><button class="btn" data-act="retry">Retry</button></section>`);if(LOAD.state!=='ok')return page('Loading', '', `<section class="panel">${esc(LOAD.step||'Connecting to Alpaca')}</section>`);return inner()}

VIEWS.home={live:1,r:()=>needData(home),a:()=>{const c=$('#cvIntel');if(c){drawIntel(c);c.onclick=graphClick}const s=focusSym();if(!ready(s))return;const C=cv();const a=H[s].slice(-80);if($('#cvReg'))lineChart($('#cvReg'),[{a,col:a[a.length-1]>=a[0]?C.up:C.dn,w:1.6,fill:true}],{noY:1});
  const px=H.SPY&&H.SPY.slice(-80);if(px&&px.length>5&&$('#cvSent')){const vol=V.SPY.slice(-80);const mom=px.map((v,i)=>i<5?50:50+Math.tanh((v/px[i-5]-1)/0.004)*40);const vn=vol.map(v=>v);const mx=Math.max(...vn)||1;lineChart($('#cvSent'),[{a:px.map((v,i)=>v/px[0]*100),col:C.cy,w:1.8},{a:vn.map(v=>70+v/mx*25),col:C.dim,w:1},{a:mom,col:C.vio,w:1.4}],{noY:1})}}};

function webV(){
  const s=focusSym(),nodes=GNODES.map(n=>n[0]).filter(ready),M=corrTf(nodes,S.gtf);
  const peers=nodes.filter(t=>t!==s&&M[s]).map(t=>[t,M[s][t]]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,8);
  const beta=(()=>{if(!ready(s)||!ready('SPY')||s==='SPY')return null;const A=D[s].slice(-60),B=D.SPY.slice(-60),n=Math.min(A.length,B.length);if(n<10)return null;const ra=[],rb=[];for(let i=1;i<n;i++){ra.push(Math.log(A[A.length-n+i]/A[A.length-n+i-1]));rb.push(Math.log(B[B.length-n+i]/B[B.length-n+i-1]))}let c=0,v=0,ma=ra.reduce((p,q)=>p+q,0)/ra.length,mb=rb.reduce((p,q)=>p+q,0)/rb.length;for(let i=0;i<ra.length;i++){c+=(ra[i]-ma)*(rb[i]-mb);v+=(rb[i]-mb)**2}return v?c/v:null})();
  const heat=SECTORS.filter(ready).map(t=>[t,chgOf(t)]);
  return page('Neural market web', 'Correlations from your loaded bars', `<div class="split">
    <section class="panel"><h3><span>Market universe sphere</span>${chips(TFS,S.gtf,'gtf')}</h3><canvas id="cvIntel" class="sphere" aria-label="Rotating correlation sphere"></canvas>${note('Each ticker sits on the rotating sphere; arcs are return correlations. Drag to spin, tap a ticker to focus it. Star dust is texture, not a relationship.')}</section>
    <div class="stack">
      <section class="panel"><h3>${esc(s)} exposure</h3><div class="kv"><div><small>Day</small><b class="${cl(chgOf(s))}">${pct(chgOf(s))}</b></div><div><small>Beta to SPY</small><b>${beta==null?'—':beta.toFixed(2)}</b></div><div><small>Sector map</small><b>${esc(NeonEngines.SECTOR_OF[s]||'—')}</b></div></div>
        ${peers.map(([t,r])=>`<div class="row" style="--c:64px 1fr 48px"><b>${t}</b><div class="bar"><i style="width:${(Math.abs(r)*100).toFixed(0)}%"></i></div><span class="m ${r<0?'dn':'cy'}">${r.toFixed(2)}</span></div>`).join('')}</section>
      <section class="panel"><h3>Sector day</h3><div class="heat">${heat.map(([t,c])=>`<i style="background:${c>=0?'rgba(46,229,154,.18)':'rgba(255,77,109,.18)'}">${BY[t].lab||t}<br><span class="${cl(c)}">${pct(c)}</span></i>`).join('')||'<span class="dim">Sector ETFs not loaded.</span>'}</div></section>
    </div></div>`)}
VIEWS.web={live:1,r:()=>needData(webV),a:()=>{const c=$('#cvIntel');if(c){drawIntel(c);c.onclick=graphClick}}};

function agentsV(){
  const s=focusSym();if(!ready(s))return '<section class="panel">No bars for the selected symbol.</section>';
  const z=analyze(s);
  return page('20-agent network', s+' · coordination is a weighted vote, review is the adversarial agent', symChips(SEL,'sel',s)+`<section class="panel" style="margin:8px 0"><div class="kv"><div><small>Direction</small><b>${z.dir}</b></div><div><small>Agree</small><b>${z.agree}/${z.ag.length}</b></div><div><small>Confidence</small><b class="cy">${z.conf}%</b></div><div><small>Haircut</small><b>${z.coord?z.coord.haircut+' pts':'0'}</b></div></div>${(z.coord&&z.coord.conflicts.length)?`<ul class="note">${z.coord.conflicts.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:note('No material conflict on this pass.')}</section>
    <div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">${z.ag.map(a=>`<div class="inscard"><b>${esc(a.name)}</b><div style="margin:4px 0">${bias(a.bias)} <span class="m">${a.conf}%</span> <span class="ago">w ${(a.w*100).toFixed(0)}%</span></div><span>${a.why.map(esc).join(' · ')}</span></div>`).join('')}</div>`)}
VIEWS.agents={live:1,r:()=>needData(agentsV)};

function optionsV(){
  const now=new Date(),s=OPTIONABLE.includes(S.sel)?S.sel:'SPY',exs=expiries(now);
  const ex=exs[Math.min(S.exp||0,exs.length-1)],c=OPT[s]&&OPT[s].ch[ex.key];
  const rows=(c&&c.rows||[]).slice(0,18);
  const bo=bestOpt();
  const scan=scanOptions(now).slice(0,10);
  return page('Options engine', CFG.ofeed+' feed · model prices are Black-Scholes, not a quote', symChips(SEL.filter(x=>OPTIONABLE.includes(x)),'osym',s)+
    `<div style="margin:8px 0">${chips(exs.map((x,k)=>[k,`${x.key.slice(5)} · ${Math.round(x.dte)}d`]),Math.min(S.exp||0,exs.length-1),'exp')}</div>
    <div class="split"><section class="panel"><h3>Chain ${esc(s)}</h3>${rows.length?`<table><tr><th>Call Δ</th><th>Call</th><th>Strike</th><th>Put</th><th>Put Δ</th><th>IV</th></tr>${rows.map(r=>`<tr><td>${r.c&&r.c.delta!=null?r.c.delta.toFixed(2):'—'}</td><td>${r.c?f2(r.c.mid):'—'}</td><td>${r.K}</td><td>${r.p?f2(r.p.mid):'—'}</td><td>${r.p&&r.p.delta!=null?r.p.delta.toFixed(2):'—'}</td><td>${r.c&&r.c.iv!=null?(r.c.iv*100).toFixed(1)+'%':'—'}</td></tr>`).join('')}</table>`:'<div class="empty">Chain not in yet. It fills in over the next minute, five names at a time.</div>'}</section>
    <section class="panel"><h3>Scanner</h3>${scan.map(b=>`<div class="row tap" data-act="sela" data-v="${b.s}" style="--c:1fr 70px 40px"><span><b>${b.s}</b> ${b.K}${b.side}</span><span class="m">${f2(b.g.mid)}</span><span class="cy">${b.score}</span></div>`).join('')||'<div class="empty">Waiting on chains.</div>'}
      ${bo?probLine(bo)+note('Probability is risk-neutral P(ITM) from the chain IV. It is not a forecast of profit.'):''}</section></div>`)}
VIEWS.options={live:1,r:()=>needData(optionsV)};

function scannerV(){
  let rows=SIG_SYMS.filter(ready).map(s=>{const z=analyze(s);return{s,z,f:z.f,sc:z.neon.score}});
  if(S.sf==='bull')rows=rows.filter(x=>x.sc>=58);else if(S.sf==='bear')rows=rows.filter(x=>x.sc<=42);else if(S.sf==='move')rows=rows.filter(x=>Math.abs(x.f.chg)>=.01);
  const key={score:x=>Math.abs(x.sc-50),chg:x=>Math.abs(x.f.chg),rsi:x=>Math.abs(x.f.r14-50),vol:x=>x.f.volRatio}[S.ss]||(x=>x.sc);
  rows=[...rows].sort((a,b)=>key(b)-key(a));
  return page('Stock scanner', rows.length+' names', chips([['all','All'],['bull','Bullish'],['bear','Bearish'],['move','Movers']],S.sf,'sf')+chips([['score','Score'],['chg','Change'],['rsi','RSI'],['vol','RVOL']],S.ss,'ss')+
    `<section class="panel" style="margin-top:8px"><table><tr><th>Symbol</th><th>Price</th><th>Day</th><th>RSI</th><th>RVOL</th><th>Score</th><th>Bias</th></tr>${rows.map(x=>`<tr class="tap" data-act="sela" data-v="${x.s}"><td>${x.s}</td><td>${f2(x.f.px)}</td><td class="${cl(x.f.chg)}">${pct(x.f.chg)}</td><td>${x.f.r14.toFixed(0)}</td><td>${x.f.volRatio.toFixed(1)}x</td><td>${x.sc}</td><td>${x.z.dir}</td></tr>`).join('')}</table>
    <button class="btn gh sm" style="margin-top:8px" data-act="export" data-v="scan">Export CSV</button></section>`)}
VIEWS.scanner={live:1,r:()=>needData(scannerV)};

function signalsV(){
  const all=SIG.list,res=all.filter(g=>g.status!=='PENDING'),wins=res.filter(g=>g.status==='WIN').length;
  const l=all.filter(g=>S.sg==='all'||g.status===S.sg).slice(0,40);
  return page('Signals', 'Resolved after 30 minutes', `<section class="panel"><div class="kv"><div><small>Count</small><b>${all.length}</b></div><div><small>Win rate</small><b>${res.length?(wins/res.length*100).toFixed(0)+'%':'—'}</b></div><div><small>Brier</small><b>${(()=>{const b=NeonEngines.brier(all);return b==null?'—':b.toFixed(3)})()}</b></div></div></section>
    <div style="margin:8px 0">${chips([['all','All'],['PENDING','Pending'],['WIN','Win'],['LOSS','Loss']],S.sg,'sg')}</div>
    <section class="panel">${l.map(g=>`<div class="row" style="--c:52px 1fr auto"><span class="ago">${hm(new Date(g.ts))}</span><span><b>${g.sym}</b> ${pill(g.dir>0?'BULL':'BEAR',g.dir>0?'p-up':'p-dn')} <span class="ago">entry ${f2(g.px)}</span></span><span>${pill(g.status,g.status==='WIN'?'p-up':g.status==='LOSS'?'p-dn':'p-wn')} <button class="btn gh sm" data-act="alertfrom" data-v="${g.sym}">Alert</button></span></div>`).join('')||'<div class="empty">None yet.</div>'}</section>`)}
VIEWS.signals={live:1,r:()=>needData(signalsV)};

function calendarV(){
  const now=new Date(),list=upcomingCal(now).filter(ev=>{
    if(S.calF==='fed'&&ev.kind!=='fed')return false;
    if(S.calF==='inflation'&&ev.kind!=='inflation')return false;
    if(S.calF==='labor'&&ev.kind!=='labor')return false;
    if(S.calK==='upcoming'&&ev.at<now)return false;
    if(S.calK==='high'&&ev.impact!=='high')return false;
    return true});
  const nxt=upcomingCal(now).find(ev=>ev.at>now&&ev.impact==='high');
  const eta=nxt?Math.round((nxt.at-now)/60000):null;
  const etaS=eta==null?'':eta<90?eta+' min':eta<60*36?Math.round(eta/60)+' h':Math.round(eta/1440)+' d';
  return page('Economics calendar', 'Agency schedules · snapshot '+CAL_ASOF, `<section class="panel"><h3>Next high-impact</h3>${nxt?`<div class="big cy" style="font-size:28px">${esc(nxt.title)}</div><div class="m">${esc(nxt.d)} ${esc(nxt.t)} ET · ${esc(nxt.src)} · ${etaS}</div><div class="ago">${esc(nxt.period||'')} ${nxt.note?esc(nxt.note):''}</div><a href="${esc(nxt.url)}" target="_blank" rel="noopener">Agency page</a>`:'<div class="empty">No upcoming high-impact item in the loaded set.</div>'}</section>
    <div style="margin:8px 0;display:flex;gap:8px;flex-wrap:wrap">${chips([['all','All'],['fed','Fed'],['inflation','Inflation'],['labor','Labor']],S.calF,'calf')}${chips([['all','Past and future'],['upcoming','Upcoming'],['high','High only']],S.calK,'calk')}</div>
    <section class="panel"><table><tr><th>When (ET)</th><th>Release</th><th>Impact</th><th>Source</th></tr>${list.map(ev=>`<tr><td>${esc(ev.d)} ${esc(ev.t)}</td><td>${esc(ev.title)}<div class="ago">${esc(ev.period||'')}</div></td><td>${pill(ev.impact.toUpperCase(),ev.impact==='high'?'p-dn':ev.impact==='med'?'p-wn':'p-nt')}</td><td><a href="${esc(ev.url)}" target="_blank" rel="noopener">${esc(ev.src)}</a></td></tr>`).join('')}</table>
    ${note('BLS October dates are from the BLS October 2026 schedule. BEA dates are from the BEA release schedule. FOMC dates are from the Board’s published calendars. Statement clock times of 2:00 p.m. ET are the Board’s usual release time, not a separate timestamp on every future meeting. Agencies can reschedule. This is not a forecast of the print.')}</section>`)}
VIEWS.calendar={r:calendarV};

function fedV(){
  const items=FED.items&&FED.items.length?FED.items:(FED_SEED[S.fedId]||[]);
  return page('Fed news', 'Board of Governors RSS', `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${chips([['monetary','Monetary policy'],['speeches','Speeches'],['all','All releases']],S.fedId,'fedid')}<button class="btn gh sm" data-act="fedrefresh">${FED.loading?'Loading…':'Refresh'}</button></div>
    ${FED.stale?`<div class="banner">Showing the ${esc((FED.asof||FED_SEED.asof||'').slice(0,10))} snapshot. Live refresh needs the /api/feeds proxy (included for Netlify). ${FED.err?esc(FED.err):''}</div>`:''}
    <section class="panel">${items.map(it=>`<a class="row" style="--c:1fr auto;text-decoration:none;color:inherit" href="${esc(it.url)}" target="_blank" rel="noopener"><span><b>${esc(it.title)}</b><div class="ago">${esc(it.cat||'')} · ${esc((it.date||'').replace('T',' ').slice(0,16))}</div></span><span class="cy">↗</span></a>`).join('')||'<div class="empty">No items.</div>'}
    ${note('Links go to federalreserve.gov. Speech snapshot rows that predate a live refresh point at the feed index if the individual URL was not stored.')}</section>
    <section class="panel" style="margin-top:8px"><h3>FOMC path</h3><div class="ago">Next decision in this calendar: 28 Oct 2026, then 9 Dec 2026 with projections. 2027 dates are the Board’s 5 Sep 2025 tentative schedule.</div></section>`)}
VIEWS.fed={r:fedV};

function strategiesV(){
  const cur=S.strats.find(x=>x.id===S.sid)||S.strats[0];
  const spec=cur?cur.spec:NeonEngines.TEMPLATES[0].spec;
  let out='';
  if(cur&&ready(cur.sym||'QQQ')&&D[cur.sym||'QQQ']){
    const r=NeonEngines.runStrategy(D[cur.sym||'QQQ'],spec,5);
    out=r.ok?`<div class="kv"><div><small>Return</small><b class="${cl(r.stats.tot)}">${pct(r.stats.tot,1)}</b></div><div><small>Max DD</small><b class="dn">${pct(r.stats.dd,1)}</b></div><div><small>Sharpe</small><b>${r.stats.sharpe.toFixed(2)}</b></div><div><small>Trades</small><b>${r.stats.n}</b></div><div><small>Win</small><b>${r.stats.n?(r.stats.win*100).toFixed(0)+'%':'—'}</b></div><div><small>Buy & hold</small><b class="${cl(r.stats.btot)}">${pct(r.stats.btot,1)}</b></div></div>`:`<p class="dn">${esc(r.errs.join(' '))}</p>`;
  }
  return page('Strategy research', 'Rules on daily closes · long only · versioned locally', `<section class="panel"><h3>Templates</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${NeonEngines.TEMPLATES.map(t=>`<button class="chip" data-act="usetpl" data-v="${t.id}">${esc(t.name)}</button>`).join('')}</div>
    ${note('A template is a starting spec. Save it to version it. Indicators are RSI, SMA gap, 1-day and 20-day return, and breakout. No code is evaluated.')}</section>
    <section class="panel" style="margin-top:8px"><h3>Saved</h3>${S.strats.map(st=>`<div class="row" style="--c:1fr auto"><span><b>${esc(st.name)}</b> <span class="ago">${esc(st.sym)} · v${st.versions.length}</span></span><span><button class="btn gh sm" data-act="openspec" data-v="${st.id}">Open</button></span></div>`).join('')||'<div class="empty">None saved.</div>'}
    ${cur?`<div style="margin-top:8px"><b>${esc(cur.name)}</b> on ${esc(cur.sym)}</div>${out}<canvas id="cvSt" class="cv" style="height:160px"></canvas>`:''}</section>`)}
VIEWS.strategies={r:()=>needData(strategiesV),a:()=>{const cur=S.strats.find(x=>x.id===S.sid)||S.strats[0];if(!cur||!ready(cur.sym)||!$('#cvSt'))return;const r=NeonEngines.runStrategy(D[cur.sym],cur.spec,5);if(!r.ok)return;const C=cv();lineChart($('#cvSt'),[{a:r.bench,col:C.dim,w:1.2},{a:r.eq,col:C.cy,w:2,fill:true}],{d:2})}};

function riskV(){
  const s=focusSym(),sf=ready(s)?feat(s):null,v95=ready(s)?histVaR(s,.95):null,v99=ready(s)?histVaR(s,.99):null;
  const px=sym=>ready(sym)?last(sym):(S.book.positions[sym]&&S.book.positions[sym].avg)||0;
  const eq=NeonEngines.markEquity(S.book,px);
  const dd=S.book.dayStartEquity?eq/S.book.dayStartEquity-1:0;
  const L=S.book.limits;
  return page('Risk', S.book.kill?'KILL SWITCH ON':'Orders allowed if limits pass', `<section class="panel"><div class="kv"><div><small>Paper equity</small><b>$${f2(eq,0)}</b></div><div><small>Day vs start</small><b class="${cl(dd)}">${pct(dd)}</b></div><div><small>Cash</small><b>$${f2(S.book.cash,0)}</b></div><div><small>Kill switch</small><b class="${S.book.kill?'dn':'up'}">${S.book.kill?'HALTED':'OFF'}</b></div></div>
    <div style="display:flex;gap:8px;margin-top:8px"><button class="btn ${S.book.kill?'gh':'dg'}" data-act="kill">${S.book.kill?'Release kill switch':'Kill switch'}</button></div>
    ${note('The kill switch blocks new paper fills and is sent with any broker order. It does not cancel working broker orders by itself.')}</section>
    <section class="panel" style="margin-top:8px"><h3>Limits</h3><div class="fg2"><label class="f">Max position %<input class="in" id="limPct" type="number" value="${L.maxPosPct}"></label><label class="f">Max daily loss %<input class="in" id="limLoss" type="number" value="${L.maxDailyLossPct}"></label><label class="f">Max notional $<input class="in" id="limNot" type="number" value="${L.maxNotional}"></label><label class="f">Max orders / day<input class="in" id="limN" type="number" value="${L.maxOrdersDay}"></label></div><button class="btn sm" style="margin-top:8px" data-act="savelim">Save limits</button></section>
    <section class="panel" style="margin-top:8px"><h3>${esc(s)} historical VaR</h3><div class="kv"><div><small>1-day 95%</small><b>${v95==null?'—':(v95*100).toFixed(2)+'%'}</b></div><div><small>1-day 99%</small><b>${v99==null?'—':(v99*100).toFixed(2)+'%'}</b></div><div><small>Intraday risk</small><b>${sf?Math.round(sf.rl*100):'—'}/100</b></div></div>${note('VaR is the historical percentile of daily returns. It is not a guarantee.')}</section>`)}
VIEWS.risk={live:1,r:()=>needData(riskV)};

function executeV(){
  const t=S.ticket,px=ready(t.symbol)?last(t.symbol):0;
  const eq=NeonEngines.markEquity(S.book,s=>ready(s)?last(s):0);
  const dayLoss=S.book.dayStartEquity? (eq/S.book.dayStartEquity-1)*100 : 0;
  const phrase=t.env==='live'?`LIVE ${t.symbol} ${t.qty}`:t.env==='paper'?`PAPER ${t.symbol} ${t.qty}`:'';
  const pos=Object.keys(S.book.positions);
  return page('Execution', 'Paper ledger on device · broker route is confirm-gated', `<section class="panel stack">
    <div class="kv"><div><small>Paper equity</small><b>$${f2(eq,0)}</b></div><div><small>Live armed</small><b class="${S.book.liveArmed?'warn':'dim'}">${S.book.liveArmed?'YES':'NO'}</b></div></div>
    ${chips([['ledger','Paper ledger'],['paper','Alpaca paper'],['live','Alpaca live']],t.env,'tenv')}
    <div class="fg2"><label class="f">Symbol<input class="in" id="tSym" value="${esc(t.symbol)}"></label><label class="f">Qty<input class="in" id="tQty" type="number" value="${esc(t.qty)}"></label></div>
    ${chips([['buy','Buy'],['sell','Sell']],t.side,'tside')}
    <label class="f">Limit price<input class="in" id="tLim" type="number" placeholder="${px?f2(px):''}" value="${esc(t.limit)}"></label>
    ${t.env!=='ledger'?`<label class="f">Type this phrase<input class="in" id="tPhrase" value="${esc(t.phrase)}" placeholder="${esc(phrase)}"></label>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="sendorder">Submit</button><button class="btn gh" data-act="armlive">${S.book.liveArmed?'Disarm live':'Arm live'}</button><button class="btn dg" data-act="kill">${S.book.kill?'Release halt':'Kill switch'}</button></div>
    ${S.msg?note(esc(S.msg)):''}
    ${note(t.env==='live'?'Live orders are limit-only, capped at $25,000 notional by the server route, and never sent by an agent.':'The ledger fills against the last print with 5 bps of slippage. It does not short.')}
  </section>
  <section class="panel" style="margin-top:8px"><h3>Paper positions</h3>${pos.map(s=>{const p=S.book.positions[s],lastPx=ready(s)?last(s):p.avg,pl=p.avg? (lastPx/p.avg-1):0;return `<div class="row" style="--c:1fr auto"><span><b>${esc(s)}</b> <span class="ago">${p.qty} @ ${f2(p.avg)}</span></span><span class="${cl(pl)}">${pct(pl)}</span></div>`}).join('')||'<div class="empty">Flat.</div>'}</section>
  <section class="panel" style="margin-top:8px"><h3>Blotter</h3>${(S.book.fills||[]).slice(0,12).map(f=>`<div class="row" style="--c:70px 1fr auto"><span class="ago">${esc(f.venue)}</span><span>${esc(f.side)} ${esc(f.qty)} ${esc(f.symbol)}</span><span class="m">${f2(f.px)}</span></div>`).join('')||'<div class="empty">No fills.</div>'}
  ${note('Day P&L vs book start '+pct(dayLoss/100)+'. Alpaca account positions stay on the Portfolio load in Settings after connect.')}</section>`)}
VIEWS.execute={r:()=>needData(executeV)};

function journalV(){
  const rows=S.journal.map(j=>{const p=ready(j.sym)?last(j.sym):j.px,dir=j.side==='Short'?-1:1,pl=j.px?dir*(p/j.px-1):0;
    return `<div class="row" style="--c:1fr auto"><span><b>${esc(j.sym)}</b> ${esc(j.side)} <span class="ago">${esc(j.t)}</span><div>${esc(j.note||'')}</div></span><span class="${cl(pl)}">${pct(pl)} <button class="btn gh sm" data-act="jdel" data-v="${j.id}">Delete</button></span></div>`}).join('');
  return page('Journal', S.journal.length+' on this device', `<section class="panel stack"><div class="fg2"><label class="f">Symbol<select class="in" id="jSym">${SEL.map(s=>`<option>${s}</option>`).join('')}</select></label><label class="f">Side<select class="in" id="jSide"><option>Long</option><option>Short</option><option>Watch</option></select></label></div><label class="f">Note<textarea class="in" id="jNote"></textarea></label><button class="btn" data-act="jadd">Save at last price</button></section>
    <section class="panel" style="margin-top:8px">${rows||'<div class="empty">Empty.</div>'}<button class="btn gh sm" data-act="export" data-v="journal">Export CSV</button></section>`)}
VIEWS.journal={r:journalV};

function performanceV(){
  const all=SIG.list,b=NeonEngines.brier(all),cal=NeonEngines.calibration(all);
  const acc=accWindow(30);
  return page('Evaluation', 'Prediction score uses resolved signals only', needData(()=>`<section class="panel"><div class="kv"><div><small>Brier (lower is better)</small><b>${b==null?'—':b.toFixed(3)}</b></div><div><small>Resolved</small><b>${all.filter(g=>g.status!=='PENDING').length}</b></div></div>
    <div class="th" style="margin-top:8px">Calibration by score bucket</div>${cal.map(c=>`<div class="row" style="--c:70px 1fr 70px"><span>${c.label}</span><div class="bar"><i style="width:${c.win==null?0:(c.win*100).toFixed(0)}%"></i></div><span>${c.n? (c.win*100).toFixed(0)+'% of '+c.n : 'n=0'}</span></div>`).join('')}</section>
    <section class="panel" style="margin-top:8px"><h3>Agent hit rate, 30D window or lifetime if the window is thin</h3>${AGENT_DEFS.map((d,i)=>`<div class="nb"><span>${d.name}</span><div class="bar"><i style="width:${acc[i]==null?0:acc[i]*100}%"></i></div><b>${acc[i]==null?'—':(acc[i]*100).toFixed(0)+'%'}</b></div>`).join('')}${note('A hit is a directional vote that matched the sign of the next 30 minutes. Neutral votes are not scored. This is a log, not a claim of edge.')}</section>`))}
VIEWS.performance={r:()=>performanceV()};

function automationV(){
  const A=CFG.al,rules=A.rules.map(r=>`<div class="row" style="--c:1fr auto"><span>${esc(r.sym)} ${esc(r.type)} ${esc(r.dir||'')} ${r.level||''}</span><button class="btn gh sm" data-act="rdel" data-v="${r.id}">Delete</button></div>`).join('');
  return page('Automation', 'Runs while this app is open', `<section class="panel"><div class="kv"><div><small>Alerts</small><b>${A.on?'ON':'OFF'}</b></div><div><small>Telegram</small><b class="${tgReady()?'up':'warn'}">${tgReady()?'Ready':'Not set'}</b></div><div><small>Rules</small><b>${A.rules.length}</b></div></div>
    <div style="display:flex;gap:8px;margin-top:8px">${chips([[1,'Alerts on'],[0,'Alerts off']],A.on?1:0,'alon')}<button class="btn gh sm" data-act="altest">Send test</button></div>
    ${note('iPhone suspends a home-screen app in the background. Continuous monitoring needs this tab awake, or a Netlify deploy plus a machine that keeps a session open. Agents never place orders.')}</section>
    <section class="panel" style="margin-top:8px"><h3>Rules</h3>${rules||'<div class="empty">None.</div>'}
      <div class="fg2" style="margin-top:8px"><label class="f">Symbol<input class="in" id="rSym" value="QQQ"></label><label class="f">Score level<input class="in" id="rLvl" type="number" value="70"></label></div>
      <button class="btn sm" data-act="radd">Add score-cross rule</button></section>`)}
VIEWS.automation={r:automationV};

function labV(){
  const a=S.cmpA,b=S.cmpB;
  if(!ready(a)||!ready(b))return page('Research lab','',connectCard());
  const g=gridSeries([a,b],S.cmpTf==='1W'||S.cmpTf==='1M'?'3M':S.cmpTf),A=g[a],B=g[b];
  const ra=[],rb=[];for(let i=1;i<Math.min(A.length,B.length);i++){ra.push(Math.log(A[i]/A[i-1]));rb.push(Math.log(B[i]/B[i-1]))}
  const r=corr(ra,rb);
  return page('Research lab', 'Same-window comparison', `<section class="panel">${symChips(SEL,'cmpa',a)}<div class="th">versus</div>${symChips(SEL,'cmpb',b)}<canvas id="cvCmp" class="cv" style="height:200px"></canvas><div class="kv"><div><small>Correlation</small><b>${r.toFixed(2)}</b></div><div><small>${a}</small><b class="${cl(A[A.length-1]/A[0]-1)}">${pct(A[A.length-1]/A[0]-1)}</b></div><div><small>${b}</small><b class="${cl(B[B.length-1]/B[0]-1)}">${pct(B[B.length-1]/B[0]-1)}</b></div></div></section>`)}
VIEWS.lab={live:1,r:()=>needData(labV),a:()=>{if(!$('#cvCmp')||!ready(S.cmpA)||!ready(S.cmpB))return;const C=cv(),g=gridSeries([S.cmpA,S.cmpB],'1D');lineChart($('#cvCmp'),[{a:g[S.cmpB].map(v=>v/g[S.cmpB][0]),col:C.vio},{a:g[S.cmpA].map(v=>v/g[S.cmpA][0]),col:C.cy,w:2}],{d:2})}};

function settingsV(){
  return page('Settings', 'OMNIXS AI · O.A.M.I', connectCard()+`<section class="panel" style="margin-top:8px"><h3>Operator</h3><label class="f">Display name<input class="in" id="whoIn" value="${esc(CFG.who||'')}" placeholder="Your name"></label><button class="btn sm" data-act="savewho">Save name</button></section>
    <section class="panel" style="margin-top:8px"><h3>Telegram</h3><label class="f">Bot token<input class="in" id="tToken" type="password" value="${esc(CFG.tgToken||'')}"></label><label class="f">Chat ID<input class="in" id="tChat" value="${esc(CFG.tgChat||'')}"></label><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn gh sm" data-act="tfind">Find chat</button><button class="btn sm" data-act="tsave">Save</button></div>${S.msg?note(esc(S.msg)):''}</section>
    <section class="panel" style="margin-top:8px"><h3>Watchlist symbol</h3><label class="f">Ticker<input class="in" id="cSym" placeholder="AMD"></label><button class="btn sm" data-act="addsym">Add and reload</button>${note('Custom symbols join the universe after reload. Max 16. '+((CFG.custom||[]).map(c=>c.s).join(', ')||'None yet.'))}</section>
    <section class="panel" style="margin-top:8px"><h3>Platform</h3>${note('Static PWA. Deploy the project on Netlify so /api/alpaca, /api/feeds, /api/ai, and /api/orders are live. Keys are not in the zip. Database is this browser’s storage. <button class="btn dg sm" data-act="wipe">Erase this device</button>')}</section>`)}
VIEWS.settings={r:settingsV};

function dataOn(){return S.preview||(hasKeys()&&LOAD.state==='ok')}
function render(){
  const v=VIEWS[S.view]||VIEWS.home;
  const main=$('#view'),st=main.scrollTop;
  main.innerHTML=v.r();
  main.scrollTop=st;
  if(v.a){try{v.a()}catch(e){console.error(e)}}
  setNav();
}
function go(v){if(!VIEWS[v])v='home';S.view=v;S.msg='';history.replaceState(null,'','#'+v);$('#side').classList.remove('on');render()}
function buildNav(){
  $('#sidenav').innerHTML=NAV.map(([sec,items])=>`<div class="navsec">${sec}</div>`+items.map(([id,label,ico])=>`<button class="ni" data-go="${id}">${ICO[ico]?`<svg viewBox="0 0 24 24">${ICO[ico]}</svg>`:''}${label}</button>`).join('')).join('');
  $('#pills').innerHTML=[['home','Real-time data'],['agents','Multi-agent AI'],['strategies','Quant analysis'],['risk','Risk management'],['calendar','Macro']].map(([id,l])=>`<button data-go="${id}">${l}</button>`).join('');
  $('#dock').innerHTML=[['home','Desk'],['calendar','Macro'],['fed','Fed'],['options','Options'],['settings','More']].map(([id,l])=>`<button data-go="${id}">${l}</button>`).join('');
}
function setNav(){
  $$('.ni').forEach(b=>{if(b.dataset.go===S.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  $$('#pills button').forEach(b=>{if(b.dataset.go===S.view)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')});
  $$('#dock button').forEach(b=>{if(b.dataset.go===S.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
}
function statusInfo(){
  if(S.preview)return{label:'PREVIEW',k:'wn'};
  if(!hasKeys())return{label:'NO KEYS',k:'wn'};
  if(LOAD.state==='loading')return{label:'LOADING',k:'cy'};
  if(LOAD.state==='error')return{label:'ERROR',k:'dn'};
  if(LIVE.stocks==='live'&&mktOpen())return{label:'LIVE',k:'up'};
  if(!mktOpen())return{label:'MKT CLOSED',k:'cy'};
  return{label:'WAITING',k:'wn'}}
function chrome(){
  const n=new Date();$('#clk').textContent=n.toLocaleTimeString('en-US',{hour12:false});$('#clkd').textContent=n.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const si=statusInfo(),st=$('#stat');st.className='livepill st-'+si.k;$('#statt').textContent=si.label;
  const on=LIVE.stocks==='live'||LIVE.crypto==='live';$('#conn').className='conn'+(on?'':' off');$('#connt').textContent=on?('Alpaca '+CFG.feed.toUpperCase()):(S.preview?'Sample tape':'No feed');
  const name=CFG.who||'Operator';$('#whon').textContent=name;$('#whob').textContent=(CFG.env||'paper').toUpperCase();$('#av').textContent=name.slice(0,2).toUpperCase();
  const sess=NeonEngines.sessionInfo(n);
  const bits=[['Alpaca tape',on?'LIVE':'OFF'],['Options',Object.keys(OPT).some(s=>OPT[s]&&OPT[s].stats)?'LIVE':'WAIT'],['News',NEWS.items.length?'LIVE':'WAIT'],['Session',sess.label],['Orders',S.book&&S.book.kill?'HALTED':'OPEN']];
  $('#sys').innerHTML=`<h4>SYSTEM STATUS</h4>${bits.map(([a,b])=>`<div class="stat"><span><i style="background:${/LIVE|REGULAR|OPEN/.test(b)?'var(--up)':'var(--warn)'}"></i>${a}</span><span>${b}</span></div>`).join('')}<p class="tagline">“Clear data. Measured decisions.”</p><img class="sidelogo" src="logo-128.png" alt=""><span class="sideword">OMNIXS<small>O.A.M.I</small></span>`;
  if(!S.touching){const t=$('#ticker');const names=['SPY','QQQ','NVDA','AAPL','MSFT','TSLA','AMZN','META','GOOGL','VIXY','BTC','ETH','XLK','XLF','XLE'];
    t.innerHTML=dataOn()?names.filter(ready).map(s=>{const c=chgOf(s);return `<button class="tk${s===S.sel?' on':''}" data-act="sela" data-v="${s}"><b>${s}</b><span class="px">${f2(last(s),s==='BTC'?0:2)}</span><span class="${cl(c)}">${c>=0?'▲':'▼'} ${pct(c)}</span><i class="tkbar ${cl(c)}" style="--w:${Math.min(100,Math.abs(c)*2500).toFixed(0)}%"></i></button>`}).join('')+'<span class="tk"><b>RV20</b><span>'+(realizedVol('SPY')==null?'—':realizedVol('SPY').toFixed(1))+'</span></span>':'<span class="tk dim">Connect Alpaca for live prices · calendar and Fed news are available now</span>'}}
function refreshOK(){const a=document.activeElement;return !S.touching&&Date.now()>S.scrollUntil&&!(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))}

function seedPreview(){
  S.preview=true;LOAD.state='ok';
  let n=7;const rnd=()=>{n=n*16807%2147483647;return (n-1)/2147483646};
  INST.forEach(i=>{let p=i.t==='crypto'?(i.s==='BTC'?64000:2400):i.s==='VIXY'?13:80+rnd()*180;const d=[];for(let k=0;k<260;k++){p=Math.max(1,p*(1+(rnd()-.48)*i.dv/80));d.push(p)}D[i.s]=d;DT[i.s]=d.map((_,k)=>'d'+k);DV[i.s]=d.map(()=>1e6);
    let x=d[d.length-1];const h=[];for(let k=0;k<420;k++){x=Math.max(.5,x*(1+(rnd()-.5)*.0012));h.push(x)}H[i.s]=h;V[i.s]=h.map(()=>1000+rnd()*8000);T[i.s]=h.map((_,k)=>Date.now()-(h.length-k)*60000);PC[i.s]=h[Math.max(0,h.length-200)];
    SNAP[i.s]={bid:h[h.length-1]*.999,ask:h[h.length-1]*1.001,last:h[h.length-1]}});
  NEWS.items=[{id:1,h:'PREVIEW headline, not a wire story',sum:'',ts:Date.now()-3600000,url:'',src:'PREVIEW',syms:['NVDA','QQQ'],sc:.2,cat:'EARNINGS'}];NEWS.t=Date.now();
  ['QQQ','SPY','NVDA'].filter(ready).forEach(s=>{
    const S0=last(s),key=scanKey(new Date()),rows=[];
    for(let i=-6;i<=6;i++){const K=Math.round(S0*(1+i*.01)/ (S0>500?1:1));const iv=.2+Math.abs(i)*.004;const T=18/365;const c=NeonEngines.bs(S0,K,T,iv,'C');const p=NeonEngines.bs(S0,K,T,iv+.015,'P');
      const side=(g,ivv)=>({mid:+g.price.toFixed(2),bid:+(g.price*.98).toFixed(2),ask:+(g.price*1.02).toFixed(2),delta:g.delta,gamma:g.gamma,theta:g.theta,vega:g.vega,iv:ivv,sp:+(g.price*.04).toFixed(2),vol:900,last:g.price});
      rows.push({K,c:side(c,iv),p:side(p,iv+.015),atm:i===0})}
    OPT[s]={stats:optStatsFrom(rows,S0),ch:{[key]:{rows,S:S0,t:Date.now(),key}}}});
  SIG.list=[{id:1,sym:'QQQ',dir:1,score:82,px:last('QQQ'),ts:Date.now()-25*60000,status:'PENDING',ret:0},{id:2,sym:'NVDA',dir:1,score:76,px:last('NVDA'),ts:Date.now()-50*60000,status:'WIN',ret:.004}];
  MEMO.clear();
}

function download(name,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/csv'}));a.download=name;a.click()}
function dayKey(){return new Date().toISOString().slice(0,10)}

const ACT={
  matrix:()=>{document.body.classList.toggle('matrix-off');toast(document.body.classList.contains('matrix-off')?'Matrix rain off':'Matrix rain on')},
  navtog:()=>$('#side').classList.toggle('on'),
  sel:v=>{S.sel=v;saveUI();render()},
  sela:v=>{S.sel=v;saveUI();go('home')},
  gtf:v=>{S.gtf=v;render()},
  tf:v=>{S.tf=v;render()},
  sf:v=>{S.sf=v;render()},ss:v=>{S.ss=v;render()},sg:v=>{S.sg=v;render()},
  win:v=>{S.win=+v;render()},
  calf:v=>{S.calF=v;render()},calk:v=>{S.calK=v;render()},
  fedid:v=>{S.fedId=v;refreshFed(v).then(()=>render())},
  fedrefresh:()=>{refreshFed(S.fedId).then(()=>render())},
  env:v=>{CFG.env=v;saveCfg();render()},feed:v=>{CFG.feed=v;saveCfg();render()},ofeed:v=>{CFG.ofeed=v;saveCfg();render()},
  osym:v=>{S.sel=v;saveUI();render()},exp:v=>{S.exp=+v;render()},
  cmpa:v=>{S.cmpA=v;render()},cmpb:v=>{S.cmpB=v;render()},
  preview:()=>{seedPreview();go('home')},
  savekeys:()=>{const ak=$('#kAk').value.trim(),as=$('#kAs').value.trim();if(!ak||!as){toast('Enter both keys');return}CFG.ak=ak;CFG.as=as;S.preview=false;saveCfg();connect().then(()=>render());render()},
  retry:()=>{connect().then(()=>render())},
  savewho:()=>{CFG.who=$('#whoIn').value.trim();saveCfg();saveUI();toast('Saved');chrome()},
  addsym:()=>{const s=($('#cSym').value||'').toUpperCase().replace(/[^A-Z.]/g,'');if(!/^[A-Z][A-Z.]{0,5}$/.test(s)){toast('Bad ticker');return}CFG.custom=Array.isArray(CFG.custom)?CFG.custom:[];if(!CFG.custom.some(c=>c.s===s))CFG.custom.push({s,n:s});saveCfg();location.reload()},
  tsave:()=>{CFG.tgToken=$('#tToken').value.trim();CFG.tgChat=$('#tChat').value.trim();saveCfg();S.msg='Telegram saved.';render()},
  tfind:async()=>{CFG.tgToken=$('#tToken').value.trim();saveCfg();try{const c=await tgFindChat();CFG.tgChat=c.id;saveCfg();S.msg='Found '+c.name}catch(e){S.msg=e.message}render()},
  alon:v=>{CFG.al.on=v==='1';saveCfg();render()},
  altest:async()=>{toast('Sending');const ok=await sendTest(S.sel);toast(ok?'Sent':'Failed')},
  radd:()=>{const sym=($('#rSym').value||'QQQ').toUpperCase(),lvl=+$('#rLvl').value||70;CFG.al.rules.push(newRule({sym,type:'score',dir:'above',level:lvl,cd:90}));saveCfg();render()},
  rdel:v=>{CFG.al.rules=CFG.al.rules.filter(r=>r.id!==v);saveCfg();render()},
  alertfrom:v=>{CFG.al.rules.push(newRule({sym:v,type:'score',dir:'above',level:70,cd:90}));saveCfg();toast('Rule added');go('automation')},
  kill:()=>{S.book.kill=!S.book.kill;saveBook();toast(S.book.kill?'Halted':'Released');render()},
  savelim:()=>{S.book.limits.maxPosPct=+$('#limPct').value||15;S.book.limits.maxDailyLossPct=+$('#limLoss').value||2;S.book.limits.maxNotional=+$('#limNot').value||50000;S.book.limits.maxOrdersDay=+$('#limN').value||40;saveBook();toast('Limits saved')},
  tenv:v=>{S.ticket.env=v;S.ticket.phrase='';render()},
  tside:v=>{S.ticket.side=v;render()},
  armlive:()=>{if(S.book.liveArmed){S.book.liveArmed=false;saveBook();toast('Live disarmed');render();return}if(CFG.env!=='live'){S.msg='Switch the account type to Live in Settings before arming.';render();return}S.book.liveArmed=true;saveBook();S.msg='Live armed. Each order still needs the confirmation phrase.';render()},
  sendorder:async()=>{
    S.ticket.symbol=($('#tSym').value||'').toUpperCase();S.ticket.qty=+$('#tQty').value;S.ticket.limit=$('#tLim').value;S.ticket.phrase=$('#tPhrase')?$('#tPhrase').value.trim():'';
    const px=ready(S.ticket.symbol)?last(S.ticket.symbol):+S.ticket.limit;
    const eq=NeonEngines.markEquity(S.book,s=>ready(s)?last(s):0);
    const order={symbol:S.ticket.symbol,qty:S.ticket.qty,side:S.ticket.side,type:'limit',limit_price:+S.ticket.limit||px,env:S.ticket.env,equity:eq,dayKey:dayKey(),dailyLossPct:S.book.dayStartEquity?(eq/S.book.dayStartEquity-1)*100:0};
    if(S.ticket.env==='ledger'){const res=NeonEngines.fillPaper(S.book,order,px||+S.ticket.limit,Date.now());S.msg=res.ok?'Paper fill '+f2(res.fill.px):res.reasons.join(' ');saveBook();render();return}
    const g=NeonEngines.guardOrder(S.book,order,S.ticket.phrase,px);
    if(!g.ok){S.msg=g.reasons.join(' ');render();return}
    try{
      const r=await fetch('/api/orders',{method:'POST',headers:{'content-type':'application/json','APCA-API-KEY-ID':CFG.ak,'APCA-API-SECRET-KEY':CFG.as},body:JSON.stringify({env:S.ticket.env,symbol:g.symbol,qty:g.qty,side:S.ticket.side,type:'limit',limit_price:+S.ticket.limit,phrase:S.ticket.phrase,liveArmed:!!S.book.liveArmed,kill:!!S.book.kill})});
      const j=await r.json().catch(()=>({message:'No JSON'}));
      if(!r.ok){S.msg=(j.reasons&&j.reasons.join(' '))||j.message||('HTTP '+r.status);render();return}
      S.book.orders.unshift({venue:S.ticket.env,symbol:g.symbol,side:S.ticket.side,qty:g.qty,px:+S.ticket.limit,status:j.status||'sent',id:j.id||Date.now()});
      saveBook();S.msg='Broker accepted '+ (j.id||j.status||'order');
    }catch(e){S.msg='Route failed: '+e.message+' — deploy with the orders function, or use the paper ledger.'}
    render()},
  usetpl:v=>{const t=NeonEngines.TEMPLATES.find(x=>x.id===v);const id=Date.now().toString(36);S.strats.unshift({id,name:t.name,sym:focusSym(),spec:JSON.parse(JSON.stringify(t.spec)),versions:[{t:Date.now(),spec:t.spec}]});S.sid=id;saveStrats();render()},
  openspec:v=>{S.sid=v;render()},
  jadd:()=>{const sym=$('#jSym').value,side=$('#jSide').value,note=$('#jNote').value.trim();if(!ready(sym)&&!S.preview){toast('No price for '+sym);return}S.journal.unshift({id:Date.now(),sym,side,px:ready(sym)?last(sym):0,t:hm(new Date()),note});saveUI();render()},
  jdel:v=>{S.journal=S.journal.filter(j=>String(j.id)!==String(v));saveUI();render()},
  export:v=>{if(v==='journal')download('journal.csv',['symbol,side,px,note',...S.journal.map(j=>[j.sym,j.side,j.px,JSON.stringify(j.note||'')].join(','))].join('\n'));
    else download('scanner.csv',['symbol,price,day,rsi,score',...SIG_SYMS.filter(ready).map(s=>{const z=analyze(s);return[s,z.f.px,z.f.chg,z.f.r14.toFixed(1),z.neon.score].join(',')})].join('\n'))},
  wipe:()=>{if(S.del!=='all'){S.del='all';toast('Tap erase again');return}['omnixs.live.v1','omnixs.ui.v2','omnixs.sig.v1','omnixs.alog.v1','omnixs.book.v1','omnixs.strat.v1'].forEach(k=>localStorage.removeItem(k));location.reload()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act],[data-go]');if(!t)return;if(t.dataset.go){go(t.dataset.go);return}const f=ACT[t.dataset.act];if(f)Promise.resolve(f(t.dataset.v)).catch(err=>toast(err.message||String(err)))});
document.addEventListener('input',e=>{const id=e.target.id,v=e.target.value;if(id==='tSym')S.ticket.symbol=v.toUpperCase();if(id==='tQty')S.ticket.qty=v;if(id==='tLim')S.ticket.limit=v;if(id==='tPhrase')S.ticket.phrase=v;if(id==='kAk')S.kd.ak=v;if(id==='kAs')S.kd.as=v});
document.addEventListener('pointerdown',()=>{S.touching=true},true);
['pointerup','pointercancel'].forEach(n=>document.addEventListener(n,()=>setTimeout(()=>{S.touching=false},160),true));

function startMatrix(){
  const c=$('#matrix');if(!c)return;
  const x=c.getContext('2d');
  const glyphs='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  let cols=[],fs=15,w=0,h=0,step=22;
  function fit(){
    w=c.width=innerWidth;h=c.height=innerHeight;fs=innerWidth<800?13:15;step=fs+10;
    const n=Math.ceil(w/step);
    cols=Array.from({length:n},(_,i)=>({
      y:Math.random()*(h/fs),
      speed:0.026+((i*13)%5)*0.006,
      hue:195+(i*8)%40,
      g:Math.floor(Math.random()*glyphs.length)
    }));
  }
  fit();addEventListener('resize',fit);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(ts){
    if(document.body.classList.contains('matrix-off')||reduce){x.clearRect(0,0,w,h);requestAnimationFrame(frame);return}
    x.fillStyle='rgba(2,5,15,.05)';x.fillRect(0,0,w,h);
    x.font=`500 ${fs}px "Noto Sans JP",sans-serif`;x.textBaseline='top';
    cols.forEach((col,i)=>{
      col.y+=col.speed;
      if((col.y*8|0)%22===0)col.g=(col.g+1)%glyphs.length;
      const hue=col.hue+Math.sin((ts||0)/8000+i)*8;
      for(let k=0;k<7;k++){
        const a=k===0?.95:Math.max(.08,.42-k*.055);
        x.fillStyle=`hsla(${hue},80%,${k===0?78:58}%,${a})`;
        x.fillText(glyphs[(col.g+k)%glyphs.length],i*step,(col.y-k)*fs);
      }
      if(col.y*fs>h+fs)col.y=Math.random()*-6;
    });
    requestAnimationFrame(frame);
  }
  const go=()=>requestAnimationFrame(frame);
  if(document.fonts&&document.fonts.load)document.fonts.load(fs+'px "Noto Sans JP"').then(go).catch(go);
  else go();
}
function viewMode(){const m=localStorage.getItem('omnixs.vm')||'auto',mob=m==='mobile'||(m==='auto'&&innerWidth<=860);document.body.classList.toggle('is-mobile',mob);document.body.classList.toggle('vm-frame',m==='mobile'&&innerWidth>860);document.body.classList.toggle('vm-desktop-forced',m==='desktop'&&innerWidth<=860);const b=$('#vmbtn');if(b)b.textContent=m==='auto'?'AUTO':m==='mobile'?'MOBILE':'DESKTOP'}
ACT.vmode=()=>{const m=localStorage.getItem('omnixs.vm')||'auto',n={auto:'mobile',mobile:'desktop',desktop:'auto'}[m];localStorage.setItem('omnixs.vm',n);viewMode();toast('View: '+n);render()};
function boot(){
  viewMode();addEventListener('resize',viewMode);
  loadCfg();loadSig();loadAlog();loadUI();
  const h=location.hash.replace('#','');
  if(VIEWS[h])S.view=h;
  if(new URLSearchParams(location.search).has('preview')&&!hasKeys())seedPreview();
  buildNav();chrome();render();startMatrix();
  refreshFed('monetary');
  const realTick=tick;
  tick=function(){if(S.preview){chrome();const v=VIEWS[S.view];if(v&&v.live&&refreshOK())render();return}realTick()};
  setInterval(()=>{try{tick()}catch(e){console.error(e)}},1000);
  if(hasKeys())connect().then(()=>render());
  window.addEventListener('resize',()=>{if(refreshOK())render()});
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  const wrap=fn=>async function(){const t0=performance.now();try{return await fn.apply(this,arguments)}finally{const ms=Math.round(performance.now()-t0);if(fn===pollSnapshots)LAT.market=ms;if(fn===fetchNews)LAT.news=ms}};
  pollSnapshots=wrap(pollSnapshots);fetchNews=wrap(fetchNews);
}
boot();
