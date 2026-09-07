const GUEST_KEY='sixpack_guest_cart';
const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_'+'JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';

function readCart(){try{const v=JSON.parse(localStorage.getItem(GUEST_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function writeCart(v){localStorage.setItem(GUEST_KEY,JSON.stringify(v));window.dispatchEvent(new CustomEvent('sixpack:cart',{detail:v}))}
function key(productId,size){return String(productId)+'::'+String(size||'')}
function maxFor(product,size){if(size&&product?.size_stock&&product.size_stock[size]!=null)return Math.max(0,Number(product.size_stock[size]||0));return Math.max(0,Number(product?.stock||0))}
function loadSupabase(){if(window.supabase?.createClient)return Promise.resolve(window.supabase);return new Promise(resolve=>{let done=false;const finish=v=>{if(done)return;done=true;resolve(v||null)};const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.async=true;s.onload=()=>finish(window.supabase);s.onerror=()=>finish(null);document.head.appendChild(s);setTimeout(()=>finish(window.supabase),3500)})}
function getDb(){try{return window.supabase?.createClient?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null}catch{return null}}

function getCart(){return readCart()}

async function addToCart(product,size='',quantity=1){
  if(!product?.id)throw new Error('PRODUCT_REQUIRED');
  const hasSizes=Array.isArray(product.sizes)&&product.sizes.length>0;
  if(hasSizes&&!size)throw new Error('SIZE_REQUIRED');
  const max=maxFor(product,size);
  if(max<=0)throw new Error(size?'SIZE_OUT_OF_STOCK':'OUT_OF_STOCK');
  const cart=readCart();
  const k=key(product.id,size);
  const i=cart.findIndex(x=>key(x.product_id,x.size)===k);
  if(i>=0){cart[i].quantity=Math.min(Number(cart[i].quantity||0)+Number(quantity||1),max);cart[i].product={...cart[i].product,...product}}
  else cart.push({product_id:String(product.id),quantity:Math.min(Number(quantity||1),max),size:String(size||''),product:{...product}});
  writeCart(cart);
  return {guest:true,cart};
}

async function removeFromCart(productId,size=''){writeCart(readCart().filter(x=>key(x.product_id,x.size)!==key(productId,size)));return true}

async function changeQty(productId,size,quantity){
  const cart=readCart();const i=cart.findIndex(x=>key(x.product_id,x.size)===key(productId,size));
  if(i<0)return cart;
  if(Number(quantity)<=0){cart.splice(i,1);writeCart(cart);return cart}
  const max=maxFor(cart[i].product,size);cart[i].quantity=Math.min(Number(quantity),max>0?max:Number(quantity));writeCart(cart);return cart;
}

async function mergeGuestIntoUser(){return readCart()}

window.sixpackCart={getCart,addToCart,removeFromCart,changeQty,mergeGuestIntoUser,loadSupabase};
