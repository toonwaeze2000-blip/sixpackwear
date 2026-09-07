const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const db=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
const GUEST_KEY='sixpack_guest_cart';
const getGuest=()=>{try{return JSON.parse(localStorage.getItem(GUEST_KEY)||'[]')}catch{return[]}};
const setGuest=v=>localStorage.setItem(GUEST_KEY,JSON.stringify(v));
async function currentUser(){if(!db)return null;const {data}=await db.auth.getUser();return data?.user||null}
function sizeAvailable(product,size){return Number(product?.size_stock?.[size]??(product?.stock>0?1:0))>0}
async function getCart(){const u=await currentUser();if(!u)return getGuest();const {data}=await db.from('cart_items').select('product_id,quantity,size,products(id,name,brand,category,price,image,stock,sizes,size_stock)').eq('user_id',u.id);return (data||[]).map(x=>({...x,product:x.products}))}
async function addToCart(product,size='',quantity=1){
 if(Number(product?.stock||0)<=0)throw new Error('OUT_OF_STOCK');
 if(Array.isArray(product.sizes)&&product.sizes.length&&!size)throw new Error('SIZE_REQUIRED');
 if(size&&!sizeAvailable(product,size))throw new Error('SIZE_OUT_OF_STOCK');
 const u=await currentUser();
 if(!u){const cart=getGuest();const i=cart.findIndex(x=>x.product_id===product.id&&x.size===size);if(i>=0)cart[i].quantity=Math.min(cart[i].quantity+quantity,Number(product.stock));else cart.push({product_id:product.id,quantity:Math.min(quantity,Number(product.stock)),size,product});setGuest(cart);return {guest:true}}
 const existing=await db.from('cart_items').select('quantity').eq('user_id',u.id).eq('product_id',product.id).eq('size',size).maybeSingle();
 const next=Math.min(Number(existing.data?.quantity||0)+quantity,Number(product.stock));
 const {error}=await db.from('cart_items').upsert({user_id:u.id,product_id:product.id,quantity:next,size},{onConflict:'user_id,product_id,size'});if(error)throw error;return {guest:false}
}
async function removeFromCart(productId,size=''){const u=await currentUser();if(!u){setGuest(getGuest().filter(x=>!(x.product_id===productId&&x.size===size)));return}const {error}=await db.from('cart_items').delete().eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function changeQty(productId,size,quantity){if(quantity<=0)return removeFromCart(productId,size);const u=await currentUser();if(!u){const c=getGuest(),i=c.findIndex(x=>x.product_id===productId&&x.size===size);if(i>=0){c[i].quantity=quantity;setGuest(c)}return}const {error}=await db.from('cart_items').update({quantity}).eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function mergeGuestIntoUser(){const u=await currentUser();if(!u)return;const guest=getGuest();for(const item of guest){await db.from('cart_items').upsert({user_id:u.id,product_id:item.product_id,quantity:item.quantity,size:item.size},{onConflict:'user_id,product_id,size'})}setGuest([])}
window.sixpackCart={getCart,addToCart,removeFromCart,changeQty,mergeGuestIntoUser};