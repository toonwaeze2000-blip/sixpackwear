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
 content.innerHTML=`<div class="authTabs"><button class="authTab ${mode==='login'?'active':''}" data-mode="login">Sign in</button><button class="authTab ${mode==='register'?'active':''}" data-mode="register">Create account</button></div><form class="authForm" id="authForm">${mode==='register'?'<label>Full name<input id="name" autocomplete="name" required></label>':''}<label>Email<input id="email" type="email" autocomplete="email" required></label>${mode==='register'?'<label>Password<input id="password" type="password" autocomplete="new-password" minlength="8" required></label><label>Confirm password<input id="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label>':'<label>Password<input id="password" type="password" autocomplete="current-password" required></label>'}<div class="authMessage" id="authMessage"></div><button class="authSubmit">${mode==='register'?'Create account':'Sign in'}</button></form>`;
 content.querySelectorAll('.authTab').forEach(x=>x.onclick=()=>form(x.dataset.mode));
 document.getElementById('authForm').onsubmit=async e=>{e.preventDefault();try{const email=document.getElementById('email').value.trim().toLowerCase();const password=document.getElementById('password').value;if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');if(!password)throw new Error('Enter your password.');if(mode==='register'){const name=document.getElementById('name').value.trim();const confirm=document.getElementById('confirmPassword').value;if(!name)throw new Error('Enter your full name.');if(password.length<8)throw new Error('Password must be at least 8 characters.');if(password!==confirm)throw new Error('Passwords do not match.');await register({name,email,password})}else await login({email,password})}catch(err){msg(err.message)}}
}
async function register(p){
 const r=await sb.auth.signUp({email:p.email,password:p.password,options:{data:{full_name:p.name}}});
 if(r.error)throw r.error;
 if(r.data.user&&r.data.user.email_confirmed_at){msg('Account created and email already verified.');setTimeout(close,500);return}
 showOtpStep(p);
}
async function login(p){
 const r=await sb.auth.signInWithPassword({email:p.email,password:p.password});
 if(r.error)throw r.error;
 msg('Signed in. Welcome to 6PACKWEAR.');setTimeout(close,500);
}
function showOtpStep(p){
 content.innerHTML=`<div class="authForm"><div class="kicker">Email verification</div><h4 style="margin:0;font-size:22px;text-transform:uppercase">Enter your OTP</h4><div class="authMessage">We sent a 6-digit verification code to <strong>${esc(p.email)}</strong>. Check your inbox and spam folder.</div><label>Verification code<input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" placeholder="000000" required></label><div class="authMessage" id="authMessage"></div><button class="authSubmit" id="verifyOtp">Verify & continue</button><button class="authSecondary" type="button" id="resendOtp">Resend code</button><button class="authSecondary" type="button" id="backAuth">Back</button></div>`;
 const otp=document.getElementById('otp');otp.focus();
 document.getElementById('verifyOtp').onclick=async()=>{const token=otp.value.trim();if(!/^\d{6}$/.test(token)){msg('Enter the 6-digit code from your email.');return}const btn=document.getElementById('verifyOtp');btn.disabled=true;try{const r=await sb.auth.verifyOtp({email:p.email,token,type:'signup'});if(r.error)throw r.error;if(r.data.user){const u=await sb.auth.updateUser({data:{full_name:p.name}});if(u.error)throw u.error}msg('Verified. Welcome to 6PACKWEAR.');setTimeout(close,500)}catch(err){btn.disabled=false;msg(err.message)}};
 document.getElementById('resendOtp').onclick=async()=>{const btn=document.getElementById('resendOtp');btn.disabled=true;try{const r=await sb.auth.resend({type:'signup',email:p.email});if(r.error)throw r.error;msg('A new verification code was sent.');}catch(err){msg(err.message)}finally{setTimeout(()=>btn.disabled=false,30000)}};
 document.getElementById('backAuth').onclick=()=>form('register');
}
async function render(){const r=await sb.auth.getUser();if(r.error){form('login');return}if(r.data.user){content.innerHTML=`<div class="accountState"><div class="accountLine"><span>Email</span><strong>${esc(r.data.user.email||'')}</strong></div><div class="authMessage">You are signed in with your 6PACKWEAR account.</div><button class="authSecondary" id="logoutBtn">Log out</button></div>`;document.getElementById('logoutBtn').onclick=async()=>{await sb.auth.signOut();form('login')}}else form('login')}
const hot=document.getElementById('accountHotspot');if(hot)hot.onclick=async()=>{modal.classList.add('show');modal.setAttribute('aria-hidden','false');await render()};const x=document.getElementById('authClose');if(x)x.onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
})();