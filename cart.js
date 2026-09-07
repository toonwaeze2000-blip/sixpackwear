const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const db=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
const GUEST_KEY='sixpack_guest_cart';
const getGuest=()=>{try{return JSON.parse(localStorage.getItem(GUEST_KEY)||'[]')}catch{return[]}};
const setGuest=(v)=>localStorage.setItem(GUEST_KEY,JSON.stringify(v));
async function currentUser(){if(!db)return null;const {data}=await db.auth.getUser();return data?.user||null}
async function getCart(){const u=await currentUser();if(!u)return getGuest();const {data}=await db.from('cart_items').select('product_id,quantity,size,products(id,name,brand,category,price,image,stock)').eq('user_id',u.id);return (data||[]).map(x=>({...x,product:x.products}))}
async function addToCart(product,size='',quantity=1){const u=await currentUser();if(!u){const cart=getGuest();const i=cart.findIndex(x=>x.product_id===product.id&&x.size===size);if(i>=0)cart[i].quantity+=quantity;else cart.push({product_id:product.id,quantity,size,product});setGuest(cart);return {guest:true}}
const {error}=await db.from('cart_items').upsert({user_id:u.id,product_id:product.id,quantity,size},{onConflict:'user_id,product_id,size'});if(error)throw error;return {guest:false}}
async function removeFromCart(productId,size=''){const u=await currentUser();if(!u){setGuest(getGuest().filter(x=>!(x.product_id===productId&&x.size===size)));return}const {error}=await db.from('cart_items').delete().eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function changeQty(productId,size,quantity){if(quantity<=0)return removeFromCart(productId,size);const u=await currentUser();if(!u){const c=getGuest(),i=c.findIndex(x=>x.product_id===productId&&x.size===size);if(i>=0){c[i].quantity=quantity;setGuest(c)}return}const {error}=await db.from('cart_items').update({quantity}).eq('user_id',u.id).eq('product_id',productId).eq('size',size);if(error)throw error}
async function mergeGuestIntoUser(){const u=await currentUser();if(!u)return;const guest=getGuest();for(const item of guest){await db.from('cart_items').upsert({user_id:u.id,product_id:item.product_id,quantity:item.quantity,size:item.size},{onConflict:'user_id,product_id,size'})}setGuest([])}
window.sixpackCart={getCart,addToCart,removeFromCart,changeQty,mergeGuestIntoUser};