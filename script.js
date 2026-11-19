const NS='http://www.w3.org/2000/svg',svg=document.getElementById('st'),$=s=>document.querySelector(s);
const HH={disc:31,beaker:58,bottle:44,yel:60},STAND=172,PU=49.5,VH=682;
const MS={},VARS=[{id:'d1',V:[25,.3],m:[195,2]},{id:'d2',V:[25,.7],m:[70,2]},{id:'d4',V:[34,.7],m:[95,2]}];
const HOME={cyl:[328,80,-90],hex:[140,238],dyn:[430,178,-90],spoon:[470,216],thr:[310,272],d4:[410,272],d2:[480,272],d1:[550,272],sc:[257,409],bk1:[100,394],bk2:[556,394],nacl:[399,408],yel:[470,392]};
const ORDER={1:['d1','d2','d4'],2:['d2','d1','d4'],3:['d4','d2','d1']},PXN=50,AX=1,AYB=93,DH=25,G=9.8;
const KIND={cyl:'cyl',hex:'hex',dyn:'dyn',spoon:'spoon',thr:'thr',d4:'disc',d2:'disc',d1:'disc',sc:'scale',bk1:'beaker',bk2:'beaker',nacl:'bottle',yel:'yel'};
const NAME={cyl:'Мензурка 250 мл',hex:'Опора мензурки',dyn:'Динамометр №1',spoon:'Ложка',thr:'Катушка с нитками',d1:'Цилиндр №1',d2:'Цилиндр №2',d4:'Цилиндр №4',sc:'Электронные весы',nacl:'Соль поваренная NaCl',yel:'Жёлтый цилиндр со шкалой'};
const SHD={bk1:[0,56,42,9],bk2:[0,56,42,9],nacl:[0,42,28,6.5],yel:[0,58,17,5],thr:[0,25,22,6],d1:[0,34,24,6],d2:[0,34,24,6],d4:[0,34,26,6.5],hex:[0,16,88,28],sc:[0,4,100,30]};
let I,tare=0,on=false,drag,tT,tipT,hid=null,vb={x:0,y:0,w:1000,h:VH},U=[],R=[],P={massed:false},hT,lx=0,ly=0,AC,light=true,TG='d1',vi=0,LAB=1,SND=true;try{SND=localStorage.getItem('snd')!=='0'}catch(e){}
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
const disp=(c,y,V)=>V*cl((y+HH.disc-(c.y+175-c.w*1.4))/(2*HH.disc),0,1);
const hd=c=>{const d=I.dyn.hang;return d&&d.bk===c?d.V*d.sf:0};
const lvlWith=(c,ys)=>c.w+discs(c).reduce((a,d)=>a+disp(c,ys(d),d.V),0)+hd(c);
const lvl=c=>lvlWith(c,d=>d.y),lvlF=c=>lvlWith(c,d=>d.tw?d.tw.y1:d.y);
const T=it=>cl(Math.hypot(it.x-it.hx,it.y-it.hy)/120,0,1);
const inTray=it=>it.x<650&&it.y<495;
const mass=it=>it.k==='disc'?MS[it.id]+(it.wet?.35:0):it.k==='beaker'?14.3+it.w:it.k==='bottle'?52.4:22.5;
function scG(it){const t=T(it),p=0;return{t,c:Math.cos(p),s:Math.sin(p),ky:1-.5*t,h:15*t}}
function panC(){const s=I.sc,g=scG(s);return{x:s.x+PU*g.c,y:s.y+PU*g.s*g.ky-g.h}}
function onPan(it){if(!(it.k in HH)||it.in||it.hung)return false;const pc=panC(),b=it.y+HH[it.k];return Math.abs(it.x-pc.x)<60&&b>pc.y-34&&b<pc.y+24}
const reading=()=>all().filter(onPan).reduce((a,i)=>a+mass(i),0)-tare;
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
 for(let i=0;i<N;i++){const x=-71+i*12.5,c=cells[i-off],tr=`translate(${x} -30.5) scale(.88 .9)`;
  for(const k in SEG){const[a,b,w,h]=SEG[k],r=`<rect x="${a}" y="${b}" width="${w}" height="${h}" rx=".6"/>`;
   g+=`<g transform="${tr}">${r}</g>`;if(c&&(DM[c.ch]||'').includes(k))l+=`<g transform="${tr}">${r}</g>`}
  g+=`<circle cx="${x+9.6}" cy="-14.6" r="1"/>`;if(c&&c.dp)l+=`<circle cx="${x+9.6}" cy="-14.6" r="1.2"/>`}
 return `<g fill="${gh}" opacity=".55">${g}</g><g fill="${lit}"${bk?' filter="url(#glow)"':''}>${l}</g><circle cx="-72" cy="-12.6" r="1.7" fill="none" stroke="${lit}" stroke-width=".7"/><text x="-68.6" y="-10.6" font-size="6.6" font-weight="700" fill="${lit}">g</text>`}
const RR=(()=>{const L=85,W=43,r=12,n=5,o=[];[[L-r,-W+r,-90],[L-r,W-r,0],[-L+r,W-r,90],[-L+r,-W+r,180]].forEach(([cx,cy,a0])=>{for(let k=0;k<=n;k++){const a=(a0+k*90/n)*Math.PI/180;o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}});return o})();
function scaleBody(it){const{c,s,ky,h}=scG(it),P=(u,v,z)=>{const x=u*c-v*s,y=(u*s+v*c)*ky-z;return x.toFixed(1)+','+y.toFixed(1)},N=RR.length,p=it.press,bk=on&&light;let o='';
 if(h>.5)for(let i=0;i<N;i++){const[u1,v1]=RR[i],[u2,v2]=RR[(i+1)%N],du=u2-u1,dv=v2-v1,l=Math.hypot(du,dv),nu=dv/l,nv=-du/l;
  if(nu*s+nv*c>0){const gr=Math.round(cl(176-55*(nu*c-nv*s),90,215)),col=`rgb(${gr},${gr+3},${gr+7})`;
   o+=`<polygon points="${P(u1,v1,h)} ${P(u2,v2,h)} ${P(u2,v2,0)} ${P(u1,v1,0)}" fill="${col}" stroke="${col}" stroke-width=".8" stroke-linejoin="round"/>`}}
 o+=`<polygon points="${RR.map(([u,v])=>P(u,v,h)).join(' ')}" fill="url(#gBody)" stroke="#858c92" stroke-width="1.2" stroke-linejoin="round"/>`;
 const btn=(a,x,y,w,l)=>{const dn=p===a?1.5:0,hh=13;return `<rect x="${x}" y="${y+2.4}" width="${w}" height="${hh}" rx="3.5" fill="#575d63"/><g transform="translate(0 ${dn})"><rect data-act="${a}" x="${x}" y="${y}" width="${w}" height="${hh}" rx="3.5" fill="${p===a?'#8a8f95':'url(#gBtn)'}" stroke="#6a7075" stroke-width=".8" style="cursor:pointer"/><rect x="${x+1.2}" y="${y+.9}" width="${w-2.4}" height="3.4" rx="1.7" fill="#fff" opacity="${p===a?.05:.32}" style="pointer-events:none"/><text data-act="${a}" x="${x+w/2}" y="${y+8.6}" text-anchor="middle" font-size="6.3" font-weight="600" fill="#f6f6f6" style="pointer-events:none">${l}</text></g>`};
 const lb=on?(bk?'url(#gLcdB)':'#a9b9a2'):'#8c98a2',lc=on?lcd(Math.abs(reading())>500?'Err':reading().toFixed(2),bk):'';
 o+=`<g transform="matrix(${c} ${s*ky} ${-s} ${c*ky} 0 ${-h})"><rect x="-81" y="-39" width="97" height="78" rx="6" fill="url(#gBody)" stroke="#aab0b5" stroke-width=".8"/><rect x="18" y="-39" width="63" height="78" rx="5" fill="#c9cdd1" stroke="#979da2" stroke-width=".8"/><rect x="21" y="-36" width="57" height="72" rx="3" fill="url(#gPlat)" stroke="#9fa5aa" stroke-width=".6"/><path d="M24 -22H75M24 -8H75M24 6H75M24 20H75" stroke="#fff" stroke-opacity=".14"/><rect x="-77" y="-35" width="90" height="30" rx="3" fill="#80868b"/><rect x="-74" y="-32" width="84" height="24" rx="2" fill="${lb}" stroke="#5f6b8a" stroke-width=".6"/>${lc}${btn('pcs',-77,-2,28,'PCS')}${btn('un',-45,-2,28,'UNITS')}${btn('lt',-13,-2,28,'LIGHT')}${btn('pw',-77,17,40,'ON/OFF')}${btn('tr',-33,17,40,'TARE')}</g>`;
 return o}
