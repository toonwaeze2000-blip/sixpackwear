const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_'+'JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const fallbackImage='/assets/d2060b27-276c-44c6-89d1-860f5908fb0b.png';
const qs=new URLSearchParams(location.search);
const view=qs.get('view')||'shop';
const requestedCategory=qs.get('category');
const requestedBrand=qs.get('brand');
const requestedDrop=qs.get('drop');
let active=requestedCategory||requestedBrand||'New In';
let products=[];let saved=new Set();let bag=0;
const root=document.getElementById('grid'),title=document.getElementById('title'),count=document.getElementById('count'),searchInput=document.getElementById('search');
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
function matches(p){
  if(view==='brands'&&requestedBrand)return String(p.brand||'').toLowerCase()===requestedBrand.toLowerCase();
  if(view==='newdrops')return true;
  if(view==='looks')return true;
  if(view==='search')return true;
  if(active==='New In')return true;
  if(active==='Clothing')return ['T-Shirts','Pants','Outerwear','Clothing'].includes(p.category);
  if(active==='Shoes')return /shoe|sneaker/i.test(p.category||'');
  if(active==='Sale')return Number(p.price||0)>0;
  return String(p.category||'').toLowerCase()===active.toLowerCase()||String(p.style||'').toLowerCase()===active.toLowerCase()||String(p.brand||'').toLowerCase()===active.toLowerCase();
}
function viewTitle(){
  if(view==='looks')return 'Looks';
  if(view==='categories')return requestedCategory||'Categories';
  if(view==='brands')return requestedBrand||'Brands';
  if(view==='newdrops')return requestedDrop||'New Drops';
  if(view==='search')return 'Search';
  return active;
}
function card(p,i){
  const img=p.image||fallbackImage;
  return `<article class="card"><div class="image"><button class="heart" data-save="${i}">${saved.has(p.id)?'♥':'♡'}</button><img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy"><span class="badge">${esc(view==='newdrops'?'NEW DROP':view==='looks'?'LOOK':active==='New In'?'NEW IN':p.category||'6PACK')}</span></div><div class="meta"><div class="brand">${esc(p.brand||'6PACKWEAR')}</div><div class="name">${esc(p.name||'Untitled product')}</div><div class="price">$${Number(p.price||0).toFixed(2)}</div><div class="sub">${esc(p.style||p.color||p.category||'Menswear')}</div><button class="quick" data-add="${i}">Add to bag</button></div></article>`;
}
function render(){
  let arr=products.filter(matches);
  const q=searchInput.value.trim().toLowerCase();
  if(q)arr=arr.filter(p=>`${p.name||''} ${p.brand||''} ${p.category||''} ${p.style||''}`.toLowerCase().includes(q));
  if(view==='newdrops')arr=arr.slice(0,12);
  const s=document.getElementById('sort').value;
  if(s==='low')arr.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
  if(s==='high')arr.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
  title.textContent=viewTitle();
  count.textContent=`${arr.length} styles`;
  root.innerHTML=arr.length?arr.map(card).join(''):`<div style="grid-column:1/-1;padding:80px 0;color:#777;font-size:12px">No products found in this edit yet.</div>`;
  root.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{const p=arr[Number(b.dataset.save)];saved.has(p.id)?saved.delete(p.id):saved.add(p.id);render();toast(saved.has(p.id)?'Saved':'Removed from saved')});
  root.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{bag++;document.getElementById('bagCount').textContent=bag;toast('Added to bag')});
}
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>x.classList.remove('show'),1400)}
function setActive(v){active=v;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===v));render()}
document.querySelectorAll('[data-filter]').forEach(x=>x.onclick=e=>{e.preventDefault();setActive(x.dataset.filter)});
searchInput.oninput=render;
if(view==='search')searchInput.focus();
if(requestedCategory||requestedBrand)document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===active));
document.getElementById('sort').onchange=render;
document.getElementById('filterBtn').onclick=()=>document.getElementById('drawer').style.display='block';
document.getElementById('close').onclick=()=>document.getElementById('drawer').style.display='none';
document.getElementById('apply').onclick=()=>{document.getElementById('drawer').style.display='none';toast('Filters applied')};
document.getElementById('accountBtn').onclick=()=>toast('Account active');
document.getElementById('savedBtn').onclick=()=>toast(saved.size?`${saved.size} saved item(s)`:'No saved items');
document.getElementById('bagBtn').onclick=()=>{window.location.href='/cart.html'};
(async()=>{const r=await db.from('products').select('id,name,brand,category,style,price,stock,sizes,color,image,created_at').order('created_at',{ascending:false});if(r.error){count.textContent='Catalog unavailable';render();return}products=r.data||[];render()})();
