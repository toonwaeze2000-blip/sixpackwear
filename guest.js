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
      btn.type='button'; btn.id='guestContinue'; btn.className='authSecondary'; btn.textContent='Continue as guest';
      btn.style.cssText='width:100%;text-align:center';
      btn.onclick=()=>{modal.classList.remove('show');window.location.href='/catalog.html?view=looks'};
      form.appendChild(btn);
    };
    new MutationObserver(addGuest).observe(content,{childList:true,subtree:true});
    addGuest();
  }

  // The homepage is the visual cover. Primary navigation now enters the real shop engine.
  const routes={
    looks:'/catalog.html?view=looks',
    categories:'/catalog.html?view=categories',
    brands:'/catalog.html?view=brands',
    newdrops:'/catalog.html?view=newdrops',
    mylook:'/my-look.html'
  };
  Object.entries(routes).forEach(([cls,href])=>{
    const el=document.querySelector('.hotspot.'+cls);
    if(el)el.onclick=(e)=>{e.preventDefault();window.location.href=href};
  });

  const hero=document.querySelector('.hotspot.heroCta');
  if(hero)hero.onclick=(e)=>{e.preventDefault();window.location.href='/catalog.html?view=looks'};

  const search=document.querySelector('.hotspot.search');
  if(search)search.onclick=(e)=>{e.preventDefault();window.location.href='/catalog.html?view=search'};

  const cart=document.querySelector('.hotspot.cart');
  if(cart)cart.onclick=(e)=>{e.preventDefault();window.location.href='/cart.html'};
})();