function dynBody(it){const e=it.ex||0,yp=-55+e,hy=75+e;
 let sp='';{const n=14,y0=-66,y1=Math.max(yp-2,y0+10);for(let i=0;i<=n;i++)sp+=`${i%2?-11:-3},${(y0+(y1-y0)*i/n).toFixed(1)} `}
 let s=`<ellipse cy="-82" rx="6" ry="7" fill="none" stroke="#777" stroke-width="2.4"/><rect x="-22" y="-76" width="44" height="152" rx="5" fill="url(#gSteel)" stroke="#6a6f75" stroke-width="1.6"/><rect x="-16" y="-68" width="32" height="136" rx="2" fill="#f7f8f9" stroke="#8a8f95" stroke-width=".8"/><text x="7" y="-59" font-size="6" font-weight="700" fill="#222">Н</text>`;
 for(let i=0;i<=25;i++){const y=-55+i*5,mj=i%10===0,md=i%5===0;s+=`<line x1="${mj?3:md?6:9}" x2="14" y1="${y}" y2="${y}" stroke="#222" stroke-width=".7"/>`;if(mj)s+=`<text x="1" y="${y+2}" text-anchor="end" font-size="5.5" fill="#222">${i/10}</text>`}
 return s+`<polyline points="${sp}" fill="none" stroke="#555" stroke-width="1.2"/><rect x="-22" y="66" width="44" height="10" fill="#7d8186" stroke="#5f6469" stroke-width=".8"/><line x1="-7" x2="-7" y1="${yp}" y2="${hy+12}" stroke="#777" stroke-width="2"/><rect x="-11" y="${yp-2}" width="8" height="4" fill="#555"/><rect x="-12" y="${yp-1.2}" width="27" height="2.4" rx="1" fill="#d22"/><path d="M-7 ${hy+10}q0 8 8 8q8 0 8 -8" fill="none" stroke="#666" stroke-width="2.4" stroke-linecap="round"/>`}
