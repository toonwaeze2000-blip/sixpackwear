const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_'+'JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const GUEST_KEY='sixpack_guest_cart';
const getGuest=()=>{try{return JSON.parse(localStorage.getItem(GUEST_KEY)||'[]')}catch{return[]}};
const setGuest=v=>localStorage.setItem(GUEST_KEY,JSON.stringify(v));
let db=null;
let supabaseLoad=null;
function getDb(){try{if(!db&&window.supabase?.createClient)db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return db}catch{return null}}
function loadSupabase(){
  if(window.supabase?.createClient)return Promise.resolve(window.supabase);
  if(supabaseLoad)return supabaseLoad;
  supabaseLoad=new Promise(resolve=>{
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.async=true;
    s.onload=()=>resolve(window.supabase||null);
    s.onerror=()=>resolve(null);
    document.head.appendChild(s);
    setTimeout(()=>resolve(window.supabase||null),3500);
  });
  return supabaseLoad;
}
async function currentUser(){
  const local=getGuest();
  if(local.length)return null;
  const c=getDb()||((await loadSupabase())&&getDb());
  if(!c)return null;
  try{const {data}=await c.auth.getUser();return data?.user||null}catch{return null}
}
async function liveSize(productId,size){
  if(!size)return 0;
  const c=getDb()||((await loadSupabase())&&getDb());
  if(!c)return 0;
  try{const {data}=await c.from('product_inventory').select('stock,reserved').eq('product_id',productId).eq('size',size).maybeSingle();return data?Math.max(0,Number(data.stock||0)-Number(data.reserved||0)):0}catch{return 0}
}
async function getCart(){
  const guest=getGuest();
  if(guest.length)return guest;
  const c=getDb()||((await loadSupabase())&&getDb());
  if(!c)return [];
  try{
    const {data:userData}=await c.auth.getUser();
    const u=userData?.user;
    if(!u)return [];
    const {data,error}=await c.from('cart_items').select('product_id,quantity,size,products(id,name,brand,category,price,image,stock,sizes,size_stock)').eq('user_id',u.id);
    if(error)return [];
    return (data||[]).map(x=>({...x,product:x.products}));
  }catch{return []}
}
async function addToCart(product,size='',quantity=1){
  if(!product?.id)throw new Error('PRODUCT_REQUIRED');
  const hasSizes=Array.isArray(product.sizes)&&product.sizes.length>0;
  if(hasSizes&&!size)throw new Error('SIZE_REQUIRED');
  let max=size?await liveSize(product.id,size):Number(product.stock||0);
  if(size&&max<=0)throw new Error('SIZE_OUT_OF_STOCK');
  if(max<=0)throw new Error('OUT_OF_STOCK');
  const c=getDb()||((await loadSupabase())&&getDb());
  const u=c?await currentUser():null;
  if(!u){
    const cart=getGuest(),i=cart.findIndex(x=>x.product_id===product.id&&x.size===size);
    if(i>=0)cart[i].quantity=Math.min(Number(cart[i].quantity||0)+quantity,max);else cart.push({product_id:product.id,quantity:Math.min(quantity,max),size,product});
    setGuest(cart);return {guest:true};
  }
  const existing=await c.from('cart_items').select('quantity').eq('user_id',u.id).eq('product_id',product.id).eq('size',size).maybeSingle();
  const next=Math.min(Number(existing.data?.quantity||0)+quantity,max);
  const {error}=await c.from('cart_items').upsert({user_id:u.id,product_id:product.id,quantity:next,size},{onConflict:'user_id,product_id,size'});
  if(error)throw error;return {guest:false};
}
async function removeFromCart(productId,size=''){
  const guest=getGuest();
  if(guest.length){setGuest(guest.filter(x=>!(x.product_id===productId&&x.size===size)));return}
  const c=getDb()||((await loadSupabase())&&getDb());if(!c)return;
  const u=await currentUser();if(!u)return;
  const {error}=await c.from('cart_items').delete().eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error;
}
async function changeQty(productId,size,quantity){
  if(quantity<=0)return removeFromCart(productId,size);
  const guest=getGuest();
  if(guest.length){const c=guest,i=c.findIndex(x=>x.product_id===productId&&x.size===size);if(i>=0){c[i].quantity=quantity;setGuest(c)}return;}
  const max=await liveSize(productId,size);if(max<=0)return removeFromCart(productId,size);const next=Math.min(quantity,max);
  const c=getDb()||((await loadSupabase())&&getDb());if(!c)return;const u=await currentUser();if(!u)return;
  const {error}=await c.from('cart_items').update({quantity:next}).eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error;
}
async function mergeGuestIntoUser(){
  const guest=getGuest();if(!guest.length)return;
  const c=getDb()||((await loadSupabase())&&getDb());if(!c)return;const u=await currentUser();if(!u)return;
  for(const item of guest){try{const max=await liveSize(item.product_id,item.size);if(max>0)await c.from('cart_items').upsert({user_id:u.id,product_id:item.product_id,quantity:Math.min(Number(item.quantity||1),max),size:item.size},{onConflict:'user_id,product_id,size'})}catch{}}
  setGuest([]);
}
window.sixpackCart={getCart,addToCart,removeFromCart,changeQty,mergeGuestIntoUser,loadSupabase};