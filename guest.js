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

  const routes={looks:'/catalog.html?view=looks',categories:'/catalog.html?view=categories',brands:'/catalog.html?view=brands',newdrops:'/catalog.html?view=newdrops',mylook:'/my-look.html',search:'/catalog.html?view=search',cart:'/cart.html'};
  const go=(href,e)=>{if(e)e.preventDefault();window.location.href=href};
  Object.entries(routes).forEach(([cls,href])=>{const el=document.querySelector('.hotspot.'+cls);if(el)el.onclick=e=>go(href,e)});
  const hero=document.querySelector('.hotspot.heroCta');if(hero)hero.onclick=e=>go('/catalog.html?view=looks',e);

  // Robust invisible navigation layer: the visible menu remains part of the hero artwork,
  // but these real links sit on top of it so the menu works even if image hotspot positions drift.
  if(!document.querySelector('#sixpackHitNav')){
    const style=document.createElement('style');
    style.id='sixpackHitNavStyle';
    style.textContent=`#sixpackHitNav{position:absolute;left:0;right:0;top:0;height:11%;min-height:54px;z-index:40;display:grid;grid-template-columns:16% 8% 11% 10% 12% 13% 10% 10%;pointer-events:none}#sixpackHitNav a,#sixpackHitNav button{pointer-events:auto;display:block;border:0;background:transparent;color:transparent;text-indent:-9999px;cursor:pointer;text-decoration:none}#sixpackHitNav a:hover,#sixpackHitNav button:hover{background:rgba(255,255,255,.02)}@media(max-width:700px){#sixpackHitNav{height:15%;min-height:64px;grid-template-columns:18% 13% 13% 13% 13% 10% 10% 10%}}`;
    document.head.appendChild(style);
    const nav=document.createElement('nav');
    nav.id='sixpackHitNav';
    nav.setAttribute('aria-label','6PACKWEAR navigation');
    nav.innerHTML=`<a href="/" aria-label="Home">Home</a><a href="${routes.looks}" aria-label="Looks">Looks</a><a href="${routes.categories}" aria-label="Categories">Categories</a><a href="${routes.brands}" aria-label="Brands">Brands</a><a href="${routes.newdrops}" aria-label="New Drops">New Drops</a><a href="${routes.mylook}" aria-label="My Look">My Look</a><a href="${routes.search}" aria-label="Search">Search</a><a href="${routes.cart}" aria-label="Cart">Cart</a>`;
    document.querySelector('.hero')?.appendChild(nav);
  }
})();