function body(it){
 const k=it.k;let s='';
 if(k==='cyl'){const T0=`rotate(${-it.rot}) translate(${-it.x} ${-it.y})`,RU=tr=>`<use href="#rf" transform="${tr} ${T0}"/><use href="#i_hex" transform="${tr} ${T0}"/>`;
  s=`<rect x="-28" y="-190" width="56" height="365" rx="4" fill="#dcecf1" fill-opacity=".08"/><g clip-path="url(#cA)" opacity=".7">${RU('translate(8 0)')}</g><g clip-path="url(#cB)" opacity=".7">${RU('scale(1.1 1)')}</g><g clip-path="url(#cC)" opacity=".7">${RU('translate(-8 0)')}</g><rect x="-28" y="-190" width="56" height="365" rx="4" fill="url(#gGlassC)" stroke="#7ea6b4" stroke-width="2"/><rect x="-30" y="172" width="60" height="9" rx="3" fill="#dbeef4" fill-opacity=".6" stroke="#7ea6b4"/>`;
 }else if(k==='disc'){const R=it.R,kk=R/26,t=T(it),h=48.8*t,top=-h/2,ry=R*(1-.65*t),c=it.in,n=it.n,a=it.wetA||0,gm=it.mat,rg=4.5*kk+1.5,ryR=Math.max(1.5,rg*(1-.5*t)),ringY=top-8*kk*(1-t)-3*t;
  const side=`M${-R} ${top}V${h/2}A${R} ${ry} 0 0 0 ${R} ${h/2}V${top}Z`;
  const ln=d=>`<path d="${d}" fill="none" stroke="#222" stroke-width="3.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#efe6cf" stroke-width="1.5" stroke-linecap="round"/>`;
  s=(t>.02?`<path d="${side}" fill="url(#gS${gm})" stroke="#555" stroke-width="1.5"/>`:'')
   +`<ellipse cy="${top}" rx="${R}" ry="${ry}" fill="url(#gD${gm})" stroke="#6c737c" stroke-width="2"/><ellipse cy="${top}" rx="${R*.73}" ry="${ry*.73}" fill="none" stroke="#fff" stroke-opacity=".55"/>`
   +`<ellipse cy="${ringY}" rx="${rg}" ry="${ryR}" fill="none" stroke="#444" stroke-width="2"/><circle cx="${9*kk*(1-t)}" cy="${10*kk*(1-t)+8*t}" r="${7*kk+1}" fill="#ffe36a" stroke="#c9a400"/><text x="${9*kk*(1-t)}" y="${14*kk*(1-t)+11.5*t}" text-anchor="middle" font-size="${10*kk+1}" font-weight="700" fill="#222">${n}</text>`
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
 else if(k==='yel'){s=`<rect x="-14" y="-60" width="28" height="120" rx="6" fill="url(#gYel)" stroke="#b99a00" stroke-width="2"/><rect x="-6" y="-70" width="12" height="12" fill="#222"/>`;for(let i=0;i<=8;i++)s+=`<line x1="-14" x2="${i%2?-4:2}" y1="${50-i*12}" y2="${50-i*12}" stroke="#333"/>`}
 return s}
const tf=it=>`translate(${it.x} ${it.y}) rotate(${it.rot})${it.in?' scale(1.06)':''}`;
function shad(it){const e=it.sh,d=SHD[it.id];if(!e||!d)return;
 let op=inTray(it)||it.in||onPan(it)?0:.3,cy=d[1],ry=d[3];
 if(it.k==='disc'&&T(it)<.6)op=0;if(it.id==='thr'&&all().some(d=>d.thread))op=0;
 if(it.id==='hex'){ry=d[3]*T(it);if(T(it)<.5)op=0}if(it.id==='sc'&&T(it)<.5)op=0;
 if(drag&&drag.it===it&&drag.moved){cy+=12;op*=.6}
 e.setAttribute('cx',it.x+d[0]);e.setAttribute('cy',it.y+cy);e.setAttribute('rx',d[2]);e.setAttribute('ry',Math.max(.1,ry));e.setAttribute('opacity',op)}
function setT(it){it.g.setAttribute('transform',tf(it));if(it.f)it.f.setAttribute('transform',tf(it));shad(it)}
function draw(it){it.g.innerHTML=body(it);if(it.f)it.f.innerHTML=it.id==='hex'?hexFront(it):cylFront(it);setT(it);if(it.id==='thr')it.g.style.display=all().some(d=>d.thread)?'none':''}
function fixZ(){const h=I.hex,c=I.cyl;
 if(c.stand===h){h.g.after(c.g);let l=c.g;all().filter(d=>d.in===c||(d.hung&&d.bk===c)).forEach(d=>{l.after(d.g);l=d.g});l.after(c.f);c.f.after(h.f)}
 else{h.g.after(h.f);c.g.after(c.f)}}
function sync(){all().forEach(draw);fixZ();if(on&&onPan(I[TG]))P.massed=true;bar();loupe();calc();upd()}
function go(it,x,y,r=it.rot,ms=420){it.tw={x0:it.x,y0:it.y,r0:it.rot,x1:x,y1:y,r1:r,t0:performance.now(),ms}}
const surfOf=b=>b===I.cyl?b.y+175-b.w*1.4:b.y+58-b.w*.363;
const floorOf=d=>{let r=null,m=99;for(const b of [I.bk1,I.bk2]){const dx=Math.abs(d.x-b.x);if(dx<=45&&dx<m){m=dx;r=dx<=37-d.R+2?{b,y:b.y+57,inside:true}:{b,y:b.y-66,inside:false}}}
 const c=I.cyl;if(c.stand&&c.rot===0){const dx=Math.abs(d.x-c.x);if(dx<=32&&dx<m){m=dx;r=dx<=28-d.R+2?{b:c,y:c.y+175,inside:true}:{b:c,y:c.y-190,inside:false}}}return r};
function dynPhys(){const D=I.dyn,d=D.hang,prev=D.ex;let tg=0;const hx0=D.x+AX,vx0=hx0-(D.px===undefined?hx0:D.px),ax=cl(vx0-(D.pv||0),-5,5);D.px=hx0;D.pv=vx0;
 if(d&&D.rot===0){const W=MS[d.id]*G/1000,fl=floorOf(d),base=D.y+AYB+DH,surf=fl&&fl.inside?surfOf(fl.b):null;
  let ex=W*PXN,f=0;
  for(let i=0;i<3;i++){f=surf!=null?cl((base+ex+HH.disc-surf)/(2*HH.disc),0,1):0;ex=(W-.0098*d.V*f)*PXN}
  d.rest=false;
  if(fl){const ymax=fl.y-HH.disc;if(base+ex>ymax){ex=Math.max(0,Math.min(ex,ymax-base));d.rest=true}}
  tg=ex;d.sf=f;d.surf=surf!=null&&f>0?surf:null;d.bk=fl&&fl.inside?fl.b:null;
  if(f>0){d.wet=true;if(!d.inW){d.inW=true;sfx('splash')}}else d.inW=false}
 else if(d){d.sf=0;d.surf=null;d.bk=null;d.rest=false}
 D.ev=(D.ev||0)*.55+(tg-D.ex)*.22;D.ex+=D.ev;if(Math.abs(tg-D.ex)<.05&&Math.abs(D.ev)<.05){D.ex=tg;D.ev=0}
 if(d&&D.rot===0){const damp=d.sf>0?.2:.03,th=D.th||0;D.tv=((D.tv||0)-.0076*Math.sin(th)-.45*ax/DH*Math.cos(th))*(1-damp);D.th=cl(th+D.tv,-.9,.9)}else{D.th=0;D.tv=0}
 if(d&&!d.tw&&!(drag&&drag.it===d)){const fl=floorOf(d),th=D.th||0,hy=D.y+AYB+D.ex;let nx=D.x+AX+DH*Math.sin(th),ny=hy+DH*Math.cos(th),rot=th*180/Math.PI;
  if(fl){ny=Math.min(ny,fl.y-HH.disc);if(fl.inside&&ny+HH.disc>(fl.b===I.cyl?fl.b.y-190:fl.b.y-66)){const inn=(fl.b===I.cyl?28:37)-d.R;nx=cl(nx,fl.b.x-inn,fl.b.x+inn)}}
  if(d.x!==nx||d.y!==ny||d.rot!==rot){d.x=nx;d.y=ny;d.rot=rot;draw(d)}}
 if(d&&d.bk!==d._pb){d._pb=d.bk;fixZ();if(LAB>=3)loupe()}
 if(Math.abs(prev-D.ex)>.001){draw(D);if(LAB>=2)loupe()}}
const bkT=b=>{const d=I.dyn.hang;return d&&d.bk===b?b.w+d.V*d.sf:b.w};
function tick(t){
 const c=I.cyl;let fin=false;dynPhys();
 for(const it of all()){const w=it.tw;if(!w)continue;
  const p=Math.min(1,(t-w.t0)/w.ms),e=ease(p);
  it.x=w.x0+(w.x1-w.x0)*e;it.y=w.y0+(w.y1-w.y0)*e;it.rot=w.r0+(w.r1-w.r0)*e;
  if(p>=1){it.tw=null;fin=true}draw(it)}
 if(c.stand&&!c.tw&&!(drag&&drag.it===c)&&(c.x!==c.stand.x||c.y!==c.stand.y-STAND)){c.x=c.stand.x;c.y=c.stand.y-STAND;setT(c)}
 for(const d of all())if(d.k==='disc'){const tg=d.wet?1:0;if(d.wetA!==tg){d.wetA=tg>d.wetA?Math.min(tg,d.wetA+.08):Math.max(tg,d.wetA-.03);draw(d)}}
 for(const d of discs(c)){const ty=c.y+d.off;if(!d.tw&&!(drag&&drag.it===d)&&(d.x!==c.x||d.y!==ty)){d.x=c.x;d.y=ty;draw(d)}}
 for(const it of [c,I.bk1,I.bk2]){const key=it===c?'lv':'dv',tg=it===c?lvl(c):bkT(it);
  if(it[key]!==tg){it[key]+=(tg-it[key])*.18;if(Math.abs(tg-it[key])<.05)it[key]=tg;draw(it);if(it===c)loupe()}}
 if(fin)sync();requestAnimationFrame(tick)}
function roll(){const rd=(c,t)=>c+(Math.random()*2-1)*t;for(const v of VARS){MS[v.id]=Math.round(rd(v.m[0],v.m[1])*100)/100;I[v.id].V=Math.round(rd(v.V[0],v.V[1])*10)/10}}
const LABS={1:{ttl:'Измерение плотности вещества',task:n=>`Используя весы, мензурку, стакан с водой, цилиндр №${n}, соберите установку для измерения плотности материала, из которого изготовлен цилиндр №${n}`,err:'Погрешность массы ±0,1 г, объёма ±2 см³',loupe:'Лупа: уровень воды'},3:{ttl:'Исследование зависимости архимедовой силы от объёма погружённой части тела',task:n=>`Используя динамометр №1, цилиндр №${n}, сосуд с водой, соберите экспериментальную установку для исследования зависимости выталкивающей силы от объёма погружённой части тела`,err:'Для этого последовательно погрузите цилиндр в воду на 1/4 часть объёма, на 1/2 часть объёма и полностью\nДля каждого погружения измерьте выталкивающую силу\nАбсолютную погрешность измерения веса цилиндра принять равной ±0,02 Н, а выталкивающей силы ±0,04 Н',loupe:'Лупа: уровень воды и шкала динамометра'},
2:{ttl:'Измерение архимедовой силы',task:n=>`Используя динамометр №1, стакан с водой, цилиндр №${n}, соберите экспериментальную установку для определения выталкивающей силы (силы Архимеда), действующей на цилиндр, полностью погружённый в воду`,err:'Абсолютная погрешность измерения силы равна ±0,02 Н',loupe:'Лупа: шкала динамометра'}};
function updTask(){const n=I[TG].n,L=LABS[LAB];$('#tt').textContent=L.task(n);$('#te').textContent=L.err;$('#var').textContent='Вариант '+(vi+1)+' ▾';$('#ttl').textContent=`Комплект №1 · Лабораторная работа №${LAB} · ${L.ttl}`;$('#lt').textContent=L.loupe;$('#dr1').hidden=LAB!==1;$('#dr2').hidden=LAB!==2;$('#dr3').hidden=LAB!==3;document.querySelectorAll('.lab').forEach(b=>b.classList.toggle('on',+b.dataset.lab===LAB));document.title=`Лабораторная ОГЭ №${LAB}: ${L.ttl}`}
function setLab(n){if(n===LAB)return;LAB=n;vi=0;TG=ORDER[n][0];U=[];R=[];P.massed=false;hid=null;init();FLD.forEach(f=>$('#'+f).value='');$('#res').innerHTML='';calc();loupe();BASE=snap()}
function newVariant(i){vi=i;TG=ORDER[LAB][i];U=[];R=[];P.massed=false;hid=null;init();FLD.forEach(f=>$('#'+f).value='');$('#res').innerHTML='';calc();BASE=snap()}
function init(){
 svg.querySelectorAll('.it').forEach(n=>n.remove());I={};
 const mk=(id,c)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','it'+(c?' nf':''));g.dataset.id=id;svg.appendChild(g);return g};
 for(const id in KIND){const[h,v,r]=HOME[id];
  I[id]={id,k:KIND[id],x:h,y:v,rot:r||0,hx:h,hy:v,hr:r||0,w:0,lv:0,dv:0,in:null,stand:null,thread:false,wet:false,wetA:0,tw:null,press:null,n:{d4:4,d2:2,d1:1}[id],V:25,off:0,ex:0,ev:0,hang:null,hung:false,sf:0,surf:null,bk:null,inW:false,rest:false,R:id==='d4'?18:15.5,mat:id==='d1'?3:2,g:mk(id)};I[id].g.id='i_'+id;
  if(id==='hex')I[id].f=mk(id);if(id==='cyl')I[id].f=mk(id,1)}
 I.bk1.w=I.bk1.dv=200;roll();light=true;on=false;tare=0;updTask();
 $('#slots').innerHTML=all().map(it=>{const c={...it,w:0,dv:0,lv:0,thread:false,wet:false,in:null};return `<g filter="url(#slot)" transform="translate(${it.hx} ${it.hy}) rotate(${it.hr})">${body(c)}${it.id==='hex'?hexFront(c):it.id==='cyl'?cylFront(c):''}</g>`}).join('');
 $('#shadows').innerHTML=Object.keys(SHD).map(id=>`<ellipse data-s="${id}" fill="#000" filter="url(#bl2)" opacity="0"/>`).join('');
 Object.keys(SHD).forEach(id=>I[id].sh=$(`#shadows [data-s="${id}"]`));
 sync()}
const FLD=['m','v1','v2','r','p1','p2','fa','fs','q1','qa','qb','qc','ra','rb','rc','qs','qn'];
function snap(){const o={};for(const id in I){const it=I[id],w=it.tw;o[id]={x:w?w.x1:it.x,y:w?w.y1:it.y,r:w?w.r1:it.rot,w:it.w,i:it.in?it.in.id:null,s:!!it.stand,t:it.thread,e:it.wet,of:it.off,hg:it.hang?it.hang.id:null,hu:it.hung}}
 return JSON.stringify({o,on,tare,lt:light,f:FLD.map(i=>$('#'+i).value)})}
function restore(str){const S=JSON.parse(str);
 for(const id in S.o){const a=S.o[id],it=I[id];it.w=a.w;it.in=a.i?I[a.i]:null;it.stand=a.s?I.hex:null;it.thread=a.t;it.wet=a.e;it.off=a.of||0;it.hang=a.hg?I[a.hg]:null;it.hung=!!a.hu;if(!it.hung){it.surf=null;it.sf=0}go(it,a.x,a.y,a.r,380)}
 on=S.on;tare=S.tare;light=S.lt!==false;FLD.forEach((i,n)=>$('#'+i).value=S.f[n]);$('#res').innerHTML='';sync()}
let BASE;
function commit(pre){if(pre!==snap()){U.push(pre);if(U.length>100)U.shift();R=[];upd()}}
function act(fn){const s=snap();fn();sync();commit(s)}
function undo(){if(!U.length)return;sfx('blip');R.push(snap());restore(U.pop())}
function redo(){if(!R.length)return;sfx('blip');U.push(snap());restore(R.pop())}
function reset(){const s=snap();P.massed=false;restore(BASE);commit(s)}
function upd(){$('#undo').disabled=!U.length;$('#redo').disabled=!R.length}
function pt(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
function toast(t){sfx('err');$('#toast').textContent=t;clearTimeout(tT);tT=setTimeout(()=>$('#toast').textContent='',5000)}
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
  if(!g2||g2.dataset.id!==id)return;const t=$('#tip');t.textContent=nameOf(id);t.style.left=lx+14+'px';t.style.top=ly+20+'px';t.hidden=false},550)}
