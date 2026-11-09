const $=s=>document.querySelector(s);
/* ---------- patient ---------- */
const PAGES={needs:'الاحتياجات',med:'الدواء',kb:'الكيبورد',room:'غرفتي',fun:'الترفيه'};
const NEEDS=[['💧','ماء'],['🍽️','أكل'],['🚻','حمام'],['🤕','ألم'],['🥶','برد'],['🥵','حر'],['👨‍👩‍👧','أسرتي'],['😢','حزين'],['🙏','شكراً']];
const ROOM=[['💡','الإضاءة'],['🌀','المروحة'],['📺','التلفزيون'],['❄️','التكييف']];
const FUN=[['▶️','يوتيوب','يحتاج إنترنت'],['📖','قرآن','قراء مرخصون'],['🎬','فيلم','ملفات محلية'],['🎵','موسيقى','ملفات محلية']];
const GROUPS=['ا ب ت ث ج ح','خ د ذ ر ز','س ش ص ض ط','ظ ع غ ف ق','ك ل م ن ه','و ي ء ة'].map(g=>g.split(' '));
let page='needs',stage=null,text='',idx=0,items=[];
const T=(ic,l,s,cls='')=>`<button class="tile ${cls}" data-sel data-l="${l}"><span class="ic">${ic}</span>${l}${s?`<small>${s}</small>`:''}</button>`;
function nav(){ $('#pages').innerHTML=Object.entries(PAGES).map(([k,v])=>`<button data-k="${k}" ${k==page?'aria-current="true"':''}>${v}</button>`).join('') }
function render(){
  nav(); let h='';
  if(page=='needs') h=`<div class="grid">${NEEDS.map(n=>T(n[0],n[1])).join('')}</div>`;
  if(page=='med') h=`<div class="med"><h2>موعد الدواء</h2><p>حان وقت الدواء الآن</p><div class="grid">${T('✅','أخدت الدواء')}${T('⏰','ذكرني بعد 10 دقائق')}${T('🆘','محتاج مساعدة')}</div></div><div class="hint">بطاقة التفاصيل (الاسم والجرعة) تظهر على موبايل المرافق فقط.</div>`;
  if(page=='kb'){
    const cells=stage===null?GROUPS.map((g,i)=>T('',g.join(' '),'مجموعة','grp'+i)):GROUPS[stage].map(c=>T('',c)).concat(T('↩','رجوع'));
    h=`<div class="say ${text?'':'empty'}">${text||'اختر مجموعة حروف ثم الحرف'}</div><div class="grid" style="margin-top:14px">${cells.join('')}</div><div class="grid" style="margin-top:14px">${T('␣','مسافة')}${T('⌫','حذف')}${T('🔊','نطق')}</div>`;
  }
  if(page=='room') h=`<div class="grid">${ROOM.map(r=>T(r[0],r[1],'مطفأ')).join('')}</div>`;
  if(page=='fun') h=`<div class="grid" style="grid-template-columns:repeat(2,1fr)">${FUN.map(f=>T(...f)).join('')}</div>`;
  if(page!='kb') h+=`<div class="say empty" id="say">اختر عنصرًا لسماعه</div>`;
  $('#view').innerHTML=h;
  items=[...document.querySelectorAll('#patient [data-sel]')]; idx=Math.min(idx,items.length-1); mark();
}
function mark(){items.forEach((e,i)=>{e.classList.toggle('on',i==idx);e.style.removeProperty('--p')})}
function act(el){
  const l=el.dataset.l;
  if(el.id=='sos'){say('🚨 تم إرسال نداء الطوارئ للمرافق');return}
  if(page=='kb'){
    if(stage===null){stage=[...el.parentNode.children].indexOf(el);idx=0}
    else if(l=='رجوع'){stage=null;idx=0}
    else if(l=='مسافة')text+=' ';else if(l=='حذف')text=text.slice(0,-1);
    else if(l=='نطق'){say('ينطق: '+text);return}
    else{text+=l;stage=null;idx=0}
    render();return
  }
  if(page=='room'){el.classList.toggle('state-on');el.querySelector('small').textContent=el.classList.contains('state-on')?'يعمل':'مطفأ';say(l);return}
  say(l)
}
function say(t){const s=$('#say');if(s){s.textContent=t;s.classList.remove('empty')}}
$('#pages').onclick=e=>{const k=e.target.dataset.k;if(k){page=k;stage=null;idx=0;render()}};
$('#view').onclick=e=>{const b=e.target.closest('[data-sel]');if(b){idx=items.indexOf(b);act(b)}};
$('#sos').onclick=()=>{idx=items.length-1;act($('#sos'))};
/* Mock input: arrows = wink, hold space = long blink */
let hold=null,t0=0;
document.addEventListener('keydown',e=>{
  if($('#patient').classList.contains('hide'))return;
  if(e.key=='ArrowRight'||e.key=='ArrowDown'){idx=(idx+1)%items.length;mark();e.preventDefault()}
  if(e.key=='ArrowLeft'||e.key=='ArrowUp'){idx=(idx-1+items.length)%items.length;mark();e.preventDefault()}
  if((e.key==' '||e.key=='Enter')&&!hold){e.preventDefault();t0=performance.now();const el=items[idx];
    hold=setInterval(()=>{const p=Math.min(100,(performance.now()-t0)/12);el.style.setProperty('--p',p);if(p>=100){clearInterval(hold);hold='done';act(el)}},30)}
});
document.addEventListener('keyup',e=>{if(e.key==' '||e.key=='Enter'){if(hold&&hold!=='done')clearInterval(hold);hold=null;items[idx]&&items[idx].style.removeProperty('--p')}});
/* ---------- mode switch ---------- */
function mode(d){$('#patient').classList.toggle('hide',d);$('#dash').classList.toggle('hide',!d);$('#mP').setAttribute('aria-pressed',!d);$('#mD').setAttribute('aria-pressed',d)}
$('#mP').onclick=()=>mode(false);$('#mD').onclick=()=>mode(true);
/* ---------- dashboard ---------- */
const NS='http://www.w3.org/2000/svg';
const days=['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'],sleep=[6.5,7.2,5.1,8,6.8,4.9,7.3];
(function(){let s='';sleep.forEach((v,i)=>{const x=20+i*76,hs=v/24*150,ha=150-hs;
 s+=`<rect x="${x}" y="10" width="46" height="${ha}" rx="4" fill="var(--hl)"/><rect x="${x}" y="${10+ha}" width="46" height="${hs}" rx="4" fill="var(--pri)"/>
 <text x="${x+23}" y="${10+ha+hs/2+4}" text-anchor="middle" style="fill:#fff;font-size:12px;font-weight:700">${v}</text>
 <text x="${x+23}" y="185" text-anchor="middle">${days[i]}</text><text x="${x+23}" y="202" text-anchor="middle">صحيان ${(24-v).toFixed(1)}</text>`});
 $('#wk').innerHTML=s})();
