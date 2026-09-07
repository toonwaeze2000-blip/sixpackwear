const SUPABASE_URL='https://boaqzdyfsosswqvjgsjn.supabase.co';
const SUPABASE_KEY='sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky';
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
window.sixpackAuth=sb;
(()=>{
const modal=document.getElementById('authModal'),content=document.getElementById('authContent');
const close=()=>{modal.classList.remove('show');modal.setAttribute('aria-hidden','true')};
function esc(s){return String(s).replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function msg(text){const el=document.getElementById('authMessage');if(el)el.textContent=text||''}
function form(mode='login'){
 content.innerHTML=`<div class="authTabs"><button class="authTab ${mode==='login'?'active':''}" data-mode="login">Sign in</button><button class="authTab ${mode==='register'?'active':''}" data-mode="register">Create account</button></div><form class="authForm" id="authForm">${mode==='register'?'<label>Full name<input id="name" autocomplete="name" required></label>':''}<label>Email<input id="email" type="email" autocomplete="email" required></label><label>Password<input id="password" type="password" minlength="8" autocomplete="current-password" required></label><div class="authMessage" id="authMessage"></div><button class="authSubmit">${mode==='register'?'Create account':'Sign in'}</button></form>`;
 content.querySelectorAll('.authTab').forEach(x=>x.onclick=()=>form(x.dataset.mode));
 document.getElementById('authForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('email').value.trim().toLowerCase(),password=document.getElementById('password').value;try{if(password.length<8)throw new Error('Password must be at least 8 characters.');if(mode==='register'){const name=document.getElementById('name').value.trim();if(!name)throw new Error('Enter your name.');await startRegistration(name,email,password)}else{const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;close()}}catch(err){msg(err.message)}}
}
async function startRegistration(name,email,password){const r=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(r.error)throw r.error;showOtpStep({name,email,password});}
function showOtpStep(p){
 content.innerHTML=`<div class="authForm"><label>Email<input value="${esc(p.email)}" disabled></label><label>Verification code<input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="8" placeholder="Enter the code from your email" required></label><div class="authMessage" id="authMessage">We sent a verification code to your email.</div><button class="authSubmit" id="verifyOtp">Verify account</button><button class="authSecondary" type="button" id="resendOtp">Resend code</button></div>`;
 document.getElementById('verifyOtp').onclick=async()=>{const token=document.getElementById('otp').value.trim();if(!/^\d{6,8}$/.test(token)){msg('Enter the verification code from your email.');return}try{const r=await sb.auth.verifyOtp({email:p.email,token,type:'email'});if(r.error)throw r.error;const u=await sb.auth.updateUser({password:p.password,data:{full_name:p.name}});if(u.error)throw u.error;msg('Email confirmed. Your account is ready.');setTimeout(close,700)}catch(err){msg(err.message)}};
 document.getElementById('resendOtp').onclick=async()=>{try{const r=await sb.auth.signInWithOtp({email:p.email,options:{shouldCreateUser:false}});if(r.error)throw r.error;msg('A new verification code was sent. Please wait before requesting another one.')}catch(err){msg(err.message)}};
}
async function render(){const r=await sb.auth.getUser();if(r.error){form('login');return}if(r.data.user){content.innerHTML=`<div class="accountState"><div class="accountLine"><span>Email</span><strong>${esc(r.data.user.email||'')}</strong></div><button class="authSecondary" id="logoutBtn">Log out</button></div>`;document.getElementById('logoutBtn').onclick=async()=>{await sb.auth.signOut();form('login')}}else form('login')}
const hot=document.getElementById('accountHotspot');if(hot)hot.onclick=async()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false');await render()};const x=document.getElementById('authClose');if(x)x.onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
})();