svg.addEventListener('pointerleave',()=>{hl(null);hideTip()});
svg.addEventListener('pointerdown',e=>{
 if(e.button)return;hideMenu();hideTip();const g=e.target.closest('.it');
 if(!g){drag={pan:true,cx:e.clientX,cy:e.clientY};svg.setPointerCapture(e.pointerId);return}
 const it=I[g.dataset.id],p=pt(e);it.tw=null;
 drag={it,ox:p.x-it.x,oy:p.y-it.y,sx:p.x,sy:p.y,fx:it.x,fy:it.y,fr:it.rot,moved:false,act:e.target.dataset.act,snap:snap(),riders:it.id==='sc'?all().filter(onPan):[]};
 {const pc=panC();drag.riders.forEach(r=>r.ro={dx:r.x-pc.x,dy:r.y-pc.y})}
 svg.setPointerCapture(e.pointerId);svg.appendChild(it.g);drag.riders.forEach(r=>svg.appendChild(r.g));
 if(drag.act){it.press=drag.act;draw(it)}else sfx('pick');
 fixZ()});
svg.addEventListener('pointermove',e=>{
 if(!drag){hover(e);return}
 if(drag.pan){const r=svg.getBoundingClientRect();vb.x-=(e.clientX-drag.cx)*vb.w/r.width;vb.y-=(e.clientY-drag.cy)*vb.h/r.height;drag.cx=e.clientX;drag.cy=e.clientY;applyVb();return}
 const p=pt(e),it=drag.it;
 if(!drag.moved){if(Math.hypot(p.x-drag.sx,p.y-drag.sy)<5)return;drag.moved=true;it.g.classList.add('drag');
  if(it.press){it.press=null;draw(it)}if(drag.act)sfx('pick');
  if(it.hung){I.dyn.hang=null;it.hung=false;it.surf=null;it.sf=0;it.inW=false;it.rot=0}
  if(it.in){it.in=null;it.wet=true;sync();svg.appendChild(it.g)}}
 const nx=cl(p.x-drag.ox,25,975),ny=cl(p.y-drag.oy,25,VH-25),dx=nx-it.x,dy=ny-it.y;it.x=nx;it.y=ny;
 if(it.id==='sc'){const pc=panC();drag.riders.forEach(r=>{r.x=pc.x+r.ro.dx;r.y=pc.y+r.ro.dy;setT(r)})}
 if(it.id==='cyl'||it.id==='dyn')it.rot=-90*(1-cl(Math.hypot(it.x-it.hx,it.y-it.hy)/170,0,1));
 if(it.k==='disc'||it.id==='hex')draw(it);else setT(it);

 draw(I.sc)});
