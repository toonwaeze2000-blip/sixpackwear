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
let products=[];
let saved=new Set(JSON.parse(localStorage.getItem('6pw-saved')||'[]'));
let bag=Number(localStorage.getItem('6pw-bag-count')||0);
let appliedFilters=[];
const root=document.getElementById('grid'),title=document.getElementById('title'),count=document.getElementById('count'),searchInput=document.getElementById('search');
const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
const money=p=>`$${Number(p||0).toFixed(2)}`;
function matches(p){
  const hay=`${p.category||''} ${p.style||''} ${p.brand||''}`.toLowerCase();
  if(view==='brands'&&requestedBrand)return String(p.brand||'').toLowerCase()===requestedBrand.toLowerCase();
  if(view==='newdrops')return true;
  if(view==='looks')return true;
  if(view==='search')return true;
  if(active==='New In')return true;
  if(active==='Clothing')return /t-shirts|hoodies|shirts|outerwear|pants|knitwear|swimwear/i.test(p.category||'');
  if(active==='Shoes')return /shoe|sneaker/i.test(p.category||'');
  if(active==='Accessories')return p.category==='Accessories';
  if(active==='Sports')return /sport|running|training/i.test(hay);
  if(active==='Grooming')return p.category==='Grooming';
  if(active==='Sale')return Number(p.price||0)<=100;
  if(active==='Streetwear')return /streetwear/i.test(hay);
  if(active==='Luxury')return /luxury|premium/i.test(hay);
  if(active==='Looks')return true;
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
  const badge=view==='newdrops'?'NEW DROP':view==='looks'?'LOOK':active==='New In'?'NEW IN':Number(p.price)<=100&&active==='Sale'?'SALE':p.category||'6PACK';
  return `<article class="card"><a class="productLink" href="/product.html?id=${encodeURIComponent(p.id)}"><div class="image"><button class="heart" type="button" data-save="${i}" aria-label="Save ${esc(p.name)}">${saved.has(p.id)?'♥':'♡'}</button><img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy"><span class="badge">${esc(badge)}</span></div><div class="meta"><div class="brand">${esc(p.brand||'6PACKWEAR')}</div><div class="name">${esc(p.name||'Untitled product')}</div><div class="price">${money(p.price)}</div><div class="sub">${esc(p.style||p.color||p.category||'Menswear')}</div></div></a><button class="quick" type="button" data-add="${i}">Add to bag</button></article>`;
}
function lookCard(name,tag,image,filters){
  return `<a class="lookCard" href="/catalog.html?view=search&look=${encodeURIComponent(name)}"><img src="${image}" alt="${esc(name)}"><div class="lookShade"></div><div class="lookCopy"><span>${esc(tag)}</span><strong>${esc(name)}</strong><em>${esc(filters)}</em></div></a>`;
}
function renderLooks(){
  root.className='lookGrid';
  root.innerHTML=[
    lookCard('City Uniform','01 · EVERYDAY','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85','Tailored layers / clean sneakers'),
    lookCard('Night Shift','02 · AFTER DARK','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85','Black denim / leather / silver'),
    lookCard('Off-Duty Form','03 · STREET','https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85','Oversized / utility / sneakers'),
    lookCard('Run Ready','04 · SPORT','https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=85','Performance / technical / monochrome'),
    lookCard('Quiet Luxury','05 · PREMIUM','https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&w=1200&q=85','Merino / tailoring / leather'),
    lookCard('Weekend Utility','06 · RELAXED','https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=85','Overshirt / cargos / everyday')
  ].join('');
}
function render(){
  if(view==='looks'){title.textContent='Looks';count.textContent='6 edits';renderLooks();return;}
  root.className='grid';
  let arr=products.filter(matches);
  const q=searchInput.value.trim().toLowerCase();
  if(q)arr=arr.filter(p=>`${p.name||''} ${p.brand||''} ${p.category||''} ${p.style||''}`.toLowerCase().includes(q));
  if(appliedFilters.length)arr=arr.filter(p=>appliedFilters.some(f=>`${p.category||''} ${p.style||''} ${p.brand||''}`.toLowerCase().includes(f.toLowerCase())));
  if(view==='newdrops')arr=arr.slice(0,24);
  const s=document.getElementById('sort').value;
  if(s==='low')arr.sort((a,b)=>Number(a.price||0)-Number(b.price||0));
  if(s==='high')arr.sort((a,b)=>Number(b.price||0)-Number(a.price||0));
  title.textContent=viewTitle();
  count.textContent=`${arr.length} styles`;
  root.innerHTML=arr.length?arr.map(card).join(''):`<div style="grid-column:1/-1;padding:80px 0;color:#777;font-size:12px">No products found in this edit yet.</div>`;
  root.querySelectorAll('[data-save]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const p=arr[Number(b.dataset.save)];saved.has(p.id)?saved.delete(p.id):saved.add(p.id);localStorage.setItem('6pw-saved',JSON.stringify([...saved]));render();toast(saved.has(p.id)?'Saved':'Removed from saved')});
  root.querySelectorAll('[data-add]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();bag++;localStorage.setItem('6pw-bag-count',String(bag));document.getElementById('bagCount').textContent=bag;toast('Added to bag')});
}
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>x.classList.remove('show'),1500)}
function setActive(v){active=v;history.replaceState({},'',`/catalog.html?view=shop&category=${encodeURIComponent(v)}`);document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===v));render()}
document.querySelectorAll('[data-filter]').forEach(x=>x.onclick=e=>{e.preventDefault();setActive(x.dataset.filter);document.querySelectorAll('.mega').forEach(m=>m.classList.remove('open'))});
searchInput.oninput=render;
searchInput.onkeydown=e=>{if(e.key==='Enter'){history.replaceState({},'',`/catalog.html?view=search&q=${encodeURIComponent(searchInput.value)}`);render()}};
if(view==='search'){searchInput.value=qs.get('q')||'';searchInput.focus()}
if(requestedCategory||requestedBrand)document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===active));
document.getElementById('sort').onchange=render;
document.getElementById('filterBtn').onclick=()=>document.getElementById('drawer').style.display='block';
document.getElementById('close').onclick=()=>document.getElementById('drawer').style.display='none';
document.getElementById('apply').onclick=()=>{appliedFilters=[...document.querySelectorAll('#drawer input:checked')].map(x=>x.value);document.getElementById('drawer').style.display='none';render();toast(appliedFilters.length?`${appliedFilters.length} filter(s) applied`:'Filters cleared')};
document.getElementById('accountBtn').onclick=()=>{window.location.href='/';setTimeout(()=>document.getElementById('accountHotspot')?.click(),100)};
document.getElementById('savedBtn').onclick=()=>toast(saved.size?`${saved.size} saved item(s)`:'No saved items');
document.getElementById('bagBtn').onclick=()=>{window.location.href='/cart.html'};
document.getElementById('bagCount').textContent=bag;
document.querySelectorAll('.megaTrigger').forEach(t=>t.onclick=e=>{e.preventDefault();const m=t.closest('.mega');document.querySelectorAll('.mega').forEach(x=>{if(x!==m)x.classList.remove('open')});m.classList.toggle('open')});
document.addEventListener('click',e=>{if(!e.target.closest('.mega'))document.querySelectorAll('.mega').forEach(m=>m.classList.remove('open'))});
(async()=>{const r=await db.from('products').select('id,name,brand,category,style,price,stock,sizes,color,image,created_at').order('created_at',{ascending:false});if(r.error){count.textContent='Catalog unavailable';products=[];render();return}products=r.data||[];render()})();