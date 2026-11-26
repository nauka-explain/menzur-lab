const NS='http://www.w3.org/2000/svg',svg=document.getElementById('st'),$=s=>document.querySelector(s);
const HH={disc:31,beaker:58,bottle:44},STAND=172,PU=49.5,SS=1.2,VH=682;
const MS={},VARS=[{id:'d1',V:[25,.3],m:[195,2]},{id:'d2',V:[25,.7],m:[70,2]},{id:'d4',V:[34,.7],m:[95,2]}];
const HOME={cyl:[328,80,-90],hex:[140,238],dyn:[430,178,-90],spoon:[470,216],thr:[310,272],d1:[410,272],d2:[480,272],d4:[550,272],sc:[261,401],bk1:[94,394],bk2:[557,394],nacl:[413,408],dyn2:[477,388,0]};
const ORDER={1:['d1','d2','d4'],2:['d1','d2','d4'],3:['d1','d2','d4']},PXN=50,AX=1,AYB=93,DH=25,G=9.8,SWK=.2,SPEC={dyn:{px:-7,bot:76,rx:8,pxn:50},dyn2:{px:0,bot:60,rx:6,pxn:16}};
const DY=()=>[I.dyn,I.dyn2],holder=d=>DY().find(D=>D.hang===d),activeDyn=()=>DY().find(D=>D.hang)||DY().find(D=>D.rot===0&&!inTray(D))||I.dyn;
const KIND={cyl:'cyl',hex:'hex',dyn:'dyn',spoon:'spoon',thr:'thr',d4:'disc',d2:'disc',d1:'disc',sc:'scale',bk1:'beaker',bk2:'beaker',nacl:'bottle',dyn2:'dyn'};
const NAME={cyl:'Мензурка 250 мл',hex:'Опора мензурки',dyn:'Динамометр №1',spoon:'Ложка',thr:'Катушка с нитками',d1:'Цилиндр №1',d2:'Цилиндр №2',d4:'Цилиндр №4',sc:'Электронные весы',nacl:'Соль поваренная NaCl',dyn2:'Динамометр №2'};
const SHD={bk1:{k:'st',r:40,h:124,g:56},bk2:{k:'st',r:40,h:124,g:56},nacl:{k:'st',r:27,h:100,g:42},thr:{k:'st',r:17,h:52,g:25},d1:{k:'st',r:16,h:62,g:30},d2:{k:'st',r:16,h:62,g:30},d4:{k:'st',r:18,h:62,g:31},cyl:{k:'st',r:31,h:365,g:175},hex:{k:'hex'},sc:{k:'rr'}};
let I,tare=0,on=false,drag,tT,tipT,hid=null,vb={x:0,y:0,w:1000,h:VH},U=[],R=[],P={massed:false},hT,lx=0,ly=0,AC,light=true,TG='d1',vi=0,LAB=1,needLp=false,SND=true;try{SND=localStorage.getItem('snd')!=='0'}catch(e){}
/* типографика: короткие слова не отрываются от следующего */
const NBSP='\u00A0',PRE='в|во|к|ко|с|со|у|о|об|на|по|за|из|от|до|при|про|над|под|без|для|и|а|но|не|ни|же|бы|ли|или';
const RXP=new RegExp('(?<=^|[\\s(«„\\u00A0])('+PRE+')\\s+(?=\\S)','giu');
const NBT=s=>String(s).replace(RXP,(m,b)=>b+NBSP).replace(/\s+—/g,NBSP+'—').replace(/№\s+/g,'№'+NBSP).replace(/(\d)\s+(?=(?:мл|г|Н|см|мм|кг|°|%)(?![а-яёa-z]))/gi,(m,d)=>d+NBSP);
const NBH=h=>String(h).split(/(<[^>]+>)/).map((x,i)=>i%2?x:NBT(x)).join('');
const setRes=h=>{$('#res').innerHTML=NBH(h)};
function typo(root){if(!document.createTreeWalker)return;const w=document.createTreeWalker(root,4),ns=[];let n;while(n=w.nextNode())ns.push(n);
 ns.forEach(n=>{const p=n.parentNode&&n.parentNode.nodeName;if(p==='SCRIPT'||p==='STYLE')return;n.nodeValue=NBT(n.nodeValue)});
 if(root.querySelectorAll)root.querySelectorAll('[data-tip]').forEach(e=>e.setAttribute('data-tip',NBT(e.getAttribute('data-tip'))))}
/* мини-рендер LaTeX без внешних библиотек */
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function K(s){let i=0;
 const SYM={rho:'ρ',Delta:'Δ',pm:'±',approx:'<span class="to">≈</span>',ldots:'…',' ':'&nbsp;',',':'&#8201;'};
 const cmd=()=>{let j=i+1;while(/[a-zA-Z]/.test(s[j]||''))j++;const named=j>i+1;if(!named)j++;const n=s.slice(i+1,j);i=j;if(named)while(s[i]===' ')i++;return n};
 const raw=()=>{i++;let j=s.indexOf('}',i);if(j<0)j=s.length;const r=s.slice(i,j);i=j+1;return r};
 const arg=()=>{if(s[i]==='{'){i++;const r=seq();i++;return r}return one()};
 function one(){const c=s[i];if(c===undefined){i++;return''}
  if(c==='\\'){const n=cmd();
   if(n==='text')return `<span class="tu">${esc(raw())}</span>`;
   if(n==='dfrac'||n==='frac'){const a=arg(),b=arg();return `<span class="tf"><span>${a}</span><span>${b}</span></span>`}
   if(n==='left'||n==='right')return s[i++];
   return SYM[n]||''}
  i++;if(/[a-zA-Z]/.test(c))return c;
  if(c==='='||c==='+')return `<span class="to">${c}</span>`;if(c==='-')return '−';return esc(c)}
 function seq(){let r='';while(i<s.length&&s[i]!=='}'){let a=s[i]==='{'?arg():one();
  while(s[i]==='_'||s[i]==='^'){const t=s[i++],b=arg();a+=t==='_'?`<sub>${b}</sub>`:`<sup>${b}</sup>`}r+=a}return r}
 let out='';while(i<s.length){out+=seq();if(s[i]==='}')i++}return `<span class="tex">${out}</span>`}