svg.addEventListener('pointerup',e=>{
 if(!drag)return;const d=drag;drag=null;if(d.pan)return;
 const it=d.it;it.g.classList.remove('drag');hl(null);hideTip();
 if(it.press)it.press=null;
 if(!d.moved){if(d.act)sfx('click');if(d.act==='pw'){on=!on;tare=0;light=true;sfx(on?'on':'off')}else if(d.act==='tr'&&on){tare+=reading();sfx('tare')}else if(d.act==='lt'&&on)light=!light;sync();commit(d.snap);return}
 drop(it,d);sync();commit(d.snap)});
function sendHome(it){const c=I.cyl;
 if(it.id==='cyl'&&(c.w>0||discs(c).length))return toast('Сначала достаньте тело и слейте воду из мензурки'),false;
 if(it.id==='hex'&&c.stand===it)return toast('Сначала уберите мензурку из опоры'),false;
 if(it.id==='sc'&&all().some(onPan))return toast('Снимите предметы с весов'),false;
 if(it.id==='dyn'&&it.hang)return toast('Сначала снимите груз с динамометра'),false;
 if(it.k==='disc'&&it.hung){I.dyn.hang=null;it.hung=false;it.surf=null;it.sf=0}
 if(it.k==='disc'&&it.in)return false;
 if(it.id==='cyl')it.stand=null;
 sfx('snap');go(it,it.hx,it.hy,it.hr);return true}
function hookOn(it){const D=I.dyn;if(D.rot!==0||it.in)return;
 if(D.hang&&D.hang!==it){toast('На крючке динамометра уже есть груз');return}
 D.hang=it;it.hung=true;D.th=0;D.tv=0;go(it,D.x+AX,D.y+AYB+D.ex+DH,0,350);sfx('clink')}
function drop(it,d){
 const c=I.cyl;
 if(Math.hypot(it.x-it.hx,it.y-it.hy)<70&&sendHome(it))return;
 if(it.id==='cyl'){const h=I.hex;
  if(!inTray(h)&&Math.abs(it.x-h.x)<80&&Math.abs(it.y+STAND-h.y)<90){it.stand=h;go(it,h.x,h.y-STAND,0,550);later(()=>sfx('clink'),480);return}
  toast('Мензурка без опоры упадёт: поставьте на стол синюю опору и вставьте мензурку в неё');go(it,d.fx,d.fy,d.fr);return}
 if(it.id==='hex'){sfx('tap');return}
 if(it.id==='dyn'){if(it.rot!==0)go(it,it.x,it.y,0,300);sfx('tap');return}
 if(it.k==='disc'&&!it.in&&I.dyn.rot===0&&Math.hypot(it.x-(I.dyn.x+AX),it.y-27-(I.dyn.y+AYB+I.dyn.ex))<46){hookOn(it);return}
 if(it.k==='disc'&&c.stand&&Math.abs(it.x-c.x)<45&&it.y>c.y-260&&it.y<c.y+175){
  if(!it.thread){toast('Опускать тело в мензурку без нитки нельзя: можно разбить стекло. Привяжите нитку');go(it,d.fx,d.fy);return}
  const want=175-(c.w+it.V)*1.4+14+HH.disc,floor=175-HH.disc-3,full=c.w>0&&want<=floor;
  it.off=full?want:floor;it.in=c;it.x=c.x;it.y=c.y-190-HH.disc-14;go(it,c.x,c.y+it.off,0,950);
  if(c.w>0&&!full)toast('Тело погружено не полностью: воды слишком мало');
  spill();later(()=>sfx(c.w>0?'splash':'tap'),c.w>0?480:900);return}
 if(it.id==='thr'){const t=['d4','d2','d1'].map(i=>I[i]).find(x=>!x.in&&Math.hypot(x.x-it.x,x.y-it.y)<50);
  if(t){all().forEach(x=>x.thread=false);t.thread=true;sfx('tie')}return}
 if(it.k in HH&&onPan(it)){const pc=panC();go(it,pc.x,pc.y-HH[it.k],0,220)}
 sfx('tap')}
function spill(){const c=I.cyl;let n=0;while(lvlF(c)>250&&c.w>0){c.w--;n++}if(n)toast('Вода перелилась через край')}
function pour(b,n){sfx('pour',Math.abs(n));act(()=>{const c=I.cyl,k=I[b];
 if(n>0){const a=Math.min(n,k.w);c.w+=a;k.w-=a}else{const a=Math.min(-n,c.w,300-k.w);c.w-=a;k.w+=a}spill()})}
function bar(){
 const c=I.cyl,b=$('#bar'),fh=$('#fh'),idle=t=>{fh.textContent=LAB===2?'':t;b.innerHTML=''};
 if(!c.stand){idle('Мензурка работает только в опоре: поставьте опору на стол и вставьте в неё мензурку');return}
 const k=['bk1','bk2'].map(i=>I[i]).find(x=>Math.abs(x.x-c.x)<150&&Math.abs(x.y-c.y)<230);
 if(!k){idle('Поднесите стакан к мензурке — появятся кнопки переливания воды');return}
 fh.textContent='';
 const B=(cls,lab,n,v)=>`<button class="${cls}" onclick="pour('${k.id}',${n})"><small>${lab}</small>${v} мл</button>`;
 b.innerHTML=`<div class="pc"><div class="pl">Стакан ⇄ мензурка</div><div class="pg">${B('g1','налить',10,'10')}${B('g2','налить',1,'1')}${B('b1','отлить',-10,'10')}${B('b2','отлить',-1,'1')}</div></div>`}
function menu(it){const m=[],c=I.cyl,away=Math.hypot(it.x-it.hx,it.y-it.hy)>3;
 if(it.k==='disc'){
  if(it.hung)m.push(['Снять с динамометра',()=>{I.dyn.hang=null;it.hung=false;it.surf=null;it.sf=0;go(it,it.x+60,it.y+20,0)}]);
  else if(I.dyn.rot===0&&!I.dyn.hang&&!it.in)m.push(['Повесить на динамометр',()=>{hookOn(it)}]);
  if(it.in)m.push(['Вынуть из воды',()=>{it.in=null;it.wet=true;go(it,c.x+75,c.y+130)}]);
  if(it.wet)m.push(['Протереть салфеткой',()=>{it.wet=false;sfx('swish')}]);
  if(it.thread)m.push(['Снять нитку',()=>{it.thread=false;I.thr.x=it.x+60;I.thr.y=it.y+30}]);
  else if(!all().some(d=>d.thread))m.push(['Привязать нитку',()=>{it.thread=true;sfx('tie')}])}
 if(it.id==='cyl'&&c.w>0)m.push(['Вылить воду',()=>{c.w=0}]);
 if(it.k==='beaker'){m.push(['Вылить воду',()=>{it.w=0}]);m.push(['Налить воду ('+K('200\\ \\text{мл}')+')',()=>{it.w=200}])}
 if(it.id==='hex'&&c.stand===it)m.push(['Разобрать: мензурку — в кейс',()=>{sendHome(c)}]);
 if(it.id==='sc'){m.push([on?'Выключить':'Включить',()=>{on=!on;tare=0}]);if(on)m.push(['Обнулить (TARE)',()=>{tare+=reading()}])}
 if(away&&!it.in)m.push(['Положить в кейс',()=>{sendHome(it)}]);
 return m}
