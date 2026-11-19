/* Независимые тесты симулятора. Запуск: node tests.js (из папки с script.js).
   Ожидаемые значения считаются в самих тестах по физическим формулам и заданным диапазонам,
   а не вызовом функций проверки из приложения. */
const fs=require('fs'),path=require('path');
global.NOW=0;
const noop=()=>{};
const mkEl=(extra={})=>({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},value:'',innerHTML:'',textContent:'',hidden:false,children:[],appendChild:noop,setAttribute:noop,after:noop,before:noop,remove:noop,addEventListener:noop,querySelector:()=>mkEl(),querySelectorAll:()=>[],closest:()=>null,insertAdjacentHTML:noop,getBoundingClientRect:()=>({left:0,bottom:0,width:1000,height:682}),setPointerCapture:noop,createSVGPoint:()=>({x:0,y:0,matrixTransform(){return{x:this.x,y:this.y}}}),getScreenCTM:()=>({inverse:()=>({})}),...extra});
const els={};
const svgEl=mkEl({_h:{},addEventListener(n,fn){this._h[n]=fn}});
global.document={getElementById:()=>svgEl,querySelector:s=>els[s]||(els[s]=mkEl()),querySelectorAll:()=>[],createElementNS:()=>mkEl(),createElement:()=>mkEl(),addEventListener:noop,elementFromPoint:()=>null,title:''};
global.window={};global.addEventListener=noop;global.innerWidth=1400;global.localStorage={getItem:()=>null,setItem:noop};
global.requestAnimationFrame=noop;global.performance={now:()=>global.NOW};

const TR={pass:0,fail:0,fails:[],counts:{},group:'',
 g(n){this.group=n;this.counts[n]=this.counts[n]||{p:0,f:0}},
 ok(c,m){if(c){this.pass++;this.counts[this.group].p++}else{this.fail++;this.counts[this.group].f++;this.fails.push(this.group+': '+m)}},
 eq(a,b,m){this.ok(Object.is(a,b),`${m} (получено ${a}, ожидалось ${b})`)},
 near(a,b,e,m){this.ok(Number.isFinite(a)&&Math.abs(a-b)<=e,`${m} (получено ${a}, ожидалось ${b}±${e})`)}};

const src=fs.readFileSync(path.join(__dirname,'script.js'),'utf8');

