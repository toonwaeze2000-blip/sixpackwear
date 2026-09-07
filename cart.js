const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const db=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
const GUEST_KEY='sixpack_guest_cart';
const SAVED_KEY='6pw-saved';
const getGuest=()=>{try{return JSON.parse(localStorage.getItem(GUEST_KEY)||'[]')}catch{return[]}};
const setGuest=v=>localStorage.setItem(GUEST_KEY,JSON.stringify(v));
function syncSavedKeys(){try{const a=JSON.parse(localStorage.getItem(SAVED_KEY)||'[]');const b=JSON.parse(localStorage.getItem('sixpack_saved')||'[]');const merged=[...new Set([...a,...b].map(String))];localStorage.setItem(SAVED_KEY,JSON.stringify(merged));localStorage.setItem('sixpack_saved',JSON.stringify(merged));return merged}catch{return[]}}
async function currentUser(){if(!db)return null;try{const {data}=await db.auth.getUser();return data?.user||null}catch{return null}}
async function inventoryFor(productId){if(!db||!productId)return[];const {data}=await db.from('product_inventory').select('size,stock,reserved').eq('product_id',productId);return data||[]}
async function available(productId,size=''){const rows=await inventoryFor(productId);if(!rows.length)return null;const target=size||rows[0]?.size||'';const row=rows.find(x=>String(x.size)===String(target));return row?Math.max(0,Number(row.stock||0)-Number(row.reserved||0)):0}
async function getCart(){const u=await currentUser();if(!u)return getGuest();const {data}=await db.from('cart_items').select('product_id,quantity,size,products(id,name,brand,category,price,image,stock,sizes)').eq('user_id',u.id);return (data||[]).map(x=>({...x,product:x.products}))}
async function addToCart(product,size='',quantity=1){
 const chosen=size||((Array.isArray(product?.sizes)&&product.sizes.length===1)?product.sizes[0]:'');
 if(Array.isArray(product?.sizes)&&product.sizes.length>1&&!chosen)throw new Error('SIZE_REQUIRED');
 const avail=await available(product.id,chosen);
 if(avail!==null&&avail<quantity)throw new Error('OUT_OF_STOCK');
 if(avail===0)throw new Error('OUT_OF_STOCK');
 const u=await currentUser();
 if(!u){const cart=getGuest();const i=cart.findIndex(x=>x.product_id===product.id&&x.size===chosen);if(i>=0){if(avail!==null&&cart[i].quantity+quantity>avail)throw new Error('OUT_OF_STOCK');cart[i].quantity+=quantity}else cart.push({product_id:product.id,quantity,size:chosen,product});setGuest(cart);return {guest:true}}
 const existing=await db.from('cart_items').select('quantity').eq('user_id',u.id).eq('product_id',product.id).eq('size',chosen).maybeSingle();
 const next=Number(existing.data?.quantity||0)+quantity;
 if(avail!==null&&next>avail)throw new Error('OUT_OF_STOCK');
 const {error}=await db.from('cart_items').upsert({user_id:u.id,product_id:product.id,quantity:next,size:chosen},{onConflict:'user_id,product_id,size'});if(error)throw error;return {guest:false}
}
async function removeFromCart(productId,size=''){const u=await currentUser();if(!u){setGuest(getGuest().filter(x=>!(x.product_id===productId&&x.size===size)));return}const {error}=await db.from('cart_items').delete().eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function changeQty(productId,size,quantity){if(quantity<=0)return removeFromCart(productId,size);const avail=await available(productId,size);if(avail!==null&&quantity>avail)throw new Error('OUT_OF_STOCK');const u=await currentUser();if(!u){const c=getGuest(),i=c.findIndex(x=>x.product_id===productId&&x.size===size);if(i>=0){c[i].quantity=quantity;setGuest(c)}return}const {error}=await db.from('cart_items').update({quantity}).eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function mergeGuestIntoUser(){const u=await currentUser();if(!u)return;const guest=getGuest();for(const item of guest){try{await addToCart(item.product,item.size,item.quantity)}catch{}}setGuest([])}
window.sixpackCart={getCart,addToCart,removeFromCart,changeQty,mergeGuestIntoUser,inventoryFor,available,syncSavedKeys};

if(location.pathname.endsWith('/product.html')){
 document.addEventListener('DOMContentLoaded',()=>setTimeout(async()=>{
  const id=new URLSearchParams(location.search).get('id');if(!id||!db)return;
  const {data:p}=await db.from('products').select('id,name,stock,sizes').eq('id',id).single();if(!p)return;
  const rows=await inventoryFor(id);const map=new Map(rows.map(r=>[String(r.size),Math.max(0,Number(r.stock||0)-Number(r.reserved||0))]));
  const buttons=[...document.querySelectorAll('[data-size]')];
  buttons.forEach(b=>{const n=map.has(String(b.dataset.size))?map.get(String(b.dataset.size)):Number(p.stock||0);b.disabled=n<=0;b.title=n>0?`${n} available`:'Out of stock';if(n<=0){b.style.opacity='.35';b.style.textDecoration='line-through';b.style.cursor='not-allowed'}});
  const first=buttons.find(b=>!b.disabled);buttons.forEach(b=>b.classList.remove('active'));if(first)first.classList.add('active');
  const add=document.getElementById('add');
  const refresh=()=>{const b=document.querySelector('[data-size].active');const n=b?(map.has(String(b.dataset.size))?map.get(String(b.dataset.size)):Number(p.stock||0)):Number(p.stock||0);if(add){add.disabled=n<=0;add.textContent=n>0?'Add to bag':'Out of stock'}const s=document.querySelector('.status');if(s)s.textContent=n>0?`${n} available in selected size`:'Currently unavailable in selected size'};
  buttons.forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,0)));refresh();
  let saved=syncSavedKeys();const save=document.getElementById('save');if(save){const paint=()=>{saved=syncSavedKeys();save.textContent=saved.includes(String(id))?'♥ Saved':'♡ Save item'};save.onclick=()=>{saved=syncSavedKeys();const key=String(id);saved=saved.includes(key)?saved.filter(x=>x!==key):[...saved,key];localStorage.setItem(SAVED_KEY,JSON.stringify(saved));localStorage.setItem('sixpack_saved',JSON.stringify(saved));paint()};paint()}
 },350));
}