function hideMenu(){$('#cm').hidden=true}
svg.addEventListener('contextmenu',e=>{e.preventDefault();hideMenu();hideTip();const g=e.target.closest('.it');if(!g)return;
 const list=menu(I[g.dataset.id]);if(!list.length)return;const m=$('#cm');m.innerHTML='';
 list.forEach(([t,fn])=>{const b=document.createElement('button');b.innerHTML=t;b.onclick=()=>{hideMenu();act(fn)};m.appendChild(b)});
 m.style.left=Math.min(e.clientX,innerWidth-230)+'px';m.style.top=e.clientY+'px';m.hidden=false});
addEventListener('scroll',hideMenu);
addEventListener('keydown',e=>{
 if(e.key==='Escape'){hideMenu();$('#help').hidden=true;$('#tosm').hidden=true;return}
 const inp=/INPUT|TEXTAREA/.test(e.target.tagName),mod=e.ctrlKey||e.metaKey;
 if(mod&&e.code==='KeyZ'&&!inp){e.preventDefault();e.shiftKey?redo():undo()}
 else if(mod&&e.code==='KeyY'&&!inp){e.preventDefault();redo()}
 else if(e.altKey&&e.code==='KeyR'){e.preventDefault();reset()}
 else if(e.altKey&&e.code==='KeyH'){e.preventDefault();showHint()}
 else if(e.altKey&&e.code==='KeyM'){e.preventDefault();toggleSnd()}});
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
function hintText3(){const h=I.hex,c=I.cyl,D=I.dyn,d=D.hang,n=I[TG].n,v=i=>$('#'+i).value.trim();
 if(inTray(h)&&!c.stand)return'Достаньте из кейса синюю опору мензурки и поставьте её на стол: мензурка нужна, чтобы измерять объём погружённой части';
 if(!c.stand)return'Достаньте мензурку из кейса и вставьте её в гнездо опоры';
 if(D.rot!==0)return'Достаньте динамометр из кейса: он займёт вертикальное положение';
 if(!d)return`Повесьте цилиндр №${n} на крючок динамометра: поднесите цилиндр колечком к крючку`;
 if(d.id!==TG)return`Для этого варианта нужен цилиндр №${n}: снимите груз (правая кнопка мыши) и повесьте нужный`;
 if(c.w<60)return'Налейте в мензурку воды, например 100 мл: поднесите стакан к мензурке';
 if(!v('q1'))return'Снимите показание динамометра в воздухе (лупа поможет) и запишите '+K('P_1');
 if(d.rest)return'Цилиндр касается дна: приподнимите динамометр';
 if(!v('qc')&&!v('qa')&&!v('qb'))return'Объём цилиндра равен подъёму уровня воды при полном погружении. Измерьте его, затем найдите погружения на 1/4 и 1/2 объёма';
 if(!v('qa'))return'Погрузите цилиндр на 1/4 объёма: уровень воды в мензурке должен подняться на четверть объёма цилиндра. Запишите '+K('P_2');
 if(!v('qb'))return'Погрузите цилиндр на 1/2 объёма и запишите '+K('P_2');
 if(!v('qc'))return'Погрузите цилиндр полностью (не касаясь дна) и запишите '+K('P_2');
 if(!v('ra')||!v('rb')||!v('rc'))return'Вычислите выталкивающую силу для каждого погружения: '+K('F_{\\text{выт}}=P_1-P_2');
 if(!v('qs')||!v('qn'))return'Выберите формулу и сформулируйте вывод';
 return'Всё готово: нажмите «Проверить»'}
function hintText2(){const D=I.dyn,d=D.hang,n=I[TG].n,v=i=>$('#'+i).value.trim();
 if(D.rot!==0)return'Достаньте динамометр из кейса: он займёт вертикальное положение';
 if(!d)return`Повесьте цилиндр №${n} на крючок динамометра: поднесите цилиндр колечком к крючку`;
 if(d.id!==TG)return`Для этого варианта нужен цилиндр №${n}: снимите груз (правая кнопка мыши) и повесьте нужный`;
 if(!v('p1')&&d.sf===0)return'Снимите показание динамометра (лупа поможет) и запишите '+K('P_1');
 if(d.rest)return'Цилиндр касается дна: приподнимите динамометр, чтобы цилиндр висел в воде';
 if(d.sf<.999)return'Опустите динамометр с цилиндром в стакан с водой: цилиндр должен полностью погрузиться и не касаться дна';
 if(!v('p2'))return'Снимите показание динамометра при погружённом цилиндре и запишите '+K('P_2');
 if(!v('fs'))return'Выберите формулу для расчёта выталкивающей силы';
 if(!v('fa'))return'Вычислите выталкивающую силу '+K('F_{\\text{выт}}=P_1-P_2')+' и запишите значение';
 return'Всё готово: нажмите «Проверить»'}
function hintText1(){const h=I.hex,c=I.cyl,t=I[TG],n=t.n,v=i=>$('#'+i).value.trim();
 if(inTray(h)&&!c.stand)return'Достаньте из кейса синюю опору мензурки и поставьте её на рабочий стол';
 if(!c.stand)return'Достаньте мензурку из кейса и вставьте её в цилиндрическое гнездо опоры';
 if(!P.massed)return on?`Положите цилиндр №${n} (цифра ${n} на цилиндре) на площадку весов; цилиндр должен быть сухим`:'Сначала измерьте массу цилиндра: включите весы кнопкой ON/OFF';
 if(!v('m'))return'Запишите массу цилиндра в черновик: '+K('m');
 if(c.w<60&&!t.in)return'Налейте в мензурку удобное количество воды, например 100 мл: поднесите стакан к мензурке';
 if(!v('v1'))return'Снимите по шкале (лупа поможет) начальный объём воды и запишите '+K('V_1')+' до погружения цилиндра';
 if(!t.in&&!t.thread)return`Привяжите нитку к колечку цилиндра №${n}: перетащите катушку на цилиндр`;
 if(!t.in)return`Плавно опустите цилиндр №${n} на нитке в воду, чтобы он полностью погрузился`;
 if(!v('v2'))return'Снимите новое показание мензурки и запишите '+K('V_2');
 if(!v('r'))return'Найдите объём тела '+K('V=V_2-V_1')+', затем плотность '+K('\\rho=\\dfrac{m}{V}')+' и запишите ответ в '+K('\\text{г/см}^3');
 return'Всё готово: нажмите «Проверить»'}