const num=s=>{if(s===null||s===undefined)return NaN;let t=String(s).trim().replace(/\s+/g,'');if(/\d[eE][-+]?\d/.test(t))return NaN;t=t.replace(/[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\/³²·.*]*$/,'');if(!/^[-+]?(\d+[.,]?\d*|[.,]\d+)$/.test(t))return NaN;const v=parseFloat(t.replace(',','.'));return Number.isFinite(v)?v:NaN},cl=(v,a,b)=>Math.min(b,Math.max(a,v)),ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,f=(x,n=2)=>x.toFixed(n).replace('.','{,}');
function ctx(){AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function tone(f,d=.08,type='sine',v=.06,f2){if(!SND)return;try{const a=ctx(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d=.2,v=.05,fq=1200,q=1,type='bandpass',fq2){if(!SND)return;try{const a=ctx(),n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=Math.random()*2-1;const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=b;fl.type=type;fl.frequency.setValueAtTime(fq,t);if(fq2)fl.frequency.linearRampToValueAtTime(fq2,t+d);fl.Q.value=q;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t)}catch(e){}}
const later=(fn,ms)=>setTimeout(fn,ms);
const SFX={click:()=>tone(1500,.04,'triangle',.05),release:()=>tone(1000,.04,'triangle',.04),pick:()=>tone(520,.05,'sine',.05,700),tap:()=>{noise(.08,.08,500,1,'lowpass');tone(160,.08,'sine',.06,90)},snap:()=>{tone(900,.03,'square',.03);later(()=>tone(1300,.04,'square',.03),45)},clink:()=>{tone(2400,.25,'sine',.05);tone(3600,.18,'sine',.03)},pour:n=>noise(.35+n*.02,.07,900,2,'bandpass',1800),splash:()=>{noise(.35,.1,1500,.8,'bandpass',500);tone(300,.12,'sine',.05,150)},swish:()=>noise(.3,.06,2500,.6,'bandpass',900),on:()=>{tone(660,.1,'square',.03);later(()=>tone(990,.12,'square',.03),110)},off:()=>{tone(990,.1,'square',.03);later(()=>tone(660,.14,'square',.03),110)},tare:()=>tone(1200,.09,'square',.03),err:()=>{tone(200,.12,'sawtooth',.035);later(()=>tone(150,.16,'sawtooth',.035),120)},ok:()=>{tone(660,.1,'sine',.06);later(()=>tone(880,.1,'sine',.06),100);later(()=>tone(1320,.18,'sine',.06),200)},bad:()=>tone(300,.25,'triangle',.06,180),blip:()=>tone(800,.05,'sine',.04),tie:()=>{tone(700,.03,'triangle',.04);later(()=>tone(500,.04,'triangle',.04),50)}};
const sfx=(n,a)=>{if(SND&&SFX[n])SFX[n](a)};
const ICON={on:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',off:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>'};
function sndUI(){const b=$('#snd');b.innerHTML=SND?ICON.on:ICON.off;b.dataset.tip=(SND?'Звук включён':'Звук выключен')+' (Alt+M)'}
function toggleSnd(){SND=!SND;try{localStorage.setItem('snd',SND?'1':'0')}catch(e){}sndUI();if(SND)sfx('blip')}
const CT=(()=>{let s='';for(let v=0;v<=250;v+=2){const y=175-v*1.4,l=v%10?6:v%50?12:18;s+=`<line x1="-28" x2="${-28+l}" y1="${y}" y2="${y}" stroke="#2c4a57"/>`;if(v&&v%20==0)s+=`<text x="-8" y="${y+3}" font-size="9" fill="#2c4a57">${v}</text>`}return s})();
const all=()=>Object.values(I),discs=c=>all().filter(d=>d.in===c);
const EXT=d=>24.4+.35*d.R;
const disp=(c,d,y)=>d.V*cl((y+EXT(d)-(c.y+175-c.w*1.4))/Math.max(2*EXT(d)-1.4*d.V,1),0,1);
const hd=c=>{const d=DY().map(D=>D.hang).find(x=>x&&x.bk===c);return d?d.V*d.sf:0};
const lvlWith=(c,ys)=>c.w+discs(c).reduce((a,d)=>a+disp(c,d,ys(d)),0)+hd(c);
const lvl=c=>lvlWith(c,d=>d.y),lvlF=c=>lvlWith(c,d=>d.tw?d.tw.y1:d.y);
const T=it=>cl(Math.hypot(it.x-it.hx,it.y-it.hy)/120,0,1);
const inTray=it=>it.x<650&&it.y<495;
const mass=it=>it.k==='disc'?MS[it.id]+(it.wet?.35:0):it.k==='beaker'?14.3+it.w:it.k==='bottle'?52.4:it.k==='thr'?0:22.5;
function scG(it){const t=T(it),a=30*Math.PI/180*t;return{t,c:1,s:0,ky:Math.cos(a),h:17.32*Math.sin(a),sa:Math.sin(a)}}
const SITES=(()=>{const o=[];for(let iv=0;iv<3;iv++)for(let iu=0;iu<3;iu++)o.push({u:PU+(iu-1)*20.5,v:(iv-1)*20.5});return o})();
const WEIGH=new Set(['disc','beaker','bottle','thr']),FP={disc:20,beaker:46,bottle:27,thr:13},SZ={disc:1,beaker:2,bottle:1.5,thr:.5};
const BOT=it=>it.k==='disc'?EXT(it):it.k==='thr'?26:HH[it.k],rOf=it=>FP[it.k]||15;
function panC(){const s=I.sc,g=scG(s);return{x:s.x+PU*SS,y:s.y-g.h*SS}}
function siteXY(it,k){const s=I.sc,g=scG(s),S=SITES[k];return{x:s.x+(S.u*g.c-S.v*g.s)*SS,y:s.y+((S.u*g.s+S.v*g.c)*g.ky-g.h)*SS-BOT(it)}}
const onPan=it=>it.site!=null&&!it.in&&!it.hung;
const scaleBusy=()=>{const s=I.sc;return !!(drag&&drag.it===s&&(drag.moved||!drag.act))||!!s.tw||all().some(i=>i.site!=null&&i.tw)};
const reading=()=>scaleBusy()?0:all().filter(onPan).reduce((a,i)=>a+mass(i),0)-tare;
function placeOnScale(it){const others=all().filter(o=>o!==it&&o.site!=null),cands=it.k==='beaker'?[4]:SITES.map((_,i)=>i),x0=it.x,y0=it.y,q=k=>siteXY(it,k);
 if(others.reduce((a,o)=>a+(SZ[o.k]||1),0)+(SZ[it.k]||1)>2+1e-9)return false;
 cands.sort((a,b)=>Math.hypot(q(a).x-x0,q(a).y-y0)-Math.hypot(q(b).x-x0,q(b).y-y0));
 for(const k of cands){if(others.every(o=>Math.hypot(SITES[k].u-SITES[o.site].u,SITES[k].v-SITES[o.site].v)*SS>=rOf(it)+rOf(o)-1e-6)){it.site=k;const p=q(k);go(it,p.x,p.y,0,220);return true}}
 return false}
function pushAside(it){const pc=panC();it.site=null;go(it,pc.x+105+Math.random()*10,pc.y+45+Math.random()*20,0,300);toast(it.k==='beaker'?'Стакан занимает всю площадку: освободите её':'На площадке нет места: освободите её')}
function hexG(it){const t=T(it);return{t,ky:1-.6*t,th:16*t,Hc:30*t,ro:38,ri:32}}
function hexBack(it){const{ky,th,Hc,ro,ri}=hexG(it),V=[[70,0],[35,60.6],[-35,60.6],[-70,0],[-35,-60.6],[35,-60.6]],pt=(n,d)=>`${V[n][0]},${V[n][1]*ky+d}`;
 let s='';const sh=['#1c2a85','#16226e','#0f1a58'];
 if(th>.5)[[3,2,0],[2,1,1],[1,0,2]].forEach(([a,b,c])=>{s+=`<polygon points="${pt(a,0)} ${pt(b,0)} ${pt(b,th)} ${pt(a,th)}" fill="${sh[c]}" stroke="#0e1650" stroke-width="1.5" stroke-linejoin="round"/>`});
 const top=V.map((_,n)=>pt(n,0)).join(' ');
 return s+`<polygon points="${top}" fill="#3550c8" stroke="#1c2a78" stroke-width="2" stroke-linejoin="round"/><polygon points="${[3,4,5,0].map(n=>pt(n,0)).join(' ')}" fill="none" stroke="#8aa0ff" stroke-width="2" opacity=".6"/><ellipse cy="${-Hc}" rx="${ro}" ry="${ro*ky}" fill="#7a92f5" stroke="#2a3fa0" stroke-width="2"/><ellipse cy="${-Hc}" rx="${ri}" ry="${ri*ky}" fill="url(#gHole)"/>`}
function hexFront(it){const{t,ky,Hc,ro,ri}=hexG(it);if(t<.03)return'';
 return `<path d="M${-ro} ${-Hc}L${-ro} 0A${ro} ${ro*ky} 0 0 0 ${ro} 0L${ro} ${-Hc}A${ro} ${ro*ky} 0 0 1 ${-ro} ${-Hc}Z" fill="url(#gWall)" stroke="#1c2a78" stroke-width="2"/><path d="M${-ro} ${-Hc}A${ro} ${ro*ky} 0 0 0 ${ro} ${-Hc}L${ri} ${-Hc}A${ri} ${ri*ky} 0 0 1 ${-ri} ${-Hc}Z" fill="#9db0ff" stroke="#2a3fa0"/>`}
function cylFront(it){const p=it.lv*1.4;let s='';
 if(p>.3)s+=`<rect x="-26" y="${175-p}" width="52" height="${p}" fill="#3d9be0" fill-opacity=".26"/><path d="M-26 ${172-p}Q0 ${178-p} 26 ${172-p}" stroke="#1d6fb5" fill="none" stroke-width="1.5"/>`;
 return s+CT+`<text x="3" y="-179" font-size="9" fill="#2c4a57">мл</text><rect x="-23" y="-182" width="5" height="335" rx="2.5" fill="#fff" opacity=".55"/><rect x="18" y="-182" width="3" height="320" rx="1.5" fill="#fff" opacity=".3"/>`}
const dropU=(x,y,r)=>`<path d="M${x-r} ${y-r*1.3}Q${x-r} ${y-r*1.95} ${x} ${y-r*1.95}Q${x+r} ${y-r*1.95} ${x+r} ${y-r*1.3}V${y}A${r} ${r} 0 0 1 ${x-r} ${y}Z" fill="#cfe8ff" fill-opacity=".34" stroke="#4f9ae0" stroke-opacity=".55" stroke-width=".7"/><ellipse cx="${x-r*.38}" cy="${y-r*.2}" rx="${r*.22}" ry="${r*.5}" fill="#fff" fill-opacity=".7"/>`;
function wetFx(t,top,h,ry,a,k=1){const b='#4aa3e0';
 let s=`<g opacity="${a}" transform="translate(0 ${(1-a)*6}) scale(${k} 1)"><ellipse cx="-8" cy="${top+1}" rx="15" ry="${ry*.5}" fill="${b}" opacity=".22"/><ellipse cx="12" cy="${top-3}" rx="11" ry="${ry*.38}" fill="${b}" opacity=".2"/>`;
 [[-14,-3,2.2],[7,-9,1.7],[15,4,2],[-5,6,1.6]].forEach(([x,y,r])=>s+=dropU(x,top+y*ry/26,r*.8));
 if(t>.02){s+=`<rect x="-21" y="${top+3}" width="12" height="${h*.7}" rx="6" fill="${b}" opacity=".22"/><rect x="5" y="${top+6}" width="10" height="${h*.55}" rx="5" fill="${b}" opacity=".2"/><rect x="-5" y="${top+2}" width="7" height="${h*.34}" rx="3.5" fill="${b}" opacity=".18"/><rect x="10" y="${top+h*.52}" width="12" height="${h*.44}" rx="6" fill="${b}" opacity=".22"/>`;
  [[-16,.1,2.5],[10,.3,2.1],[-2,.62,2],[16,.7,2.4],[-12,.85,1.8],[3,.9,1.7]].forEach(([x,u,r])=>s+=dropU(x,top+ry*.9+u*Math.max(8,h-ry*.9),r))}
 return s+'</g>'}
const SEG={a:[1.5,0,7,1.8],b:[8.2,1.5,1.8,7],c:[8.2,9.7,1.8,7],d:[1.5,16.4,7,1.8],e:[0,9.7,1.8,7],f:[0,1.5,1.8,7],g:[1.5,8.2,7,1.8]};
const DM={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg','-':'g',E:'adefg',r:'eg'};
function lcd(str,bk){const lit=bk?'#f4f9ff':'#18261b',gh=bk?'#2d66e0':'#93a48e',cells=[];
 for(const ch of str){if(ch==='.'&&cells.length)cells[cells.length-1].dp=1;else cells.push({ch,dp:0})}
 const N=6,off=N-cells.length;let g='',l='';
 for(let i=0;i<N;i++){const x=-64+i*11.6,c=cells[i-off],tr=`translate(${x} -29) scale(.84 .85)`;
  for(const k in SEG){const[a,b,w,h]=SEG[k],r=`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx=".6"/>`;
   g+=`<g transform="${tr}">${r}</g>`;if(c&&(DM[c.ch]||'').includes(k))l+=`<g transform="${tr}">${r}</g>`}
  g+=`<circle cx="${x+9.2}" cy="-14.2" r="1"/>`;if(c&&c.dp)l+=`<circle cx="${x+9.2}" cy="-14.2" r="1.2"/>`}
 return `<g fill="${gh}" opacity=".55">${g}</g><g fill="${lit}"${bk?' filter="url(#glow)"':''}>${l}</g><circle cx="-69" cy="-12" r="1.6" fill="none" stroke="${lit}" stroke-width=".7"/><text x="-66" y="-9.8" font-size="6.4" font-weight="700" fill="${lit}">g</text>`}
const RR=(()=>{const L=85,W=43,r=12,n=5,o=[];[[L-r,-W+r,-90],[L-r,W-r,0],[-L+r,W-r,90],[-L+r,-W+r,180]].forEach(([cx,cy,a0])=>{for(let k=0;k<=n;k++){const a=(a0+k*90/n)*Math.PI/180;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}});return o})();
function scaleBody(it){const{c,s,ky,h,sa}=scG(it),thB=(2.4/ky)*sa/.5,thP=(3/ky)*sa/.5,wall=(x,y,w,hh,r,th,c1,c2)=>`<rect x="${x}" y="${y+th}" width="${w}" height="${hh}" rx="${r}" fill="${c1}"/>`+(th>.05?`<rect x="${x}" y="${y+r}" width="${w}" height="${Math.max(0,hh+th-2*r)}" fill="${c2}"/>`:''),P=(u,v,z)=>{const x=u*c-v*s,y=(u*s+v*c)*ky-z;return x.toFixed(1)+','+y.toFixed(1)},N=RR.length,p=it.press,bk=on&&light;let o='';
 if(h>.5)for(let i=0;i<N;i++){const[u1,v1]=RR[i],[u2,v2]=RR[(i+1)%N],du=u2-u1,dv=v2-v1,l=Math.hypot(du,dv),nu=dv/l,nv=-du/l;
  if(nu*s+nv*c>0){const gr=Math.round(cl(176-55*(nu*c-nv*s),90,215)),col=`rgb(${gr},${gr+3},${gr+7})`;
   o+=`<polygon points="${P(u1,v1,h)} ${P(u2,v2,h)} ${P(u2,v2,0)} ${P(u1,v1,0)}" fill="${col}" stroke="${col}" stroke-width=".8" stroke-linejoin="round"/>`}}
 o+=`<polygon points="${RR.map(([u,v])=>P(u,v,h)).join(' ')}" fill="url(#gBody)" stroke="#858c92" stroke-width="1.2" stroke-linejoin="round"/>`;
 const btn=(a,x,y,w,hh,l,fs)=>{const dn=p===a?thB*.6:0;return `${wall(x,y,w,hh,3.5,thB,'#575d63','#4a5056')}<g transform="translate(0 ${dn})"><rect data-act="${a}" x="${x}" y="${y}" width="${w}" height="${hh}" rx="3.5" fill="${p===a?'#8a8f95':'url(#gBtn)'}" stroke="#6a7075" stroke-width=".8" style="cursor:pointer"/><rect x="${x+1.2}" y="${y+.9}" width="${w-2.4}" height="3.4" rx="1.7" fill="#fff" opacity="${p===a?.05:.32}" style="pointer-events:none"/><text data-act="${a}" x="${x+w/2}" y="${y+hh/2+fs*.36}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#f6f6f6" style="pointer-events:none">${l}</text></g>`};
 const lb=on?(bk?'url(#gLcdB)':'#a9b9a2'):'#8c98a2',lc=on?lcd(Math.abs(reading())>500?'Err':reading().toFixed(2),bk):'',w3=(85-8)/3,w2=(85-4)/2;
 o+=`<g transform="matrix(${c} ${s*ky} ${-s} ${c*ky} 0 ${-h})"><rect x="-81" y="-39" width="97" height="78" rx="6" fill="url(#gBody)" stroke="#aab0b5" stroke-width=".8"/><rect x="18" y="-39" width="63" height="78" rx="5" fill="#b9c4d2" stroke="#8d9bb0" stroke-width=".8"/>${wall(21,-36,57,72,3,thP,'#66788f','#586b83')}<rect x="21" y="-36" width="57" height="72" rx="3" fill="url(#gPlat)" stroke="#7f92ab" stroke-width=".7"/><rect x="23" y="-34" width="53" height="68" rx="2" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width=".8"/><path d="M26 -22H73M26 -8H73M26 6H73M26 20H73" stroke="#fff" stroke-opacity=".12"/><rect x="-75" y="-33" width="85" height="28" rx="3" fill="#80868b"/><rect x="-72" y="-30" width="79" height="22" rx="2" fill="${lb}" stroke="#5f6b8a" stroke-width=".6"/>${lc}${btn('pcs',-75,0,w3,12,'PCS',6.2)}${btn('un',-75+w3+4,0,w3,12,'UNITS',6.2)}${btn('lt',-75+2*(w3+4),0,w3,12,'LIGHT',6.2)}${btn('pw',-75,17,w2,16,'ON/OFF',7.4)}${btn('tr',-75+w2+4,17,w2,16,'TARE',7.4)}</g>`;
 return `<g transform="scale(${SS})">${o}</g>`}
function dyn2Body(it){const e=it.ex||0,z=-40,yp=z+e*16/16,hy=59+e;
 let sp='';{const n=10,y0=-50,y1=Math.max(yp-2,y0+8);for(let i=0;i<=n;i++)sp+=`${i%2?-4:4},${(y0+(y1-y0)*i/n).toFixed(1)} `}
 let s=`<ellipse cy="-76" rx="5" ry="6" fill="none" stroke="#777" stroke-width="2"/><rect x="-14" y="-60" width="28" height="120" rx="6" fill="url(#gYel)" stroke="#b99a00" stroke-width="2"/><rect x="-6" y="-70" width="12" height="12" fill="#222"/><rect x="-9" y="-52" width="18" height="104" rx="2" fill="#fffbe0" stroke="#b99a00" stroke-width=".8"/>`;
 for(let i=0;i<=50;i++){const y=z+i*1.6,mj=i%10===0,md=i%5===0;s+=`<line x1="${mj?1:md?3:5}" x2="9" y1="${y}" y2="${y}" stroke="#222" stroke-width=".6"/>`;if(mj)s+=`<text x="0" y="${y+2}" text-anchor="end" font-size="5.5" fill="#222">${i/10}</text>`}
 return s+`<polyline points="${sp}" fill="none" stroke="#555" stroke-width="1.1"/><rect x="-14" y="52" width="28" height="8" fill="#b99a00" opacity=".5"/><line x1="0" x2="0" y1="${yp}" y2="60" stroke="#777" stroke-width="2"/><rect x="-4" y="${yp-2}" width="8" height="4" fill="#555"/><rect x="-9" y="${yp-1.2}" width="18" height="2.4" rx="1" fill="#d22"/><g transform="rotate(${(it.sw||0)*180/Math.PI} 0 60)"><line x1="0" x2="0" y1="60" y2="${hy+12}" stroke="#777" stroke-width="2"/><path d="M0 ${hy+10}q0 8 6 8q6 0 6 -8" fill="none" stroke="#666" stroke-width="2.4" stroke-linecap="round"/></g>`}
function dynBody(it){if(it.id==='dyn2')return dyn2Body(it);const e=it.ex||0,yp=-55+e,hy=75+e;
 let sp='';{const n=14,y0=-66,y1=Math.max(yp-2,y0+10);for(let i=0;i<=n;i++)sp+=`${i%2?-11:-3},${(y0+(y1-y0)*i/n).toFixed(1)} `}
 let s=`<ellipse cy="-82" rx="6" ry="7" fill="none" stroke="#777" stroke-width="2.4"/><rect x="-22" y="-76" width="44" height="152" rx="5" fill="url(#gSteel)" stroke="#6a6f75" stroke-width="1.6"/><rect x="-16" y="-68" width="32" height="136" rx="2" fill="#f7f8f9" stroke="#8a8f95" stroke-width=".8"/><text x="7" y="-59" font-size="6" font-weight="700" fill="#222">Н</text>`;
 for(let i=0;i<=25;i++){const y=-55+i*5,mj=i%10===0,md=i%5===0;s+=`<line x1="${mj?3:md?6:9}" x2="14" y1="${y}" y2="${y}" stroke="#222" stroke-width=".7"/>`;if(mj)s+=`<text x="1" y="${y+2}" text-anchor="end" font-size="5.5" fill="#222">${i/10}</text>`}
 return s+`<polyline points="${sp}" fill="none" stroke="#555" stroke-width="1.2"/><rect x="-22" y="66" width="44" height="10" fill="#7d8186" stroke="#5f6469" stroke-width=".8"/><line x1="-7" x2="-7" y1="${yp}" y2="76" stroke="#777" stroke-width="2"/><rect x="-11" y="${yp-2}" width="8" height="4" fill="#555"/><rect x="-12" y="${yp-1.2}" width="27" height="2.4" rx="1" fill="#d22"/><g transform="rotate(${(it.sw||0)*180/Math.PI} -7 76)"><line x1="-7" x2="-7" y1="76" y2="${hy+12}" stroke="#777" stroke-width="2"/><path d="M-7 ${hy+10}q0 8 8 8q8 0 8 -8" fill="none" stroke="#666" stroke-width="2.4" stroke-linecap="round"/></g>`}
function body(it){
 const k=it.k;let s='';
 if(k==='cyl'){const T0=`rotate(${-it.rot}) translate(${-it.x} ${-it.y})`,RU=tr=>`<use href="#rf" transform="${tr} ${T0}"/><use href="#i_hex" transform="${tr} ${T0}"/>`;
  s=`<rect x="-28" y="-190" width="56" height="365" rx="4" fill="#dcecf1" fill-opacity=".08"/><g clip-path="url(#cA)" opacity=".7">${RU('translate(8 0)')}</g><g clip-path="url(#cB)" opacity=".7">${RU('scale(1.1 1)')}</g><g clip-path="url(#cC)" opacity=".7">${RU('translate(-8 0)')}</g><rect x="-28" y="-190" width="56" height="365" rx="4" fill="url(#gGlassC)" stroke="#7ea6b4" stroke-width="2"/><rect x="-30" y="172" width="60" height="9" rx="3" fill="#dbeef4" fill-opacity=".6" stroke="#7ea6b4"/>`;
 }else if(k==='disc'){const R=it.R,kk=R/26,t=T(it),h=48.8*t,top=-h/2,ry=R*(1-.65*t),c=it.in,n=it.n,a=it.wetA||0,gm=it.mat,rg=4.5*kk+1.5,ryR=Math.max(1.5,rg*(1-.5*t)),ringY=top-8*kk*(1-t)-3*t,bx=9*kk*(1-t),by=10*kk*(1-t)+8*t,fs=10*kk+1;
  const side=`M${-R} ${top}V${h/2}A${R} ${ry} 0 0 0 ${R} ${h/2}V${top}Z`;
  const ln=d=>`<path d="${d}" fill="none" stroke="#222" stroke-width="3.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#efe6cf" stroke-width="1.5" stroke-linecap="round"/>`;
  s=(t>.02?`<path d="${side}" fill="url(#gS${gm})" stroke="#555" stroke-width="1.5"/>`:'')
   +`<ellipse cy="${top}" rx="${R}" ry="${ry}" fill="url(#gD${gm})" stroke="#6c737c" stroke-width="2"/><ellipse cy="${top}" rx="${R*.73}" ry="${ry*.73}" fill="none" stroke="#fff" stroke-opacity=".55"/>`
   +`<ellipse cy="${ringY}" rx="${rg}" ry="${ryR}" fill="none" stroke="#444" stroke-width="2"/><circle cx="${bx}" cy="${by}" r="${7*kk+1}" fill="#ffe36a" stroke="#c9a400"/><text x="${bx}" y="${by+fs*.36}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#222">${n}</text>`
   +(a>.02?wetFx(t,top,h,ry,a,kk):'');
  if(it.surf!=null){const sl=it.surf-it.y;s+=`<clipPath id="wc_${it.id}"><path d="${side}"/><ellipse cy="${top}" rx="${R}" ry="${ry}"/><ellipse cy="${h/2}" rx="${R}" ry="${ry}"/></clipPath><g clip-path="url(#wc_${it.id})"><rect transform="rotate(${-it.rot})" x="-200" y="${sl}" width="400" height="300" fill="#3d9be0" fill-opacity=".3"/></g>`}
  if(it.thread&&!it.hung){const y0=ringY-ryR;s+=`<circle cx="0" cy="${y0}" r="1.9" fill="#efe6cf" stroke="#222" stroke-width=".8"/>`;
   if(c){const L=Math.min(-40,(c.y-214)-it.y);s+=ln(`M0 ${y0}C5 ${L*.3} -5 ${L*.65} 1 ${L}q7 -7 13 -1`)}
   else{const gy=h/2+ry*.55;s+=ln(`M0 ${y0}C8 ${y0-12} ${R+10} ${y0-8} ${R+6} ${y0+8}C${R+3} ${gy-6} ${R+8} ${gy} ${R+6} ${gy+4}C${R+20} ${gy+12} ${R+40} ${gy+10} ${R+46} ${gy+2}C${R+50} ${gy-8} ${R+34} ${gy-10} ${R+30} ${gy+2}C${R+26} ${gy+16} ${R+60} ${gy+18} ${R+74} ${gy+8}S${R+92} ${gy+2} ${R+100} ${gy+10}`)}}
 }else if(k==='beaker'){const KB=.363,h=it.dv*KB,TOP=-66.3,hw=y=>38+(55-y)*4/121.3;
  s=`<path d="M-42 ${TOP}L-38 55Q-38 58 -34 58L34 58Q38 58 38 55L42 ${TOP}" fill="url(#gGlass)" stroke="#7d93a3" stroke-width="2"/>`;
  if(h>.3){const yt=58-h,wt=hw(yt)-.6;s+=yt>55?`<path d="M-35 ${yt}L35 ${yt}L35 57L-35 57Z" fill="#4aa3e0" fill-opacity=".55"/>`:`<path d="M${-wt} ${yt}L${wt} ${yt}L37 55Q36 57 34 57L-34 57Q-36 57 -37 55Z" fill="#4aa3e0" fill-opacity=".55"/>`}
  for(let v=50;v<=300;v+=50)s+=`<line x1="22" x2="38" y1="${58-v*KB}" y2="${58-v*KB}" stroke="#111"/><text x="18" y="${61-v*KB}" font-size="8" text-anchor="end" fill="#111">${v}</text>`;
 }else if(k==='hex')s=hexBack(it);
 else if(k==='dyn')s=dynBody(it);
 else if(k==='spoon')s=`<rect x="-70" y="-4" width="100" height="8" rx="4" fill="#3fc058"/><ellipse cx="45" rx="26" ry="13" fill="#4fd36a"/><ellipse cx="42" cy="-3" rx="14" ry="5" fill="#fff" opacity=".3"/>`;
 else if(k==='thr'){s=`<rect x="-17" y="-26" width="34" height="7" rx="2.5" fill="#c9a06a" stroke="#8a6a3a"/><rect x="-17" y="19" width="34" height="7" rx="2.5" fill="#c9a06a" stroke="#8a6a3a"/><rect x="-12" y="-19" width="24" height="38" fill="url(#gThr)" stroke="#b8ad90"/>`;
  for(let i=0;i<9;i++)s+=`<path d="M-12 ${-17+i*4.4}L12 ${-14+i*4.4}" stroke="#b8ad90" stroke-width=".9"/>`;
  s+=`<path d="M11 -6C24 -10 30 4 25 14S16 30 30 29" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/><path d="M11 -6C24 -10 30 4 25 14S16 30 30 29" fill="none" stroke="#f3ead2" stroke-width="1.5" stroke-linecap="round"/>`}
 else if(k==='scale')s=scaleBody(it);
 else if(k==='bottle')s=`<g transform="scale(1.1)"><rect x="-24" y="-30" width="48" height="70" rx="9" fill="#fafafa" stroke="#bbb" stroke-width="2"/><rect x="-12" y="-46" width="24" height="18" fill="#f0f0f0" stroke="#bbb"/><rect x="-13" y="-52" width="26" height="8" fill="#e5e5e5" stroke="#aaa"/><rect x="-21" y="-9" width="42" height="40" rx="2" fill="#fff" stroke="#ccc"/><text y="8" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" font-weight="700" fill="#222">NaCl</text><text y="18" text-anchor="middle" font-size="8" font-weight="600" fill="#333">Соль</text><text y="27" text-anchor="middle" font-size="7" font-weight="600" fill="#333" textLength="34" lengthAdjust="spacingAndGlyphs">поваренная</text></g>`;
 return s}
const tf=it=>`translate(${it.x} ${it.y}) rotate(${it.rot})${it.in?' scale(1.06)':''}`;
const HEXP=[[70,0],[35,60.6],[-35,60.6],[-70,0],[-35,-60.6],[35,-60.6]];
function shadowD(it,d,k){
 if(d.k==='st'){const L=Math.min(d.h*.25,60)*k,dx=L*.3,ry=d.r*.42,cy=it.y+d.g,cx=it.x;
  return `M${cx-d.r} ${cy}L${cx-d.r+dx} ${cy-L}A${d.r} ${ry} 0 0 1 ${cx+d.r+dx} ${cy-L}L${cx+d.r} ${cy}A${d.r} ${ry} 0 0 1 ${cx-d.r} ${cy}Z`}
 if(d.k==='hex'){const t=T(it),ky=1-.6*t,th=16*t,L=12*t*k;return [0,.5,1].map(f=>'M'+HEXP.map(([x,y])=>`${(it.x+x+L*.3*f).toFixed(1)},${(it.y+y*ky+th-L*f).toFixed(1)}`).join('L')+'Z').join('')}
 const g=scG(it),L=9*g.t*k;return [0,.5,1].map(f=>'M'+RR.map(([u,v])=>`${(it.x+u*SS+L*.3*f).toFixed(1)},${(it.y+v*g.ky*SS-L*f).toFixed(1)}`).join('L')+'Z').join('')}
function shad(it){const e=it.sh,d=SHD[it.id];if(!e||!d)return;
 let op=inTray(it)||it.in||onPan(it)||it.hung?0:.3,k=1;
 if(it.k==='disc'&&T(it)<.6)op=0;if(it.id==='thr'&&all().some(x=>x.thread))op=0;
 if(it.id==='hex'&&T(it)<.5)op=0;if(it.id==='sc'&&T(it)<.5)op=0;
 if(it.id==='cyl')op=it.stand&&it.rot===0&&!inTray(it)?.3:0;
 if(drag&&drag.it===it&&drag.moved){k=1.6;op*=.6}
 e.setAttribute('d',op?shadowD(it,d,k):'');e.setAttribute('opacity',op)}
function setT(it){it.g.setAttribute('transform',tf(it));if(it.f)it.f.setAttribute('transform',tf(it));shad(it)}
function draw(it){
 if(it.k==='disc'){const sig=[T(it).toFixed(2),(it.wetA||0).toFixed(2),it.thread?1:0,it.hung?1:0,it.in?Math.round(it.y):'',it.surf==null?'':Math.round(it.surf-it.y)+'@'+Math.round(it.rot)].join('|');if(sig===it._sig){setT(it);return}it._sig=sig}
 it.g.innerHTML=body(it);if(it.f)it.f.innerHTML=it.id==='hex'?hexFront(it):cylFront(it);setT(it);if(it.id==='thr')it.g.style.display=all().some(d=>d.thread)?'none':''}
function fixZ(){const h=I.hex,c=I.cyl;
 if(c.stand===h){h.g.after(c.g);let l=c.g;all().filter(d=>d.in===c||(d.hung&&d.bk===c)).forEach(d=>{l.after(d.g);l=d.g});l.after(c.f);c.f.after(h.f)}
 else{h.g.after(h.f);c.g.after(c.f)}}
function sync(){{const c=I.cyl;if(c.stand&&LAB===1){if(discs(c).length)P.L1=lvlF(c);else if(c.w>0)P.L0=c.w}}
all().forEach(draw);fixZ();if(on&&onPan(I[TG]))P.massed=true;bar();loupe();calc();selUI();upd()}
function go(it,x,y,r=it.rot,ms=420){it.tw={x0:it.x,y0:it.y,r0:it.rot,x1:x,y1:y,r1:r,t0:performance.now(),ms}}
const surfOf=b=>b===I.cyl?b.y+175-b.w*1.4:b.y+58-b.w*.363;
const floorOf=(d,x=d.x)=>{let r=null,m=99;for(const b of [I.bk1,I.bk2]){if(inTray(b))continue;const dx=Math.abs(x-b.x);if(dx<=45&&dx<m){m=dx;r=dx<=37-d.R+2?{b,y:b.y+57,inside:true}:{b,y:b.y-66,inside:false}}}
 const c=I.cyl;if(c.stand&&c.rot===0){const dx=Math.abs(x-c.x);if(dx<=32&&dx<m){m=dx;r=dx<=28-d.R+2?{b:c,y:c.y+175,inside:true}:{b:c,y:c.y-190,inside:false}}}return r};
function hookPos(D){const sp=SPEC[D.id]||SPEC.dyn,ph=D.sw||0,rx=sp.rx,ry=D.ex/(sp.pxn/PXN)*0+D.ex+17;return{x:D.x+sp.px+rx*Math.cos(ph)-ry*Math.sin(ph),y:D.y+sp.bot+rx*Math.sin(ph)+ry*Math.cos(ph)}}
function dynPhysOne(D){const d=D.hang,prev=D.ex,sp=SPEC[D.id]||SPEC.dyn;let tg=0;
 const hp0=hookPos(D),vx0=hp0.x-(D.px===undefined?hp0.x:D.px),ax=cl(vx0-(D.pv||0),-5,5);D.px=hp0.x;D.pv=vx0;
 if(d&&D.rot===0){const W=MS[d.id]*G/1000,E=EXT(d),fl=floorOf(d,hp0.x),base=D.y+sp.bot+17+DH,surf=fl&&fl.inside?surfOf(fl.b):null;
  let ex=W*sp.pxn,f=0;
  for(let i=0;i<3;i++){f=surf!=null?cl((base+ex+E-surf)/Math.max(2*E-(fl.b===I.cyl?1.4:.363)*d.V,1),0,1):0;ex=(W-.0098*d.V*f)*sp.pxn}
  d.rest=false;
  if(fl){const ymax=fl.y-E;if(base+ex>ymax){ex=Math.max(0,Math.min(ex,ymax-base));d.rest=true}}
  tg=ex;d.sf=f;d.surf=surf!=null&&f>0?surf:null;d.bk=fl&&fl.inside?fl.b:null;
  if(f>0){d.wet=true;if(!d.inW){d.inW=true;sfx('splash')}}else d.inW=false}
 else if(d){d.sf=0;d.surf=null;d.bk=null;d.rest=false}
 D.ev=(D.ev||0)*.55+(tg-D.ex)*.22;D.ex+=D.ev;if(Math.abs(tg-D.ex)<.05&&Math.abs(D.ev)<.05){D.ex=tg;D.ev=0}
 if(d&&D.rot===0){const damp=d.sf>0?.2:.03,th=D.th||0;D.tv=((D.tv||0)-.0076*Math.sin(th)-.45*ax/DH*Math.cos(th))*(1-damp);D.th=cl(th+D.tv,-.9,.9)}else{D.th=0;D.tv=0}
 D.sw=-SWK*(D.th||0);
 if(d&&!d.tw&&!(drag&&drag.it===d)){const hp=hookPos(D),fl=floorOf(d,hp.x),th=D.th||0,E=EXT(d);let nx=hp.x+DH*Math.sin(th),ny=hp.y+DH*Math.cos(th),rot=-th*180/Math.PI;
  if(fl){ny=Math.min(ny,fl.y-E);if(fl.inside&&ny+E>(fl.b===I.cyl?fl.b.y-190:fl.b.y-66)){const inn=(fl.b===I.cyl?28:37)-d.R;nx=cl(nx,fl.b.x-inn,fl.b.x+inn)}}
  if(d.x!==nx||d.y!==ny||d.rot!==rot){d.x=nx;d.y=ny;d.rot=rot;draw(d);if(LAB>=3&&d.bk===I.cyl)needLp=true}}
 if(d&&d.bk!==d._pb){d._pb=d.bk;fixZ();if(LAB>=3)needLp=true}
 if(Math.abs(prev-D.ex)>.001||Math.abs((D.sw||0)-(D._psw||0))>.0005){D._psw=D.sw;draw(D);if(LAB>=2)needLp=true}}
function dynPhys(){for(const D of DY())dynPhysOne(D)}
const bkT=b=>{const d=DY().map(D=>D.hang).find(x=>x&&x.bk===b);return d?b.w+d.V*d.sf:b.w};
function tick(t){
 const c=I.cyl;let fin=false;dynPhys();
 for(const it of all()){const w=it.tw;if(!w)continue;
  const p=Math.min(1,(t-w.t0)/w.ms),e=ease(p);
  it.x=w.x0+(w.x1-w.x0)*e;it.y=w.y0+(w.y1-w.y0)*e;it.rot=w.r0+(w.r1-w.r0)*e;
  if(p>=1){it.tw=null;fin=true}draw(it);if(it.k==='disc'&&(it.in||it.hung)&&LAB!==2)needLp=true}
 if(c.stand&&!c.tw&&!(drag&&drag.it===c)&&(c.x!==c.stand.x||c.y!==c.stand.y-STAND)){c.x=c.stand.x;c.y=c.stand.y-STAND;draw(c)}
 for(const d of all())if(d.k==='disc'){const tg=d.wet?1:0;if(d.wetA!==tg){d.wetA=tg>d.wetA?Math.min(tg,d.wetA+.08):Math.max(tg,d.wetA-.03);draw(d)}}
 for(const d of discs(c)){const ty=c.y+d.off;if(disp(c,d,d.y)>.05)d.touched=true;if(!d.tw&&!(drag&&drag.it===d)&&(d.x!==c.x||d.y!==ty)){d.x=c.x;d.y=ty;draw(d);needLp=true}}
 for(const it of [c,I.bk1,I.bk2]){const key=it===c?'lv':'dv',tg=it===c?lvl(c):bkT(it);
  if(it[key]!==tg){it[key]+=(tg-it[key])*.18;if(Math.abs(tg-it[key])<.05)it[key]=tg;draw(it);if(it===c)loupe()}}
 if(fin)sync();if(needLp){needLp=false;if(LAB!==2)loupe()}requestAnimationFrame(tick)}
function roll(){const rd=(c,t)=>c+(Math.random()*2-1)*t;for(const v of VARS){MS[v.id]=Math.round(rd(v.m[0],v.m[1])*100)/100;I[v.id].V=Math.round(rd(v.V[0],v.V[1])*10)/10}}
const LABS={1:{ttl:'Измерение плотности вещества',task:n=>`Используя весы, мензурку, стакан с водой, цилиндр №${n}, соберите установку для измерения плотности материала, из которого изготовлен цилиндр №${n}`,err:'Погрешность массы ±0,1 г, объёма ±2 см³',loupe:'Лупа: уровень воды'},3:{ttl:'Исследование зависимости архимедовой силы от объёма погружённой части тела',task:n=>`Используя динамометр №1, цилиндр №${n}, сосуд с водой, соберите экспериментальную установку для исследования зависимости выталкивающей силы от объёма погружённой части тела`,err:'Для этого последовательно погрузите цилиндр в воду на 1/4 часть объёма, на 1/2 часть объёма и полностью\nДля каждого погружения измерьте выталкивающую силу\nАбсолютную погрешность измерения веса цилиндра принять равной ±0,02 Н, а выталкивающей силы ±0,04 Н',loupe:'Лупа: уровень воды и шкала динамометра'},
2:{ttl:'Измерение архимедовой силы',task:n=>`Используя динамометр №1, стакан с водой, цилиндр №${n}, соберите экспериментальную установку для определения выталкивающей силы (силы Архимеда), действующей на цилиндр, полностью погружённый в воду`,err:'Абсолютная погрешность измерения силы равна ±0,02 Н',loupe:'Лупа: шкала динамометра'}};
const BLANK={1:['Сделайте рисунок экспериментальной установки для определения объёма тела','Запишите формулу для расчёта плотности','Укажите результаты измерения массы цилиндра и его объёма с учётом абсолютных погрешностей измерений','Запишите значение плотности материала цилиндра'],2:['Сделайте рисунок экспериментальной установки','Запишите формулу для расчёта выталкивающей силы','Укажите результаты прямых измерений силы с учётом абсолютной погрешности измерений','Запишите значение выталкивающей силы'],3:['Сделайте рисунок экспериментальной установки для измерения выталкивающей силы и запишите формулу для расчёта выталкивающей силы','Для каждого погружения укажите в таблице результаты измерений веса цилиндра в воздухе и веса цилиндра в воде, а также выталкивающей силы','Сформулируйте вывод о зависимости выталкивающей силы от объёма погружённой части тела']};
function updTask(){$('#tb').innerHTML=NBH('<b>В бланке ответов №2:</b>'+BLANK[LAB].map((x,i)=>`<div class="ln">${i+1}. ${x}</div>`).join(''));const n=I[TG].n,L=LABS[LAB];$('#tt').textContent=NBT(L.task(n));$('#te').textContent=NBT(L.err);$('#var').textContent='Вариант '+(vi+1)+' ▾';$('#ttl').textContent=NBT(`Комплект №1 · Лабораторная работа №${LAB} · ${L.ttl}`);$('#lt').textContent=NBT(L.loupe);$('#dr1').hidden=LAB!==1;$('#dr2').hidden=LAB!==2;$('#dr3').hidden=LAB!==3;document.querySelectorAll('.lab').forEach(b=>b.classList.toggle('on',+b.dataset.lab===LAB));document.title=`Лабораторная ОГЭ №${LAB}: ${L.ttl}`}
function setLab(n){if(n===LAB)return;try{if(typeof history!=='undefined'&&history.replaceState)history.replaceState(null,'','#'+n)}catch(e){}LAB=n;vi=0;TG=ORDER[n][0];U=[];R=[];P.massed=false;P.L0=P.L1=undefined;hid=null;init();FLD.forEach(f=>$('#'+f).value='');$('#res').innerHTML='';calc();loupe();BASE=snap();openVariants()}
function openVariants(){const m=$('#varm'),c=$('#vc');$('#vt').textContent=NBT(`Работа №${LAB}: выберите исследуемое тело`);$('#vs').textContent=NBT(LABS[LAB].ttl);
 if($('#vh'))$('#vh').innerHTML=$('#helpbody').innerHTML;
 c.innerHTML=ORDER[LAB].map((id,i)=>{const d=I[id],w=d.R*1.1;return `<button class="vcard" data-i="${i}"><svg viewBox="0 0 70 92" width="70" height="92"><ellipse cx="35" cy="82" rx="24" ry="6" fill="#000" opacity=".16"/><path d="M${35-w} 24V78A${w} 6 0 0 0 ${35+w} 78V24Z" fill="url(#gS${d.mat})" stroke="#555"/><ellipse cx="35" cy="24" rx="${w}" ry="6" fill="url(#gD${d.mat})" stroke="#555"/><ellipse cx="35" cy="15" rx="5" ry="4" fill="none" stroke="#444" stroke-width="2"/><circle cx="35" cy="52" r="9" fill="#ffe36a" stroke="#c9a400"/><text x="35" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#222">${d.n}</text></svg><b>Вариант ${i+1}</b><span>Цилиндр №${d.n}</span></button>`}).join('');
 if(c.querySelectorAll)c.querySelectorAll('.vcard').forEach(b=>b.onclick=()=>{$('#varm').hidden=true;sfx('blip');newVariant(+b.dataset.i)});
 m.hidden=false}
function newVariant(i){vi=i;TG=ORDER[LAB][i];U=[];R=[];P.massed=false;P.L0=P.L1=undefined;FLD.forEach(f=>$('#'+f).value='');$('#res').innerHTML='';updTask();sync()}
function init(){
 svg.querySelectorAll('.it').forEach(n=>n.remove());I={};
 const mk=(id,c)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','it'+(c?' nf':''));g.dataset.id=id;svg.appendChild(g);return g};
 for(const id in KIND){const[h,v,r]=HOME[id];
  I[id]={id,k:KIND[id],x:h,y:v,rot:r||0,hx:h,hy:v,hr:r||0,w:0,lv:0,dv:0,in:null,stand:null,thread:false,wet:false,wetA:0,tw:null,press:null,n:{d4:4,d2:2,d1:1}[id],V:25,off:0,ex:0,ev:0,hang:null,hung:false,site:null,touched:false,sw:0,sf:0,surf:null,bk:null,inW:false,rest:false,R:id==='d4'?18:15.5,mat:id==='d1'?3:2,g:mk(id)};I[id].g.id='i_'+id;
  if(id==='hex')I[id].f=mk(id);if(id==='cyl')I[id].f=mk(id,1)}
 I.bk1.w=I.bk1.dv=200;roll();light=true;on=false;tare=0;updTask();
 $('#slots').innerHTML=all().map(it=>{const c={...it,w:0,dv:0,lv:0,thread:false,wet:false,in:null};return `<g filter="url(#slot)" transform="translate(${it.hx} ${it.hy}) rotate(${it.hr})">${body(c)}${it.id==='hex'?hexFront(c):it.id==='cyl'?cylFront(c):''}</g>`}).join('');
 $('#shadows').innerHTML=Object.keys(SHD).map(id=>`<path data-s="${id}" fill="#000" filter="url(#bl2)" opacity="0"/>`).join('');
 Object.keys(SHD).forEach(id=>I[id].sh=$(`#shadows [data-s="${id}"]`));
 sync()}
const FLD=['m','dm','v1','v2','vv','dv','r','p1','dp1','p2','dp2','fa','q1','eq1','qa','eqa','qb','eqb','qc','eqc','ra','era','rb','erb','rc','erc','qn'];
function snap(){const o={};for(const id in I){const it=I[id],w=it.tw;o[id]={x:w?w.x1:it.x,y:w?w.y1:it.y,r:w?w.r1:it.rot,w:it.w,i:it.in?it.in.id:null,s:!!it.stand,t:it.thread,e:it.wet,of:it.off,hg:it.hang?it.hang.id:null,hu:it.hung,sit:it.site}}
 return JSON.stringify({o,on,tare,lt:light,f:FLD.map(i=>$('#'+i).value)})}
function restore(str){const S=JSON.parse(str);
 for(const id in S.o){const a=S.o[id],it=I[id];it.w=a.w;it.in=a.i?I[a.i]:null;it.stand=a.s?I.hex:null;it.thread=a.t;it.wet=a.e;it.off=a.of||0;it.hang=a.hg?I[a.hg]:null;it.hung=!!a.hu;it.site=a.sit==null?null:a.sit;if(!it.hung){it.surf=null;it.sf=0}go(it,a.x,a.y,a.r,380)}
 on=S.on;tare=S.tare;light=S.lt!==false;FLD.forEach((i,n)=>$('#'+i).value=S.f[n]);$('#res').innerHTML='';sync()}
let BASE;
function commit(pre){if(pre!==snap()){U.push(pre);if(U.length>100)U.shift();R=[];upd()}}
function act(fn){const s=snap();fn();sync();commit(s)}
function undo(){if(!U.length)return;sfx('blip');R.push(snap());restore(U.pop())}
function redo(){if(!R.length)return;sfx('blip');U.push(snap());restore(R.pop())}
function reset(){const s=snap();P.massed=false;P.L0=P.L1=undefined;roll();restore(BASE);commit(s)}
function upd(){$('#undo').disabled=!U.length;$('#redo').disabled=!R.length}
function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function toast(t){sfx('err');$('#toast').textContent=NBT(t);clearTimeout(tT);tT=setTimeout(()=>$('#toast').textContent='',5000)}
function applyVb(){vb.w=cl(vb.w,300,1000);vb.h=vb.w*VH/1000;vb.x=cl(vb.x,0,1000-vb.w);vb.y=cl(vb.y,0,VH-vb.h);svg.setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`)}
function zoom(fc,p){const w=cl(vb.w*fc,300,1000),h=w*VH/1000;vb.x=p.x-(p.x-vb.x)*w/vb.w;vb.y=p.y-(p.y-vb.y)*h/vb.h;vb.w=w;applyVb()}
svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.87:1.15,pt(e))},{passive:false});
const mid=()=>({x:vb.x+vb.w/2,y:vb.y+vb.h/2});
$('#zi').onclick=()=>zoom(.8,mid());$('#zo').onclick=()=>zoom(1.25,mid());$('#zr').onclick=()=>{vb={x:0,y:0,w:1000,h:VH};applyVb()};
function hl(id){if(hid===id)return;if(hid){const o=I[hid];o.g.classList.remove('hl');if(o.f)o.f.classList.remove('hl')}hid=id;if(id){const o=I[id];o.g.classList.add('hl');if(o.f)o.f.classList.add('hl')}}
const nameOf=id=>/^bk/.test(id)?(I[id].w>0?'Стакан с водой':'Пустой стакан'):NAME[id];
function hideTip(){clearTimeout(tipT);$('#tip').hidden=true}
function hover(e){const g=e.target.closest('.it'),id=g?g.dataset.id:null;
 clearTimeout(tipT);if(id!==hid||Math.hypot(e.clientX-lx,e.clientY-ly)>2)hideTip();
 hl(id);lx=e.clientX;ly=e.clientY;
 if(id)tipT=setTimeout(()=>{const el=document.elementFromPoint(lx,ly),g2=el&&el.closest&&el.closest('.it');
  if(!g2||g2.dataset.id!==id)return;const t=$('#tip');t.textContent=NBT(nameOf(id));t.style.left=lx+14+'px';t.style.top=ly+20+'px';t.hidden=false},550)}
svg.addEventListener('pointerleave',()=>{hl(null);hideTip()});
svg.addEventListener('pointerdown',e=>{
 if(e.button)return;hideMenu();hideTip();const g=e.target.closest('.it');
 if(!g){drag={pan:true,cx:e.clientX,cy:e.clientY};svg.setPointerCapture(e.pointerId);return}
 const it=I[g.dataset.id],p=pt(e);it.tw=null;
 drag={it,ox:p.x-it.x,oy:p.y-it.y,sx:p.x,sy:p.y,fx:it.x,fy:it.y,fr:it.rot,moved:false,act:e.target.dataset.act,snap:snap(),site0:it.site,riders:it.id==='sc'?all().filter(onPan):[]};if(it.site!=null)it.site=null;
  svg.setPointerCapture(e.pointerId);svg.appendChild(it.g);drag.riders.forEach(r=>svg.appendChild(r.g));
 if(drag.act){it.press=drag.act;draw(it)}else sfx('pick');
 fixZ()});
svg.addEventListener('pointermove',e=>{
 if(!drag){hover(e);return}
 if(drag.pan){const r=svg.getBoundingClientRect();vb.x-=(e.clientX-drag.cx)*vb.w/r.width;vb.y-=(e.clientY-drag.cy)*vb.h/r.height;drag.cx=e.clientX;drag.cy=e.clientY;applyVb();return}
 const p=pt(e),it=drag.it;
 if(!drag.moved){if(Math.hypot(p.x-drag.sx,p.y-drag.sy)<5)return;drag.moved=true;it.g.classList.add('drag');
  if(it.press){it.press=null;draw(it)}if(drag.act)sfx('pick');
  if(it.hung){const H0=holder(it);if(H0)H0.hang=null;it.hung=false;it.surf=null;it.sf=0;it.inW=false;it.rot=0}
  if(it.in){it.in=null;it.wet=it.wet||!!it.touched;it.touched=false;sync();svg.appendChild(it.g)}}
 const nx=cl(p.x-drag.ox,25,975),ny=cl(p.y-drag.oy,25,VH-25),dx=nx-it.x,dy=ny-it.y;it.x=nx;it.y=ny;
 if(it.id==='sc')drag.riders.forEach(r=>{const q=siteXY(r,r.site);r.x=q.x;r.y=q.y;setT(r)});
 if(it.id==='cyl'||it.id==='dyn')it.rot=-90*(1-cl(Math.hypot(it.x-it.hx,it.y-it.hy)/170,0,1));
 if(it.k==='disc'||it.id==='hex'||it.id==='cyl')draw(it);else setT(it);

 draw(I.sc)});
svg.addEventListener('pointerup',e=>{
 if(!drag)return;const d=drag;drag=null;if(d.pan)return;
 const it=d.it;it.g.classList.remove('drag');hl(null);hideTip();
 if(it.press)it.press=null;
 if(!d.moved){if(d.site0!=null&&!d.act&&it.site==null)placeOnScale(it);if(d.act)sfx('click');if(d.act==='pw'){on=!on;tare=0;light=true;sfx(on?'on':'off')}else if(d.act==='tr'&&on){tare+=reading();sfx('tare')}else if(d.act==='lt'&&on)light=!light;sync();commit(d.snap);return}
 drop(it,d);sync();commit(d.snap)});
function sendHome(it){const c=I.cyl;
 if(it.id==='cyl'&&(c.w>0||discs(c).length))return toast('Сначала достаньте тело и слейте воду из мензурки'),false;
 if(it.id==='hex'&&c.stand===it)return toast('Сначала уберите мензурку из опоры'),false;
 if(it.id==='sc'&&all().some(onPan))return toast('Снимите предметы с весов'),false;
 if(it.k==='dyn'&&it.hang)return toast('Сначала снимите груз с динамометра'),false;
 if(it.k==='disc'&&it.hung){const H0=holder(it);if(H0)H0.hang=null;it.hung=false;it.surf=null;it.sf=0}
 it.site=null;
 if(it.k==='disc'&&it.in)return false;
 if(it.id==='cyl')it.stand=null;
 sfx('snap');go(it,it.hx,it.hy,it.hr);return true}
function hookOn(it,D0){const D=D0||DY().find(x=>x.rot===0&&!x.hang&&!inTray(x));if(!D||D.rot!==0||inTray(D)||it.in)return;
 if(D.hang&&D.hang!==it){toast('На крючке динамометра уже есть груз');return}
 D.hang=it;it.hung=true;it.site=null;D.th=0;D.tv=0;const hp=hookPos(D);go(it,hp.x,hp.y+DH,0,350);sfx('clink')}
function drop(it,d){
 const c=I.cyl;
 if(Math.hypot(it.x-it.hx,it.y-it.hy)<70&&sendHome(it))return;
 if(it.id==='cyl'){const h=I.hex;
  if(!inTray(h)&&Math.abs(it.x-h.x)<80&&Math.abs(it.y+STAND-h.y)<90){it.stand=h;go(it,h.x,h.y-STAND,0,550);later(()=>sfx('clink'),480);return}
  toast('Мензурка без опоры упадёт: поставьте на стол синюю опору и вставьте мензурку в неё');go(it,d.fx,d.fy,d.fr);return}
 if(it.id==='hex'){sfx('tap');return}
 if(it.k==='dyn'){if(it.rot!==0)go(it,it.x,it.y,0,300);sfx('tap');return}
 {const Dh=it.k==='disc'&&!it.in?DY().find(D=>D.rot===0&&!D.hang&&!inTray(D)&&Math.hypot(it.x-hookPos(D).x,it.y-27-hookPos(D).y)<46):null;if(Dh){hookOn(it,Dh);return}}
 if(it.k==='disc'&&c.stand&&Math.abs(it.x-c.x)<45&&it.y>c.y-260&&it.y<c.y+175){
  if(!it.thread){toast('Опускать тело в мензурку без нитки нельзя: можно разбить стекло. Привяжите нитку');go(it,d.fx,d.fy);return}
  const E=EXT(it),want=175-(c.w+it.V)*1.4+1.4+E,floor=175-E,full=c.w>0&&want<=floor;
  it.off=full?want:floor;it.in=c;it.site=null;it.touched=false;it.x=c.x;it.y=c.y-190-E-14;go(it,c.x,c.y+it.off,0,950);
  if(c.w>0&&!full)toast('Тело погружено не полностью: воды слишком мало');
  spill();later(()=>sfx(c.w>0?'splash':'tap'),c.w>0?480:900);return}
 if(it.id==='thr'){const t=['d4','d2','d1'].map(i=>I[i]).find(x=>!x.in&&Math.hypot(x.x-it.x,x.y-it.y)<50);
  if(t){all().forEach(x=>x.thread=false);t.thread=true;it.site=null;sfx('tie');return}}
 if(WEIGH.has(it.k)){const g=scG(I.sc),pc=panC(),dyL=Math.max(26,36*g.ky*SS+8);
  if(Math.abs(it.x-pc.x)<=34+rOf(it)*.6&&Math.abs(it.y+BOT(it)-pc.y)<=dyL){if(placeOnScale(it))sfx('tap');else pushAside(it);return}}
 sfx('tap')}
function spill(){const c=I.cyl;let n=0;while(lvlF(c)>250&&c.w>0){c.w--;n++}if(n)toast('Вода перелилась через край')}
const cylBusy=()=>{const c=I.cyl;return discs(c).length>0||DY().some(D=>D.hang&&D.hang.bk===c)};
const busyMsg=()=>{const filled=LAB===1&&($('#v1').value.trim()||$('#v2').value.trim()||$('#vv').value.trim());toast('Нельзя доливать или отливать воду, пока в мензурке находится цилиндр: сначала уберите его'+(filled?'. Если значения объёма уже записаны в разделе «Измерения», обновите их после изменения уровня воды':''))};
function pour(b,n){if(cylBusy()){busyMsg();return}sfx('pour',Math.abs(n));act(()=>{const c=I.cyl,k=I[b];
 if(n>0){const a=Math.min(n,k.w);c.w+=a;k.w-=a}else{const a=Math.min(-n,c.w,300-k.w);c.w-=a;k.w+=a}spill()})}
function bar(){barInner();const th=I.thr;if(th.site!=null&&!scaleBusy()&&!th.in){$('#fh').textContent=NBT('Нить настолько мала, что её вес и объём не выходят за пределы точности измерений, поэтому они равны нулю')}}
function barInner(){
 const c=I.cyl,b=$('#bar'),fh=$('#fh'),idle=t=>{fh.textContent=LAB===2?'':NBT(t);b.innerHTML=''};
 if(!c.stand){idle('Мензурка устойчива только на опоре: сначала поставьте опору на стол, а затем вставьте в неё мензурку');return}
 const k=['bk1','bk2'].map(i=>I[i]).find(x=>Math.abs(x.x-c.x)<28*1.1+42&&Math.abs(x.y-c.y)<230);
 if(!k){idle('Поднесите стакан к мензурке — появятся кнопки переливания воды');return}
  const busy=cylBusy();fh.textContent=busy?NBT('Уберите цилиндр из мензурки, чтобы менять количество воды'):'';
  const B=(cls,lab,n,v)=>`<button class="${cls}" ${busy?'disabled':''} onclick="pour('${k.id}',${n})"><small>${lab}</small><span>${v} мл</span></button>`;
  const ph=((typeof performance!=='undefined'?performance.now():0)/1000)%1.2;
  b.innerHTML=`<div class="pc"><div class="flow${busy?' off':''}"><div class="fi"><svg viewBox="0 0 30 40" width="30" height="40"><path d="M3 6L6 36Q6 38 8 38L22 38Q24 38 24 36L27 6" fill="#e6f2f8" stroke="#7d93a3" stroke-width="2"/><path d="M5 22L7 36L23 36L25 22Z" fill="#4aa3e0" opacity=".75"/></svg><span class="arr"><i style="animation-delay:-${ph.toFixed(2)}s"></i><i style="animation-delay:-${(ph-.2).toFixed(2)}s"></i><i style="animation-delay:-${(ph-.4).toFixed(2)}s"></i></span><svg viewBox="0 0 22 40" width="22" height="40"><rect x="5" y="2" width="12" height="30" rx="2" fill="#e6f2f8" stroke="#7d93a3" stroke-width="2"/><rect x="6" y="16" width="10" height="15" fill="#4aa3e0" opacity=".75"/><rect x="3" y="26" width="16" height="9" rx="1.5" fill="#6f89f0" stroke="#2a3fa0" stroke-width="1.2"/><rect x="1" y="34" width="20" height="5" rx="2" fill="#2f46b8" stroke="#1c2a78" stroke-width="1"/></svg></div><div class="ft">Переливание воды</div></div><div class="pg">${B('g1','налить',10,'10')}${B('g2','налить',1,'1')}${B('b1','отлить',-10,'10')}${B('b2','отлить',-1,'1')}</div></div>`}
function menu(it){const m=[],c=I.cyl,away=Math.hypot(it.x-it.hx,it.y-it.hy)>3;
 if(it.k==='disc'){
  if(it.hung)m.push(['Снять с динамометра',()=>{const H0=holder(it);if(H0)H0.hang=null;it.hung=false;it.surf=null;it.sf=0;go(it,it.x+60,it.y+20,0)}]);
  else if(!it.in&&DY().some(D=>D.rot===0&&!D.hang&&!inTray(D)))m.push(['Повесить на динамометр',()=>{hookOn(it)}]);
  if(it.in)m.push(['Вынуть из воды',()=>{it.in=null;it.wet=it.wet||!!it.touched;it.touched=false;go(it,c.x+75,c.y+130)}]);
  if(it.wet)m.push(['Протереть салфеткой',()=>{it.wet=false;sfx('swish')}]);
  if(it.thread)m.push(['Снять нитку',()=>{it.thread=false;I.thr.x=it.x+60;I.thr.y=it.y+30}]);
  else if(!all().some(d=>d.thread))m.push(['Привязать нитку',()=>{it.thread=true;sfx('tie')}])}
 if(it.id==='cyl'&&c.w>0)m.push(['Вылить воду',()=>{if(cylBusy()){busyMsg();return}c.w=0}]);
 if(it.k==='beaker'){m.push(['Вылить воду',()=>{it.w=0}]);m.push(['Налить воду ('+K('200\\ \\text{мл}')+')',()=>{it.w=200}])}
 if(it.id==='hex'&&c.stand===it)m.push(['Разобрать: мензурку — в кейс',()=>{sendHome(c)}]);
 if(it.id==='sc'){m.push([on?'Выключить':'Включить',()=>{on=!on;tare=0}]);if(on)m.push(['Обнулить (TARE)',()=>{tare+=reading()}])}
 if(away&&!it.in)m.push(['Положить в кейс',()=>{sendHome(it)}]);
 return m}
function hideMenu(){$('#cm').hidden=true}
svg.addEventListener('contextmenu',e=>{e.preventDefault();hideMenu();hideTip();const g=e.target.closest('.it');if(!g)return;
 const list=menu(I[g.dataset.id]);if(!list.length)return;const m=$('#cm');m.innerHTML='';
 list.forEach(([t,fn])=>{const b=document.createElement('button');b.innerHTML=NBH(t);b.onclick=()=>{hideMenu();act(fn)};m.appendChild(b)});
 m.style.left=Math.min(e.clientX,innerWidth-230)+'px';m.style.top=e.clientY+'px';m.hidden=false});
addEventListener('scroll',hideMenu);
addEventListener('keydown',e=>{
 if(e.key==='Escape'){hideMenu();$('#help').hidden=true;$('#tosm').hidden=true;$('#varm').hidden=true;return}
 const inp=/INPUT|TEXTAREA/.test(e.target.tagName),mod=e.ctrlKey||e.metaKey;
 if(mod&&e.code==='KeyZ'&&!inp){e.preventDefault();e.shiftKey?redo():undo()}
 else if(mod&&e.code==='KeyY'&&!inp){e.preventDefault();redo()}
 else if(e.altKey&&e.code==='KeyR'){e.preventDefault();reset()}
 else if(e.altKey&&e.code==='KeyH'){e.preventDefault();showHint()}
 else if(e.altKey&&e.code==='KeyM'){e.preventDefault();toggleSnd()}});
$('#qno').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.opt');if(!b)return;const v=b.dataset.v;act(()=>{$('#qn').value=$('#qn').value===v?'':v});sfx('click')});
$('#varm').addEventListener('click',e=>{if(e.target.id==='varm')e.target.hidden=true});
$('#tos').onclick=e=>{e.preventDefault();$('#tosm').hidden=false};$('#tx').onclick=()=>$('#tosm').hidden=true;$('#tosm').addEventListener('click',e=>{if(e.target.id==='tosm')e.target.hidden=true});
$('#hp').onclick=()=>$('#help').hidden=false;$('#hx').onclick=()=>$('#help').hidden=true;$('#help').addEventListener('click',e=>{if(e.target.id==='help')e.target.hidden=true});
document.querySelectorAll('.lab').forEach(b=>b.onclick=()=>{if(+b.dataset.lab!==LAB){sfx('blip');setLab(+b.dataset.lab)}});
$('#snd').onclick=toggleSnd;sndUI();
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#cm,#var'))hideMenu()});
$('#var').onclick=e=>{e.stopPropagation();const m=$('#cm'),r=e.currentTarget.getBoundingClientRect();m.innerHTML='';
 ORDER[LAB].map(id=>({id})).forEach((v,i)=>{const b=document.createElement('button');b.textContent=`Вариант ${i+1} — цилиндр №${I[v.id].n}`+(i===vi?' ✓':'');b.onclick=()=>{hideMenu();sfx('blip');newVariant(i)};m.appendChild(b)});
 m.style.left=Math.min(r.left,innerWidth-260)+'px';m.style.top=r.bottom+6+'px';m.hidden=false};
$('#undo').onclick=undo;$('#redo').onclick=redo;$('#rst').onclick=reset;$('#hnt').onclick=showHint;
function hintText(){return LAB===2?hintText2():LAB===3?hintText3():hintText1()}
function hintText3(){const h=I.hex,c=I.cyl,D=activeDyn(),d=D.hang,n=I[TG].n,v=i=>$('#'+i).value.trim();
 if(inTray(h)&&!c.stand)return'Достаньте из кейса синюю опору мензурки и поставьте её на стол: мензурка нужна, чтобы измерять объём погружённой части';
 if(!c.stand)return'Достаньте мензурку из кейса и вставьте её в гнездо опоры';
 if(D.rot!==0)return'Достаньте динамометр из кейса: он займёт вертикальное положение';
 if(!d)return`Повесьте цилиндр №${n} на крючок динамометра: поднесите цилиндр колечком к крючку`;
 if(d.id!==TG)return`Для этого варианта нужен цилиндр №${n}: снимите груз (правая кнопка мыши) и повесьте нужный`;
 if(c.w<60)return'Налейте в мензурку воды, например 100 мл: поднесите стакан к мензурке';
 if(!v('q1')||!v('eq1'))return'Снимите показание динамометра в воздухе (лупа поможет) и запишите '+K('P_1');
 if(d.rest)return'Цилиндр касается дна: приподнимите динамометр';
 if(!v('qc')&&!v('qa')&&!v('qb'))return'Объём цилиндра равен подъёму уровня воды при полном погружении. Измерьте его, затем найдите погружения на 1/4 и 1/2 объёма';
 if(!v('qa')||!v('eqa'))return'Погрузите цилиндр на 1/4 объёма: уровень воды в мензурке должен подняться на четверть объёма цилиндра. Запишите '+K('P_2');
 if(!v('qb')||!v('eqb'))return'Погрузите цилиндр на 1/2 объёма и запишите '+K('P_2');
 if(!v('qc')||!v('eqc'))return'Погрузите цилиндр полностью (не касаясь дна) и запишите '+K('P_2');
 if(!v('ra')||!v('rb')||!v('rc')||!v('era')||!v('erb')||!v('erc'))return'Вычислите выталкивающую силу для каждого погружения самостоятельно и запишите значения';
 if(!v('qn'))return'Сформулируйте вывод о зависимости: выберите подходящий вариант';
 return'Всё готово: нажмите «Проверить»'}
function hintText2(){const D=activeDyn(),d=D.hang,n=I[TG].n,v=i=>$('#'+i).value.trim();
 if(D.rot!==0)return'Достаньте динамометр из кейса: он займёт вертикальное положение';
 if(!d)return`Повесьте цилиндр №${n} на крючок динамометра: поднесите цилиндр колечком к крючку`;
 if(d.id!==TG)return`Для этого варианта нужен цилиндр №${n}: снимите груз (правая кнопка мыши) и повесьте нужный`;
 if((!v('p1')||!v('dp1'))&&d.sf===0)return'Снимите показание динамометра (лупа поможет) и запишите '+K('P_1')+' с погрешностью из условия';
 if(d.rest)return'Цилиндр касается дна: приподнимите динамометр, чтобы цилиндр висел в воде';
 if(d.sf<.999)return'Опустите динамометр с цилиндром в стакан с водой: цилиндр должен полностью погрузиться и не касаться дна';
 if(!v('p2')||!v('dp2'))return'Снимите показание динамометра при погружённом цилиндре и запишите '+K('P_2')+' с погрешностью из условия';
 if(!v('fa'))return'Вычислите выталкивающую силу самостоятельно и запишите значение';
 return'Всё готово: нажмите «Проверить»'}
function hintText1(){const h=I.hex,c=I.cyl,t=I[TG],n=t.n,v=i=>$('#'+i).value.trim();
 if(inTray(h)&&!c.stand)return'Достаньте из кейса синюю опору мензурки и поставьте её на рабочий стол';
 if(!c.stand)return'Достаньте мензурку из кейса и вставьте её в цилиндрическое гнездо опоры';
 if(!P.massed)return on?`Положите цилиндр №${n} (цифра ${n} на цилиндре) на площадку весов; цилиндр должен быть сухим`:'Сначала измерьте массу цилиндра: включите весы кнопкой ON/OFF';
 if(!v('m')||!v('dm'))return'Запишите массу цилиндра с погрешностью из условия: '+K('m')+'. Погрешность переносится из условия без изменений';
 if(c.w<60&&!t.in)return'Налейте в мензурку удобное количество воды, например 100 мл: поднесите стакан к мензурке';
 if(!v('v1'))return'Снимите по шкале (лупа поможет) начальный объём воды и запишите '+K('V_1')+' до погружения цилиндра. Цена деления 2 мл: записывайте значение шкалы, например 74 или 76, а не 75';
 if(!t.in&&!t.thread)return`Привяжите нитку к колечку цилиндра №${n}: перетащите катушку на цилиндр`;
 if(!t.in)return`Плавно опустите цилиндр №${n} на нитке в воду, чтобы он полностью погрузился`;
 if(!v('v2'))return'Снимите новое показание мензурки и запишите '+K('V_2');
 if(!v('vv')||!v('dv'))return'Вычислите объём цилиндра по показаниям мензурки и запишите его вместе с погрешностью из условия';
 if(!v('r'))return'Вычислите плотность самостоятельно и запишите ответ в '+K('\\text{г/см}^3');
 return'Всё готово: нажмите «Проверить»'}
let hT2;function showHint(){sfx('blip');const b=$('#hintbox');b.innerHTML='💡 '+NBH(hintText());b.hidden=false;b.style.opacity=1;clearTimeout(hT);clearTimeout(hT2);hT=setTimeout(()=>{b.style.opacity=0},6000);hT2=setTimeout(()=>{b.hidden=true},7000)}
function loupe(){const t=$('#lp');t.innerHTML=LAB===1?lpV():LAB===2?lpD():'<div class="pair"><div class="slot">'+lpV()+'</div><div class="slot">'+lpD()+'</div></div>'}
function lpD(){const D=activeDyn(),t=$('#lp'),FS=LAB===3?2:1;if(D.rot!==0){return'<span class="hint">Достаньте динамометр из кейса</span>'}
 const F=D.ex/SPEC[D.id].pxn,k=1000,Y=v=>150+(v-F)*k;
 let s=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet"><rect x="10" y="0" width="180" height="300" rx="4" fill="#f7f8f9" stroke="#8a8f95" stroke-width="2"/><text x="182" y="${6+12*FS}" text-anchor="end" font-size="${13*FS}" fill="#222">Н</text>`;
 for(let i=Math.max(0,Math.ceil((F-.16)/.02-1e-9));i*.02<=F+.16;i++){const v=i*.02,y=Y(v),mj=i%5===0;s+=`<line x1="12" x2="${mj?46:28}" y1="${y}" y2="${y}" stroke="#222" stroke-width="${mj?1.6:1}"/>`;if(mj)s+=`<text x="54" y="${y+4*FS}" font-size="${12*FS}" fill="#222">${v.toFixed(1).replace('.',',')}</text>`}
 return s+`<rect x="12" y="148.5" width="176" height="3" fill="#d22"/><path d="M12 140L26 150L12 160Z" fill="#d22"/></svg>`}
function lpV(){
 const c=I.cyl,t=$('#lp');if(!c.stand){return'<span class="hint">Мензурка не установлена в опору</span>'}
 const L=c.lv,k=4.5,FS=LAB===3?2:1,Y=v=>150-(v-L)*k,ml=y=>(c.y+175-y)/1.4,y0=Y(0);
 let s=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">`+(y0>0?`<rect x="10" y="0" width="180" height="${Math.min(300,y0)}" rx="4" fill="#e6f4f8" fill-opacity=".5" stroke="#7ea6b4" stroke-width="2"/>`:'')+(y0<=300?`<rect x="6" y="${y0-1}" width="188" height="5" rx="2" fill="#7ea6b4"/>`:'')+`<text x="182" y="${6+12*FS}" text-anchor="end" font-size="${13*FS}" fill="#2c4a57">мл</text>`;
  for(const d of all().filter(x=>x.in===c||(x.hung&&x.bk===c))){const w=d.R*180/56,ry=w*.35,top=Y(ml(d.y-EXT(d))),bot=Y(ml(d.y+EXT(d))),yt=top+ry,yb=bot-ry;
   if(bot>0&&top<300){const cy=Math.min(Math.max((yt+yb)/2,20),280);
    s+=`<path d="M${100-w} ${yt}V${yb}A${w} ${ry} 0 0 0 ${100+w} ${yb}V${yt}Z" fill="url(#gS${d.mat})" stroke="#555" stroke-width="2"/><ellipse cx="100" cy="${yt}" rx="${w}" ry="${ry}" fill="url(#gD${d.mat})" stroke="#555" stroke-width="2"/>`;
    if(d.hung)s+=`<path d="M100 ${yt-ry*.8}V0" stroke="#555" stroke-width="2.5" fill="none"/>`;else if(d.thread)s+=`<path d="M100 ${yt-ry*.8}C104 ${top*.6} 96 ${top*.3} 101 0" fill="none" stroke="#222" stroke-width="2.5"/><ellipse cx="100" cy="${yt-ry*.6}" rx="7" ry="4" fill="none" stroke="#444" stroke-width="2.5"/>`;
    s+=`<circle cx="100" cy="${cy}" r="14" fill="#ffe36a" stroke="#c9a400"/><text x="100" y="${cy+5.5}" text-anchor="middle" font-size="16" font-weight="700" fill="#222">${d.n}</text>`}}
 if(L>0)s+=`<rect x="12" y="150" width="176" height="${Math.min(148,L*k)}" fill="#3d9be0" fill-opacity=".45"/><path d="M12 147Q100 155 188 147" stroke="#1d6fb5" fill="none" stroke-width="2"/>`;
 for(let v=Math.max(0,Math.ceil((L-34)/2)*2);v<=Math.min(250,L+34);v+=2){const y=Y(v),l=v%10?18:34;
  s+=`<line x1="12" x2="${12+l}" y1="${y}" y2="${y}" stroke="#2c4a57" stroke-width="${v%10?1:1.5}"/>`;if(v%10==0)s+=`<text x="52" y="${y+4*FS}" font-size="${12*FS}" fill="#2c4a57">${v}</text>`}
 if(L<=0)s+=`<line x1="12" x2="188" y1="150" y2="150" stroke="#1d6fb5"/>`;
 return s+'</svg>'}
function calc(){}
FLD.forEach(i=>$('#'+i).addEventListener('input',calc));
const TOL={m:3,V:6,F:.06,dm:.1,dV:2,dP:.02,dF:.04};
const same=(a,b)=>Math.abs(a-b)<=1e-9,okN=x=>Number.isFinite(x)&&x!==0;
function finish(o,all_ok){setRes(o.join(''));sfx(all_ok?'ok':'bad')}
function mkAdd(o,st){return(ok,t)=>{if(!ok)st.bad=true;o.push(`<div class="${ok?'ok':'er'}">${ok?'✓':'✗'} ${t}</div>`)}}
function check1(){const m=num($('#m').value),dm=num($('#dm').value),a=num($('#v1').value),b=num($('#v2').value),V=num($('#vv').value),dV=num($('#dv').value),r=num($('#r').value),o=[],st={bad:false},add=mkAdd(o,st);
 if(!okN(m)||!okN(dm)||!Number.isFinite(a)||!okN(b)||!okN(V)||!okN(dV)||!okN(r)){setRes('<div class="er">Заполните все поля раздела «Измерения»</div>');sfx('err');return}
 const tg=I[TG],n=tg.n,mt=MS[TG],Vt=tg.V,tm=TOL.m+1e-9,tV=TOL.V+1e-9;
 const other=['d1','d2','d4'].find(id=>id!==TG&&Math.abs(m-MS[id])<=tm);
 if(Math.abs(m-mt)<=tm)add(1,`Масса цилиндра №${n} измерена верно`);
 else if(other)add(0,`Это масса цилиндра №${I[other].n}, а не №${n}`);
 else add(0,`Масса не соответствует цилиндру №${n}. Измерьте её на весах`);
 add(same(dm,TOL.dm),same(dm,TOL.dm)?'Погрешность массы перенесена из условия верно':'Погрешность массы указана неверно: перенесите её из условия, '+K('\\pm 0{,}1\\ \\text{г}'));
 const par=(x,sym)=>{if(Number.isInteger(x)&&x%2===0)return true;const lo=Math.floor(x/2)*2;add(0,`Показание ${K(sym)} = ${K(f(x,Number.isInteger(x)?0:1)+'\\ \\text{мл}')} записано неверно: цена деления мензурки 2 мл, запишите значение шкалы: ${lo} или ${lo+2}`);return false};
 const okA=par(a,'V_1'),okB=par(b,'V_2');if(okA&&okB)add(1,'Показания мензурки записаны с учётом цены деления 2 мл');
 if(okA&&P.L0!==undefined&&Math.abs(a-P.L0)>2+1e-9)add(0,'Показание '+K('V_1')+' не соответствует уровню воды до погружения цилиндра');
 if(okB&&P.L1!==undefined&&Math.abs(b-P.L1)>2+1e-9)add(0,'Показание '+K('V_2')+' не соответствует уровню воды после погружения цилиндра');
 if(Math.abs(V-Vt)<=tV)add(1,`Объём цилиндра ${K('V='+f(V,Number.isInteger(V)?0:1)+'\\ \\text{см}^3')} найден верно`);
 else add(0,V<=0?'Объём цилиндра должен быть положительным':`Объём цилиндра ${K('V='+f(V,Number.isInteger(V)?0:1)+'\\ \\text{см}^3')} не соответствует измерению. Проверьте отсчёты по мензурке и полное погружение`);
 add(same(dV,TOL.dV),same(dV,TOL.dV)?'Погрешность объёма перенесена из условия верно':'Погрешность объёма указана неверно: перенесите её из условия, '+K('\\pm 2\\ \\text{см}^3'));
 const q=V>0?m/V:0;
 if(r>100)add(0,'Ответ должен быть в '+K('\\text{г/см}^3')+': число '+K(f(r,0))+' похоже на значение в '+K('\\text{кг/м}^3')+'. Переведите единицы');
 else if(!(q>0&&Math.abs(r-q)<=.02*q+1e-9))add(0,'Ответ не согласуется с вашими значениями массы и объёма. Проверьте расчёт');
 else if(r<(mt-TOL.m)/(Vt+TOL.V)-1e-9||r>(mt+TOL.m)/(Vt-TOL.V)+1e-9)add(0,'Плотность выходит за допустимый диапазон');
 else add(1,'Плотность найдена верно');
 finish(o,!st.bad)}
function check2(){const p1=num($('#p1').value),d1=num($('#dp1').value),p2=num($('#p2').value),d2=num($('#dp2').value),fa=num($('#fa').value),o=[],st={bad:false},add=mkAdd(o,st);
 if(!okN(p1)||!okN(d1)||!okN(p2)||!okN(d2)||!okN(fa)){setRes('<div class="er">Заполните все поля раздела «Измерения»</div>');sfx('err');return}
 const tg=I[TG],n=tg.n,W=MS[TG]*G/1000,B=.0098*tg.V,P2=W-B,t=TOL.F+1e-9;
 const other=VARS.map(v=>v.id).find(id=>id!==TG&&Math.abs(p1-MS[id]*G/1000)<=t);
 if(Math.abs(p1-W)<=t)add(1,`Вес цилиндра №${n} в воздухе ${K('P_1='+f(p1)+'\\ \\text{Н}')} измерен верно`);
 else if(other)add(0,`Это вес цилиндра №${I[other].n}, а не №${n}`);
 else add(0,'Значение '+K('P_1')+' не соответствует весу цилиндра в воздухе. Проверьте показание динамометра');
 if(Math.abs(p2-P2)<=t)add(1,`Вес в воде ${K('P_2='+f(p2)+'\\ \\text{Н}')} измерен верно`);
 else if(p2>P2)add(0,'Значение '+K('P_2')+' слишком велико: цилиндр должен быть полностью погружён в воду');
 else add(0,'Значение '+K('P_2')+' слишком мало: цилиндр не должен касаться дна или стенок стакана');
 const eo=same(d1,TOL.dP)&&same(d2,TOL.dP);add(eo,eo?'Погрешности измерения силы перенесены из условия верно':'Погрешности указаны неверно: перенесите их из условия, '+K('\\pm 0{,}02\\ \\text{Н}'));
 if(!(p1>=p2&&Math.abs(fa-(p1-p2))<=.011+1e-9))add(0,'Значение '+K('F_{\\text{выт}}')+' не согласуется с вашими значениями '+K('P_1')+' и '+K('P_2')+'. Проверьте расчёт');
 else if(Math.abs(fa-B)<=2*TOL.F+1e-9)add(1,'Выталкивающая сила '+K('F_{\\text{выт}}='+f(fa)+'\\ \\text{Н}')+' найдена верно');
 else add(0,'Выталкивающая сила выходит за допустимый диапазон');
 finish(o,!st.bad)}
function flashOpts(){const e=$('#qno');e.classList.add('shake');setTimeout(()=>e.classList.remove('shake'),700)}
function selUI(){document.querySelectorAll('#qno .opt').forEach(b=>b.classList.toggle('on',b.dataset.v===$('#qn').value))}
function check3(){const v=i=>$('#'+i).value,q1=num(v('q1')),e1=num(v('eq1')),o=[],st={bad:false},add=mkAdd(o,st);
 if(!v('qn')){setRes('<div class="er">Вы не выбрали вариант вывода о зависимости. Выберите наиболее подходящий, по вашему мнению, и после этого проверьте работу</div>');flashOpts();sfx('err');return}
 const rows=[['qa','eqa','ra','era',.25,'\\dfrac{1}{4}'],['qb','eqb','rb','erb',.5,'\\dfrac{1}{2}'],['qc','eqc','rc','erc',1,'1']];
 if(!okN(q1)||!okN(e1)||rows.some(([p,ep,r,er])=>!okN(num(v(p)))||!okN(num(v(ep)))||!okN(num(v(r)))||!okN(num(v(er))))||!v('qn')){setRes('<div class="er">Заполните все поля раздела «Измерения»</div>');sfx('err');return}
 const tg=I[TG],n=tg.n,W=MS[TG]*G/1000,B=.0098*tg.V,t=TOL.F+1e-9;
 add(Math.abs(q1-W)<=t,Math.abs(q1-W)<=t?`Вес цилиндра №${n} в воздухе ${K('P_1='+f(q1)+'\\ \\text{Н}')} измерен верно`:'Значение '+K('P_1')+` не соответствует весу цилиндра №${n} в воздухе`);
 let errs=same(e1,TOL.dP);const Fs=[];
 rows.forEach(([p,ep,r,er,fr,tx])=>{const p2=num(v(p)),F=num(v(r)),ex=W-B*fr,tol=(fr===1?TOL.F:TOL.F+.05*B)+1e-9,lab=K('V_{\\text{погр}}='+tx);Fs.push(F);
  errs=errs&&same(num(v(ep)),TOL.dP)&&same(num(v(er)),TOL.dF);
  if(Math.abs(p2-ex)<=tol)add(1,`Погружение ${lab}: ${K('P_2='+f(p2)+'\\ \\text{Н}')} измерен верно`);
  else add(0,`Погружение ${lab}: значение ${K('P_2')} `+(p2>ex?'слишком велико, цилиндр погружён меньше, чем нужно':'слишком мало, цилиндр погружён больше, чем нужно или касается дна'));
  const okF=Math.abs(F-(q1-p2))<=.011+1e-9;
  add(okF,okF?`Погружение ${lab}: ${K('F_{\\text{выт}}='+f(F)+'\\ \\text{Н}')} найдена верно`:`Погружение ${lab}: ${K('F_{\\text{выт}}')} не согласуется с вашими значениями ${K('P_1')} и ${K('P_2')}. Проверьте расчёт`)});
 add(errs,errs?'Погрешности перенесены из условия верно':'Погрешности указаны неверно: перенесите их из условия, '+K('\\pm 0{,}02\\ \\text{Н}')+' для веса и '+K('\\pm 0{,}04\\ \\text{Н}')+' для выталкивающей силы');
 add(Fs[0]<Fs[1]&&Fs[1]<Fs[2],Fs[0]<Fs[1]&&Fs[1]<Fs[2]?'Значения выталкивающей силы растут с объёмом погружённой части':'Выталкивающая сила должна расти с увеличением объёма погружённой части');
 add(v('qn')==='a',v('qn')==='a'?'Вывод сформулирован верно':'Вывод неверен: сопоставьте объём погружённой части и значения выталкивающей силы в своих измерениях');
 finish(o,!st.bad)}
$('#chk').onclick=()=>LAB===2?check2():LAB===3?check3():check1();
document.querySelectorAll('[data-k]').forEach(el=>el.innerHTML=K(el.dataset.k));
let hashVar=false;
{const hm=typeof location!=='undefined'?/^#(\d)(?:-(\d))?$/.exec(location.hash||''):null;
 if(hm&&LABS[+hm[1]]){LAB=+hm[1];const v=hm[2]?Math.min(2,Math.max(0,+hm[2]-1)):0;vi=v;TG=ORDER[LAB][v];hashVar=!!hm[2]}}
if(typeof addEventListener==='function')addEventListener('hashchange',()=>{const m=/^#(\d)/.exec((typeof location!=='undefined'&&location.hash)||'');if(m&&LABS[+m[1]]&&+m[1]!==LAB)setLab(+m[1])});
init();BASE=snap();requestAnimationFrame(tick);
typo(document.body);if(!hashVar)openVariants();
