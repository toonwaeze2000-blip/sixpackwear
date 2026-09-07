(()=>{
  const modal=document.getElementById('authModal');
  const content=document.getElementById('authContent');
  if(!modal||!content)return;
  const addGuest=()=>{
    const form=content.querySelector('.authForm');
    if(!form||form.querySelector('#guestContinue'))return;
    const wrap=document.createElement('div');
    wrap.id='guestContinueWrap';
    wrap.style.cssText='display:flex;align-items:center;gap:10px;margin-top:4px;color:#555;font-size:9px;letter-spacing:.16em;text-transform:uppercase';
    wrap.innerHTML='<span style="height:1px;background:#2a2a2a;flex:1"></span><span>OR</span><span style="height:1px;background:#2a2a2a;flex:1"></span>';
    form.appendChild(wrap);
    const btn=document.createElement('button');
    btn.type='button'; btn.id='guestContinue'; btn.className='authSecondary'; btn.textContent='Continue as guest';
    btn.style.cssText='width:100%;text-align:center';
    btn.onclick=()=>modal.classList.remove('show');
    form.appendChild(btn);
  };
  new MutationObserver(addGuest).observe(content,{childList:true,subtree:true});
  addGuest();
})();