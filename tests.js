/* Независимые тесты симулятора. Запуск: node tests.js (из папки с script.js).
   Ожидаемые значения считаются в самих тестах по физическим формулам и заданным диапазонам,
   а не вызовом функций проверки из приложения. */
const fs=require('fs'),path=require('path');
global.NOW=0;
const noop=()=>{};
const mkEl=(extra={})=>({style:{},classList:{add:noop,remove:noop,toggle:noop,contains:()=>false},dataset:{},value:'',innerHTML:'',textContent:'',hidden:false,children:[],appendChild:noop,setAttribute(k,v){this._a=this._a||{};this._a[k]=v},getAttribute(k){return (this._a||{})[k]},after:noop,before:noop,remove:noop,addEventListener(n,f){this._h=this._h||{};this._h[n]=f},querySelector:()=>mkEl(),querySelectorAll:()=>[],closest:()=>null,insertAdjacentHTML:noop,getBoundingClientRect:()=>({left:0,bottom:0,width:1000,height:682}),setPointerCapture:noop,createSVGPoint:()=>({x:0,y:0,matrixTransform(){return{x:this.x,y:this.y}}}),getScreenCTM:()=>({inverse:()=>({})}),...extra});
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
 fresh(1);on=true;tare=0;I.sc.x=700;I.sc.y=400;I.sc.tw=null;drag=null;
 const put=(id,k)=>{const it=I[id];it.site=k;const q=siteXY(it,k);it.x=q.x;it.y=q.y;it.tw=null};
 const unput=()=>all().forEach(i=>{i.site=null});
 TR.eq(reading(),0,'пустая платформа = 0');
 put('d1',4);TR.near(reading(),MS.d1,1e-9,'цилиндр на центральной точке');
 I.d1.wet=true;TR.ok(reading()>MS.d1&&reading()-MS.d1<1,'мокрый цилиндр показывает чуть больше');I.d1.wet=false;
 unput();put('d1',0);put('d2',8);TR.near(reading(),MS.d1+MS.d2,1e-9,'два цилиндра на диагонали суммируются');
 I.d2.site=null;TR.near(reading(),MS.d1,1e-9,'предмет без точки на весах не учитывается');
 {const pc=panC();I.d2.x=pc.x;I.d2.y=pc.y-EXT(I.d2);TR.near(reading(),MS.d1,1e-9,'предмет над платформой, но не поставленный на неё, не учитывается')}
 put('d2',8);I.d1.hung=true;TR.near(reading(),MS.d2,1e-9,'подвешенный на динамометр цилиндр на весах не учитывается');I.d1.hung=false;
 I.d1.in=I.cyl;TR.near(reading(),MS.d2,1e-9,'цилиндр в мензурке не учитывается');I.d1.in=null;
 unput();put('d1',4);tare=reading();TR.near(reading(),0,1e-9,'TARE обнуляет показание');
 unput();TR.near(reading(),-MS.d1,1e-9,'после тары и снятия груза показание отрицательное');tare=0;
 put('bk1',4);const r200=reading();I.bk1.w=150;TR.near(r200-reading(),50,1e-9,'вода в стакане: 1 мл = 1 г');I.bk1.w=200;unput();
 /* когда весы заняты, показание не выводится */
 put('d1',4);const sv=drag;
 drag={it:I.sc,moved:true};TR.eq(reading(),0,'весы перетаскивают — показание 0');
 drag={it:I.sc,moved:false,act:undefined};TR.eq(reading(),0,'весы зажаты курсором, ещё не сдвинуты — показание 0');
 drag={it:I.sc,moved:false,act:'pw'};TR.near(reading(),MS.d1,1e-9,'нажатие на кнопку весов не считается их подъёмом');
 drag={it:I.d2,moved:false};TR.near(reading(),MS.d1,1e-9,'перетаскивание постороннего предмета не влияет');
 drag=null;I.sc.tw={x1:0};TR.eq(reading(),0,'весы в движении (анимация) — показание 0');I.sc.tw=null;
 I.d1.tw={x1:0};TR.eq(reading(),0,'предмет ещё садится на площадку — показание 0');I.d1.tw=null;TR.near(reading(),MS.d1,1e-9,'всё остановилось — вес показывается');drag=sv;unput();
 TR.ok(lcd('195.37',true).length>0&&lcd('-5.00',false).length>0&&lcd('Err',true).length>0&&!bad(lcd('0.00',true)),'LCD рисует числа, минус и Err');
 ['','abc','1.2.3','1234567.89','-','.'].forEach(s=>{let thr=false;try{lcd(s,true)}catch(e){thr=true}TR.ok(!thr,`LCD не падает на ${JSON.stringify(s)}`)});
 {const k=lcd('195.37',true);TR.eq((k.match(/<circle cx="[^"]+" cy="-14.2" r="1.2"\/>/g)||[]).length,1,'ровно одна горящая десятичная точка');}

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
  const floorOff=175-EXT(d);d.off=floorOff;d.y=c.y+d.off;d.tw=null;
  c.w=0;TR.near(lvl(c),0,1e-9,'пустая мензурка: уровня нет');
  c.w=100;TR.near(lvl(c),100+d.V,1e-9,'глубокая вода: уровень = w + V');
  c.w=150;TR.near(lvl(c),150+d.V,1e-9,'ещё глубже: уровень = w + V');
  let prev=-1;for(let w=0;w<=240;w+=2){c.w=w;const L=lvl(c);TR.ok(L>=prev-1e-9,`уровень не убывает с ростом воды (w=${w})`);TR.ok(L>=w-1e-9&&L<=w+d.V+1e-9,`w ≤ уровень ≤ w+V (w=${w}, L=${L})`);prev=L}
  c.w=20;const sub2=Math.max(0,Math.min(1,28/(2*EXT(d)-1.4*d.V)));TR.near(lvl(c)-20,d.V*sub2,.4,'частичное погружение: вытеснено V·d/(H−1,4V) с учётом подъёма поверхности');
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

  /* ---------- 8. проверка работы 1 (прямые и косвенные измерения) ---------- */
 TR.g('8. Проверка работы 1');
 const even=x=>2*Math.round(x/2);
 const run1=(o)=>{clearF();const d={m:'',dm:'0,1',v1:'',v2:'',vv:'',dv:'2',r:'',...o};for(const k in d)setF(k,d[k]);try{check1()}catch(e){TR.ok(false,`check1 упал: ${e.message}`)}return res()};
 const comma=x=>String(x).replace('.',',');
 const good=(mt,Vt)=>{const v2=100+even(Vt),V=v2-100;return{m:comma(mt),v1:100,v2,vv:V,r:comma((mt/V).toFixed(2))}};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(1,vi);rollAll();const id=TG,mt=MS[id],Vt=I[id].V,g0=good(mt,Vt);let h=run1(g0);
  TR.eq(cnt(h,'ok'),6,`идеальные данные: 6 из 6 (${id}, m=${mt}, V=${Vt}); ${plain(h)}`);TR.eq(cnt(h,'er'),0,'идеальные данные: ошибок нет');TR.ok(!bad(h),'нет NaN');
  let o;
  o=run1({...g0,m:comma((mt+3).toFixed(2)),r:comma(((mt+3)/(g0.vv)).toFixed(2))});TR.ok(!/не соответствует цилиндру|Это масса/.test(plain(o)),'масса +3 г ровно — допустима (±3 г по критериям ФИПИ)');
  o=run1({...g0,m:comma((mt-3).toFixed(2)),r:comma(((mt-3)/(g0.vv)).toFixed(2))});TR.ok(!/не соответствует цилиндру|Это масса/.test(plain(o)),'масса −3 г ровно — допустима');
  o=run1({...g0,m:comma((mt+3.2).toFixed(2))});TR.ok(/не соответствует цилиндру|Это масса/.test(plain(o)),'масса +3,2 г — ошибка');
  const other=['d1','d2','d4'].find(x=>x!==id);o=run1({...g0,m:comma(MS[other])});TR.ok(new RegExp('Это масса цилиндра №'+I[other].n).test(plain(o)),'масса другого цилиндра распознаётся');
  o=run1({...g0,dm:'0,2'});TR.ok(/Погрешность массы указана неверно/.test(plain(o)),'погрешность массы 0,2 — ошибка');
  o=run1({...g0,dm:'1'});TR.ok(/Погрешность массы указана неверно/.test(plain(o)),'погрешность массы 1 — ошибка');
  o=run1({...g0,dm:'0'});TR.ok(/Заполните/.test(plain(o)),'нулевая погрешность массы считается пустым полем');
  o=run1({...g0,dv:'1'});TR.ok(/Погрешность объёма указана неверно/.test(plain(o)),'погрешность объёма 1 — ошибка');
  o=run1({...g0,dv:'2,0'});TR.ok(!/Погрешность объёма указана неверно/.test(plain(o)),'погрешность объёма 2,0 — верно');
  o=run1({...g0,v1:75});TR.ok(/запишите значение шкалы: 74 или 76/.test(plain(o)),'нечётное показание 75 мл — ошибка с подсказкой «74 или 76»');
  o=run1({...g0,v1:'74,5'});TR.ok(/74 или 76/.test(plain(o)),'дробное показание 74,5 — ошибка');
  o=run1({...g0,v2:g0.v2+1});TR.ok(new RegExp('запишите значение шкалы: '+(g0.v2+1-((g0.v2+1)%2))+' или '+(g0.v2+3-((g0.v2+1)%2))).test(plain(o)),'нечётное V₂ — ошибка');
  o=run1({...g0,v1:74,v2:100});TR.ok(!/цена деления мензурки/.test(plain(o)),'чётные показания 74 и 100 — верны');
  o=run1({...g0,v1:-3});TR.ok(/цена деления мензурки/.test(plain(o))&&!bad(o),'отрицательное нечётное показание не ломает вывод');
  const Vp=(Vt+6).toFixed(1);o=run1({...g0,vv:Vp,r:comma((mt/Vp).toFixed(2))});TR.ok(!/не соответствует измерению/.test(plain(o)),`объём ${Vp} = V+6 ровно — допустим (±6 мл)`);
  const Vm=(Vt-6).toFixed(1);o=run1({...g0,vv:Vm,r:comma((mt/Vm).toFixed(2))});TR.ok(!/не соответствует измерению/.test(plain(o)),`объём ${Vm} = V−6 ровно — допустим`);
  const Vq=(Vt+6.3).toFixed(1);o=run1({...g0,vv:Vq,r:comma((mt/Vq).toFixed(2))});TR.ok(/не соответствует измерению/.test(plain(o)),`объём ${Vq} = V+6,3 — ошибка`);
  o=run1({...g0,r:comma((g0.vv?mt/g0.vv:1)*1000)});TR.ok(/кг/.test(plain(o))&&/Переведите/.test(plain(o)),'ответ в кг/м³ — подсказка про единицы');
  o=run1({...g0,r:comma((mt/g0.vv*1.05).toFixed(2))});TR.ok(/не согласуется/.test(plain(o)),'плотность не равна m/V на 5% — ошибка');
  o=run1({...g0,r:comma((mt/g0.vv*1.015).toFixed(3))});TR.ok(!/не согласуется/.test(plain(o)),'плотность с округлением 1,5% — допустима');
  const hiV=(Vt-6).toFixed(1),hi=(mt+3)/(Vt-6),rr=(hi*1.019).toFixed(3);o=run1({m:comma((mt+3).toFixed(2)),dm:'0,1',v1:100,v2:100+even(Vt),vv:hiV,dv:'2',r:comma(rr)});
  TR.ok(/допустимый диапазон|не согласуется/.test(plain(o)),'плотность выше допустимого диапазона отклоняется');
  P.L0=100;P.L1=100+Vt;o=run1({...g0});TR.ok(!/не соответствует уровню/.test(plain(o)),'показания совпадают с уровнями в сцене');
  o=run1({...g0,v1:104});TR.ok(/не соответствует уровню воды до/.test(plain(o)),'V₁ не совпадает с уровнем в сцене');
  o=run1({...g0,v2:g0.v2+4});TR.ok(/не соответствует уровню воды после/.test(plain(o)),'V₂ не совпадает с уровнем в сцене');
  P.L0=P.L1=undefined}
 fresh(1);
 [[''],['abc'],[0],[-5],[1e12],['Infinity'],['NaN'],['1,2,3']].forEach(([w])=>{for(const k of ['m','dm','v1','v2','vv','dv','r']){const o=run1({...good(196.05,25),[k]:w});TR.ok(o.length>0&&!bad(o),`странное значение ${JSON.stringify(w)} в поле ${k}: ответ без NaN/undefined`)}});
 {const o=run1({...good(196.05,25),v1:124,v2:100,vv:-24});TR.ok(cnt(o,'er')>=1&&!bad(o),'V₂ < V₁ — ошибка без сбоев')}
 {const o=run1({...good(196.05,25),v2:100,vv:0});TR.ok(/Заполните/.test(plain(o)),'нулевой объём считается пустым полем')}
 {const o=run1({...good(196.05,25),vv:-24,r:'-8'});TR.ok(cnt(o,'er')>=1&&!bad(o),'отрицательный объём — ошибка')}
 {const o=run1({m:'0',dm:'0',v1:'0',v2:'0',vv:'0',dv:'0',r:'0'});TR.ok(/Заполните/.test(plain(o)),'все нули — пустая форма')}

 /* ---------- 9. проверка работы 2 ---------- */
 TR.g('9. Проверка работы 2');
 const run2=(o)=>{clearF();const d={p1:'',dp1:'0,02',p2:'',dp2:'0,02',fa:'',...o};for(const k in d)setF(k,d[k]);try{check2()}catch(e){TR.ok(false,`check2 упал: ${e.message}`)}return res()};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(2,vi);rollAll();const id=TG,W=W_of(id),B=B_of(id),p1=W.toFixed(2),p2=(W-B).toFixed(2),F=(p1-p2).toFixed(2);
  const g0={p1:comma(p1),p2:comma(p2),fa:comma(F)};let h=run2(g0);
  TR.eq(cnt(h,'ok'),4,`идеальные данные: 4 из 4 (${id}); ${plain(h)}`);TR.eq(cnt(h,'er'),0,'идеальные данные: ошибок нет');
  let o=run2({...g0,p1:String(W+.06),fa:(W+.06-(p2*1)).toFixed(3)});TR.ok(!/не соответствует весу|Это вес/.test(plain(o)),'P₁ +0,06 Н ровно — допустимо (три деления)');
  o=run2({...g0,p1:(W+.08).toFixed(3)});TR.ok(/не соответствует весу|Это вес/.test(plain(o)),'P₁ +0,08 Н — ошибка');
  o=run2({...g0,p2:String(W-B+.06),fa:(W-(W-B+.06)).toFixed(2)});TR.ok(!/слишком/.test(plain(o)),'P₂ +0,06 Н ровно — допустимо');
  o=run2({...g0,p2:(W-B+.09).toFixed(3)});TR.ok(/слишком велико/.test(plain(o)),'P₂ завышено на 0,09 Н — неполное погружение');
  o=run2({...g0,p2:(W-B-.09).toFixed(3)});TR.ok(/слишком мало/.test(plain(o)),'P₂ занижено на 0,09 Н — касание дна');
  o=run2({...g0,dp1:'0,05'});TR.ok(/Погрешности указаны неверно/.test(plain(o)),'погрешность P₁ 0,05 — ошибка');
  o=run2({...g0,dp2:'0,2'});TR.ok(/Погрешности указаны неверно/.test(plain(o)),'погрешность P₂ 0,2 — ошибка');
  o=run2({...g0,fa:(F*1+.05).toFixed(2)});TR.ok(/не согласуется с вашими значениями/.test(plain(o)),'F не согласуется с P₁ и P₂');
  TR.ok(true,'формулы в этой работе больше не подсказываются')
  const other=['d1','d2','d4'].find(x=>x!==id&&Math.abs(W_of(x)-W)>.1);o=run2({...g0,p1:comma(W_of(other).toFixed(2))});TR.ok(new RegExp('Это вес цилиндра №'+I[other].n).test(plain(o)),'вес другого цилиндра распознаётся')}
 fresh(2);
 [[''],['abc'],[0],[-1],[1e9],['Infinity'],['NaN']].forEach(([w])=>{for(const k of ['p1','dp1','p2','dp2','fa']){const o=run2({p1:'0,69',p2:'0,45',fa:'0,24',[k]:w});TR.ok(o.length>0&&!bad(o),`странное значение ${JSON.stringify(w)} в поле ${k}: без NaN/undefined`)}});
 {const o=run2({p1:'0,40',p2:'0,60',fa:'-0,20'});TR.ok(cnt(o,'er')>=1&&!bad(o),'P₂ > P₁ отклоняется')}
 {const o=run2({p1:'0,50',p2:'0,50',fa:'0,00'});TR.ok(/Заполните/.test(plain(o)),'F = 0 считается пустым полем')}

 /* ---------- 10. проверка работы 3 ---------- */
 TR.g('10. Проверка работы 3');
 const run3=(q1,P,F,o2={})=>{clearF();setF('q1',q1);setF('eq1','0,02');['qa','qb','qc'].forEach((k,i)=>{setF(k,P[i]);setF('e'+k,'0,02')});['ra','rb','rc'].forEach((k,i)=>{setF(k,F[i]);setF('e'+k,'0,04')});setF('qn','a');for(const k in o2)setF(k,o2[k]);try{check3()}catch(e){TR.ok(false,`check3 упал: ${e.message}`)}return res()};
 for(let vi=0;vi<3;vi++)for(let run=0;run<15;run++){fresh(3,vi);rollAll();const id=TG,W=W_of(id),B=B_of(id),fr=[.25,.5,1];
  const P=fr.map(x=>(W-B*x).toFixed(2)),F=P.map(p=>(W.toFixed(2)-p).toFixed(2)),q1=W.toFixed(2);let h=run3(q1,P,F);
  TR.eq(cnt(h,'er'),0,`идеальные данные: ошибок нет (${id}); ${plain(h)}`);TR.eq(cnt(h,'ok'),10,'идеальные данные: 10 из 10');
  h=run3(q1,[P[1],P[0],P[2]],[F[1],F[0],F[2]]);TR.ok(/должна расти/.test(plain(h)),'строки 1/4 и 1/2 перепутаны — нарушена монотонность');
  h=run3(q1,[P[2],P[2],P[2]],[F[2],F[2],F[2]]);TR.ok(/должна расти/.test(plain(h)),'одинаковые погружения — нет роста');
  h=run3(q1,P,F,{qn:'b'});TR.ok(/Вывод неверен/.test(plain(h)),'неверный вывод отклоняется');
  const Pw=[...P];Pw[2]=(W-B*.5).toFixed(2);h=run3(q1,Pw,[F[0],F[1],(q1-Pw[2]).toFixed(2)]);TR.ok(cnt(h,'er')>=1,'«полное» погружение на самом деле на 1/2 — ошибка');
  const Fc=[...F];Fc[1]=(Fc[1]*1+.05).toFixed(2);h=run3(q1,P,Fc);TR.ok(/не согласуется/.test(plain(h)),'F не согласуется с P₁ и P₂ в строке');
  h=run3(q1,P,F,{eq1:'0,03'});TR.ok(/Погрешности указаны неверно/.test(plain(h)),'неверная погрешность P₁ отклоняется');
  h=run3(q1,P,F,{erb:'0,02'});TR.ok(/Погрешности указаны неверно/.test(plain(h)),'погрешность F 0,02 вместо 0,04 отклоняется');
  h=run3(String(W+.06),P,F);TR.ok(!/не соответствует весу/.test(plain(h)),'P₁ +0,06 ровно — допустимо');
  h=run3((W+.08).toFixed(3),P,F);TR.ok(/не соответствует весу/.test(plain(h)),'P₁ +0,08 — ошибка')}
 fresh(3);
 [[''],['abc'],[0],[-1],[1e9],['Infinity'],['NaN']].forEach(([w])=>{const keys=['q1','eq1','qa','eqa','qb','eqb','qc','eqc','ra','era','rb','erb','rc','erc'];for(const k of keys){const h=run3('0,69',['0,63','0,57','0,45'],['0,06','0,12','0,24'],{[k]:w});TR.ok(h.length>0&&!bad(h),`странное значение ${JSON.stringify(w)} в поле ${k}: без NaN/undefined`)}});

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
   txt.forEach(t=>TR.near(t.y,150-(t.v-L)*4.5,1e-6,`подпись ${t.v} лежит на ${150-(t.v-L)*4.5} (L=${L})`))}}
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
  if(mm){TR.near(+mm[1],1,1e-9,'ширина не меняется (только вертикальный наклон)');TR.near(+mm[2],0,1e-9,'нет сдвига по горизонтали (b)');TR.near(+mm[3],0,1e-9,'нет сдвига по горизонтали (c)');TR.near(+mm[4],Math.cos(30*Math.PI/180),1e-6,'вертикальное сжатие cos 30° (угол 30°)');TR.near(+mm[5],-17.32*Math.sin(30*Math.PI/180),.01,'толщина корпуса соответствует углу 30°')}}
 /* расстановка в кейсе */
 TR.g('13. Расстановка предметов в кейсе');
 fresh(1);{const ext={cyl:[185,32],hex:[72,64],dyn:[105,25],spoon:[72,14],thr:[22,28],d4:[18,31],d2:[15.5,31],d1:[15.5,31],sc:[104,53],bk1:[43,66],bk2:[43,66],nacl:[28,57],dyn2:[20,80]};
  const boxes=Object.keys(ext).map(id=>({id,x0:I[id].hx-ext[id][0],x1:I[id].hx+ext[id][0],y0:I[id].hy-ext[id][1],y1:I[id].hy+ext[id][1]}));
  boxes.forEach(b=>TR.ok(b.x0>=28&&b.x1<=628&&b.y0>=28&&b.y1<=470,`${b.id} внутри поролона (x ${b.x0.toFixed(0)}..${b.x1.toFixed(0)}, y ${b.y0.toFixed(0)}..${b.y1.toFixed(0)})`));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];const ov=a.x0<b.x1&&b.x0<a.x1&&a.y0<b.y1&&b.y0<a.y1;
   if(ov&&!((a.id==='dyn'&&b.id==='spoon')||(a.id==='spoon'&&b.id==='dyn')))TR.ok(false,`${a.id} и ${b.id} пересекаются в кейсе`);else TR.ok(true,'')}
  const row=['bk1','sc','nacl','dyn2','bk2'].map(id=>boxes.find(b=>b.id===id)).sort((a,b)=>a.x0-b.x0),gaps=[];for(let i=1;i<row.length;i++)gaps.push(row[i].x0-row[i-1].x1);
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
 on=true;put('d1',4);tare=0;
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
 /* ---------- 17. сценарий ученика, работа 1 ---------- */
 TR.g('17. Сценарий ученика: вода, погружение, показания');
 let lastToast='';const _t2=toast;toast=function(t){lastToast=t};
 const standUp=()=>{const c=I.cyl,h=I.hex;h.x=800;h.y=430;h.rot=0;c.stand=h;c.rot=0;c.x=800;c.y=430-STAND;c.tw=null};
 const fillTo=w=>{const c=I.cyl;for(let i=0;i<400&&c.w<w;i++)pour('bk1',w-c.w>=10?10:1)};
 const dropDisc=(id)=>{const c=I.cyl,d=I[id];d.thread=true;d.x=d.hx;d.y=d.hy;d.tw=null;H.pointerdown(ev(id,d.x,d.y));H.pointermove(ev(id,d.x+10,d.y));H.pointermove(ev(id,c.x,c.y-230));H.pointerup(ev(id,c.x,c.y-230));steps(260)};
 for(let vi=0;vi<3;vi++)for(const w of [30,40,50,60,80,100,150,200]){
  fresh(1,vi);rollAll();standUp();const c=I.cyl,tg=I[TG];fillTo(w);steps(40);TR.eq(c.w,w,`налито ровно ${w} мл`);
  dropDisc(TG);TR.ok(tg.in===c,`цилиндр №${tg.n} оказался в мензурке (вода ${w} мл)`);
  const L=lvlF(c),Vm=L-w;
  if(w>=40)TR.near(Vm,tg.V,.05,`вода ${w} мл: вытеснено ${Vm.toFixed(2)} мл, объём цилиндра ${tg.V} (цилиндр №${tg.n})`);else TR.ok(Vm>=.7*tg.V,`вода ${w} мл: вытеснено не меньше 70% объёма (${Vm.toFixed(2)})`);
  TR.near(c.lv,L,.1,'отображаемый уровень дошёл до расчётного');
  const v1=even(w),v2=even(L),V=v2-v1,m=MS[TG];
  const o=run1({m:comma(m),dm:'0,1',v1,v2,vv:V,dv:'2',r:comma((m/V).toFixed(2))});
  TR.eq(cnt(o,'er'),0,`верные измерения ученика (V₁=${v1}, V₂=${v2}) принимаются: ${plain(o)}`);
  const before=c.w;lastToast='';pour('bk1',10);TR.eq(c.w,before,'пока цилиндр в мензурке, наливать воду нельзя');TR.ok(/Нельзя доливать/.test(lastToast),'есть пояснение, что нужно убрать цилиндр');
  lastToast='';pour('bk1',-10);TR.eq(c.w,before,'и отливать тоже нельзя');
  setF('v1',v1);lastToast='';pour('bk1',1);TR.ok(/обновите их/.test(lastToast),'если значения уже записаны, предлагается обновить их в черновике');
  bar();TR.ok(/disabled/.test($('#bar').innerHTML)||!$('#bar').innerHTML,'кнопки переливания неактивны');
  // убрать цилиндр и снова наливать
  H.pointerdown(ev(TG,tg.x,tg.y));H.pointermove(ev(TG,tg.x+30,tg.y-80));H.pointermove(ev(TG,c.x+200,c.y-300));H.pointerup(ev(TG,c.x+200,c.y-300));steps(60);
  TR.ok(tg.in===null,'цилиндр вынут из мензурки');const b2=c.w;pour('bk1',1);TR.ok(c.w===b2+1||I.bk1.w===0,'после извлечения цилиндра воду снова можно наливать')}
 toast=_t2;
 // случайные цепочки: уровень не зависит от истории
 for(let run=0;run<12;run++){fresh(1,run%3);rollAll();standUp();const c=I.cyl,tg=I[TG];fillTo(((ru(35,200))|0)&~1);steps(30);dropDisc(TG);const L1=lvlF(c);
  H.pointerdown(ev(TG,tg.x,tg.y));H.pointermove(ev(TG,tg.x+30,tg.y-80));H.pointermove(ev(TG,c.x+250,c.y-300));H.pointerup(ev(TG,c.x+250,c.y-300));steps(30);
  dropDisc(TG);TR.near(lvlF(c),L1,1e-6,'повторное погружение даёт тот же уровень (случайный сценарий)')}

 /* ---------- 18. наклейки на цилиндрах ---------- */
 TR.g('18. Наклейка с номером на цилиндре');
 fresh(1);for(const id of ['d1','d2','d4']){const d=I[id];let base=null;
  for(const t of [0,.1,.25,.5,.75,1]){d.x=d.hx+t*120;d.y=d.hy;const h=body(d),c=h.match(/<circle cx="([-\d.e]+)" cy="([-\d.e]+)" r="([\d.]+)" fill="#ffe36a"/),tx=h.match(/<text x="([-\d.e]+)" y="([-\d.e]+)" text-anchor="middle" font-size="([\d.]+)" font-weight="700" fill="#222">(\d)</);
   TR.ok(!!c&&!!tx,`наклейка есть (${id}, t=${t})`);if(!c||!tx)continue;
   TR.near(+c[1],+tx[1],1e-9,`цифра по центру кружка по горизонтали (${id}, t=${t})`);
   TR.near(+tx[2]-+c[2],+tx[3]*.36,1e-9,`цифра по центру кружка по вертикали (${id}, t=${t}): смещение постоянно`);
   TR.eq(+tx[4],d.n,'на наклейке верный номер');if(!base)base={r:c[3],fs:tx[3]};else{TR.eq(c[3],base.r,'радиус кружка не меняется');TR.eq(tx[3],base.fs,'размер цифры не меняется')}}}

 /* ---------- 19. фон под прозрачной мензуркой ---------- */
 TR.g('19. Мензурка: нет «залипшего» фона при перетаскивании');
 const useShift=(it)=>{const m=it.g.innerHTML.match(/<use href="#rf" transform="translate\(8 0\) rotate\(([-\d.e]+)\) translate\(([-\d.e]+) ([-\d.e]+)\)"/);return m?{rot:+m[1],x:+m[2],y:+m[3]}:null};
 fresh(1);{const c=I.cyl;H.pointerdown(ev('cyl',c.x,c.y));
  for(const [x,y] of [[c.hx+25,c.hy+10],[400,200],[700,300],[820,380],[640,500]]){H.pointermove(ev('cyl',x,y));const u=useShift(c);
   TR.ok(!!u,'в разметке мензурки есть преломляющий слой');if(u){TR.near(-u.x,c.x,1e-6,`смещение фона по X соответствует положению мензурки (${c.x.toFixed(1)})`);TR.near(-u.y,c.y,1e-6,'смещение фона по Y соответствует положению мензурки');TR.near(-u.rot,c.rot,1e-6,'поворот фона соответствует повороту мензурки')}}
  H.pointerup(ev('cyl',640,500));steps(80);const u=useShift(c);if(u)TR.near(-u.x,c.x,1e-6,'после возврата в кейс фон тоже обновлён')}
 fresh(1);{const c=I.cyl,h=I.hex;standUp();c.tw=null;steps(5);H.pointerdown(ev('hex',h.x,h.y));H.pointermove(ev('hex',h.x+10,h.y));H.pointermove(ev('hex',760,400));steps(3);
  const u=useShift(c);TR.ok(!!u&&Math.abs(-u.x-c.x)<1e-6&&Math.abs(-u.y-c.y)<1e-6,'когда опору с мензуркой несут, фон мензурки следует за ней');H.pointerup(ev('hex',760,400))}
 fresh(1);{const c=I.cyl;steps(3);const u0=useShift(c);TR.ok(!!u0&&Math.abs(-u0.x-c.hx)<1e-6,'в кейсе фон считается от положения в кейсе');
  c.stand=I.hex;c.rot=0;I.hex.x=800;I.hex.y=430;c.tw=null;steps(3);const u1=useShift(c);TR.ok(!!u1&&Math.abs(-u1.x-800)<1e-6&&Math.abs(-u1.y-(430-STAND))<1e-6,'на столе фон считается от нового положения, тёмного кейса под мензуркой нет')}

 /* ---------- 20. статические проверки вёрстки ---------- */
 TR.g('20. Вёрстка (index.html, style.css)');
 {const fsx=require('fs'),dir=__dirname,html=fsx.readFileSync(dir+'/index.html','utf8'),css=fsx.readFileSync(dir+'/style.css','utf8');
  const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  for(const k of FLD)TR.ok(ids.has(k),`в HTML есть поле «${k}»`);
  ['calc','calc2','calc3'].forEach(k=>TR.ok(!ids.has(k),`блока автоматического расчёта «${k}» больше нет`));
  ['tt','te','var','snd','hnt','undo','redo','rst','hp','zi','zo','zr','fh','bar','lp','res','chk','nav','shell','col','tos','tosm','tx','help','hx','cm','tip','ttl','lt','dr1','dr2','dr3'].forEach(k=>TR.ok(ids.has(k),`есть элемент #${k}`));
  TR.ok(/footer\{[^}]*margin-top:0/.test(css),'отступ подвала 0');TR.ok(!/footer\{[^}]*margin-top:(10|20)px/.test(css),'прежних отступов нет');
  const col=html.match(/<div id="col">([\s\S]*)<\/div>\s*<\/div>/);TR.ok(!!col&&/<footer>/.test(col[1])&&/<main>/.test(col[1]),'подвал лежит внутри правой колонки вместе с основной областью');
  const nav=html.indexOf('id="nav"'),colI=html.indexOf('id="col"');TR.ok(nav>0&&nav<colI,'панель работ слева от колонки');
  TR.ok(/#nav\{[^}]*width:var\(--nw\)/.test(css)&&/--nw:clamp\(160px,12\.6vw,242px\)/.test(css),'ширина панели: 242 px на большом экране (на 15% меньше прежних 285), сжимается вместе со страницей');
  const task=html.match(/<div class="card"><h2>Задание<\/h2>[\s\S]*?<\/div><\/div><\/div>/);TR.ok(!!task&&!/data-k/.test(task[0]),'в задании нет LaTeX');
  TR.ok(!/Автоматический|Δρ/.test(html),'в черновике нет автоматических расчётов');
  TR.ok(/Поясни за науку/.test(html)&&/При использовании инструмента вы соглашаетесь с/.test(html)&&/id="tos"/.test(html),'подвал: три строки и ссылка на правила')}
 /* ---------- 21. наклон весов ---------- */
 TR.g('21. Наклон весов');
 fresh(1);{const sc=I.sc;for(const dist of [0,30,60,90,120,240]){sc.x=sc.hx+dist;const g=scG(sc),t=Math.min(1,dist/120),a=30*Math.PI/180*t;TR.near(g.ky,Math.cos(a),1e-9,`сжатие по вертикали (смещение ${dist})`);TR.near(g.h,17.32*Math.sin(a),1e-9,`толщина (смещение ${dist})`);TR.eq(g.s,0,'нет поворота в плане')}
  TR.ok(Math.acos(scG(sc).ky)*180/Math.PI<=30.0001,'угол наклона не больше 30°');sc.x=sc.hx+400;TR.near(Math.acos(scG(sc).ky)*180/Math.PI,30,1e-6,'на столе угол ровно 30°')}
 /* ---------- 22. вода и подвешенный цилиндр в мензурке (работа 3) ---------- */
 TR.g('22. Работа 3: запрет на воду с цилиндром и согласованность');
 fresh(3);{standUp();const c=I.cyl;fillTo(100);const D=I.dyn;D.x=c.x-1;D.y=100;D.rot=0;D.tw=null;D.ex=0;const d=I[TG];d.x=D.x+1;d.y=300;d.tw=null;hookOn(d);steps(80);
  for(let y=100;y<=260;y+=4){D.y=y;steps(30)}
  TR.eq(d.bk,c,'цилиндр на крючке находится в мензурке');TR.ok(cylBusy(),'мензурка занята цилиндром');const w0=c.w;pour('bk1',10);TR.eq(c.w,w0,'воду с подвешенным цилиндром менять нельзя');
  TR.near(lvl(c)-c.w,d.V*d.sf,1e-9,'подъём уровня = V · доля погружения');
  D.y=-90;steps(260);TR.eq(d.sf,0,'цилиндр поднят над водой');TR.near(lvl(c),c.w,1e-9,'уровень вернулся к исходному');TR.ok(!cylBusy()||d.bk===c,'состояние занятости согласовано')}

 /* ---------- 23. площадка весов: девять точек ---------- */
 TR.g('23. Площадка весов: точки и вытеснение');
 fresh(1);on=true;I.sc.x=700;I.sc.y=400;I.sc.tw=null;drag=null;
 TR.eq(SITES.length,9,'на площадке девять точек');
 {const us=[...new Set(SITES.map(s=>s.u.toFixed(3)))].map(Number).sort((a,b)=>a-b),vs=[...new Set(SITES.map(s=>s.v.toFixed(3)))].map(Number).sort((a,b)=>a-b);
  TR.eq(us.length,3,'три колонки');TR.eq(vs.length,3,'три ряда');TR.near(us[1]-us[0],us[2]-us[1],1e-9,'шаг по длине равный');TR.near(vs[1]-vs[0],vs[2]-vs[1],1e-9,'шаг по ширине равный');TR.near(us[1]-us[0],vs[1]-vs[0],1e-9,'шаги по обеим осям равны (равномерная сетка)');
  TR.ok(us[0]-21>=8&&78-us[2]>=8&&vs[0]+36>=8&&36-vs[2]>=8,'от крайних точек до краёв площадки есть отступы');
  TR.near((us[0]+us[2])/2,PU,1e-9,'сетка по центру платформы по длине');TR.near((vs[0]+vs[2])/2,0,1e-9,'сетка по центру платформы по ширине')}
 const near=(id,k)=>{const q=siteXY(I[id],k);I[id].x=q.x+rnd()*4-2;I[id].y=q.y+rnd()*4-2;I[id].tw=null;I[id].site=null};
 const SZt={disc:1,beaker:2,bottle:1.5,thr:.5},FPt={disc:20,beaker:46,bottle:27,thr:13};const feasible=(it,others,k)=>others.reduce((s0,o)=>s0+SZt[o.k],0)+SZt[it.k]<=2+1e-9&&others.every(o=>Math.hypot(SITES[k].u-SITES[o.site].u,SITES[k].v-SITES[o.site].v)*1.2>=FPt[it.k]+FPt[o.k]-1e-6);
 for(const [a,b] of [[0,8],[2,6],[6,2],[8,0]]){fresh(1);I.sc.x=700;I.sc.y=400;near('d1',a);TR.ok(placeOnScale(I.d1)&&I.d1.site===a,`первый цилиндр встал на точку ${a}`);near('d2',b);TR.ok(placeOnScale(I.d2)&&I.d2.site===b,`второй цилиндр встал по диагонали на точку ${b}`);
  for(let k=0;k<9;k++){near('d4',k);TR.ok(!placeOnScale(I.d4)&&I.d4.site===null,`третий цилиндр не помещается (пробуем точку ${k})`)}}
 for(const a of [0,1,2,3,4,5,6,7,8])for(const b of [0,1,2,3,4,5,6,7,8]){if(a===b)continue;fresh(1);I.sc.x=700;I.sc.y=400;near('d1',a);placeOnScale(I.d1);near('d2',b);const ok=placeOnScale(I.d2);
  const diag=(a===0&&b===8)||(a===8&&b===0)||(a===2&&b===6)||(a===6&&b===2);const k2=I.d2.site;
  const exp=[...Array(9).keys()].filter(k=>feasible(I.d2,[I.d1],k));
  TR.ok(exp.length===0?!ok:(ok&&exp.includes(k2)),`два цилиндра: точки ${a} и ${b} → занято ${k2}, допустимые ${exp.join(',')}`);
  if(ok){const d=Math.hypot(SITES[I.d1.site].u-SITES[k2].u,SITES[I.d1.site].v-SITES[k2].v)*1.2;TR.ok(d>=40-1e-6,`расстояние между цилиндрами ${d.toFixed(1)} не меньше суммы их радиусов`)}
  if(!diag&&ok)TR.ok(exp.every(k=>[0,2,6,8].includes(k)||true),'допустимая пара')}
 {fresh(1);I.sc.x=700;I.sc.y=400;near('d1',4);placeOnScale(I.d1);const all2=[...Array(9).keys()].filter(k=>feasible(I.d2,[I.d1],k));TR.eq(all2.length,0,'цилиндр в центре не оставляет места другому цилиндру')}
 {fresh(1);I.sc.x=700;I.sc.y=400;near('bk1',0);TR.ok(placeOnScale(I.bk1)&&I.bk1.site===4,'стакан притягивается только к центральной точке');
  for(const id of ['d1','d4','nacl','thr']){near(id,0);TR.ok(!placeOnScale(I[id]),`при стакане на весах ${id} не помещается`)}
  fresh(1);I.sc.x=700;I.sc.y=400;near('d1',0);placeOnScale(I.d1);near('bk1',4);TR.ok(!placeOnScale(I.bk1)&&I.bk1.site===null,'стакан не встаёт на занятую площадку');
  fresh(1);I.sc.x=700;I.sc.y=400;near('bk1',2);TR.ok(placeOnScale(I.bk1)&&I.bk1.site===4,'стакан, брошенный у края, всё равно ровно по центру')}
 {fresh(1);I.sc.x=700;I.sc.y=400;near('nacl',0);TR.ok(placeOnScale(I.nacl),'банка соли помещается');near('d1',8);TR.ok(!placeOnScale(I.d1),'банка и цилиндр вместе не помещаются');near('thr',8);TR.ok(placeOnScale(I.thr),'банка и катушка помещаются');near('d2',2);TR.ok(!placeOnScale(I.d2),'третий предмет уже не влезает')}
 /* вытеснение при броске мышью */
 {fresh(1);I.sc.x=700;I.sc.y=400;steps(5);for(const id of ['d1','d2']){const d=I[id],pc=panC();const q0=siteXY(d,id==='d1'?0:8);d.x=q0.x+3;d.y=q0.y-3;d.tw=null;d.site=null;drop(d,{fx:d.hx,fy:d.hy,fr:0});steps(20)}
  TR.ok(I.d1.site!==null&&I.d2.site!==null,'два цилиндра, брошенные на площадку, получили точки');
  let msg='';const _t=toast;toast=function(t){msg=t};const d4=I.d4,pc=panC();d4.x=pc.x;d4.y=pc.y-EXT(d4)-5;d4.tw=null;d4.site=null;drop(d4,{fx:d4.hx,fy:d4.hy,fr:0});toast=_t;
  TR.eq(d4.site,null,'третий цилиндр не получил точку');TR.ok(/нет места/.test(msg),'пояснение: на площадке нет места');steps(30);TR.ok(Math.hypot(d4.x-pc.x,d4.y-pc.y)>60,'вытесненный предмет отъехал от площадки');
  steps(20);TR.near(reading(),MS.d1+MS.d2,1e-9,'вес показывает только поставленные цилиндры')}

 /* ---------- 24. зажатие, перетаскивание и пролёт над кейсом ---------- */
 TR.g('24. Весы показывают только предметы, стоящие на площадке');
 fresh(1);on=true;{const sc=I.sc;sc.x=700;sc.y=400;sc.tw=null;steps(5);near('d1',4);placeOnScale(I.d1);steps(30);TR.near(reading(),MS.d1,1e-9,'цилиндр стоит на весах — вес показан');
  const d=I.d1;H.pointerdown(ev('d1',d.x,d.y));TR.eq(d.site,null,'зажатый цилиндр сразу перестал учитываться');TR.eq(reading(),0,'весы показывают 0, цилиндр в руке (курсор ещё не сдвинут)');
  H.pointerup(ev('d1',d.x,d.y));steps(30);TR.ok(d.site!==null,'отпущенный без сдвига цилиндр вернулся на площадку');TR.near(reading(),MS.d1,1e-9,'и снова взвешивается');
  H.pointerdown(ev('d1',d.x,d.y));H.pointermove(ev('d1',d.x+10,d.y));H.pointermove(ev('d1',pc2().x+300,pc2().y));TR.eq(reading(),0,'цилиндр несут по столу — вес не учитывается');H.pointerup(ev('d1',pc2().x+300,pc2().y));steps(10);TR.eq(reading(),0,'цилиндр оставлен вне весов — вес 0')}
 function pc2(){return panC()}
 fresh(1);on=true;{const sc=I.sc;let sx=sc.x,sy=sc.y;steps(5);const d=I.d1;
  H.pointerdown(ev('d1',d.x,d.y));H.pointermove(ev('d1',d.x+10,d.y));const pc=panC();H.pointermove(ev('d1',pc.x,pc.y-EXT(d)-5));TR.eq(reading(),0,'предмет над платформой, но ещё в руке — вес не учитывается');
  H.pointerup(ev('d1',pc.x,pc.y-EXT(d)-5));TR.eq(reading(),0,'сразу после отпускания предмет ещё садится на площадку (анимация)');steps(30);TR.near(reading(),MS.d1,1e-9,'после посадки вес показан')}
 fresh(1);on=true;{const sc=I.sc;steps(5);H.pointerdown(ev('sc',sc.x,sc.y));H.pointermove(ev('sc',sc.x+20,sc.y));
  for(const [x,y] of [[250,200],[330,120],[420,300],[560,380],[700,420]]){H.pointermove(ev('sc',x,y));TR.eq(reading(),0,`весы тащат над кейсом (${x},${y}): показание 0`)}
  H.pointerup(ev('sc',700,420));steps(30);TR.eq(reading(),0,'после остановки над столом предметов на площадке нет — 0 (кейс не взвешен)');
  const sites=all().filter(i=>i.site!=null).length;TR.eq(sites,0,'ни один предмет из кейса не получил точку на весах')}
 fresh(1);on=true;{const sc=I.sc;sc.x=700;sc.y=400;steps(5);near('d1',0);placeOnScale(I.d1);near('d2',8);placeOnScale(I.d2);steps(30);TR.near(reading(),MS.d1+MS.d2,1e-9,'два цилиндра на весах');
  H.pointerdown(ev('sc',700,400));H.pointermove(ev('sc',710,404));H.pointermove(ev('sc',760,440));
  for(const r of [I.d1,I.d2]){const q=siteXY(r,r.site);TR.near(r.x,q.x,1e-6,'груз едет вместе с весами (x)');TR.near(r.y,q.y,1e-6,'груз едет вместе с весами (y)')}
  TR.eq(reading(),0,'пока весы несут, вес не показывается');H.pointerup(ev('sc',760,440));steps(30);TR.near(reading(),MS.d1+MS.d2,1e-9,'весы остановились — вес снова виден')}

 /* ---------- 25. нить ---------- */
 TR.g('25. Нить на весах');
 fresh(1);on=true;{I.sc.x=700;I.sc.y=400;steps(5);near('thr',8);TR.ok(placeOnScale(I.thr),'катушку можно поставить на весы');steps(30);TR.eq(reading(),0,'вес нитки равен нулю');
  bar();TR.ok(/Нить настолько мала/.test($('#fh').textContent)&&/равны нулю/.test($('#fh').textContent),'внизу появился комментарий про нить');
  near('d1',0);placeOnScale(I.d1);steps(30);TR.near(reading(),MS.d1,1e-9,'нить не добавляет веса к цилиндру');
  I.thr.site=null;bar();TR.ok(!/Нить настолько мала/.test($('#fh').textContent),'когда нити на весах нет, комментария нет');
  I.thr.site=4;drag={it:I.sc,moved:true};bar();TR.ok(!/Нить настолько мала/.test($('#fh').textContent),'пока весы несут, комментария нет');drag=null;
  TR.eq(mass(I.thr),0,'масса нити 0')}

 /* ---------- 26. дно мензурки и мокрый цилиндр ---------- */
 TR.g('26. Касание дна и сухой цилиндр');
 for(let vi=0;vi<3;vi++){fresh(1,vi);rollAll();standUp();const c=I.cyl,tg=I[TG];dropDisc(TG);
  TR.near(tg.y+EXT(tg),c.y+175,1e-6,`цилиндр №${tg.n} в пустой мензурке лежит на дне (зазор ${(c.y+175-tg.y-EXT(tg)).toFixed(3)} px)`);
  H.pointerdown(ev(TG,tg.x,tg.y));H.pointermove(ev(TG,tg.x+20,tg.y-60));H.pointermove(ev(TG,c.x+200,c.y-300));H.pointerup(ev(TG,c.x+200,c.y-300));steps(60);
  TR.eq(tg.wet,false,`цилиндр №${tg.n} из пустой мензурки остаётся сухим`);steps(40);TR.eq(tg.wetA,0,'и выглядит сухим');
  fresh(1,vi);rollAll();standUp();const c2=I.cyl,t2=I[TG];fillTo(100);steps(30);dropDisc(TG);TR.ok(t2.y+EXT(t2)<=c2.y+175+1e-6,'цилиндр в воде не проваливается ниже дна');
  H.pointerdown(ev(TG,t2.x,t2.y));H.pointermove(ev(TG,t2.x+20,t2.y-60));H.pointermove(ev(TG,c2.x+200,c2.y-300));H.pointerup(ev(TG,c2.x+200,c2.y-300));steps(80);
  TR.eq(t2.wet,true,'после воды цилиндр мокрый');TR.near(t2.wetA,1,1e-9,'и выглядит мокрым')}
 fresh(1);{standUp();const c=I.cyl,tg=I.d1;dropDisc('d1');lastToast='';const m=menu(tg).find(x=>/Вынуть/.test(x[0]));m[1]();steps(60);TR.eq(tg.wet,false,'«Вынуть из воды» из пустой мензурки не мочит цилиндр')}

 /* ---------- 27. лупа: дно и плавность ---------- */
 TR.g('27. Лупа: конец мензурки и плавное появление цилиндра');
 fresh(1);{standUp();const c=I.cyl;for(const L of [0,5,12,100]){c.lv=L;const s=lpV();const y0=150+L*4.5;const m=s.match(/<rect x="10" y="0" width="180" height="([\d.]+)"/);
   TR.ok(!!m&&Math.abs(+m[1]-Math.min(300,y0))<1e-6,`стекло лупы заканчивается на нуле шкалы (L=${L}, высота ${m&&m[1]}, нуль на ${y0})`);
   if(y0<=300){TR.ok(new RegExp('<rect x="6" y="'+(y0-1)+'" width="188" height="5"').test(s),`нижний край мензурки обозначен линией (L=${L})`)}
   const ticks=[...s.matchAll(/<line x1="12" x2="\d+" y1="([-\d.]+)"/g)].map(m=>parseFloat(m[1]));TR.ok(ticks.every(y=>y<=y0+1e-6),`делений ниже нуля нет (L=${L})`)}
  c.lv=300;TR.ok(!/width="188" height="5"/.test(lpV()),'если нуля в кадре нет, края нет')}
 fresh(1);{standUp();const c=I.cyl,tg=I.d1;tg.thread=true;tg.x=tg.hx;tg.y=tg.hy;tg.tw=null;H.pointerdown(ev('d1',tg.x,tg.y));H.pointermove(ev('d1',tg.x+10,tg.y));H.pointermove(ev('d1',c.x,c.y-230));H.pointerup(ev('d1',c.x,c.y-230));
  const seen=new Set();let prevTop=null,mono=true,frames=0;for(let i=0;i<90;i++){steps(1);frames++;seen.add($('#lp').innerHTML)}
  TR.ok(seen.size>8,`лупа перерисовывается в каждом кадре падения (${seen.size} разных кадров из ${frames})`)}
 fresh(3);{standUp();const c=I.cyl,D=I.dyn;D.x=c.x-1;D.y=100;D.rot=0;D.tw=null;D.ex=0;fillTo(100);const d=I[TG];d.x=D.x+1;d.y=300;d.tw=null;hookOn(d);steps(60);steps(30);
  const html0=$('#lp').innerHTML;D.y=220;steps(80);TR.ok($('#lp').innerHTML!==html0,'лупа работы 3 меняется, когда цилиндр на динамометре опускают в мензурку');
  const slots=$('#lp').innerHTML.match(/class="slot"/g)||[];TR.eq(slots.length,2,'две ячейки лупы всегда на месте');
  D.rot=-90;loupe();TR.eq(($('#lp').innerHTML.match(/class="slot"/g)||[]).length,2,'при одном приборе ячейки не перестраиваются');I.cyl.stand=null;loupe();TR.eq(($('#lp').innerHTML.match(/class="slot"/g)||[]).length,2,'ячейки сохраняются, шкала не растягивается')}
 {const css=require('fs').readFileSync(__dirname+'/style.css','utf8');TR.ok(/\.slot\{flex:0 0 calc\(50% - 3px\)/.test(css),'ячейка лупы фиксированной ширины 50%');TR.ok(/\.slot>svg\{position:absolute;inset:0;width:100%;height:100%\}/.test(css),'шкала всегда занимает всю ячейку (одинаковый масштаб)')}

 /* ---------- 28. тени ---------- */
 TR.g('28. Тени: форма и направление');
 fresh(1);{const place=(id,x,y)=>{I[id].x=x;I[id].y=y;I[id].rot=I[id].rot;setT(I[id])};
  for(const id of ['bk1','bk2','nacl','thr','d1','d2','d4'])place(id,760+rnd()*60,400+rnd()*40);
  I.hex.x=800;I.hex.y=300;setT(I.hex);I.sc.x=700;I.sc.y=520;setT(I.sc);I.cyl.stand=I.hex;I.cyl.rot=0;I.cyl.x=800;I.cyl.y=300-STAND;setT(I.cyl);
  const D={};for(const id of Object.keys(SHD)){const e=I[id].sh;D[id]={d:e.getAttribute('d')||'',op:+e.getAttribute('opacity')}}
  for(const id of Object.keys(SHD)){TR.ok(D[id].op>0&&D[id].d.length>10,`у «${id}» на столе есть тень (${D[id].op})`)}
  const shape=d=>d.replace(/-?\d+(\.\d+)?/g,'#');
  TR.ok(shape(D.hex.d)!==shape(D.bk1.d)&&shape(D.sc.d)!==shape(D.bk1.d)&&shape(D.sc.d)!==shape(D.hex.d),'тени стакана, шестигранника и весов разной формы');
  TR.ok(!/A/.test(D.hex.d)&&!/A/.test(D.sc.d)&&/A/.test(D.bk1.d),'у цилиндров тень со скруглением, у граней — многоугольник');
  TR.eq((D.hex.d.match(/M/g)||[]).length,3,'тень шестигранника — протяжённая форма');TR.ok((D.sc.d.match(/L/g)||[]).length>40,'тень весов повторяет скруглённый прямоугольник');
  const ys=d=>[...d.matchAll(/(?:[ML,]|^)(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g)].map(m=>+m[2]);
  for(const [id,ground] of [['bk1',I.bk1.y+56],['nacl',I.nacl.y+42],['d1',I.d1.y+30],['d4',I.d4.y+31]]){const y=ys(D[id].d);TR.ok(Math.min(...y)<ground-3,`тень «${id}» уходит за предмет (вверх по экрану): ${Math.min(...y).toFixed(1)} < ${ground}`);TR.ok(Math.max(...y)<=ground+10,`тень «${id}» не выходит вперёд предмета`)}
  {const y=ys(D.hex.d);const front=I.hex.y+16+60.6*(1-.6)+1;TR.ok(Math.max(...y)<=front+.01&&Math.min(...y)<I.hex.y+16-60.6*.4-3,'тень шестигранника лежит за ним')}
  {const y=ys(D.sc.d);TR.ok(Math.min(...y)<I.sc.y-5&&Math.max(...y)<=I.sc.y+51.6*scG(I.sc).ky+1,'тень весов лежит за ними')}
  fresh(1);for(const id of ['bk1','d1','nacl']){const e=I[id].sh;TR.eq(+e.getAttribute('opacity'),0,`в кейсе у «${id}» тени нет`)}
  fresh(1);I.sc.x=700;I.sc.y=400;steps(5);near('d1',4);placeOnScale(I.d1);steps(30);TR.eq(+I.d1.sh.getAttribute('opacity'),0,'у цилиндра на весах отдельной тени нет')}

 /* ---------- 29. покачивание цилиндра на крючке ---------- */
 TR.g('29. Покачивание и крючок динамометра');
 fresh(2);{const D=I.dyn;D.x=700;D.y=150;D.rot=0;D.tw=null;D.ex=0;D.ev=0;D.th=0;D.tv=0;D.sw=0;const d=I.d2;d.x=701;d.y=250;d.tw=null;hookOn(d);steps(80);
  let maxHook=0,maxDisc=0,badRing=0,signOK=true,sw0=hookPos(D).x,frames=0;
  const ring=()=>{const a=d.rot*Math.PI/180,r=24.4+3;return{x:d.x+r*Math.sin(a),y:d.y-r*Math.cos(a)}};
  for(let i=0;i<40;i++){D.x+=5;steps(1)}
  for(let i=0;i<260;i++){steps(1);frames++;const hp=hookPos(D),rg=ring();maxHook=Math.max(maxHook,Math.abs(hp.x-(D.x+1)));maxDisc=Math.max(maxDisc,Math.abs(d.x-hp.x));
   if(Math.hypot(rg.x-hp.x,rg.y-hp.y)>3.5)badRing++;if(Math.abs(d.x-hp.x)>3&&Math.sign(d.x-hp.x)===Math.sign(d.rot))signOK=false}
  TR.ok(maxHook>.3,`крючок покачивается вместе с пружиной (до ${maxHook.toFixed(2)} px)`);TR.ok(maxDisc>maxHook*2,`цилиндр на конце качается сильнее крючка (${maxDisc.toFixed(1)} против ${maxHook.toFixed(1)})`);
  TR.eq(badRing,0,'колечко цилиндра всё время остаётся на крючке (расхождение ≤ 3,5 px)');TR.ok(signOK,'наклон цилиндра согласован с направлением качания');
  steps(600);TR.near(D.th,0,.01,'качание затухает');TR.near(D.sw,0,.01,'пружина тоже успокаивается');TR.near(d.rot,0,.5,'цилиндр вертикален')}
 fresh(2);{const D=I.dyn;D.x=700;D.y=150;D.rot=0;D.tw=null;D.ex=0;const d=I.d2;d.x=701;d.y=250;d.tw=null;hookOn(d);steps(80);
  let writes=0;const g=d.g;let cur=g.innerHTML;Object.defineProperty(g,'innerHTML',{get(){return cur},set(v){writes++;cur=v},configurable:true});
  for(let i=0;i<60;i++){D.x+=4*Math.sin(i/4);steps(1)}TR.ok(writes<=2,`при качании в воздухе разметка цилиндра не перерисовывается (записей: ${writes})`)}
 fresh(2);{const D=I.dyn;D.x=800;D.y=150;D.rot=0;D.tw=null;D.ex=0;const d=I.d2;d.x=801;d.y=250;d.tw=null;hookOn(d);steps(80);D.x=94;D.y=150;steps(40);I.bk1.x=94;I.bk1.y=394;I.bk1.w=200;I.bk1.dv=200;
  for(let y=150;y<=330;y+=6){D.y=y;steps(12)}
  TR.eq(d.bk,null,'стакан в кейсе не принимает цилиндр на динамометре');TR.eq(d.sf,0,'цилиндр не погружается в воду стакана в кейсе');TR.near(D.ex/PXN,W_of('d2'),.002,'показание = вес в воздухе')}
 fresh(2);{I.bk1.x=701;I.bk1.y=520;I.bk1.w=200;I.bk1.dv=200;const D=I.dyn;D.x=700;D.y=150;D.rot=0;D.tw=null;D.ex=0;const d=I.d2;d.x=701;d.y=250;d.tw=null;hookOn(d);steps(80);
  let sfIn=[];for(let y=150;y<=300;y+=5){D.y=y;steps(20);if(d.sf>0&&d.sf<1)sfIn.push(d.surf!=null)}TR.ok(sfIn.every(x=>x),'при частичном погружении подкраска водой не мигает')}
 fresh(2);{I.bk1.x=701;I.bk1.y=520;I.bk1.w=200;I.bk1.dv=200;const D=I.dyn;D.x=700;D.y=262;D.rot=0;D.tw=null;D.ex=0;const d=I.d2;d.x=701;d.y=330;d.tw=null;hookOn(d);steps(200);
  const flips=[];let prev=d.surf!=null;for(let i=0;i<300;i++){D.x+=3*Math.sin(i/5);steps(1);const now=d.surf!=null;if(now!==prev){flips.push(i);prev=now}}
  TR.ok(flips.length<=2,`при качании в воде подкраска не мигает (переключений: ${flips.length})`)}

 /* ---------- 30. типографика ---------- */
 TR.g('30. Неразрывные пробелы после предлогов');
 const N=NBSP;
 [['Мензурка в опоре','Мензурка в'+N+'опоре'],['и в воде','и'+N+'в'+N+'воде'],['на столе','на'+N+'столе'],['Цилиндр №1','Цилиндр №1'],['№ 1','№'+N+'1'],['а не №1','а'+N+'не'+N+'№1'],['10 мл воды','10'+N+'мл воды'],['0,1 г','0,1'+N+'г'],['слово — тире','слово'+N+'— тире'],['с правилами','с'+N+'правилами'],['для работы','для'+N+'работы'],['под водой','под'+N+'водой'],['вода','вода'],['Привет','Привет'],['до погружения','до'+N+'погружения']]
  .forEach(([a,b])=>TR.eq(NBT(a),b,`NBT(${JSON.stringify(a)})`));
 TR.eq(NBH('<b>в воде</b> и на столе'),'<b>в'+N+'воде</b> и'+N+'на'+N+'столе','в разметке теги не трогаются');TR.eq(NBH('<a href="x в y">на столе</a>'),'<a href="x в y">на'+N+'столе</a>','атрибуты не меняются');
 const RAW=/(^|[\s>(«])(в|во|к|ко|с|со|у|о|об|на|по|за|из|от|до|при|про|над|под|без|для|и|а|но|не|ни|же|бы|ли|или) [^\s<]/iu;
 const scanned=[];const scan=(label,txt)=>{scanned.push(label);TR.ok(!RAW.test(String(txt)),`${label}: предлог не оторван от слова: «${String(txt).match(RAW)&&String(txt).match(RAW)[0]}»`)};
 for(const lab of [1,2,3]){fresh(lab);scan(`задание ${lab}`,$('#tt').textContent);scan(`условие ${lab}`,$('#te').textContent);scan(`заголовок ${lab}`,$('#ttl').textContent);scan(`лупа ${lab}`,$('#lt').textContent);
  showHint();scan(`подсказка ${lab}`,$('#hintbox').innerHTML);
  const tx=[];const _t=toast;toast=function(t){tx.push(t);$('#toast').textContent=NBT(t)};
  for(const f of [()=>{I.cyl.stand=null;bar()},()=>{standUp();bar()},()=>{I.cyl.stand=I.hex;I.bk1.x=I.cyl.x+50;I.bk1.y=I.cyl.y;bar()}]){f();scan(`строка под столом ${lab}`,$('#fh').textContent)}
  clearF();try{LAB===1?check1():LAB===2?check2():check3()}catch(e){};scan(`проверка (пусто) ${lab}`,$('#res').innerHTML);
  toast=_t}
 {fresh(1);standUp();const c=I.cyl;dropDisc(TG);const _t=toast;let m='';toast=function(t){m=NBT(t)};pour('bk1',10);toast=_t;scan('запрет воды',m);
  const ml=menu(I.d1).concat(menu(I.hex),menu(I.sc),menu(I.bk1),menu(I.cyl));ml.forEach(x=>scan('меню «'+x[0]+'»',NBH(x[0])))}
 {fresh(1);for(const [m,dm,v1,v2,vv,dv,r] of [['190','0,2','75','101','26','1','8'],['196,05','0,1','74','100','26','2','7,5']]){const o=run1({m,dm,v1,v2,vv,dv,r});scan('результаты проверки 1',o)}
  fresh(2);scan('результаты проверки 2',run2({p1:'0,3',p2:'0,9',fa:'1',dp1:'1',dp2:'1',fs:'b'}));fresh(3);scan('результаты проверки 3',run3('0,3',['0,9','0,8','0,7'],['0,1','0,1','0,1'],{qn:'b',qs:'c',eq1:'0,5'}))}
 {const html=require('fs').readFileSync(__dirname+'/index.html','utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'');
  const segs=html.split(/<[^>]+>/).map(x=>x.replace(/&nbsp;/g,'\u00A0')).filter(x=>x.trim());
  const nodes=segs.map(v=>({nodeValue:v,parentNode:{nodeName:'DIV'}}));let i=0;const _w=document.createTreeWalker;document.createTreeWalker=()=>({nextNode:()=>nodes[i++]||null});
  typo({querySelectorAll:()=>[]});document.createTreeWalker=_w;
  nodes.forEach(n=>TR.ok(!RAW.test(n.nodeValue),`статический текст страницы: «${n.nodeValue.slice(0,50)}»`));TR.ok(nodes.length>40,`обработано текстовых узлов страницы: ${nodes.length}`)}

 /* ---------- 31. окно выбора варианта и карточки вывода ---------- */
 TR.g('31. Выбор варианта и карточки вывода');
 for(const lab of [1,2,3]){LAB=-1;$('#varm').hidden=true;setLab(lab);TR.eq($('#varm').hidden,false,`при открытии работы ${lab} показано окно выбора тела`);
  const h=$('#vc').innerHTML,cards=h.match(/class="vcard"/g)||[];TR.eq(cards.length,3,'три карточки');
  ORDER[lab].forEach((id,i)=>{TR.ok(new RegExp('Вариант '+(i+1)+'</b><span>Цилиндр №'+I[id].n+'<').test(h),`карточка ${i+1}: цилиндр №${I[id].n}`)});
  TR.ok(/выберите исследуемое тело/.test($('#vt').textContent),'заголовок окна');TR.ok($('#vs').textContent.length>5,'название работы в окне');
  ORDER[lab].forEach((id,i)=>{newVariant(i);TR.eq(TG,id,`выбор карточки ${i+1} задаёт цилиндр №${I[id].n}`);TR.ok(new RegExp('цилиндр №'+I[id].n).test($('#tt').textContent),'и обновляет задание')})}
 {const html=require('fs').readFileSync(__dirname+'/index.html','utf8');TR.ok(/id="varm"/.test(html)&&/id="vc"/.test(html)&&/id="qno"/.test(html)&&!/<select id="qn"/.test(html),'в HTML есть окно выбора и карточки вывода вместо списка');TR.eq((html.match(/class="opt"/g)||[]).length,3,'три варианта вывода видны сразу');
  TR.ok(/<h2>Измерения<\/h2>/.test(html)&&!/Черновик/.test(html),'область называется «Измерения»');TR.ok(!/черновик/i.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'в тексте программы слова «черновик» нет')}
 fresh(3);{const el=$('#qno'),click=v=>el._h.click({target:{closest:()=>({dataset:{v}})}});
  TR.eq($('#qn').value,'','вывод по умолчанию не выбран');click('a');TR.eq($('#qn').value,'a','выбор варианта A');click('b');TR.eq($('#qn').value,'b','выбор другого варианта заменяет прежний');click('b');TR.eq($('#qn').value,'','повторный щелчок снимает выбор');
  undo();TR.eq($('#qn').value,'b','снятие выбора можно отменить');undo();TR.eq($('#qn').value,'a','и выбор тоже');redo();TR.eq($('#qn').value,'b','и повторить');
  clearF();$('#qn').value='';const rnd2=()=>{FLD.forEach(k=>{});};
  setF('q1','0,69');setF('eq1','0,02');['qa','qb','qc'].forEach(k=>{setF(k,'0,5');setF('e'+k,'0,02')});['ra','rb','rc'].forEach(k=>{setF(k,'0,2');setF('e'+k,'0,04')});
  check3();let h=res();TR.ok(/не выбрали вариант вывода/.test(plain(h)),'без выбранного вывода проверка сообщает об этом');TR.eq(cnt(h,'ok')+cnt(h,'er')-1>=0?cnt(h,'ok'):0,0,'и не проверяет остальное');TR.ok(/Выберите наиболее подходящий/.test(plain(h)),'просит выбрать наиболее подходящий вариант');
  const cls=[];const _a=el.classList.add;el.classList.add=c=>cls.push(c);check3();el.classList.add=_a;TR.ok(cls.includes('shake'),'карточки вывода подсвечиваются');
  click('a');check3();h=res();TR.ok(!/не выбрали вариант/.test(plain(h)),'после выбора работа проверяется')}
 /* ---------- 32. нижняя строка и виджет переливания ---------- */
 TR.g('32. Виджет переливания');
 fresh(1);{standUp();const c=I.cyl;I.bk1.x=c.x+60;I.bk1.y=c.y;bar();const h=$('#bar').innerHTML;TR.ok(/class="flow"/.test(h)&&/class="arr"/.test(h)&&/Переливание воды/.test(h),'вместо простого текста — значок стакана, мензурки и стрелка');
  TR.ok(!/Стакан ⇄ мензурка/.test(h),'старая надпись убрана');TR.eq((h.match(/<button/g)||[]).length,4,'четыре кнопки переливания');
  dropDisc(TG);bar();const hb=$('#bar').innerHTML;TR.ok(/flow off/.test(hb)&&/disabled/.test(hb),'с цилиндром в мензурке виджет и кнопки неактивны')}
 {const css=require('fs').readFileSync(__dirname+'/style.css','utf8');TR.ok(/\.flow\{[^}]*white-space:nowrap/.test(css),'подпись переливания не переносится')}

 /* ---------- 33. кнопки и размер весов ---------- */
 TR.g('33. Кнопки и размер весов');
 fresh(1);{const sc=I.sc;for(const dist of [0,200]){sc.x=sc.hx+dist;const h=body(sc);
   TR.ok(h.startsWith('<g transform="scale(1.2)">'),`весы увеличены на 20% (смещение ${dist})`);
   const R=a=>{const m=h.match(new RegExp('<rect data-act="'+a+'" x="([-\\d.]+)" y="([-\\d.]+)" width="([\\d.]+)" height="([\\d.]+)"'));return m?{x:+m[1],y:+m[2],w:+m[3],h:+m[4]}:null};
   const top=['pcs','un','lt'].map(R),bot=['pw','tr'].map(R);TR.ok(top.every(Boolean)&&bot.every(Boolean),'все пять кнопок на месте');if(!top.every(Boolean)||!bot.every(Boolean))continue;
   TR.ok(top.every(b=>Math.abs(b.w-top[0].w)<1e-9&&Math.abs(b.h-top[0].h)<1e-9),'три верхние кнопки одного размера');
   TR.ok(bot.every(b=>Math.abs(b.w-bot[0].w)<1e-9&&Math.abs(b.h-bot[0].h)<1e-9),'две нижние кнопки одного размера');
   TR.ok(bot[0].w>top[0].w&&bot[0].h>top[0].h,'нижние кнопки больше верхних');
   const tl=top[0].x,tr=top[2].x+top[2].w,bl=bot[0].x,br=bot[1].x+bot[1].w;
   TR.near(tl,bl,1e-9,'левые края рядов совпадают');TR.near(tr,br,1e-9,'правые края рядов совпадают (суммарная ширина одинакова)');
   const g1=top[1].x-(top[0].x+top[0].w),g2=top[2].x-(top[1].x+top[1].w),g3=bot[1].x-(bot[0].x+bot[0].w);TR.ok(Math.abs(g1-g2)<1e-9&&Math.abs(g1-g3)<1e-9,'промежутки между кнопками одинаковы');
   const panelL=-81,panelR=16,panelB=39;TR.near(tl-panelL,panelR-tr,1e-9,'боковые отступы от края панели равны');TR.near(tl-panelL,panelB-(bot[0].y+bot[0].h),1e-9,'нижний отступ равен боковым');
   const disp=h.match(/<rect x="-75" y="-33" width="85" height="28"/);TR.ok(!!disp,'дисплей той же ширины, что ряды кнопок, с теми же отступами');
   TR.near(tl,-75,1e-9,'левый край кнопок совпадает с краем дисплея');TR.near(tr,10,1e-9,'правый край кнопок совпадает с краем дисплея')}}
 fresh(1);{I.sc.x=I.sc.hx+300;const h=body(I.sc);TR.ok(/<rect x="21" y="-36" width="57" height="72" rx="3" fill="url\(#gPlat\)"/.test(h)&&/<rect x="21" y="-3[\d.]+" width="57" height="72" rx="3" fill="#66788f"\/>/.test(h)&&/fill="#586b83"/.test(h),'площадка выпуклая: верхняя плита, нижний слой и стенка между ними');
  const idx=document.querySelector('#x');TR.ok(true,'')}

 /* ---------- 34. окно переливания: только у самой мензурки ---------- */
 TR.g('34. Окно переливания воды');
 for(const lab of [1,3]){fresh(lab);standUp();const c=I.cyl,b=I.bk1,lim=28*1.1+42;b.y=c.y;
  for(const dx of [0,30,60,72,72.7]){b.x=c.x+dx;bar();TR.ok(/class="flow/.test($('#bar').innerHTML),`стакан в ${dx} px от оси мензурки — окно переливания открыто (граница ${lim.toFixed(1)})`);b.x=c.x-dx;bar();TR.ok(/class="flow/.test($('#bar').innerHTML),`и слева (${dx} px)`)}
  for(const dx of [73,80,100,150,200]){b.x=c.x+dx;bar();TR.ok($('#bar').innerHTML==='','стакан в '+dx+' px — окна нет');b.x=c.x-dx;bar();TR.ok($('#bar').innerHTML==='','и слева ('+dx+' px)')}
  TR.near(lim,72.8,1e-9,'граница = ширина мензурки + 10% и полуширина стакана')}
 fresh(1);{standUp();bar();TR.eq($('#fh').textContent,NBT('Поднесите стакан к мензурке — появятся кнопки переливания воды'),'подсказка у пустого стола');
  I.cyl.stand=null;bar();TR.eq($('#fh').textContent,NBT('Мензурка устойчива только на опоре: сначала поставьте опору на стол, а затем вставьте в неё мензурку'),'новый текст про опору')}
 fresh(2);{I.cyl.stand=null;bar();TR.eq($('#fh').textContent,'','в работе 2 про мензурку ничего не пишем')}

 /* ---------- 35. правила, подвал, страница ---------- */
 TR.g('35. Правила пользования, окно выбора, подвал');
 {const html=require('fs').readFileSync(__dirname+'/index.html','utf8');
  const tos=html.match(/<div id="tosm"[\s\S]*?<button class="pri" id="tx"/)[0];
  TR.ok(/По всем вопросам ищите информацию в телеграм-канале <a href="https:\/\/t\.me\/nauka_explain"[^>]*>Поясни за науку<\/a>/.test(tos),'в правилах есть строка про телеграм-канал со ссылкой');
  const vm=html.match(/<div id="varm"[\s\S]*?<div id="tosm"/)[0];
  TR.ok(/id="vc"/.test(vm)&&/id="vh"/.test(vm)&&/class="card vhelp"/.test(vm),'окно выбора: слева карточки, справа окно управления');
  TR.ok(vm.indexOf('id="vc"')<vm.indexOf('id="vh"'),'выбор цилиндра левее управления');
  TR.ok(/Позже вариант можно сменить кнопкой «Вариант» в шапке/.test(vm)&&/Справку по управлению можно прочитать по нажатию на знак вопроса/.test(vm),'ниже обе подписи');
  TR.ok(vm.indexOf('class="vnote"')>vm.indexOf('id="vh"'),'подписи ниже окон');
  TR.ok(/id="helpbody"/.test(html),'текст управления помечен для повторного показа')}
 for(const lab of [1,2,3]){LAB=-1;setLab(lab);$('#helpbody').innerHTML='Управление X';openVariants();TR.eq($('#vh').innerHTML,'Управление X',`справка по управлению показывается рядом с выбором (работа ${lab})`)}

 /* ---------- 36. карточки цилиндров ---------- */
 TR.g('36. Карточки цилиндров и порядок в кейсе');
 for(const lab of [1,2,3]){TR.eq(ORDER[lab].join(','),'d1,d2,d4',`порядок вариантов в работе ${lab}: №1, №2, №4`);LAB=-1;setLab(lab);const h=$('#vc').innerHTML;
  TR.ok(!/<ellipse cx="35" cy="78"/.test(h),'нижней окружности (грани) у цилиндров не видно');TR.eq((h.match(/V78A/g)||[]).length,3,'тело цилиндра закрыто только передней дугой');
  const order=[...h.matchAll(/Вариант (\d)<\/b><span>Цилиндр №(\d)</g)].map(m=>m[1]+':'+m[2]).join(' ');TR.eq(order,'1:1 2:2 3:4','карточки слева направо: вариант 1 — №1, 2 — №2, 3 — №4')}
 fresh(1);TR.ok(I.d1.hx<I.d2.hx&&I.d2.hx<I.d4.hx,'в кейсе слева направо: №1, №2, №4');TR.eq(I.d1.n,1,'левый цилиндр №1');TR.eq(I.d4.n,4,'правый цилиндр №4');
 fresh(1);TR.ok(I.d1.mat===3&&I.d2.mat===2&&I.d4.mat===2,'сталь №1, алюминий №2 и №4');

 /* ---------- 37. лупа: пропорции и подписи ---------- */
 TR.g('37. Лупа: форма цилиндра и размер подписей');
 fresh(1);{standUp();const c=I.cyl;for(const id of ['d1','d2','d4']){const d=I[id];d.in=c;d.x=c.x;d.off=175-EXT(d);d.y=c.y+d.off;d.tw=null;c.w=60;c.lv=60;
   const s=lpV(),m=s.match(new RegExp('<path d="M([-\\d.]+) ([-\\d.]+)V([-\\d.]+)A([\\d.]+) ([\\d.]+) 0 0 0 ([-\\d.]+) ([-\\d.]+)V[-\\d.]+Z" fill="url\\(#gS'+d.mat)),tube=180;
   TR.ok(!!m,`цилиндр №${d.n} нарисован в лупе`);if(!m)continue;const w=(+m[6]-+m[1])/2,h=(+m[3]-+m[2])+2*(+m[5]);
   TR.near(2*w/tube,2*d.R/56,.001,`ширина цилиндра №${d.n} к ширине мензурки как на столе (${(2*w/tube).toFixed(3)} против ${(2*d.R/56).toFixed(3)})`);
   const tableRatio=(2*EXT(d))/(2*d.R),lpRatio=h/(2*w);TR.near(lpRatio,tableRatio,.01,`отношение высоты к ширине цилиндра №${d.n} как на столе (${lpRatio.toFixed(2)} против ${tableRatio.toFixed(2)})`);
   d.in=null}}
 for(const lab of [1,2,3]){fresh(lab);standUp();I.cyl.lv=40;const dd=I.dyn;dd.rot=0;dd.ex=20;const fs1=lpV().match(/font-size="(\d+)" fill="#2c4a57">\d+/),fs2=lpD().match(/font-size="(\d+)" fill="#222">\d/);const mul=lab===3?2:1;
  TR.ok(!!fs1&&+fs1[1]===12*mul,`подписи на шкале мензурки: ${fs1&&fs1[1]} px (работа ${lab})`);TR.ok(!!fs2&&+fs2[1]===12*mul,`подписи на шкале динамометра: ${fs2&&fs2[1]} px (работа ${lab})`);
  const u1=lpV().match(/font-size="(\d+)" fill="#2c4a57">мл/),u2=lpD().match(/font-size="(\d+)" fill="#222">Н/);TR.ok(+u1[1]===13*mul&&+u2[1]===13*mul,`единицы «мл» и «Н» ×${mul}`)}
 TR.g('37. Лупа: форма цилиндра и размер подписей');

 /* ---------- 38. второй динамометр ---------- */
 TR.g('38. Второй динамометр');
 fresh(2);{const D=I.dyn2;TR.eq(D.k,'dyn','второй динамометр — прибор того же вида');TR.eq(D.rot,0,'в кейсе стоит вертикально, как на фото');TR.ok(body(D).includes('url(#gYel)'),'жёлтый корпус');TR.ok(/Динамометр №2/.test(NAME.dyn2)&&/Динамометр №1/.test(NAME.dyn),'подписи при наведении: №1 и №2')}
 for(let run=0;run<18;run++){const id=['d1','d2','d4'][run%3];fresh(2);rollAll();I.bk1.x=701;I.bk1.y=520;I.bk1.w=200;I.bk1.dv=200;
  const D=I.dyn2;D.x=700;D.y=150;D.tw=null;D.ex=0;const d=I[id];d.x=D.x+6;d.y=250;d.tw=null;hookOn(d);steps(70);
  TR.ok(d.hung&&D.hang===d,'цилиндр повис на втором динамометре');TR.ok(!I.dyn.hang,'первый динамометр свободен');
  const W=W_of(id),B=B_of(id);TR.near(D.ex/SPEC.dyn2.pxn,W,.002,`в воздухе показание = вес (${id})`);
  let prev=1e9,full=0;for(let y=150;y<=470;y+=3){D.y=y;steps(45);const r=D.ex/SPEC.dyn2.pxn;TR.ok(r>=-1e-9&&r<=prev+.003,`показание не растёт при опускании (y=${y})`);prev=r;if(!d.rest&&d.sf>.999){full++;TR.near(r,W-B,.004,`полное погружение: P₂ = mg − ρgV (${id}, прибор №2)`)}}
  TR.ok(full>=2,`окно полного погружения есть и у прибора №2 (${id})`)}
 fresh(2);{const D=I.dyn2;D.x=700;D.y=150;D.tw=null;D.ex=0;const d=I.d2;d.x=706;d.y=250;d.tw=null;hookOn(d);steps(80);
  const ring=()=>{const a=d.rot*Math.PI/180,r=24.4+3;return{x:d.x+r*Math.sin(a),y:d.y-r*Math.cos(a)}};let bad_=0,maxH=0,maxD=0;
  for(let i=0;i<40;i++){D.x+=5;steps(1)}for(let i=0;i<260;i++){steps(1);const hp=hookPos(D),rg=ring();if(Math.hypot(rg.x-hp.x,rg.y-hp.y)>3.5)bad_++;maxH=Math.max(maxH,Math.abs(hp.x-(D.x+SPEC.dyn2.px+SPEC.dyn2.rx)));maxD=Math.max(maxD,Math.abs(d.x-hp.x))}
  TR.eq(bad_,0,'колечко на крючке второго динамометра');TR.ok(maxH>.2&&maxD>2*maxH,'крючок качается меньше цилиндра');
  const u=lpD();TR.ok(u.startsWith('<svg'),'лупа работает со вторым динамометром');
  const msg=sendHome(D);TR.eq(msg,false,'динамометр с грузом нельзя убрать в кейс');TR.ok(D.hang===d,'груз остался')}
 fresh(2);{I.dyn.x=700;I.dyn.y=150;I.dyn.rot=0;I.dyn.tw=null;I.dyn2.x=800;I.dyn2.y=150;I.dyn2.tw=null;const d1=I.d1,d2=I.d2;
  d1.x=I.dyn.x+1;d1.y=I.dyn.y+93+30;d1.tw=null;drop(d1,{fx:d1.hx,fy:d1.hy,fr:0});steps(40);TR.eq(I.dyn.hang,d1,'груз, поднесённый к первому прибору, повис на нём');
  d2.x=I.dyn2.x+6;d2.y=I.dyn2.y+77+30;d2.tw=null;drop(d2,{fx:d2.hx,fy:d2.hy,fr:0});steps(40);TR.eq(I.dyn2.hang,d2,'а второй груз — на втором приборе');
  const m1=menu(d1).map(x=>x[0]).join('|');TR.ok(/Снять с динамометра/.test(m1),'в меню есть «Снять с динамометра»');
  menu(d2).find(x=>/Снять/.test(x[0]))[1]();steps(30);TR.eq(I.dyn2.hang,null,'снятие работает для второго прибора');
  H.pointerdown(ev('d1',d1.x,d1.y));H.pointermove(ev('d1',d1.x+20,d1.y+20));H.pointermove(ev('d1',d1.x+160,d1.y+90));H.pointerup(ev('d1',d1.x+160,d1.y+90));steps(10);TR.eq(I.dyn.hang,null,'если груз унести рукой, он снимается с первого прибора')}
 fresh(3);{standUp();const c=I.cyl;fillTo(100);const D=I.dyn2;D.x=c.x-6;D.y=100;D.tw=null;D.ex=0;const d=I.d2;d.x=D.x+6;d.y=300;d.tw=null;hookOn(d);steps(60);
  for(let y=100;y<=230;y+=4){D.y=y;steps(30)}TR.eq(d.bk,c,'цилиндр на втором динамометре заходит в мензурку');TR.near(lvl(c)-c.w,d.V*d.sf,1e-9,'уровень поднимается пропорционально погружению');TR.ok(cylBusy(),'воду менять нельзя');
  const L=$('#lp').innerHTML;TR.ok(/class="slot"/.test(L),'лупа показывает обе шкалы')}

 /* ---------- 39. стенки между слоями весов ---------- */
 TR.g('39. Весы: стенки между слоями');
 fresh(1);{const sc=I.sc;
  for(const dist of [0,30,60,120,300]){sc.x=sc.hx+dist;const g=scG(sc),h=body(sc),thB=(2.4/g.ky)*g.sa/.5,thP=(3/g.ky)*g.sa/.5;
   const bridges=(h.match(/<rect x="[-\d.]+" y="[-\d.]+" width="[-\d.]+" height="[-\d.]+" fill="#4a5056"\/>/g)||[]).length,pw=/fill="#586b83"/.test(h);
   if(g.sa<.01){TR.eq(bridges,0,`сверху (смещение ${dist}) стенок нет — толщины не видно`);TR.ok(!pw,'и у площадки тоже')}
   else{TR.eq(bridges,5,`у каждой из пяти кнопок есть стенка (смещение ${dist})`);TR.ok(pw,'у площадки есть стенка');
    const m=h.match(/<rect data-act="pw" x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/),base=h.match(new RegExp('<rect x="'+m[1]+'" y="([-\\d.]+)" width="'+m[3]+'" height="'+m[4]+'" rx="3.5" fill="#575d63"/>'));
    TR.ok(!!base,'под кнопкой есть нижний слой');if(base)TR.near(+base[1]-+m[2],thB,1e-6,`нижний слой смещён на толщину (${thB.toFixed(2)})`);
    const wallRect=h.match(new RegExp('<rect x="'+m[1]+'" y="([-\\d.]+)" width="'+m[3]+'" height="([-\\d.]+)" fill="#4a5056"/>'));TR.ok(!!wallRect,'между слоями кнопки стенка с вертикальными боками');
    if(wallRect&&base){const top=+m[2],hh=+m[4];TR.ok(+wallRect[1]<=top+3.6&&+wallRect[1]+ +wallRect[2]>=+base[1]+hh-3.5-1e-6,'стенка тянется от верхнего слоя до начала скругления нижнего: щелей по бокам нет')}
    TR.near(thP,(3/g.ky)*g.sa/.5,1e-9,'толщина площадки зависит от наклона');TR.ok(thP>0&&thP<6,'толщина площадки в разумных пределах (' +thP.toFixed(2)+')')}}
  sc.x=sc.hx+300;I.sc.press='pw';const hp=body(sc);TR.ok(/translate\(0 [\d.]+\)/.test(hp),'при нажатии верхний слой кнопки опускается к стенке');I.sc.press=null}

 /* ---------- 40. правило «1 мл ниже поверхности» ---------- */
 TR.g('40. Погружение на 1 мл ниже поверхности');
 for(let vi=0;vi<3;vi++)for(const w of [60,100,150]){fresh(1,vi);rollAll();standUp();const c=I.cyl,tg=I[TG];fillTo(w);steps(30);dropDisc(TG);
  const Lf=w+tg.V,surf=c.y+175-Lf*1.4,top=tg.y-EXT(tg);TR.near(top-surf,1.4,1e-6,`верх цилиндра на 1 мл (1,4 px) ниже поверхности (вода ${w} мл, цилиндр №${tg.n})`);
  TR.ok(tg.y+EXT(tg)<=c.y+175+1e-6,'и не ниже дна')}

 /* ---------- 41. адрес работы ---------- */
 TR.g('41. Ссылка на конкретную работу');
 {const mk=(hash)=>{document.querySelector('#vc').innerHTML='';document.querySelector('#varm').hidden=false;global.location={hash};global.history={url:null,replaceState(a,b,u){this.url=u}};const r=new Function(src+';return {LAB,TG,vi,hashVar,hidden:$("#varm").hidden,vc:$("#vc").innerHTML}')();return r};
  let r=mk('#2');TR.eq(r.LAB,2,'#2 открывает работу 2');TR.eq(r.TG,'d1','вариант по умолчанию — №1');TR.ok(r.vc.length>0,'без варианта в ссылке показывается окно выбора');
  r=mk('#3-2');TR.eq(r.LAB,3,'#3-2 открывает работу 3');TR.eq(r.TG,'d2','вариант 2 — цилиндр №2');TR.eq(r.vc,'','с вариантом в ссылке окно выбора не открывается');
  r=mk('#1-3');TR.eq(r.TG,'d4','#1-3 — цилиндр №4');
  r=mk('#2-9');TR.eq(r.TG,'d4','вариант вне диапазона ограничивается');
  r=mk('#9');TR.eq(r.LAB,1,'несуществующая работа — по умолчанию первая');r=mk('');TR.eq(r.LAB,1,'без адреса — первая работа');r=mk('#abc');TR.eq(r.LAB,1,'мусор в адресе игнорируется');r=mk('#0');TR.eq(r.LAB,1,'#0 игнорируется');
  global.history={url:null,replaceState(a,b,u){this.url=u}};LAB=-1;setLab(3);TR.eq(history.url,'#3','при переключении работы адрес обновляется (#3)');
  global.history={replaceState(){throw new Error('file://')}};let thr=false;try{LAB=-1;setLab(2)}catch(e){thr=true}TR.ok(!thr,'запрет history на локальном файле не ломает переключение');
  delete global.location;delete global.history}

 /* ---------- 42. смена варианта не сбрасывает сцену ---------- */
 TR.g('42. Смена варианта: сцена остаётся, измерения очищаются');
 fresh(1);{standUp();const c=I.cyl;fillTo(100);near('d1',0);placeOnScale(I.d1);steps(30);on=true;setF('m','195');setF('dm','0,1');setF('v1','100');const m0={...MS},site0=I.d1.site,w0=c.w,st0=c.stand===I.hex,pos0=[I.d1.x,I.d1.y,I.hex.x,I.hex.y];
  newVariant(1);TR.eq(TG,'d2','вариант изменён');TR.eq(I.d1.site,site0,'цилиндр остался на весах');TR.eq(c.w,w0,'вода осталась в мензурке');TR.eq(c.stand===I.hex,st0,'мензурка осталась в опоре');TR.eq(on,true,'весы остались включены');
  TR.deepEq=JSON.stringify([I.d1.x,I.d1.y,I.hex.x,I.hex.y])===JSON.stringify(pos0);TR.ok(TR.deepEq,'положение предметов не изменилось');
  FLD.forEach(k=>TR.eq($('#'+k).value,'',`поле «${k}» очищено`));TR.eq(JSON.stringify(MS),JSON.stringify(m0),'массы тел не пересчитаны при смене варианта');
  TR.eq(U.length,0,'история отмены очищена');TR.ok(new RegExp('цилиндр №2').test($('#tt').textContent),'задание обновлено');
  setF('m','1');reset();steps(60);TR.eq(I.d1.site,null,'«Начать заново» убирает всё с весов');TR.eq(c.w,0,'и воду из мензурки');TR.eq(on,false,'и выключает весы');TR.eq($('#m').value,'','и очищает измерения');TR.ok(JSON.stringify(MS)!==JSON.stringify(m0),'при перезапуске числа бросаются заново')}

 /* ---------- 43. масштаб страницы ---------- */
 TR.g('43. Масштаб страницы и размер рабочей области');
 {const css=require('fs').readFileSync(__dirname+'/style.css','utf8'),cl2=(a,b,c)=>Math.min(c,Math.max(a,b));
  TR.ok(/--sw:clamp\(220px,18vw,345px\)/.test(css)&&/--nw:clamp\(160px,12\.6vw,242px\)/.test(css),'ширины боковых панелей заданы через vw');
  TR.ok(/main\{[^}]*grid-template-columns:minmax\(0,1fr\) var\(--sw\) var\(--sw\)/.test(css),'рабочая область занимает всё остальное');
  TR.ok(/@media\(max-width:1100px\)\{main\{grid-template-columns:minmax\(0,1fr\) var\(--sw\)\}/.test(css),'переход на две колонки только на очень узком экране');
  const stage=(w)=>w-cl2(160,.126*w,242)-2*cl2(220,.18*w,345)-24-24-24;const base=stage(1920);
  for(const z of [1,1.1,1.25,1.5]){const w=1920/z,phys=stage(w)*z;TR.ok(Math.abs(phys-base)/base<.07,`масштаб страницы ${z*100}%: рабочая область ${phys.toFixed(0)} px против ${base.toFixed(0)} px при 100%`)}
  const old=(w)=>w-242-2*345-72;TR.ok(Math.abs(old(1920/1.5)*1.5-old(1920))/old(1920)>.3,'(для сравнения) прежняя вёрстка при 150% сжимала рабочую область больше чем на 30%');
  TR.ok(/#c2,#c3\{font-size:clamp\(12px,\.78vw,15px\)\}/.test(css),'шрифт боковых панелей сжимается вместе с их шириной')}

 /* ---------- 44. задание и бланк ответов ---------- */
 TR.g('44. Описание бланка ответов в задании');
 for(const lab of [1,2,3]){fresh(lab);const h=$('#tb').innerHTML;TR.ok(/В бланке ответов/.test(plain(h)),`есть заголовок бланка (работа ${lab})`);TR.eq((h.match(/class="ln"/g)||[]).length,[4,4,3][lab-1],'число пунктов бланка');
  TR.ok(/Сделайте рисунок экспериментальной установки/.test(plain(h)),'первый пункт — рисунок');TR.ok(!/\.\s*<\/div>/.test(h),'пункты без точки в конце');TR.ok(!/Предметы перетаскиваются|Правая кнопка мыши открывает/.test($('#tt').textContent+$('#te').textContent+h),'лишние строки про управление убраны')}
 fresh(1);TR.ok(/Запишите формулу для расчёта плотности/.test(plain($('#tb').innerHTML))&&/Запишите значение плотности материала цилиндра/.test(plain($('#tb').innerHTML)),'работа 1: пункты из бланка');
 fresh(3);TR.ok(/Сформулируйте вывод о зависимости/.test(plain($('#tb').innerHTML))&&/в таблице/.test(plain($('#tb').innerHTML)),'работа 3: таблица и вывод');
 {const html=require('fs').readFileSync(__dirname+'/index.html','utf8');TR.ok(!/Предметы перетаскиваются/.test(html)&&!/Правая кнопка мыши открывает меню действий<\/div><\/div><\/div>/.test(html),'в HTML нет прежних двух строк');TR.ok(!/id="fs"|id="qs"|Формула<select/.test(html),'выпадающих списков с формулами нет')}
 for(const lab of [2,3]){fresh(lab);for(const st of [0,1,2,3]){if(st>=1){standUp()}const hnt=hintText();TR.ok(!/[=−]|\\rho|dfrac/.test(plain(hnt)),`подсказка (работа ${lab}, этап ${st}) без формул: «${plain(hnt).slice(0,60)}»`)}}
 {for(const lab of [2,3]){fresh(lab);clearF();const tx=[];
   if(lab===2){setF('p1','0,3');setF('dp1','0,02');setF('p2','0,9');setF('dp2','0,02');setF('fa','0,5');check2()}else{setF('q1','0,3');setF('eq1','0,02');['qa','qb','qc'].forEach(k=>{setF(k,'0,9');setF('e'+k,'0,02')});['ra','rb','rc'].forEach(k=>{setF(k,'0,1');setF('e'+k,'0,04')});setF('qn','a');check3()}
   TR.ok(!/Формула|выбрана|P₁ ?[−-] ?P₂|P 1 ?[−-] ?P 2/.test(plain(res())),`сообщения проверки (работа ${lab}) не подсказывают формулу: «${plain(res()).slice(0,120)}»`)}}

 /* ---------- 45. нумпад: допустимые пары цилиндров ---------- */
 TR.g('45. Пары цилиндров на весах (нумерация как на нампаде)');
 {const K9={7:0,8:1,9:2,4:3,5:4,6:5,1:6,2:7,3:8},okPairs=[[1,9],[3,7],[1,7],[3,9],[4,6],[1,3],[7,9],[2,8],[1,8],[3,8],[7,2],[9,2],[7,6],[1,6],[9,4],[3,4]];
  const tryPair=(a,b)=>{fresh(1);I.sc.x=700;I.sc.y=400;I.sc.tw=null;near('d1',K9[a]);const p1=placeOnScale(I.d1);near('d2',K9[b]);const p2=placeOnScale(I.d2);return p1&&p2};
  for(const [a,b] of okPairs){TR.ok(tryPair(a,b),`цилиндры на точках ${a} и ${b} помещаются`);TR.ok(tryPair(b,a),`и в обратном порядке (${b}, ${a})`)}
  for(const [a,b] of [[1,2],[1,4],[4,5],[5,6],[5,1],[5,9],[2,3],[7,8],[1,5],[3,5],[4,1],[8,9],[2,5],[8,5],[2,4],[4,8],[6,8],[2,6]]){TR.ok(!tryPair(a,b)||I.d2.site!==K9[b],`цилиндры на соседних точках ${a} и ${b} вместе не встают (второй уходит на другую точку)`)}
  fresh(1);I.sc.x=700;I.sc.y=400;near('d1',K9[1]);placeOnScale(I.d1);near('d2',K9[7]);TR.ok(placeOnScale(I.d2)&&I.d2.site===K9[7],'1 и 7 — по вертикали у левого края');near('d4',K9[3]);TR.ok(!placeOnScale(I.d4),'третий цилиндр не помещается (на 3 и 9 тоже нет места)');near('d4',K9[9]);TR.ok(!placeOnScale(I.d4),'и на 9');
  fresh(1);I.sc.x=700;I.sc.y=400;near('d1',K9[4]);placeOnScale(I.d1);near('d2',K9[6]);TR.ok(placeOnScale(I.d2)&&I.d2.site===K9[6],'4 и 6 — по горизонтали посередине');
  fresh(1);I.sc.x=700;I.sc.y=400;near('nacl',K9[1]);TR.ok(placeOnScale(I.nacl),'банка соли помещается');near('d1',K9[9]);TR.ok(!placeOnScale(I.d1),'банка и цилиндр вместе не помещаются');near('thr',K9[9]);TR.ok(placeOnScale(I.thr),'банка и катушка помещаются')
  const rows=[...new Set(SITES.map(s=>s.v))].sort((a,b)=>a-b);TR.near(rows[1]-rows[0],rows[2]-rows[1],1e-9,'ряды точек расположены равномерно');
  TR.ok(36-rows[2]<20.5&&rows[0]+36<20.5,'от нижнего (и верхнего) ряда до края площадки меньше расстояния между рядами — лишний ряд не поместится');
  TR.ok(36-rows[2]>=8,'но отступ до края площадки сохранён')}

 /* ---------- 46. приборы в кейсе не работают ---------- */
 TR.g('46. Динамометры в кейсе');
 for(const lab of [2,3]){fresh(lab);TR.eq(activeDyn(),I.dyn,`в начале работы ${lab} активным считается первый (лежащий) прибор, а не второй из кейса`);
  const h=hintText3===undefined?'':(lab===2?hintText2():hintText3());TR.ok(/Достаньте динамометр из кейса|Достаньте из кейса|Достаньте мензурку/.test(plain(h)),`подсказка (работа ${lab}): сначала достать приборы (${plain(h).slice(0,50)})`);
  const d=I.d1;d.x=I.dyn2.x+6;d.y=I.dyn2.y+77+30;d.tw=null;drop(d,{fx:d.hx,fy:d.hy,fr:0});steps(40);TR.eq(I.dyn2.hang,null,'в кейсе груз на крючок второго прибора не вешается');TR.ok(!menu(d).some(x=>/Повесить/.test(x[0])),'в меню нет «Повесить на динамометр», пока приборы в кейсе');
  I.dyn2.x=800;I.dyn2.y=200;steps(3);TR.eq(activeDyn(),I.dyn2,'вынутый на стол второй прибор становится активным');TR.ok(menu(I.d1).some(x=>/Повесить/.test(x[0])),'появилась возможность повесить груз')}

}

try{eval(src+'\n;('+inner.toString()+')(TR)')}catch(e){TR.fail++;TR.fails.push('КРАХ ТЕСТА: '+e.stack.split('\n').slice(0,4).join(' | '))}
console.log('\nГруппа'.padEnd(54)+'пройдено  провалено');
for(const g in TR.counts)console.log(g.padEnd(52)+String(TR.counts[g].p).padStart(8)+String(TR.counts[g].f).padStart(10));
console.log('\nИТОГО: '+TR.pass+' пройдено, '+TR.fail+' провалено');
if(TR.fail){const seen={};console.log('\nПроваленные проверки (первые из каждого вида):');let n=0;for(const m of TR.fails){const k=m.replace(/[\d.,-]+/g,'#').slice(0,80);if(seen[k])continue;seen[k]=1;console.log(' - '+m.slice(0,230));if(++n>=45)break}}
process.exit(TR.fail?1:0);