const hrD=Array.from({length:60},(_,i)=>74+Math.sin(i/6)*4+Math.random()*3);
let fever=false;
function hrDraw(){
 const x=i=>10+i*(380/59),y=v=>200-(v-40)/100*190;
 const pts=hrD.map((v,i)=>x(i)+','+y(v)).join(' ');
 $('#hr').innerHTML=`<rect x="10" y="${y(110)}" width="380" height="${y(50)-y(110)}" fill="var(--pri2)"/><text x="14" y="${y(110)-4}">110</text><text x="14" y="${y(50)+12}">50</text><polyline points="${pts}" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linejoin="round"/>`;
 const v=Math.round(hrD[59]);$('#hrv').textContent=v;const bad=v<50||v>110;const c=$('#hrc');c.textContent=bad?'خارج النطاق':'طبيعي';c.classList.toggle('bad',bad)}
const tD=[36.6,36.5,36.5,36.4,36.5,36.7,36.8,36.8,36.9,36.8,36.7,36.8];
function tDraw(){
 const x=i=>20+i*(440/11),y=v=>160-(v-35.5)/3*140;
 $('#tp').innerHTML=`<rect x="20" y="${y(37.5)}" width="440" height="${y(36.1)-y(37.5)}" fill="var(--pri2)"/><text x="24" y="${y(37.5)-4}">37.5</text><text x="24" y="${y(36.1)+12}">36.1</text><polyline points="${tD.map((v,i)=>x(i)+','+y(v)).join(' ')}" fill="none" stroke="var(--pri)" stroke-width="2.5"/>`;
 const v=tD[tD.length-1];$('#tv').textContent=v.toFixed(1);const bad=v>37.5||v<36.1;const c=$('#tc');c.textContent=v>37.5?'حرارة مرتفعة':v<36.1?'حرارة منخفضة':'طبيعي';c.classList.toggle('bad',bad)}
function log(t,bad){const li=document.createElement('li');const n=new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});li.innerHTML=`<span${bad?' style="color:var(--red);font-weight:600"':''}>${t}</span><span style="color:var(--mute)">${n}</span>`;$('#log').prepend(li)}
['تم أخذ الدواء بتأكيد المرافق','استيقظ المريض 6:30 ص','نام المريض 11:10 م'].forEach(t=>log(t));
$('#fever').onclick=()=>{fever=true;tD.push(38.2);tD.shift();tDraw();log('ارتفاع الحرارة 38.2°C — تنبيه للمرافق',true)};
$('#reset').onclick=()=>{fever=false;tD.push(36.8);tD.shift();tDraw()};
setInterval(()=>{hrD.push(fever?100+Math.random()*14:Math.max(62,Math.min(88,hrD[59]+(Math.random()-.5)*5)));hrD.shift();hrDraw()},1000);
hrDraw();tDraw();render();
