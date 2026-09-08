(()=>{
  const modal=document.getElementById('authModal');
  const content=document.getElementById('authContent');
  if(modal&&content){
    const addGuest=()=>{
      const form=content.querySelector('.authForm');
      if(!form||form.querySelector('#guestContinue'))return;
      const wrap=document.createElement('div');
      wrap.id='guestContinueWrap';
      wrap.style.cssText='display:flex;align-items:center;gap:10px;margin-top:4px;color:#555;font-size:9px;letter-spacing:.16em;text-transform:uppercase';
      wrap.innerHTML='<span style="height:1px;background:#2a2a2a;flex:1"></span><span>OR</span><span style="height:1px;background:#2a2a2a;flex:1"></span>';
      form.appendChild(wrap);
      const btn=document.createElement('button');
      btn.type='button';btn.id='guestContinue';btn.className='authSecondary';btn.textContent='Continue as guest';
      btn.style.cssText='width:100%;text-align:center';
      btn.onclick=()=>{modal.classList.remove('show');window.location.href='/catalog.html?view=looks'};
      form.appendChild(btn);
    };
    new MutationObserver(addGuest).observe(content,{childList:true,subtree:true});
    addGuest();
  }

  // Every homepage header item has its own real link/hit area.
  // No shared overlay is used, so clicks cannot fall through to another menu item.
  const routes={
    looks:'/catalog.html?view=looks',
    categories:'/catalog.html?view=categories',
    brands:'/catalog.html?view=brands',
    newdrops:'/catalog.html?view=newdrops',
    mylook:'/my-look.html',
    search:'/catalog.html?view=search',
    cart:'/cart.html'
  };
  Object.entries(routes).forEach(([cls,href])=>{
    const el=document.querySelector('.hotspot.'+cls);
    if(!el)return;
    el.onclick=(e)=>{
      e.preventDefault();
      window.location.assign(href);
    };
  });
  const hero=document.querySelector('.hotspot.heroCta');
  if(hero)hero.onclick=(e)=>{
    e.preventDefault();
    window.location.assign('/catalog.html?view=looks');
  };
})();