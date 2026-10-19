const months=['Januar','Februar','Marec','April','Maj','Junij','Julij','Avgust','September','Oktober','November','December'];
const plants=[
{id:'solata',name:'Solata',latin:'Lactuca sativa',icon:'🥬',color:'#eaf0df',out:[3,4,5,6,7,8,9],inside:[2,3,4],harvest:[5,6,7,8,9,10],depth:'0,5–1 cm',days:'6–10 tednov'},
{id:'korenje',name:'Korenje',latin:'Daucus carota',icon:'🥕',color:'#f5eadb',out:[3,4,5,6,7],inside:[],harvest:[6,7,8,9,10,11],depth:'1–2 cm',days:'12–16 tednov'},
{id:'redkvica',name:'Redkvica',latin:'Raphanus sativus',icon:'🌱',color:'#f0e6e1',out:[3,4,5,8,9,10],inside:[],harvest:[4,5,6,9,10,11],depth:'1–2 cm',days:'4–6 tednov'},
{id:'spinaca',name:'Špinača',latin:'Spinacia oleracea',icon:'🥬',color:'#e4eada',out:[3,4,8,9,10],inside:[],harvest:[4,5,6,9,10,11],depth:'2–3 cm',days:'6–8 tednov'},
{id:'paradiznik',name:'Paradižnik',latin:'Solanum lycopersicum',icon:'🍅',color:'#f3e6df',out:[5,6],inside:[2,3,4],harvest:[7,8,9],depth:'0,5–1 cm',days:'16–20 tednov'},
{id:'paprika',name:'Paprika',latin:'Capsicum annuum',icon:'🫑',color:'#e9eddb',out:[5,6],inside:[1,2,3],harvest:[7,8,9,10],depth:'0,5–1 cm',days:'18–22 tednov'},
{id:'grah',name:'Grah',latin:'Pisum sativum',icon:'🫛',color:'#e7ecda',out:[2,3,4],inside:[],harvest:[5,6,7],depth:'3–5 cm',days:'10–14 tednov'},
{id:'cesen',name:'Česen',latin:'Allium sativum',icon:'🧄',color:'#efeadd',out:[2,3,10,11],inside:[],harvest:[6,7],depth:'5–7 cm',days:'8–9 mesecev'},
{id:'motovilec',name:'Motovilec',latin:'Valerianella locusta',icon:'🌿',color:'#e6eddc',out:[8,9,10],inside:[],harvest:[1,2,3,10,11,12],depth:'0,5–1 cm',days:'8–12 tednov'},
{id:'fizol',name:'Fižol',latin:'Phaseolus vulgaris',icon:'🫘',color:'#efe5dc',out:[5,6,7],inside:[],harvest:[7,8,9],depth:'3–5 cm',days:'8–12 tednov'},
{id:'bucka',name:'Bučka',latin:'Cucurbita pepo',icon:'🥒',color:'#e6ebdb',out:[5,6],inside:[4],harvest:[6,7,8,9],depth:'2–3 cm',days:'8–10 tednov'},
{id:'por',name:'Por',latin:'Allium porrum',icon:'🌿',color:'#e8ecdf',out:[4,5,6],inside:[1,2,3],harvest:[9,10,11,12],depth:'1 cm',days:'20–24 tednov'}
];
let month=new Date().getMonth()+1,year=new Date().getFullYear(),filter='all',query='',saved;
try{saved=JSON.parse(localStorage.getItem('setveni-vrt')||'[]');if(!Array.isArray(saved))saved=[]}catch{saved=[]}
const $=s=>document.querySelector(s);
function toggle(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];try{localStorage.setItem('setveni-vrt',JSON.stringify(saved))}catch{}render();$('#toast').textContent=saved.includes(id)?'Rastlina je dodana v vaš vrt.':'Rastlina je odstranjena iz vrta.';$('#toast').style.opacity=1;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').style.opacity=0,2200)}
function render(){
$('#year').textContent=year;
$('#months').innerHTML=months.map((m,i)=>`<button class="${month===i+1?'selected':''}" aria-pressed="${month===i+1}" data-month="${i+1}">${m}</button>`).join('');
$('#month-title').textContent=`${months[month-1]} na vrtu`;
$('#month-description').textContent=month<3||month===12?'Čas za načrtovanje, pripravo in prve setve na toplem.':month<6?'Zemlja se prebuja. Čas je, da zavihamo rokave.':month<9?'Vrt je poln življenja. Poskrbite za vodo in sproti pobirajte pridelek.':'Jesenske setve, polne košare in priprava vrta na počitek.';
$('#season').textContent=month<3||month===12?'❄ Zimski čas':month<6?'☀ Pomladni čas':month<9?'☀ Poletni čas':'❋ Jesenski čas';
const list=plants.filter(p=>(filter==='all'?[...p.out,...p.inside,...p.harvest].includes(month):p[filter==='out'?'out':filter==='in'?'inside':'harvest'].includes(month))&&p.name.toLocaleLowerCase('sl').includes(query));
$('#results-count').textContent=`${list.length} rastlin za izbrani mesec`;
$('#cards').innerHTML=list.map(p=>`<article class="card"><div class="card-art" style="--tint:${p.color}"><span class="vegetable" role="img" aria-label="${p.name}">${p.icon}</span><button class="add ${saved.includes(p.id)?'chosen':''}" data-save="${p.id}" aria-label="${saved.includes(p.id)?'Odstrani':'Dodaj'} ${p.name}" aria-pressed="${saved.includes(p.id)}">${saved.includes(p.id)?'✓':'+'}</button></div><div class="card-body"><h4>${p.name}</h4><span class="latin">${p.latin}</span><div class="tags">${p.out.includes(month)?`<span class="tag">${['cesen'].includes(p.id)||(['paradiznik','paprika','bucka','por'].includes(p.id))?'Sajenje na prosto':'Setev na prosto'}</span>`:''}${p.inside.includes(month)?'<span class="tag">Setev na toplem</span>':''}${p.harvest.includes(month)?'<span class="tag harvest">Pobiranje</span>':''}</div><div class="card-bottom"><span>↧ ${p.depth}</span><span>◷ ${p.days}</span></div></div></article>`).join('')||'<div class="empty">Za ta izbor ni rastlin. Poskusite drug mesec ali filter.</div>';
$('#count').textContent=saved.length;
$('#saved').innerHTML=plants.filter(p=>saved.includes(p.id)).map(p=>`<button data-save="${p.id}" aria-label="Odstrani ${p.name}">${p.icon} ${p.name} <span aria-hidden="true">×</span></button>`).join('')||'<p>Vaš vrt še čaka na prvo rastlino.</p>';
}
$('#months').addEventListener('click',e=>{if(e.target.dataset.month){month=Number(e.target.dataset.month);render()}});
$('#filters').addEventListener('click',e=>{if(e.target.dataset.filter){filter=e.target.dataset.filter;document.querySelectorAll('#filters button').forEach(b=>{b.classList.toggle('selected',b===e.target);b.setAttribute('aria-pressed',b===e.target)});render()}});
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('sl');render()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-save]');if(b)toggle(b.dataset.save)});
$('#prev').onclick=()=>{year--;render()};$('#next').onclick=()=>{year++;render()};render();
