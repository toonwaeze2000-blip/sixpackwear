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

  // Each visible homepage menu label gets its own independent transparent link.
  // The positions are applied here as well so older cached index.html builds are corrected.
  const routes={
    looks:'/catalog.html?view=looks',
    categories:'/catalog.html?view=categories',
    brands:'/catalog.html?view=brands',
    newdrops:'/catalog.html?view=newdrops',
    mylook:'/my-look.html',
    search:'/catalog.html?view=search',
    cart:'/cart.html'
  };

  const desktopAreas={
    logo:['0%','0%','16%','11%'],
    looks:['16%','0%','11%','11%'],
    categories:['27%','0%','15%','11%'],
    brands:['42%','0%','11.5%','11%'],
    newdrops:['53.5%','0%','14%','11%'],
    mylook:['67.5%','0%','13%','11%'],
    search:['80.5%','0%','7%','11%'],
    account:['87.5%','0%','6%','11%'],
    cart:['93.5%','0%','6.5%','11%']
  };
  const mobileAreas={
    logo:['0%','0%','18%','15%'],
    looks:['18%','0%','13%','15%'],
    categories:['31%','0%','16%','15%'],
    brands:['47%','0%','13%','15%'],
    newdrops:['60%','0%','16%','15%'],
    mylook:['76%','0%','14%','15%'],
    search:['90%','0%','4%','15%'],
    account:['94%','0%','3%','15%'],
    cart:['97%','0%','3%','15%']
  };
  const applyArea=(el,area)=>{
    if(!el)return;
    el.style.left=area[0];el.style.top=area[1];el.style.width=area[2];el.style.height=area[3];
    el.style.zIndex='30';el.style.pointerEvents='auto';el.style.cursor='pointer';
  };
  const applyAreas=()=>{
    const areas=window.innerWidth<=700?mobileAreas:desktopAreas;
    Object.entries({...areas,...desktopAreas}).forEach(([cls])=>{
      const el=document.querySelector('.hotspot.'+cls);
      if(el)applyArea(el,areas[cls]||desktopAreas[cls]);
    });
  };
  applyAreas();
  window.addEventListener('resize',applyAreas);

  Object.entries(routes).forEach(([cls,href])=>{
    const el=document.querySelector('.hotspot.'+cls);
    if(!el)return;
    el.onclick=(e)=>{
      e.preventDefault();
      window.location.assign(href);
    };
  });
  const account=document.querySelector('.hotspot.account');
  if(account){
    account.onclick=(e)=>{
      e.preventDefault();
      document.getElementById('accountHotspot')?.click();
    };
  }
  const hero=document.querySelector('.hotspot.heroCta');
  if(hero)hero.onclick=(e)=>{
    e.preventDefault();
    window.location.assign('/catalog.html?view=looks');
  };
})();