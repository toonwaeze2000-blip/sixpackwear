const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const fallbackImage='/assets/d2060b27-276c-44c6-89d1-860f5908fb0b.png';
const qs=new URLSearchParams(location.search);
const view=qs.get('view')||'all';
const brand=qs.get('brand');
const category=qs.get('category');
const search=(qs.get('q')||'').trim();
const root=document.getElementById('catalogApp');
const esc=(s)=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
function title(){
 if(brand) return brand.toUpperCase();
 if(category) return category.toUpperCase();
 return ({brands:'BRANDS',categories:'CATEGORIES',looks:'LOOKS',newdrops:'NEW DROPS',search:'SEARCH',all:'SHOP'}[view]||'SHOP');
}
function buildQuery(){
 let q=db.from('products').select('id,name,brand,category,style,price,stock,sizes,color,image,created_at').order('created_at',{ascending:false});
 if(brand) q=q.ilike('brand',brand);
 if(category) q=q.ilike('category',category);
 if(search) q=q.or(`name.ilike.%${search}%,brand.ilike.%${search}%,category.ilike.%${search}%`);
 if(view==='newdrops') q=q.limit(12);
 return q;
}
function card(p){
 const img=p.image||fallbackImage;
 return `<a class="pcard" href="/product.html?id=${encodeURIComponent(p.id)}"><div class="pimage"><img src="${esc(img)}" alt="${esc(p.name)}"></div><div class="pmeta"><div class="pbrand">${esc(p.brand||'6PACKWEAR')}</div><h3>${esc(p.name)}</h3><div class="psub">${esc(p.category||'')}${p.color?' · '+esc(p.color):''}</div><div class="prow"><strong>$${Number(p.price||0).toFixed(2)}</strong><span>${p.stock>0?'IN STOCK':'OUT OF STOCK'}</span></div></div></a>`;
}
async function init(){
 root.innerHTML=`<div class="catalogHead"><div><div class="kicker">6PACKWEAR CATALOG</div><h1>${esc(title())}</h1></div><div class="catalogTools"><input id="catalogSearch" value="${esc(search)}" placeholder="Search products, brands, categories"><button id="searchBtn">SEARCH</button></div></div><div id="catalogStatus" class="catalogStatus">Loading catalog…</div><div id="grid" class="productGrid"></div>`;
 const input=document.getElementById('catalogSearch');
 document.getElementById('searchBtn').onclick=()=>{const q=input.value.trim();location.href=q?`/catalog.html?view=search&q=${encodeURIComponent(q)}`:'/catalog.html?view=all'};
 input.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('searchBtn').click()});
 const {data,error}=await buildQuery();
 const status=document.getElementById('catalogStatus');
 const grid=document.getElementById('grid');
 if(error){status.textContent='Catalog is temporarily unavailable.';return;}
 if(!data?.length){status.textContent='No products yet. Add products in the 6PACKWEAR catalog and they will appear here automatically.';return;}
 status.textContent=`${data.length} PRODUCTS`;
 grid.innerHTML=data.map(card).join('');
}
init();