let hT2;function showHint(){sfx('blip');const b=$('#hintbox');b.innerHTML='💡 '+hintText();b.hidden=false;b.style.opacity=1;clearTimeout(hT);clearTimeout(hT2);hT=setTimeout(()=>{b.style.opacity=0},6000);hT2=setTimeout(()=>{b.hidden=true},7000)}
function loupe(){const t=$('#lp');t.innerHTML=LAB===1?lpV():LAB===2?lpD():'<div class="pair">'+lpV()+lpD()+'</div>'}
function lpD(){const D=I.dyn,t=$('#lp');if(D.rot!==0){return'<span class="hint">Достаньте динамометр из кейса</span>'}
 const F=D.ex/PXN,k=1000,Y=v=>150+(v-F)*k;
 let s=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet"><rect x="10" y="0" width="180" height="300" rx="4" fill="#f7f8f9" stroke="#8a8f95" stroke-width="2"/><text x="182" y="18" text-anchor="end" font-size="13" fill="#222">Н</text>`;
 for(let i=Math.max(0,Math.ceil((F-.16)/.02-1e-9));i*.02<=F+.16;i++){const v=i*.02,y=Y(v),mj=i%5===0;s+=`<line x1="12" x2="${mj?46:28}" y1="${y}" y2="${y}" stroke="#222" stroke-width="${mj?1.6:1}"/>`;if(mj)s+=`<text x="54" y="${y+4}" font-size="12" fill="#222">${v.toFixed(1).replace('.',',')}</text>`}
 return s+`<rect x="12" y="148.5" width="176" height="3" fill="#d22"/><path d="M12 140L26 150L12 160Z" fill="#d22"/></svg>`}
function lpV(){
 const c=I.cyl,t=$('#lp');if(!c.stand){return'<span class="hint">Мензурка не установлена в опору</span>'}
 const L=c.lv,k=8.5,Y=v=>150-(v-L)*k,ml=y=>(c.y+175-y)/1.4;
 let s=`<svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet"><rect x="10" y="0" width="180" height="300" rx="4" fill="#e6f4f8" fill-opacity=".5" stroke="#7ea6b4" stroke-width="2"/><text x="182" y="18" text-anchor="end" font-size="13" fill="#2c4a57">мл</text>`;
 for(const d of all().filter(x=>x.in===c||(x.hung&&x.bk===c))){const w=d.R*3.14,top=Y(ml(d.y-HH.disc)),bot=Y(ml(d.y+HH.disc));
  if(bot>0&&top<300){const cy=Math.min(Math.max((top+bot)/2,20),280);
   s+=`<rect x="${100-w}" y="${top}" width="${2*w}" height="${bot-top}" rx="6" fill="url(#gS${d.mat})" stroke="#555" stroke-width="2"/>`;
   if(d.hung)s+=`<path d="M100 ${top-8}V0" stroke="#555" stroke-width="2.5" fill="none"/>`;else if(d.thread)s+=`<path d="M100 ${top-8}C104 ${top*.6} 96 ${top*.3} 101 0" fill="none" stroke="#222" stroke-width="2.5"/><ellipse cx="100" cy="${top-3}" rx="7" ry="4" fill="none" stroke="#444" stroke-width="2.5"/>`;
   s+=`<circle cx="100" cy="${cy}" r="13" fill="#ffe36a" stroke="#c9a400"/><text x="100" y="${cy+5}" text-anchor="middle" font-size="15" font-weight="700" fill="#222">${d.n}</text>`}}
 if(L>0)s+=`<rect x="12" y="150" width="176" height="${Math.min(148,L*k)}" fill="#3d9be0" fill-opacity=".45"/><path d="M12 147Q100 155 188 147" stroke="#1d6fb5" fill="none" stroke-width="2"/>`;
 for(let v=Math.max(0,Math.ceil((L-18)/2)*2);v<=Math.min(250,L+18);v+=2){const y=Y(v),l=v%10?18:34;
  s+=`<line x1="12" x2="${12+l}" y1="${y}" y2="${y}" stroke="#2c4a57" stroke-width="${v%10?1:1.5}"/>`;if(v%10==0)s+=`<text x="52" y="${y+4}" font-size="12" fill="#2c4a57">${v}</text>`}
 if(L<=0)s+=`<line x1="12" x2="188" y1="150" y2="150" stroke="#1d6fb5"/>`;
 return s+'</svg>'}
function calc(){return LAB===2?calc2():LAB===3?calc3():calc1()}
function calc3(){const a=num($('#q1').value),out=[];[['qa'],['qb'],['qc']].forEach(([p])=>{const b=num($('#'+p).value);if(a&&b&&a>=b)out.push(K('F_{\\text{выт}}='+f(a)+'-'+f(b)+'='+f(a-b)+'\\ \\text{Н}'))});
 $('#calc3').innerHTML=out.length?out.join('<br>'):K('F_{\\text{выт}}=P_1-P_2=\\ldots')}
function calc2(){const a=num($('#p1').value),b=num($('#p2').value);$('#calc2').innerHTML=(a&&b&&a>=b)?K('F_{\\text{выт}}=P_1-P_2='+f(a)+'-'+f(b)+'='+f(a-b)+'\\ \\text{Н}'):K('F_{\\text{выт}}=P_1-P_2=\\ldots')}
function calc1(){
 const m=num($('#m').value),a=num($('#v1').value),b=num($('#v2').value);
 if(m&&a>=0&&b>a){const V=b-a,r=m/V,dr=r*(.1/m+2/V);
  $('#calc').innerHTML=K('V=V_2-V_1='+f(V,1)+'\\ \\text{мл}='+f(V,1)+'\\ \\text{см}^3')+'<br>'+K('\\rho=\\dfrac{m}{V}='+f(r)+'\\ \\dfrac{\\text{г}}{\\text{см}^3}='+Math.round(r*1000)+'\\ \\dfrac{\\text{кг}}{\\text{м}^3}')+'<br>'+K('\\Delta\\rho\\approx\\rho\\left(\\dfrac{\\Delta m}{m}+\\dfrac{\\Delta V}{V}\\right)='+f(dr)+'\\ \\text{г/см}^3')}
 else $('#calc').innerHTML=K('V=V_2-V_1=\\ldots')+'<br>'+K('\\rho=\\dfrac{m}{V}=\\ldots')}
FLD.forEach(i=>$('#'+i).addEventListener('input',calc));
function check1(){
 const m=num($('#m').value),a=num($('#v1').value),b=num($('#v2').value),r=num($('#r').value),o=[];let all_ok=true;
 const add=(ok,t)=>{if(!ok)all_ok=false;o.push(`<div class="${ok?'ok':'er'}">${ok?'✓':'✗'} ${t}</div>`)},g=x=>K(f(x)+'\\ \\text{г}');
 if(!m||isNaN(a)||!b||!r){$('#res').innerHTML='<div class="er">Заполните все поля черновика</div>';sfx('err');return}
 const tg=I[TG],n=tg.n,mt=MS[TG],Vt=tg.V,dm=Math.abs(m-mt),other=VARS.map(v=>v.id).find(id=>id!==TG&&Math.abs(m-MS[id])<=.6+1e-9);
 if(dm<=.1+1e-9)add(1,`Масса цилиндра №${n} измерена верно`);
 else if(dm<=.6+1e-9)add(0,`Масса отличается на ${g(dm)}. Проверьте, обнулены ли весы и не мокрый ли цилиндр`);
 else if(other)add(0,`Это масса цилиндра №${I[other].n}, а не №${n}`);
 else add(0,`Масса не соответствует цилиндру №${n}. Измерьте её на весах`);
 const V=b-a;
 if(V>0&&Math.abs(V-Vt)<=2+1e-9)add(1,`Объём тела ${K(f(V,0)+'\\ \\text{мл}')} найден верно`);
 else add(0,V<=0?'Значение '+K('V_2')+' должно быть больше '+K('V_1'):`Объём получился ${K(f(V,0)+'\\ \\text{мл}')}. Проверьте отсчёты (цена деления ${K('2\\ \\text{мл}')}) и полное погружение`);
 const q=V>0?m/V:0,dr=q?q*(.1/m+2/V):0;
 if(r>100)add(0,'Ответ должен быть в '+K('\\text{г/см}^3')+': число '+K(f(r,0))+' похоже на значение в '+K('\\text{кг/м}^3')+'. Переведите единицы');
 else if(q&&Math.abs(r-q)<=.05*q+1e-9)add(1,'Плотность посчитана по формуле '+K('\\rho=\\dfrac{m}{V}')+' верно');
 else add(0,'Ответ не совпадает с '+K('\\dfrac{m}{V}')+(q?` (у вас получается ${K(f(q)+'\\ \\text{г/см}^3')})`:''));
 if(r<=100&&q&&Math.abs(r-mt/Vt)<=dr+1e-9)add(1,'Результат '+K('\\rho='+f(r)+'\\pm'+f(dr)+'\\ \\text{г/см}^3')+' согласуется с реальным значением в пределах погрешности');
 else add(0,'Результат выходит за пределы допустимой погрешности');
 $('#res').innerHTML=o.join('');sfx(all_ok?'ok':'bad')}