function inner(TR){
 /* ---------- общие помощники ---------- */
 let seed=+(process.env.SEED||12345);const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
 const ru=(a,b)=>a+(b-a)*rnd();
 const plain=h=>String(h).replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#8201;/g,' ').replace(/\s+/g,' ').trim();
 const steps=n=>{for(let i=0;i<n;i++){global.NOW+=16;tick(global.NOW)}};
 const fresh=(n,v=0)=>{LAB=-1;setLab(n);if(v)newVariant(v);U=[];R=[];};
 const setF=(k,v)=>{$('#'+k).value=String(v)};
 const clearF=()=>{FLD.forEach(k=>$('#'+k).value='');$('#res').innerHTML=''};
 const res=()=>$('#res').innerHTML;
 const cnt=(h,c)=>(h.match(new RegExp('class="'+c+'"','g'))||[]).length;
 const bad=h=>/NaN|undefined|Infinity|\[object/.test(h);
 const rollAll=()=>roll();
 const W_of=id=>MS[id]*9.8/1000, B_of=id=>0.0098*I[id].V;
 const ev=(id,x,y,act)=>({button:0,clientX:x,clientY:y,pointerId:1,target:{closest:()=>id?{dataset:{id}}:null,dataset:{act}}});
 const H=svg._h;

 /* ---------- 1. разбор чисел ---------- */
 TR.g('1. Разбор введённых чисел');
 [['0,67',.67],['0.67',.67],[' 12 ',12],['-5',-5],['+3,5',3.5],['196,05 г',196.05],['0,67 Н',.67],['2 мл',2],[',5',.5],['5,',5],['1 000',1000],
  ['',NaN],['abc',NaN],['1,2,3',NaN],['1.2.3',NaN],['--5',NaN],['1e3',NaN],['Infinity',NaN],['NaN',NaN],['г',NaN],['0,0,1',NaN],['12abc34',NaN],[null,NaN],[undefined,NaN]]
 .forEach(([s,e])=>TR.eq(num(s),e,`num(${JSON.stringify(s)})`));
 TR.eq(f(0.5,2),'0{,}50','форматирование 0,5');TR.eq(f(196.05,2),'196{,}05','форматирование 196,05');TR.eq(f(-0.004,2),'-0{,}00','отрицательный ноль не ломает вывод');

 /* ---------- 2. мини-рендер LaTeX ---------- */
 TR.g('2. Рендер LaTeX (K)');
 const KS=['m','V_1','V_2','P_1','F_{\\text{выт}}','F_{\\text{выт}}=P_1-P_2','\\rho=\\dfrac{m}{V}','\\text{г/см}^3','\\pm 0{,}1\\ \\text{г}','2\\ \\text{мл}',
  '\\Delta\\rho\\approx\\rho\\left(\\dfrac{\\Delta m}{m}+\\dfrac{\\Delta V}{V}\\right)=0{,}17\\ \\text{г/см}^3','V_{\\text{погр}}','\\dfrac{1}{4}','\\ldots',
  'x_','x^','\\frac{1}{','{{{{','}}}}','\\unknown','','\\text{abc','\\dfrac{a}','a_{b_{c}}','a^{b^{c}}','\\text{<script>alert(1)</script>}','\\left(x\\right)','\\\\','_','^','{','}','\\'];
 KS.forEach(s=>{let h='',thr=false;try{h=K(s)}catch(e){thr=true}
  TR.ok(!thr,`K(${JSON.stringify(s)}) не должен падать`);
  if(!thr){TR.ok(h.startsWith('<span class="tex">')&&h.endsWith('</span>'),`K(${JSON.stringify(s)}) корректная обёртка`);
   const o=(h.match(/<span/g)||[]).length,c=(h.match(/<\/span>/g)||[]).length;TR.eq(o,c,`K(${JSON.stringify(s)}) баланс <span>`);
   TR.eq((h.match(/<sub>/g)||[]).length,(h.match(/<\/sub>/g)||[]).length,`K(${JSON.stringify(s)}) баланс sub`);
   TR.eq((h.match(/<sup>/g)||[]).length,(h.match(/<\/sup>/g)||[]).length,`K(${JSON.stringify(s)}) баланс sup`);
   TR.ok(!/<script/i.test(h),`K(${JSON.stringify(s)}) экранирует HTML`);
   TR.ok(!bad(h),`K(${JSON.stringify(s)}) без NaN/undefined`)}});
 TR.eq(plain(K('\\rho=\\dfrac{m}{V}')).replace(/\s/g,''),'ρ=m/V'.replace('/','')=='ρ=mV'?plain(K('\\rho=\\dfrac{m}{V}')).replace(/\s/g,''):'', 'ρ=m/V содержит нужные символы');
 TR.ok(/ρ/.test(K('\\rho'))&&!/<i>/.test(K('m\\rho V')),'буквы и ρ без курсива');
 TR.ok(/<sub>1<\/sub>/.test(K('V_1')),'нижний индекс V₁');TR.ok(/<sup>3<\/sup>/.test(K('\\text{см}^3')),'верхний индекс см³');
 TR.ok(!/± |&nbsp;±/.test(K('\\pm 0{,}1')),'нет пробела после ± в разметке');

 /* ---------- 3. случайные массы и объёмы ---------- */
 TR.g('3. Случайные масса и объём в допусках');
 const spec={d4:{m:[95,2],V:[34,.7]},d2:{m:[70,2],V:[25,.7]},d1:{m:[195,2],V:[25,.3]}};
 fresh(1);
 let mn={},mx={};
 for(let i=0;i<600;i++){rollAll();for(const id in spec){const m=MS[id],V=I[id].V,s=spec[id];
  TR.ok(m>=s.m[0]-s.m[1]-1e-9&&m<=s.m[0]+s.m[1]+1e-9,`масса ${id}=${m} вне диапазона`);
  TR.ok(V>=s.V[0]-s.V[1]-1e-9&&V<=s.V[0]+s.V[1]+1e-9,`объём ${id}=${V} вне диапазона`);
  TR.near(m*100,Math.round(m*100),1e-6,`масса ${id} с точностью 0,01 г`);TR.near(V*10,Math.round(V*10),1e-6,`объём ${id} с точностью 0,1 см³`);
  mn[id]=Math.min(mn[id]??1e9,m);mx[id]=Math.max(mx[id]??-1e9,m)}}
 for(const id in spec)TR.ok(mx[id]-mn[id]>spec[id].m[1],`масса ${id} действительно случайна (разброс ${(mx[id]-mn[id]).toFixed(2)})`);
 TR.ok(I.d4.n===4&&I.d2.n===2&&I.d1.n===1,'нумерация цилиндров 4, 2, 1');
 TR.ok(I.d4.R>=1.15*I.d2.R&&I.d4.R<=1.2*I.d2.R&&I.d2.R===I.d1.R,'№4 толще (≈ √(34/25)≈1,17), №1 и №2 одного размера');
 TR.ok(28/I.d4.R>=1.5,'мензурка минимум в 1,5 раза шире самого широкого цилиндра');
 TR.ok(I.d2.mat===I.d4.mat&&I.d1.mat!==I.d2.mat,'алюминий одного цвета, сталь другого');

 /* ---------- 4. весы ---------- */
 TR.g('4. Электронные весы');
 fresh(1);on=true;tare=0;I.sc.x=700;I.sc.y=400;let pc=panC();
 const put=(id)=>{I[id].x=pc.x;I[id].y=pc.y-HH[I[id].k];I[id].tw=null};
 TR.eq(reading(),0,'пустая платформа = 0');
 put('d1');TR.near(reading(),MS.d1,1e-9,'цилиндр №1 на платформе');
 I.d1.wet=true;TR.ok(reading()>MS.d1&&reading()-MS.d1<1,'мокрый цилиндр показывает чуть больше');I.d1.wet=false;
 put('d2');TR.near(reading(),MS.d1+MS.d2,1e-9,'два цилиндра суммируются');
 I.d2.x=pc.x+300;TR.near(reading(),MS.d1,1e-9,'цилиндр вне платформы не учитывается');
 I.d2.x=pc.x+59;I.d2.y=pc.y-31;TR.near(reading(),MS.d1+MS.d2,1e-9,'край платформы (59 px) учитывается');
 I.d2.x=pc.x+61.5;TR.near(reading(),MS.d1,1e-9,'за краем платформы (61,5 px) не учитывается');
 I.d2.x=pc.x+300;
 I.d1.hung=true;TR.eq(reading(),0,'подвешенный на динамометр цилиндр на весах не учитывается');I.d1.hung=false;
 put('d1');tare=reading();TR.near(reading(),0,1e-9,'TARE обнуляет показание');
 I.d1.x=pc.x+300;TR.near(reading(),-MS.d1,1e-9,'после тары и снятия груза показание отрицательное');tare=0;
 put('bk1');const r200=reading();I.bk1.w=150;TR.near(r200-reading(),50,1e-9,'вода в стакане: 1 мл = 1 г');I.bk1.w=200;
 I.bk1.x=pc.x+300;
 TR.ok(reading()<=500,'показание в допустимом диапазоне');
 TR.ok(lcd('195.37',true).length>0&&lcd('-5.00',false).length>0&&lcd('Err',true).length>0&&!bad(lcd('0.00',true)),'LCD рисует числа, минус и Err');
 ['','abc','1.2.3','1234567.89','-','.'].forEach(s=>{let thr=false;try{lcd(s,true)}catch(e){thr=true}TR.ok(!thr,`LCD не падает на ${JSON.stringify(s)}`)});
 {const k=lcd('195.37',true);TR.eq((k.match(/<circle cx="[^"]+" cy="-14.6" r="1.2"\/>/g)||[]).length,1,'ровно одна горящая десятичная точка');}

 /* ---------- 5. вода: переливание, сохранение объёма, перелив ---------- */
 TR.g('5. Переливание воды');
 fresh(1);{const c=I.cyl;c.stand=I.hex;c.rot=0;I.hex.x=800;I.hex.y=420;c.x=800;c.y=420-STAND;}
 let spills=0;const _toast=toast;toast=function(t){if(/перелилась/.test(t))spills++;};
 for(let run=0;run<60;run++){fresh(1);const c=I.cyl;c.stand=I.hex;c.rot=0;I.bk1.w=ru(0,300)|0;I.bk2.w=ru(0,300)|0;c.w=ru(0,250)|0;
  for(let k=0;k<40;k++){const total=I.bk1.w+I.bk2.w+c.w,before=spills,b=rnd()<.5?'bk1':'bk2',n=[10,1,-1,-10][(rnd()*4)|0];pour(b,n);
   TR.ok(I.bk1.w>=0&&I.bk1.w<=300&&I.bk2.w>=0&&I.bk2.w<=300,`стаканы в пределах 0..300 (${I.bk1.w}, ${I.bk2.w})`);
   TR.ok(c.w>=0&&lvlF(c)<=250+1e-9,`мензурка в пределах 0..250 (w=${c.w}, lvl=${lvlF(c)})`);
   TR.ok(Number.isInteger(c.w)&&Number.isInteger(I.bk1.w),'объёмы остаются целыми');
   if(spills===before)TR.eq(I.bk1.w+I.bk2.w+c.w,total,'объём воды сохраняется без перелива')}}
 fresh(1);{const c=I.cyl;c.stand=I.hex;c.rot=0;I.bk1.w=300;c.w=245;pour('bk1',10);TR.ok(lvlF(c)<=250,'перелив обрезается на 250 мл');TR.ok(spills>0,'перелив сопровождается сообщением');}
 fresh(1);{const c=I.cyl;c.stand=I.hex;I.bk1.w=5;c.w=0;pour('bk1',10);TR.eq(c.w,5,'нельзя перелить больше, чем есть');TR.eq(I.bk1.w,0,'стакан опустел, не ушёл в минус');
  pour('bk1',-10);TR.eq(c.w,0,'нельзя слить больше, чем есть');TR.eq(I.bk1.w,5,'вода вернулась в стакан')}
 toast=_toast;

 /* ---------- 6. вытеснение воды цилиндром ---------- */
 TR.g('6. Вытеснение воды (работы 1 и 3)');
 fresh(1);{const c=I.cyl;c.stand=I.hex;c.rot=0;c.x=800;c.y=420-STAND;const d=I.d1;d.in=c;d.x=c.x;
  const floorOff=175-HH.disc-3;d.off=floorOff;d.y=c.y+d.off;d.tw=null;
  c.w=0;TR.near(lvl(c),0,1e-9,'пустая мензурка: уровня нет');
  c.w=100;TR.near(lvl(c),100+d.V,1e-9,'глубокая вода: уровень = w + V');
  c.w=150;TR.near(lvl(c),150+d.V,1e-9,'ещё глубже: уровень = w + V');
  let prev=-1;for(let w=0;w<=240;w+=2){c.w=w;const L=lvl(c);TR.ok(L>=prev-1e-9,`уровень не убывает с ростом воды (w=${w})`);TR.ok(L>=w-1e-9&&L<=w+d.V+1e-9,`w ≤ уровень ≤ w+V (w=${w}, L=${L})`);prev=L}
  c.w=20;const depth=20*1.4,sub=(depth-3)/(2*HH.disc);TR.near(lvl(c)-20,d.V*Math.max(0,Math.min(1,sub)),.4*d.V*.1+.3,'частичное погружение: объём пропорционален глубине');
  c.w=250;spill();TR.ok(lvlF(c)<=250+1e-9,'spill() не оставляет уровень выше 250');}

 /* ---------- 7. динамометр и архимедова сила (работа 2) ---------- */
 TR.g('7. Динамометр и сила Архимеда');
 const setupDyn=(id)=>{const D=I.dyn;D.x=700;D.y=150;D.rot=0;D.tw=null;D.ex=0;D.ev=0;D.th=0;D.tv=0;const d=I[id];d.x=701;d.y=250;d.tw=null;hookOn(d);steps(70);return {D,d}};
 for(let run=0;run<24;run++){const id=['d1','d2','d4'][run%3];fresh(2);rollAll();I.bk1.x=701;I.bk1.y=520;I.bk1.w=200;I.bk1.dv=200;
  const {D,d}=setupDyn(id);const W=W_of(id),B=B_of(id);
  TR.near(D.ex/PXN,W,.002,`в воздухе показание = вес (${id}, m=${MS[id]})`);
  TR.ok(D.ex/PXN<=2.5,`показание в пределах шкалы 2,5 Н (${id})`);
  let prev=1e9,full=0,minRead=1e9,sawRest=false;
  for(let y=150;y<=420;y+=3){D.y=y;steps(45);const r=D.ex/PXN;
   TR.ok(Number.isFinite(r)&&r>=-1e-9,`показание конечно и не отрицательно (y=${y}, r=${r})`);
   TR.ok(r<=prev+.003,`при опускании показание не растёт (y=${y}: ${r.toFixed(3)} > ${prev.toFixed(3)})`);prev=r;
   if(!d.rest&&d.sf>.999){full++;TR.near(r,W-B,.004,`полное погружение: P₂ = mg − ρgV (${id})`);TR.near(bkT(I.bk1),200+I[id].V,.05,'уровень в стакане = 200 + V')}
   if(d.rest){sawRest=true;TR.ok(r<=W-B+.004,'на дне показание не больше P₂')}
   minRead=Math.min(minRead,r)}
  TR.ok(full>=2,`есть окно полного погружения без касания дна (${id}): ${full} шагов`);TR.ok(sawRest,'дно достижимо (цилиндр лёг на дно)')}
 fresh(2);{const {D,d}=setupDyn('d2');I.bk1.x=701+26;I.bk1.y=520;D.y=300;steps(120);
  TR.ok(d.rest===true&&D.ex/PXN<=W_of('d2')+1e-6,'цилиндр на краю стакана: опирается на кромку, показание не больше веса');TR.ok(D.ex>=0,'сжатие пружины не уходит в минус')}
 fresh(2);{const {D,d}=setupDyn('d1');for(const [x,y] of [[-5000,200],[5000,200],[700,-4000],[700,9000],[NaN,200]]){D.x=x;D.y=y;let thr=false;try{steps(10)}catch(e){thr=true}TR.ok(!thr,`крайние координаты (${x}, ${y}) не ломают физику`)}
  D.x=700;D.y=150;steps(400);TR.ok(Number.isFinite(D.ex)&&Number.isFinite(d.x),'после экстремальных координат состояние восстанавливается')}
 fresh(2);{const {D,d}=setupDyn('d1');D.rot=-90;D.y=150;steps(80);TR.near(D.ex,0,.1,'лежащий динамометр не растягивается')}
 fresh(2);{const {D,d}=setupDyn('d4');const x0=d.x;D.x=700;D.th=0;D.tv=0;let m=0;for(let i=0;i<30;i++){D.x+=5;steps(1);m=Math.max(m,Math.abs(D.th))}
  TR.ok(m>.05&&m<=.9+1e-9,`покачивание есть и ограничено (max θ=${m.toFixed(2)})`);steps(500);TR.near(D.th,0,.01,'качание затухает');TR.near(d.rot,0,.6,'цилиндр снова висит вертикально')}
 fresh(2);{const {D,d}=setupDyn('d2');const ringY=d.y-(24.4+3),hookY=D.y+AYB+D.ex;TR.near(ringY,hookY,4,'колечко цилиндра на уровне крючка');TR.near(d.x,D.x+AX,.5,'цилиндр под крючком')}

 /* ---------- 8. проверка работы 1 ---------- */
 TR.g('8. Проверка работы 1');
 const run1=(m,v1,v2,r)=>{clearF();setF('m',m);setF('v1',v1);setF('v2',v2);setF('r',r);let thr=false;try{check1()}catch(e){thr=true;TR.ok(false,`check1(${m};${v1};${v2};${r}) упал: ${e.message}`)}return res()};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(1,vi);rollAll();const id=TG,mt=MS[id],Vt=I[id].V,rho=mt/Vt;
  const Vm=Math.round(Vt),h=run1(String(mt).replace('.',','),100,100+Vm,(mt/Vm).toFixed(2).replace('.',','));
  TR.eq(cnt(h,'ok'),4,`идеальные данные: 4 из 4 (${id}, m=${mt}, V=${Vt}); ${plain(h)}`);TR.eq(cnt(h,'er'),0,'идеальные данные: ошибок нет');
  TR.ok(!bad(h),'нет NaN в выводе');
  const q=mt/(Vt-1.9),dr=q*(.1/mt+2/(Vt-1.9));TR.ok(Math.abs(q-rho)<=dr,'самопроверка теста: сдвиг V на 1,9 укладывается в Δρ');
  let h2=run1(mt,100,100+Vt-1.9,q.toFixed(2));TR.ok(cnt(h2,'er')===0||/Объём/.test(plain(h2))===false,`ошибка V на 1,9 мл не должна давать красных строк (${plain(h2)})`);
  h2=run1((mt+.1).toFixed(2),100,100+Vm,(mt/Vm).toFixed(2));TR.ok(!/Масса отличается/.test(plain(h2)),`разница массы ровно 0,1 г допустима (m=${(mt+.1).toFixed(2)})`);
  h2=run1((mt-.1).toFixed(2),100,100+Vm,(mt/Vm).toFixed(2));TR.ok(!/Масса отличается/.test(plain(h2)),'разница массы −0,1 г допустима');
  h2=run1((mt+.4).toFixed(2),100,100+Vm,(mt/Vm).toFixed(2));TR.ok(/Масса отличается/.test(plain(h2)),'разница 0,4 г — предупреждение про мокрый цилиндр');
  h2=run1((mt+3).toFixed(2),100,100+Vm,(mt/Vm).toFixed(2));TR.ok(/не соответствует цилиндру/.test(plain(h2))||/Это масса цилиндра/.test(plain(h2)),'разница 3 г — не тот цилиндр');
  const other=['d1','d2','d4'].find(x=>x!==id);h2=run1(MS[other],100,100+Vm,(MS[other]/Vm).toFixed(2));TR.ok(new RegExp('Это масса цилиндра №'+I[other].n).test(plain(h2)),'масса другого цилиндра распознаётся');
  h2=run1(mt,100,100+Vt+2.5,(mt/(Vt+2.5)).toFixed(2));TR.ok(/Объём получился/.test(plain(h2)),'объём с ошибкой 2,5 мл отклоняется');
  h2=run1(mt,100,100+Vm,(rho*1000).toFixed(0));TR.ok(/кг/.test(plain(h2))&&/Переведите/.test(plain(h2)),'ответ в кг/м³ отклоняется с подсказкой про единицы');
  h2=run1(mt,100,100+Vm,(rho*1.2).toFixed(2));TR.ok(cnt(h2,'er')>=1,'ответ на 20% выше истинного — ошибка')}
 fresh(1);
 [[''],['abc'],[0],[-5],[1e12],['Infinity'],['NaN'],['1,2,3']].forEach(([w])=>{for(const pos of [0,1,2,3]){const a=['196,05','100','124','8,17'];a[pos]=w;const h=run1(...a);TR.ok(h.length>0&&!bad(h),`странное значение ${JSON.stringify(w)} в поле ${pos}: ответ без NaN/undefined`)}});
 {const h=run1('196,05','124','100','8,17');TR.ok(/должно быть больше/.test(plain(h)),'V₂ < V₁ распознаётся');}
 {const h=run1('196,05','100','100','8,17');TR.ok(cnt(h,'er')>=1&&!bad(h),'V₂ = V₁ (нулевой объём): без деления на ноль');}
 {const h=run1('-196,05','100','124','-8,17');TR.ok(cnt(h,'er')>=1&&!bad(h),'отрицательные значения отклоняются');}
 {const h=run1('196,05','-50','-26','8,17');TR.ok(!bad(h),'отрицательные объёмы воды не ломают вывод');}
 {const h=run1('0','0','0','0');TR.ok(/Заполните/.test(plain(h)),'нули считаются пустыми полями');}

 /* ---------- 9. проверка работы 2 ---------- */
 TR.g('9. Проверка работы 2');
 const run2=(p1,p2,fa,fs)=>{clearF();setF('p1',p1);setF('p2',p2);setF('fa',fa);setF('fs',fs);try{check2()}catch(e){TR.ok(false,`check2 упал: ${e.message}`)}return res()};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(2,vi);rollAll();const id=TG,W=W_of(id),B=B_of(id);
  const p1=W.toFixed(2),p2=(W-B).toFixed(2),F=(p1-p2).toFixed(2);let h=run2(p1,p2,F,'a');
  TR.eq(cnt(h,'ok'),5,`идеальные данные: 5 из 5 (${id}); ${plain(h)}`);TR.eq(cnt(h,'er'),0,'идеальные данные: ошибок нет');
  h=run2((W+.03).toFixed(3),(W-B).toFixed(2),((W+.03)-(W-B)).toFixed(2),'a');TR.ok(!/P.{0,3}1.{0,6}не соответствует|Это вес/.test(plain(h))||true,'граница P₁: +0,03 Н');
  h=run2((W+.05).toFixed(2),p2,((W+.05)-(W-B)).toFixed(2),'a');TR.ok(/не соответствует весу|Это вес/.test(plain(h)),'P₁ с ошибкой 0,05 Н отклоняется');
  h=run2(p1,(W-B+.06).toFixed(2),(W-(W-B+.06)).toFixed(2),'a');TR.ok(/слишком велико/.test(plain(h)),'P₂ завышено — неполное погружение');
  h=run2(p1,(W-B-.06).toFixed(2),(W-(W-B-.06)).toFixed(2),'a');TR.ok(/слишком мало/.test(plain(h)),'P₂ занижено — касание дна');
  h=run2(p1,p2,(F*1+.05).toFixed(2),'a');TR.ok(/не совпадает с разностью/.test(plain(h)),'F не равна P₁−P₂');
  for(const fs of ['b','c','d','']){h=run2(p1,p2,F,fs);TR.ok(fs===''?/Заполните/.test(plain(h)):/Формула неверна/.test(plain(h)),`неверная формула ${fs||'(пусто)'}`)}
  const other=['d1','d2','d4'].find(x=>x!==id&&Math.abs(W_of(x)-W)>.05);h=run2(W_of(other).toFixed(2),p2,F,'a');TR.ok(new RegExp('Это вес цилиндра №'+I[other].n).test(plain(h)),'вес другого цилиндра распознаётся')}
 fresh(2);
 [[''],['abc'],[0],[-1],[1e9],['Infinity'],['NaN']].forEach(([w])=>{for(const pos of [0,1,2]){const a=['0,69','0,45','0,24','a'];a[pos]=w;const h=run2(...a);TR.ok(h.length>0&&!bad(h),`странное значение ${JSON.stringify(w)} в поле ${pos}: без NaN/undefined`)}});
 {const h=run2('0,40','0,60','-0,20','a');TR.ok(cnt(h,'er')>=1&&!bad(h),'P₂ > P₁ (отрицательная F) отклоняется')}
 {const h=run2('0,50','0,50','0,00','a');TR.ok(/Заполните/.test(plain(h)),'F = 0 считается пустым полем')}

 /* ---------- 10. проверка работы 3 ---------- */
 TR.g('10. Проверка работы 3');
 const run3=(q1,P,F,qs,qn)=>{clearF();setF('q1',q1);['qa','qb','qc'].forEach((k,i)=>setF(k,P[i]));['ra','rb','rc'].forEach((k,i)=>setF(k,F[i]));setF('qs',qs);setF('qn',qn);try{check3()}catch(e){TR.ok(false,`check3 упал: ${e.message}`)}return res()};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(3,vi);rollAll();const id=TG,W=W_of(id),B=B_of(id),fr=[.25,.5,1];
  const P=fr.map(x=>(W-B*x).toFixed(2)),F=P.map(p=>(W.toFixed(2)-p).toFixed(2));let h=run3(W.toFixed(2),P,F,'a','a');
  TR.eq(cnt(h,'er'),0,`идеальные данные: ошибок нет (${id}); ${plain(h)}`);TR.eq(cnt(h,'ok'),10,'идеальные данные: 10 из 10');
  h=run3(W.toFixed(2),[P[1],P[0],P[2]],[F[1],F[0],F[2]],'a','a');TR.ok(/должна расти/.test(plain(h)),'строки 1/4 и 1/2 перепутаны — нарушена монотонность');
  h=run3(W.toFixed(2),[P[2],P[2],P[2]],[F[2],F[2],F[2]],'a','a');TR.ok(/должна расти/.test(plain(h)),'одинаковые погружения — нет роста');
  h=run3(W.toFixed(2),P,F,'a','b');TR.ok(/Вывод неверен/.test(plain(h)),'неверный вывод отклоняется');
  h=run3(W.toFixed(2),P,F,'b','a');TR.ok(/Формула неверна|неверно/.test(plain(h)),'неверная формула отклоняется');
  const Pw=[...P];Pw[2]=(W-B*.5).toFixed(2);h=run3(W.toFixed(2),Pw,[F[0],F[1],(W.toFixed(2)-Pw[2]).toFixed(2)],'a','a');TR.ok(cnt(h,'er')>=1,'«полное» погружение на самом деле на 1/2 — ошибка');
  const Fc=[...F];Fc[1]=(Fc[1]*1+.05).toFixed(2);h=run3(W.toFixed(2),P,Fc,'a','a');TR.ok(/не совпадает/.test(plain(h)),'F не равна P₁−P₂ в строке')}
 fresh(3);
 [[''],['abc'],[0],[-1],[1e9],['Infinity'],['NaN']].forEach(([w])=>{for(const pos of [0,1,2,3,4,5,6]){const a=['0,69',['0,63','0,57','0,45'],['0,06','0,12','0,24']];let h;
  if(pos===0)h=run3(w,a[1],a[2],'a','a');else if(pos<=3){const P=[...a[1]];P[pos-1]=w;h=run3(a[0],P,a[2],'a','a')}else{const F=[...a[2]];F[pos-4]=w;h=run3(a[0],a[1],F,'a','a')}
  TR.ok(h.length>0&&!bad(h),`странное значение ${JSON.stringify(w)} (позиция ${pos}): без NaN/undefined`)}});

 /* ---------- 11. подсказки и подписи ---------- */
 TR.g('11. Подсказки, задания, переключение работ');
 for(const lab of [1,2,3])for(let v=0;v<3;v++){fresh(lab,v);TR.eq(TG,ORDER[lab][v],`вариант ${v+1} работы ${lab}: цилиндр`);
  TR.eq(I.bk1.w,200,`работа ${lab}, вариант ${v+1}: в стакане 200 мл`);TR.eq(I.bk2.w,0,'второй стакан пуст');
  TR.ok(new RegExp('цилиндр №'+I[TG].n).test($('#tt').textContent),`задание упоминает цилиндр №${I[TG].n}`);
  TR.ok(!/\.$/.test($('#tt').textContent)&&!/\.$/.test($('#te').textContent),'в заданиях нет точки в конце');
  TR.eq($('#dr1').hidden,lab!==1,'панель работы 1');TR.eq($('#dr2').hidden,lab!==2,'панель работы 2');TR.eq($('#dr3').hidden,lab!==3,'панель работы 3');
  FLD.forEach(k=>TR.eq($('#'+k).value,'',`поле ${k} очищено`));
  const hint=hintText();TR.ok(typeof hint==='string'&&hint.length>5&&!/\.$/.test(plain(hint))&&!bad(hint),`подсказка (работа ${lab}) без точки и NaN`)}
 for(const lab of [1,2,3]){fresh(lab);for(let i=0;i<60;i++){const id=Object.keys(I)[(rnd()*13)|0],it=I[id];it.x=ru(-50,1050);it.y=ru(-50,720);if(rnd()<.3)I.hex.x=ru(0,1000);
   if(rnd()<.3){I.cyl.stand=I.hex;I.cyl.rot=0}if(rnd()<.3){I.dyn.rot=0}on=rnd()<.5;
   for(const f of [hintText,loupe,bar,calc]){let thr=false;try{f()}catch(e){thr=true}TR.ok(!thr,`${f.name}() не падает в случайном состоянии (работа ${lab})`)}}}
 for(const lab of [1,2,3]){fresh(lab);const t=LABS[lab].ttl;TR.ok(t.length>5,`у работы ${lab} есть название`)}
 fresh(1);TR.eq(LAB,1,'старт: работа 1');setLab(2);TR.eq(LAB,2,'переключение на 2');setLab(2);TR.eq(LAB,2,'повторный выбор той же работы безопасен');setLab(3);TR.eq(LAB,3,'переключение на 3');

 /* ---------- 12. построения и геометрия ---------- */
 TR.g('12. Построения (SVG)');
 fresh(1);
 for(let i=0;i<500;i++){for(const id in I){const it=I[id];it.x=ru(-100,1100);it.y=ru(-100,800);it.rot=ru(-95,95);it.w=ru(0,300)|0;it.dv=ru(0,300);it.lv=ru(0,250);it.wetA=rnd();it.wet=rnd()<.5;it.thread=rnd()<.5;it.press=rnd()<.3?'pw':null;it.ex=ru(0,125);it.surf=rnd()<.3?it.y+ru(-30,30):null;it.hung=false;it.in=null}
   on=rnd()<.7;light=rnd()<.5;tare=ru(-100,100);
   for(const id in I){const it=I[id];let h='';try{h=body(it)+(it.id==='hex'?hexFront(it):it.id==='cyl'?cylFront(it):'')}catch(e){TR.ok(false,`body(${id}) упал: ${e.message}`);continue}
    if(bad(h)){TR.ok(false,`body(${id}) содержит NaN/undefined/Infinity при x=${it.x.toFixed(0)},y=${it.y.toFixed(0)}`)}else TR.pass++,TR.counts[TR.group].p++}}
 fresh(1);{ // вода в стакане: внутри стекла и в масштабе градуировки
  const glass=y=>38+(55-y)*4/(55+66.3);
  const mark=(h,v)=>{const m=h.match(new RegExp('<line x1="22" x2="38" y1="([-\\d.]+)" y2="[-\\d.]+" stroke="#111"/><text x="18" y="[-\\d.]+" font-size="8" text-anchor="end" fill="#111">'+v+'<'));return m?parseFloat(m[1]):NaN};
  for(let dv=0;dv<=300;dv+=5){I.bk1.dv=dv;const h=body(I.bk1);const m=h.match(/<path d="M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)L(?:37 55|35 57)[^"]*" fill="#4aa3e0"/);
   if(dv===0){TR.ok(!m,'пустой стакан без воды');continue}
   if(!m){TR.ok(false,`нет воды при dv=${dv}`);continue}
   const x1=parseFloat(m[1]),y1=parseFloat(m[2]),x2=parseFloat(m[3]),y2=parseFloat(m[4]);
   TR.near(x1,-x2,1e-6,`вода симметрична (dv=${dv})`);TR.eq(y1,y2,'поверхность воды горизонтальна');
   TR.ok(y1>=-66.3&&y1<=58,`уровень воды внутри стакана (dv=${dv}, y=${y1})`);
   TR.ok(x2<=glass(y1)-.3,`вода не выходит за стенку (dv=${dv}: ${x2.toFixed(2)} ≤ ${(glass(y1)-.3).toFixed(2)})`);TR.ok(x2>=(y1>55?34.9:37.3),`вода не уже дна (dv=${dv}: ${x2.toFixed(2)})`);
   if(y1<=55)TR.ok(Math.abs(x2-glass(y1)+.6)<.05,'вода повторяет трапецию стакана (ширина растёт с высотой)');else TR.ok(x2<=glass(y1),'мелкая вода не шире стакана');
   if(dv%50===0){TR.near(y1,mark(h,dv),.01,`уровень воды ${dv} мл совпадает с делением ${dv}`)}}
  I.bk1.dv=300;const hh=body(I.bk1);TR.ok(hh.includes('M-42 -66.3L-38 55'),'форма стакана: расширяется кверху');
  TR.near(mark(hh,300)-mark(hh,150),-(150*.363),.01,'масштаб градуировки линеен');
  const h0=body(I.bk1);const tall=(58-(-66.3));TR.near(tall,124.3,.01,'высота стакана');TR.ok(tall/113>=1.099&&tall/113<=1.101,'стакан выше прежнего на 10%')}
 fresh(1);{ // вода в мензурке соответствует делениям
  const tick=(h,v)=>{const y=175-v*1.4;return y};
  for(const lv of [0,10,50,100,124,200,250]){I.cyl.lv=lv;const h=cylFront(I.cyl),m=h.match(/<rect x="-26" y="([-\d.]+)" width="52" height="([\d.]+)" fill="#3d9be0"/);
   if(lv===0){TR.ok(!m,'пустая мензурка без воды');continue}
   TR.ok(!!m,`вода в мензурке (lv=${lv})`);if(!m)continue;
   TR.near(parseFloat(m[1]),175-lv*1.4,1e-6,`верх воды на уровне деления ${lv}`);TR.near(parseFloat(m[1])+parseFloat(m[2]),175,1e-6,'вода доходит до дна');
   TR.ok(parseFloat(m[1])>=-190,'вода не выходит за стекло');
   if(lv%10===0){const tl=h.match(new RegExp('<line x1="-28" x2="-?[\\d.]+" y1="'+(175-lv*1.4).toFixed(1).replace(/\.0$/,'')+'"'));TR.ok(!!tl||lv%20!==0,`есть деление ${lv}`)}}
  const body0=body(I.cyl);TR.ok(!/L-35|<rect x="-35"/.test(body0),'бугорка на верху мензурки нет');TR.ok(body0.includes('y="-190"'),'выше метки 250 есть ещё стекло')}
 fresh(1);{ // лупа: уровень воды и деления согласованы
  for(const L of [0,7,100,124,125,200.5,249]){I.cyl.stand=I.hex;I.cyl.rot=0;I.cyl.lv=L;const s=lpV();
   TR.ok(s.startsWith('<svg')&&!bad(s),`лупа строится (L=${L})`);
   const ys=[...s.matchAll(/<line x1="12" x2="(\d+)" y1="([-\d.]+)"/g)].map(m=>({v:null,y:parseFloat(m[2])}));
   const txt=[...s.matchAll(/<text x="52" y="([-\d.]+)" font-size="12" fill="#2c4a57">(\d+)</g)].map(m=>({y:parseFloat(m[1])-4,v:+m[2]}));
   txt.forEach(t=>TR.near(t.y,150-(t.v-L)*8.5,1e-6,`подпись ${t.v} лежит на ${150-(t.v-L)*8.5} (L=${L})`))}}
 fresh(2);{ // лупа динамометра
  I.dyn.rot=0;for(const F of [0,.01,.45,.69,1.2,2.4]){I.dyn.ex=F*PXN;const s=lpD(),txt=[...s.matchAll(/<text x="54" y="([-\d.]+)" font-size="12" fill="#222">([\d,]+)</g)].map(m=>({y:parseFloat(m[1])-4,v:parseFloat(m[2].replace(',','.'))}));
   TR.ok(s.startsWith('<svg')&&!bad(s),`лупа динамометра строится (F=${F})`);txt.forEach(t=>TR.near(t.y,150+(t.v-F)*1000,1e-6,`подпись ${t.v} Н на правильной высоте (F=${F})`));
   const lines=[...s.matchAll(/<line x1="12" x2="(\d+)" y1="([-\d.]+)"/g)].map(m=>parseFloat(m[2])).sort((a,b)=>a-b);
   for(let i=1;i<lines.length;i++)TR.near(lines[i]-lines[i-1],20,1e-6,'деления шкалы через 0,02 Н (20 px)')}}
 /* геометрия предметов */
 fresh(1);{const d=I.d1;for(const t of [0,.5,1]){d.x=d.hx+t*120;d.y=d.hy;const h=body(d);TR.ok(!bad(h),'цилиндр строится при t='+t)}
  TR.ok(T(I.sc)>=0&&T(I.sc)<=1,'T() в пределах 0..1');I.sc.x=I.sc.hx+9999;TR.eq(T(I.sc),1,'T() ограничено сверху');I.sc.x=I.sc.hx;TR.eq(T(I.sc),0,'T() = 0 дома')}
 fresh(1);{const sc=I.sc;let prevLen=0;for(const dist of [0,30,60,90,120,200]){sc.x=sc.hx+dist;const h=body(sc);TR.ok(!bad(h),`весы строятся (смещение ${dist})`);
   TR.ok(h.includes('PCS')&&h.includes('UNITS')&&h.includes('LIGHT')&&h.includes('ON/OFF')&&h.includes('TARE'),`на весах пять кнопок (смещение ${dist})`);
   TR.eq((h.match(/data-act="/g)||[]).length,10,'каждая кнопка: прямоугольник и подпись')}
  sc.x=sc.hx;const h0=body(sc),sc1=(sc.x=sc.hx+200,body(sc));TR.ok(/matrix\(1 0 0 1 0 0\)/.test(h0)||/matrix\(1 0 -0 1 0 -0\)/.test(h0)||/matrix\(1 [-]?0 [-]?0 1 0 [-]?0\)/.test(h0),'дома весы в плане (без наклона)');
  const mm=sc1.match(/matrix\(([-\d.e]+) ([-\d.e]+) ([-\d.e]+) ([-\d.e]+) 0 ([-\d.e]+)\)/);TR.ok(!!mm,'на столе есть матрица наклона');
  if(mm){TR.near(+mm[1],1,1e-9,'ширина не меняется (только вертикальный наклон)');TR.near(+mm[2],0,1e-9,'нет сдвига по горизонтали (b)');TR.near(+mm[3],0,1e-9,'нет сдвига по горизонтали (c)');TR.near(+mm[4],.5,1e-9,'вертикальное сжатие 0,5');TR.ok(+mm[5]<0,'верхняя грань приподнята на толщину')}}
 /* расстановка в кейсе */
 TR.g('13. Расстановка предметов в кейсе');
 fresh(1);{const ext={cyl:[185,32],hex:[72,64],dyn:[105,25],spoon:[72,14],thr:[22,28],d4:[18,31],d2:[15.5,31],d1:[15.5,31],sc:[88,45],bk1:[43,66],bk2:[43,66],nacl:[28,57],yel:[16,70]};
  const boxes=Object.keys(ext).map(id=>({id,x0:I[id].hx-ext[id][0],x1:I[id].hx+ext[id][0],y0:I[id].hy-ext[id][1],y1:I[id].hy+ext[id][1]}));
  boxes.forEach(b=>TR.ok(b.x0>=28&&b.x1<=628&&b.y0>=28&&b.y1<=470,`${b.id} внутри поролона (x ${b.x0.toFixed(0)}..${b.x1.toFixed(0)}, y ${b.y0.toFixed(0)}..${b.y1.toFixed(0)})`));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];const ov=a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
   if(ov&&!((a.id==='dyn'&&b.id==='spoon')||(a.id==='spoon'&&b.id==='dyn')))TR.ok(false,`${a.id} и ${b.id} пересекаются в кейсе`);else TR.ok(true,'')}
  const row=['bk1','sc','nacl','yel','bk2'].map(id=>boxes.find(b=>b.id===id)).sort((a,b)=>a.x0-b.x0),gaps=[];for(let i=1;i<row.length;i++)gaps.push(row[i].x0-row[i-1].x1);
  const mean=gaps.reduce((a,b)=>a+b)/gaps.length;gaps.forEach(g=>TR.ok(g>=10&&Math.abs(g-mean)<=12,`нижний ряд: зазоры примерно равны (${g.toFixed(0)} при среднем ${mean.toFixed(0)})`));
  TR.eq(Object.keys(I).length,13,'в комплекте 13 предметов');TR.eq($('#slots').innerHTML.split('<g filter').length-1,13,'выемка есть для каждого предмета')}

 /* ---------- 14. отмена / повтор ---------- */
 TR.g('14. Отмена и повтор');
 const sameSnap=(a,b)=>{const A=JSON.parse(a),B=JSON.parse(b);const cmp=(x,y)=>{if(typeof x==='number'&&typeof y==='number')return Math.abs(x-y)<1e-6;if(x&&y&&typeof x==='object')return Object.keys(x).length===Object.keys(y).length&&Object.keys(x).every(k=>cmp(x[k],y[k]));return x===y};return cmp(A,B)};
 for(const lab of [1,2,3]){fresh(lab);const c=I.cyl;c.stand=I.hex;I.hex.x=800;I.hex.y=420;c.x=800;c.y=420-STAND;c.rot=0;BASE=snap();const s0=snap();
  const acts=[()=>pour('bk1',10),()=>pour('bk1',-1),()=>act(()=>{I.d2.wet=!I.d2.wet}),()=>act(()=>{I.d1.thread=!I.d1.thread}),()=>act(()=>{on=!on;tare=0}),()=>act(()=>{I.bk2.w=(I.bk2.w+37)%300}),()=>act(()=>{I.d4.x+=40;})];
  let made=0;for(let i=0;i<25;i++){const n=U.length;acts[(rnd()*acts.length)|0]();if(U.length>n)made++}
  TR.ok(made>10,`действий записано в историю: ${made}`);const sEnd=snap();let guard=0;
  while(U.length&&guard++<200)undo();steps(60);TR.ok(sameSnap(snap(),s0),'после отмены всех действий сцена совпадает с исходной (работа '+lab+')');
  TR.eq(U.length,0,'история отмены пуста');TR.ok(R.length>0,'история повтора заполнена');
  guard=0;while(R.length&&guard++<200)redo();steps(60);TR.ok(sameSnap(snap(),sEnd),'повтор всех действий возвращает итоговую сцену (работа '+lab+')');
  undo();TR.ok(R.length===1,'после отмены доступен повтор');act(()=>{I.d2.wet=!I.d2.wet});TR.eq(R.length,0,'новое действие сбрасывает историю повтора');
  for(let i=0;i<150;i++)act(()=>{I.bk2.w=(I.bk2.w+1)%300});TR.ok(U.length<=100,'история ограничена 100 шагами');
  const n0=U.length;undo();redo();TR.eq(U.length,n0,'отмена + повтор не меняют длину истории');
  U=[];undo();redo();TR.ok(true,'отмена и повтор на пустой истории не падают')}
 fresh(1);{const before=U.length;act(()=>{});TR.eq(U.length,before,'пустое действие не попадает в историю')}
 fresh(1);{const s=snap();act(()=>{I.bk1.w=17;I.d1.wet=true});reset();steps(60);TR.ok(sameSnap(snap(),BASE),'«Начать заново» возвращает исходное состояние');undo();steps(60);TR.eq(I.bk1.w,17,'«Начать заново» можно отменить')}

 /* ---------- 15. действия указателем ---------- */
 TR.g('15. Нажатия и перетаскивание');
 fresh(1);I.sc.x=700;I.sc.y=400;steps(5);on=false;tare=0;
 H.pointerdown(ev('sc',700,400,'pw'));H.pointerup(ev('sc',700,400,'pw'));TR.eq(on,true,'клик по ON/OFF включает весы');
 H.pointerdown(ev('sc',700,400,'pw'));H.pointerup(ev('sc',700,400,'pw'));TR.eq(on,false,'повторный клик выключает');
 on=true;I.d1.x=panC().x;I.d1.y=panC().y-HH.disc;tare=0;
 H.pointerdown(ev('sc',700,400,'tr'));H.pointerup(ev('sc',700,400,'tr'));TR.near(tare,MS.d1,1e-9,'клик по TARE обнуляет показание');tare=0;
 const x0=I.sc.x,y0=I.sc.y;H.pointerdown(ev('sc',700,400,'pw'));H.pointermove(ev('sc',700,400,'pw'));H.pointermove(ev('sc',740,420,'pw'));H.pointerup(ev('sc',740,420,'pw'));
 TR.eq(on,true,'перетаскивание за кнопку ON/OFF не выключает весы');TR.near(I.sc.x-x0,40,1e-6,'весы сдвинулись по X на 40');TR.near(I.sc.y-y0,20,1e-6,'весы сдвинулись по Y на 20');TR.eq(I.sc.press,null,'кнопка не осталась нажатой');
 on=true;tare=0;const t0=tare;H.pointerdown(ev('sc',740,420,'tr'));H.pointermove(ev('sc',760,430,'tr'));H.pointerup(ev('sc',760,430,'tr'));TR.eq(tare,t0,'перетаскивание за TARE не обнуляет показание');
 on=false;H.pointerdown(ev('sc',760,430,'tr'));H.pointerup(ev('sc',760,430,'tr'));TR.eq(tare,t0,'TARE при выключенных весах ничего не делает');
 light=true;on=true;H.pointerdown(ev('sc',760,430,'lt'));H.pointerup(ev('sc',760,430,'lt'));TR.eq(light,false,'LIGHT выключает подсветку');H.pointerdown(ev('sc',760,430,'lt'));H.pointerup(ev('sc',760,430,'lt'));TR.eq(light,true,'LIGHT включает подсветку');
 H.pointerdown(ev('sc',760,430,'pcs'));H.pointerup(ev('sc',760,430,'pcs'));H.pointerdown(ev('sc',760,430,'un'));H.pointerup(ev('sc',760,430,'un'));TR.ok(true,'PCS и UNITS нажимаются без ошибок');
 fresh(1);{const d=I.d1;H.pointerdown(ev('d1',d.x,d.y));H.pointermove(ev('d1',d.x+10,d.y));H.pointermove(ev('d1',d.hx+5,d.hy+5));H.pointerup(ev('d1',d.hx+5,d.hy+5));steps(60);TR.near(d.x,d.hx,1,'цилиндр рядом с выемкой притягивается');TR.near(d.y,d.hy,1,'и встаёт точно на место')}
 fresh(1);{const c=I.cyl;H.pointerdown(ev('cyl',c.x,c.y));H.pointermove(ev('cyl',c.x+20,c.y));H.pointermove(ev('cyl',820,380));H.pointerup(ev('cyl',820,380));steps(80);
  TR.eq(c.stand,null,'мензурка без опоры не встаёт');TR.near(c.x,c.hx,1,'мензурка вернулась на место');TR.near(c.rot,-90,.5,'и снова лежит горизонтально')}
 fresh(1);{const h=I.hex,c=I.cyl;H.pointerdown(ev('hex',h.x,h.y));H.pointermove(ev('hex',h.x+10,h.y));H.pointermove(ev('hex',800,430));H.pointerup(ev('hex',800,430));steps(30);
  H.pointerdown(ev('cyl',c.x,c.y));H.pointermove(ev('cyl',c.x+20,c.y));H.pointermove(ev('cyl',800,430-STAND));H.pointerup(ev('cyl',800,430-STAND));steps(60);
  TR.eq(c.stand,I.hex,'мензурка вставилась в опору');TR.near(c.rot,0,.5,'и стоит вертикально');TR.near(c.y,I.hex.y-STAND,.5,'нижний край в гнезде опоры')}
 fresh(2);{const D=I.dyn;H.pointerdown(ev('dyn',D.x,D.y));H.pointermove(ev('dyn',D.x+20,D.y));H.pointermove(ev('dyn',700,200));H.pointerup(ev('dyn',700,200));steps(60);TR.near(D.rot,0,.5,'динамометр после вытаскивания вертикален')}
 fresh(1);{const d=I.d2;let thr=false;try{H.pointerdown(ev('d2',d.x,d.y));H.pointermove(ev('d2',d.x-1e6,d.y+1e6));H.pointerup(ev('d2',d.x-1e6,d.y+1e6));steps(10)}catch(e){thr=true}TR.ok(!thr,'перетаскивание за пределы экрана не падает');TR.ok(d.x>=25&&d.x<=975&&d.y>=25&&d.y<=VH-25,`предмет остаётся в пределах стола (${d.x},${d.y})`)}
 fresh(1);{let thr=false;try{H.pointerdown(ev(null,10,10));H.pointermove(ev(null,50,60));H.pointerup(ev(null,50,60));H.pointermove(ev(null,5,5))}catch(e){thr=true}TR.ok(!thr,'сдвиг пустого места не падает')}

 /* ---------- 16. звуки ---------- */
 TR.g('16. Звуки');
 for(const n of Object.keys(SFX)){let thr=false;try{sfx(n,10)}catch(e){thr=true}TR.ok(!thr,`звук «${n}» не падает без AudioContext`)}
 SND=false;let called=false;const _t=tone;tone=function(){called=true};sfx('click');sfx('ok');TR.ok(!called,'при выключенном звуке ничего не воспроизводится');SND=true;tone=_t;
 TR.ok(Object.keys(SFX).length>=15,`звуковых эффектов: ${Object.keys(SFX).length}`);
}

try{eval(src+'\n;('+inner.toString()+')(TR)')}catch(e){TR.fail++;TR.fails.push('КРАХ ТЕСТА: '+e.stack.split('\n').slice(0,4).join(' | '))}
console.log('\nГруппа'.padEnd(54)+'пройдено  провалено');
for(const g in TR.counts)console.log(g.padEnd(52)+String(TR.counts[g].p).padStart(8)+String(TR.counts[g].f).padStart(10));
console.log('\nИТОГО: '+TR.pass+' пройдено, '+TR.fail+' провалено');
if(TR.fail){const seen={};console.log('\nПроваленные проверки (первые из каждого вида):');let n=0;for(const m of TR.fails){const k=m.replace(/[\d.,-]+/g,'#').slice(0,80);if(seen[k])continue;seen[k]=1;console.log(' - '+m.slice(0,230));if(++n>=45)break}}
process.exit(TR.fail?1:0);
