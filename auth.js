const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_'+'JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
window.sixpackAuth=sb;
(()=>{
const modal=document.getElementById('authModal'),content=document.getElementById('authContent');
const nextUrl=()=>{const n=new URLSearchParams(location.search).get('next');return n&&n.startsWith('/')?n:'/catalog.html?view=all'};
const close=()=>{if(!modal)return;modal.classList.remove('show');modal.setAttribute('aria-hidden','true')};
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function msg(text){const el=document.getElementById('authMessage');if(el)el.textContent=text||''}
function form(mode='login'){
 if(!content)return;
 content.innerHTML=`<div class="authTabs"><button class="authTab ${mode==='login'?'active':''}" data-mode="login">Sign in</button><button class="authTab ${mode==='register'?'active':''}" data-mode="register">Create account</button></div><form class="authForm" id="authForm">${mode==='register'?'<label>Full name<input id="name" autocomplete="name" required></label>':''}<label>Email<input id="email" type="email" autocomplete="email" required></label>${mode==='register'?'<label>Password<input id="password" type="password" autocomplete="new-password" minlength="6" required></label><label>Confirm password<input id="confirmPassword" type="password" autocomplete="new-password" minlength="6" required></label>':'<label>Password<input id="password" type="password" autocomplete="current-password" required></label>'}<div class="authMessage" id="authMessage"></div><button class="authSubmit">${mode==='register'?'Create account':'Sign in'}</button></form>`;
 content.querySelectorAll('.authTab').forEach(x=>x.onclick=()=>form(x.dataset.mode));
 document.getElementById('authForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase();const password=document.getElementById('password').value;try{if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');if(!password)throw new Error('Enter your password.');if(mode==='register'){const name=document.getElementById('name').value.trim();const confirm=document.getElementById('confirmPassword').value;if(!name)throw new Error('Enter your full name.');if(password.length<6)throw new Error('Password must be at least 6 characters.');if(password!==confirm)throw new Error('Passwords do not match.');await register({name,email,password})}else await login({email,password})}catch(err){msg(err.message)}}
}
async function register(p){const r=await sb.auth.signUp({email:p.email,password:p.password,options:{data:{full_name:p.name}}});if(r.error)throw r.error;if(r.data.user)showOtpStep({mode:'register',name:p.name,email:p.email})}
async function login(p){const r=await sb.auth.signInWithPassword({email:p.email,password:p.password});if(r.error)throw r.error;msg('Signed in. Opening your account…');setTimeout(()=>{window.location.href=nextUrl()},350)}
function showOtpStep(p){content.innerHTML=`<div class="authForm"><div class="kicker">Email verification</div><h4 style="margin:0;font-size:22px;text-transform:uppercase">Enter your OTP</h4><div class="authMessage">We sent a verification code to <strong>${esc(p.email)}</strong>. Enter all digits from the email.</div><label>Verification code<input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]{6,8}" placeholder="00000000" required></label><div class="authMessage" id="authMessage"></div><button class="authSubmit" id="verifyOtp">Verify account</button><button class="authSecondary" type="button" id="resendOtp">Resend code</button><button class="authSecondary" type="button" id="backAuth">Back</button></div>`;const otp=document.getElementById('otp');otp.focus();document.getElementById('verifyOtp').onclick=async()=>{const token=otp.value.trim();if(!/^\d{6,8}$/.test(token)){msg('Enter the complete verification code from your email.');return}const btn=document.getElementById('verifyOtp');btn.disabled=true;try{const r=await sb.auth.verifyOtp({email:p.email,token,type:'email'});if(r.error)throw r.error;msg('Account verified. Opening your account…');setTimeout(()=>{window.location.href=nextUrl()},700)}catch(err){btn.disabled=false;msg(err.message)}};document.getElementById('resendOtp').onclick=async()=>{const btn=document.getElementById('resendOtp');btn.disabled=true;try{const r=await sb.auth.resend({type:'signup',email:p.email});if(r.error)throw r.error;msg('A new verification code was sent.')}catch(err){msg(err.message)}finally{setTimeout(()=>btn.disabled=false,30000)}};document.getElementById('backAuth').onclick=()=>form('register')}
function decorateHeader(user){
 const hot=document.getElementById('accountHotspot');
 if(!hot)return;
 const old=document.getElementById('sixpackMemberBadge');if(old)old.remove();
 const badge=document.createElement('span');badge.id='sixpackMemberBadge';
 badge.textContent=user?`MEMBER · ${(user.user_metadata?.full_name||user.email||'ACCOUNT').split(' ')[0].toUpperCase()}`:'GUEST · LIMITED ACCESS';
 badge.style.cssText='position:fixed;right:18px;top:18px;z-index:95;color:#fff;background:rgba(5,5,5,.88);border:1px solid #444;padding:9px 11px;font:800 9px Arial,Helvetica,sans-serif;letter-spacing:.14em;pointer-events:none';
 document.body.appendChild(badge);
 hot.setAttribute('title',user?'Signed in · '+(user.email||''):'Guest · Sign in for member features');
}
async function render(){
 if(!content||!modal)return;
 const r=await sb.auth.getUser();
 if(r.error){decorateHeader(null);form('login');return}
 if(r.data.user){decorateHeader(r.data.user);content.innerHTML=`<div class="accountState"><div class="accountLine"><span>Account</span><strong>${esc(r.data.user.user_metadata?.full_name||'Member')}</strong></div><div class="accountLine"><span>Email</span><strong>${esc(r.data.user.email||'')}</strong></div><div class="authMessage">Member access is enabled. Your personal features are available.</div><button class="authSubmit" id="shopBtn">Open shop</button><button class="authSecondary" id="logoutBtn">Log out</button></div>`;document.getElementById('shopBtn').onclick=()=>{window.location.href='/catalog.html?view=all'};document.getElementById('logoutBtn').onclick=async()=>{await sb.auth.signOut();decorateHeader(null);form('login')}}else{decorateHeader(null);form('login')}}
const hot=document.getElementById('accountHotspot');if(hot)hot.onclick=async()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false');await render()};
const x=document.getElementById('authClose');if(x)x.onclick=close;if(modal)modal.onclick=e=>{if(e.target===modal)close()};
const p=new URLSearchParams(location.search);if(modal&&p.get('auth')==='login'){modal.classList.add('show');modal.setAttribute('aria-hidden','false');render()}
const gatePersonal=async(path)=>{const r=await sb.auth.getUser();if(!r.data.user){window.location.href='/?auth=login&next='+encodeURIComponent(path);return false}return true};
window.sixpackRequireAuth=gatePersonal;
window.sixpackAuthState=async()=>{const r=await sb.auth.getUser();return r.data?.user||null};
})();