function check2(){const p1=num($('#p1').value),p2=num($('#p2').value),fa=num($('#fa').value),fs=$('#fs').value,o=[];let all_ok=true;
 const add=(ok,t)=>{if(!ok)all_ok=false;o.push(`<div class="${ok?'ok':'er'}">${ok?'✓':'✗'} ${t}</div>`)},N=x=>K(f(x)+'\\ \\text{Н}');
 if(!p1||!p2||!fa||!fs){$('#res').innerHTML='<div class="er">Заполните все поля черновика</div>';sfx('err');return}
 const tg=I[TG],n=tg.n,W=MS[TG]*G/1000,B=.0098*tg.V,P2=W-B;
 if(fs==='a')add(1,'Формула '+K('F_{\\text{выт}}=P_1-P_2')+' выбрана верно');
 else add(0,'Формула неверна: выталкивающая сила равна разности веса в воздухе и веса в воде, '+K('F_{\\text{выт}}=P_1-P_2'));
 const other=VARS.map(v=>v.id).find(id=>id!==TG&&Math.abs(p1-MS[id]*G/1000)<=.04+1e-9);
 if(Math.abs(p1-W)<=.03+1e-9)add(1,`Вес цилиндра №${n} в воздухе ${K('P_1='+f(p1)+'\\ \\text{Н}')} измерен верно`);
 else if(other)add(0,`Это вес цилиндра №${I[other].n}, а не №${n}`);
 else add(0,'Значение '+K('P_1')+' не соответствует весу цилиндра в воздухе. Проверьте показание динамометра');
 if(Math.abs(p2-P2)<=.03+1e-9)add(1,`Вес в воде ${K('P_2='+f(p2)+'\\ \\text{Н}')} измерен верно`);
 else if(p2>P2+.03)add(0,'Значение '+K('P_2')+' слишком велико: цилиндр должен быть полностью погружён в воду');
 else add(0,'Значение '+K('P_2')+' слишком мало: цилиндр не должен касаться дна или стенок стакана');
 if(p1>=p2&&Math.abs(fa-(p1-p2))<=.011+1e-9)add(1,'Выталкивающая сила посчитана по вашим измерениям верно');
 else add(0,'Значение '+K('F_{\\text{выт}}')+' не совпадает с разностью '+K('P_1-P_2')+(p1>=p2?` (у вас получается ${N(p1-p2)})`:''));
 if(Math.abs(fa-B)<=.04+1e-9)add(1,'Результат '+K('F_{\\text{выт}}='+f(fa)+'\\ \\text{Н}')+' согласуется с реальным значением в пределах погрешности '+K('\\pm 0{,}04\\ \\text{Н}'));
 else add(0,'Результат выходит за пределы допустимой погрешности');
 $('#res').innerHTML=o.join('');sfx(all_ok?'ok':'bad')}
function check3(){const v=i=>$('#'+i).value,q1=num(v('q1')),o=[];let all_ok=true;
 const add=(ok,t)=>{if(!ok)all_ok=false;o.push(`<div class="${ok?'ok':'er'}">${ok?'✓':'✗'} ${t}</div>`)};
 const rows=[['qa','ra',.25,'\\dfrac{1}{4}'],['qb','rb',.5,'\\dfrac{1}{2}'],['qc','rc',1,'1']];
 if(!q1||rows.some(([p,r])=>!num(v(p))||!num(v(r)))||!v('qs')||!v('qn')){$('#res').innerHTML='<div class="er">Заполните все поля черновика</div>';sfx('err');return}
 const tg=I[TG],n=tg.n,W=MS[TG]*G/1000,B=.0098*tg.V;
 add(v('qs')==='a','Формула '+K('F_{\\text{выт}}=P_1-P_2')+(v('qs')==='a'?' выбрана верно':' выбрана неверно: выталкивающая сила равна разности веса в воздухе и веса в воде'));
 add(Math.abs(q1-W)<=.03+1e-9,Math.abs(q1-W)<=.03+1e-9?`Вес цилиндра №${n} в воздухе ${K('P_1='+f(q1)+'\\ \\text{Н}')} измерен верно`:'Значение '+K('P_1')+` не соответствует весу цилиндра №${n} в воздухе`);
 const Fs=[];
 rows.forEach(([p,r,fr,tx])=>{const p2=num(v(p)),F=num(v(r)),ex=W-B*fr,tol=fr===1?.035:.035+.05*B,lab=K('V_{\\text{погр}}='+tx);Fs.push(F);
  if(Math.abs(p2-ex)<=tol+1e-9)add(1,`Погружение ${lab}: ${K('P_2='+f(p2)+'\\ \\text{Н}')} измерен верно`);
  else add(0,`Погружение ${lab}: значение ${K('P_2')} `+(p2>ex?'слишком велико, цилиндр погружён меньше, чем нужно':'слишком мало, цилиндр погружён больше, чем нужно или касается дна'));
  add(Math.abs(F-(q1-p2))<=.011+1e-9,Math.abs(F-(q1-p2))<=.011+1e-9?`Погружение ${lab}: ${K('F_{\\text{выт}}='+f(F)+'\\ \\text{Н}')} посчитана верно`:`Погружение ${lab}: ${K('F_{\\text{выт}}')} не совпадает с ${K('P_1-P_2')} (получается ${K(f(q1-p2)+'\\ \\text{Н}')})`)});
 add(Fs[0]<Fs[1]&&Fs[1]<Fs[2],Fs[0]<Fs[1]&&Fs[1]<Fs[2]?'Значения выталкивающей силы растут с объёмом погружённой части':'Выталкивающая сила должна расти с увеличением объёма погружённой части');
 add(v('qn')==='a',v('qn')==='a'?'Вывод сформулирован верно':'Вывод неверен: чем больше объём погружённой части, тем больше выталкивающая сила');
 $('#res').innerHTML=o.join('');sfx(all_ok?'ok':'bad')}
$('#chk').onclick=()=>LAB===2?check2():LAB===3?check3():check1();
document.querySelectorAll('[data-k]').forEach(el=>el.innerHTML=K(el.dataset.k));
init();BASE=snap();requestAnimationFrame(tick);
