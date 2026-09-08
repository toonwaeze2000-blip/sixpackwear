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
    logo:['0%','0%','16%','11%'],looks:['16%','0%','11%','11%'],categories:['27%','0%','15%','11%'],brands:['42%','0%','11.5%','11%'],newdrops:['53.5%','0%','14%','11%'],mylook:['67.5%','0%','13%','11%'],search:['80.5%','0%','7%','11%'],account:['87.5%','0%','6%','11%'],cart:['93.5%','0%','6.5%','11%']
  };
  const mobileAreas={
    logo:['0%','0%','18%','15%'],looks:['18%','0%','13%','15%'],categories:['31%','0%','16%','15%'],brands:['47%','0%','13%','15%'],newdrops:['60%','0%','16%','15%'],mylook:['76%','0%','14%','15%'],search:['90%','0%','4%','15%'],account:['94%','0%','3%','15%'],cart:['97%','0%','3%','15%']
  };
  const applyArea=(el,area)=>{if(!el)return;el.style.left=area[0];el.style.top=area[1];el.style.width=area[2];el.style.height=area[3];el.style.zIndex='30';el.style.pointerEvents='auto';el.style.cursor='pointer'};
  const applyAreas=()=>{const areas=window.innerWidth<=700?mobileAreas:desktopAreas;Object.keys(desktopAreas).forEach(cls=>{const el=document.querySelector('.hotspot.'+cls);if(el)applyArea(el,areas[cls]||desktopAreas[cls])})};
  applyAreas();window.addEventListener('resize',applyAreas);

  Object.entries(routes).forEach(([cls,href])=>{
    const el=document.querySelector('.hotspot.'+cls);if(!el)return;
    el.onclick=async e=>{
      e.preventDefault();
      if(cls==='mylook'){
        const user=window.sixpackAuthState?await window.sixpackAuthState():null;
        if(!user){window.location.assign('/?auth=login&next='+encodeURIComponent('/my-look.html'));return}
      }
      window.location.assign(href);
    };
  });

  // Account is handled by auth.js. Do not overwrite its click handler here.
  const hero=document.querySelector('.hotspot.heroCta');
  if(hero)hero.onclick=e=>{e.preventDefault();window.location.assign('/catalog.html?view=looks')};

  // Live Shop the Look section: replace placeholder artwork with real product images from Supabase.
  const hydrateLiveLooks=async()=>{
    const grid=document.querySelector('.looksGrid');
    if(!grid||!window.supabase?.createClient)return;
    try{
      const db=window.supabase.createClient('https://boaqzdyfsosswqvjgsjn.supabase.co','sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky');
      const r=await db.from('products').select('id,name,brand,category,style,price,image,created_at').order('created_at',{ascending:false}).limit(40);
      if(r.error||!Array.isArray(r.data)||!r.data.length)return;
      const products=r.data.filter(p=>p&&p.image&&!/(women|woman|womens|female|ladies|girls)/i.test([p.name,p.category,p.brand,p.style].join(' ')));
      const specs=[
        {title:'City Uniform',match:/outerwear|pants|accessories|utility|streetwear/i,meta:'Jacket · trousers · accessories'},
        {title:'Clean Everyday',match:/t-shirts|shirts|pants|chinos|minimal|casual|relaxed/i,meta:'Tee · pants · sneakers'},
        {title:'Runway Form',match:/luxury|tailoring|outerwear|jacket|wool|smart/i,meta:'Jacket · trousers · footwear'},
        {title:'After Hours',match:/shirts|outerwear|accessories|denim|evening/i,meta:'Shirt · trousers · accessories'}
      ];
      const used=new Set();
      const pick=rx=>products.find(p=>!used.has(p.id)&&rx.test([p.category,p.style,p.name,p.brand].join(' ')))||products.find(p=>!used.has(p.id));
      grid.querySelectorAll('.look').forEach((card,i)=>{
        const spec=specs[i]||specs[0];
        const p=pick(spec.match);
        if(!p)return;
        used.add(p.id);
        const img=card.querySelector('.lookImg img');
        const brand=card.querySelector('.brand');
        const h3=card.querySelector('h3');
        const meta=card.querySelector('.meta');
        const price=card.querySelector('.row span');
        const add=card.querySelector('.add');
        if(img){img.src=p.image;img.alt=p.name||spec.title;img.loading='lazy';img.style.filter='none';}
        if(brand)brand.textContent=[p.brand||'6PACKWEAR',p.category||'MEN'].join(' · ');
        if(h3)h3.textContent=spec.title;
        if(meta)meta.textContent=spec.meta;
        if(price)price.textContent='$'+Number(p.price||0).toFixed(0);
        card.dataset.productId=p.id;
        card.setAttribute('role','link');
        card.setAttribute('tabindex','0');
        card.style.cursor='pointer';
        card.onclick=e=>{if(e.target.closest('button')){e.preventDefault();e.stopPropagation();}else window.location.href='/product.html?id='+encodeURIComponent(p.id)};
        card.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();window.location.href='/product.html?id='+encodeURIComponent(p.id)}};
        if(add){add.type='button';add.textContent='VIEW ITEM';add.onclick=e=>{e.preventDefault();e.stopPropagation();window.location.href='/product.html?id='+encodeURIComponent(p.id)}}
      });
    }catch(err){console.error('live looks',err)}
  };

  // LIVE luxury-house feed: reads current official pages through a Supabase Edge Function,
  // then rotates the visible cards while keeping every card linked to the official source.
  const injectLuxuryLive=async()=>{
    if(document.getElementById('luxuryLive'))return;
    const baseSection=document.querySelector('.looksGrid')?.closest('.section');
    if(!baseSection)return;

    const section=document.createElement('section');
    section.id='luxuryLive';
    section.className='section luxuryLiveSection';
    section.innerHTML=`
      <div class="luxuryLiveHead">
        <div>
          <div class="kicker">Live from the houses</div>
          <h2>LIVE LUXURY</h2>
        </div>
        <div class="luxuryLiveStatus"><span class="liveDot"></span><span id="luxuryLiveStatusText">SYNCING OFFICIAL FEEDS</span></div>
      </div>
      <div class="luxuryTicker" aria-hidden="true"><div class="luxuryTickerTrack">BALENCIAGA · LOUIS VUITTON · PRADA · GUCCI · DIOR · SAINT LAURENT · MONCLER · BURBERRY · BALENCIAGA · LOUIS VUITTON · PRADA · GUCCI · DIOR · SAINT LAURENT · MONCLER · BURBERRY ·</div></div>
      <div class="luxuryLiveGrid" id="luxuryLiveGrid"></div>
      <div class="luxuryLiveNote">Live feed from official brand pages · refreshes automatically · opens the official house site</div>`;

    const style=document.createElement('style');
    style.id='luxuryLiveStyle';
    style.textContent=`
      .luxuryLiveSection{padding-top:75px;overflow:hidden}
      .luxuryLiveHead{display:flex;justify-content:space-between;align-items:end;gap:30px;border-bottom:1px solid #292929;padding-bottom:24px}
      .luxuryLiveHead h2{margin:8px 0 0;font-size:clamp(46px,6vw,78px);line-height:.82;letter-spacing:-.07em;text-transform:uppercase}
      .luxuryLiveStatus{display:flex;align-items:center;gap:8px;color:#898989;font-size:9px;letter-spacing:.15em;text-transform:uppercase;white-space:nowrap}
      .liveDot{width:7px;height:7px;border-radius:50%;background:#f4f4f0;box-shadow:0 0 0 0 rgba(244,244,240,.55);animation:livePulse 1.8s infinite}
      @keyframes livePulse{0%{box-shadow:0 0 0 0 rgba(244,244,240,.45)}70%{box-shadow:0 0 0 7px rgba(244,244,240,0)}100%{box-shadow:0 0 0 0 rgba(244,244,240,0)}}
      .luxuryTicker{overflow:hidden;border-bottom:1px solid #292929;background:#080808;white-space:nowrap}
      .luxuryTickerTrack{display:inline-block;min-width:max-content;padding:15px 0;color:#777;font-size:9px;letter-spacing:.19em;text-transform:uppercase;animation:luxTicker 30s linear infinite}
      @keyframes luxTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      .luxuryLiveGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}
      .luxuryLiveCard{position:relative;min-height:350px;background:#0b0b0b;border:1px solid #292929;overflow:hidden;text-decoration:none;display:flex;flex-direction:column;justify-content:flex-end;opacity:1;transform:translateY(0);transition:opacity .35s,transform .35s,border-color .2s}
      .luxuryLiveCard.swap{opacity:0;transform:translateY(10px)}
      .luxuryLiveCard:hover{border-color:#555}
      .luxuryLiveImage{position:absolute;inset:0;background:linear-gradient(150deg,#141414,#060606);display:flex;align-items:center;justify-content:center;overflow:hidden}
      .luxuryLiveImage img{width:100%;height:100%;object-fit:cover;display:block;opacity:.8;filter:grayscale(.15);transform:scale(1.01)}
      .luxuryLiveImage.noImage:after{content:'6PACKWEAR / LIVE';font-size:10px;letter-spacing:.22em;color:#555;text-transform:uppercase}
      .luxuryLiveShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02) 30%,rgba(0,0,0,.88) 100%)}
      .luxuryLiveBody{position:relative;z-index:2;padding:24px}
      .luxuryLiveBrand{font-size:11px;font-weight:900;letter-spacing:.09em;color:#fff}
      .luxuryLiveLabel{margin-top:8px;font-size:9px;letter-spacing:.17em;text-transform:uppercase;color:#cfcfca}
      .luxuryLiveTitle{margin-top:9px;font-size:17px;line-height:1.25;color:#fff;max-width:320px}
      .luxuryLiveCount{margin-top:8px;font-size:10px;color:#999}
      .luxuryLiveArrow{position:absolute;right:18px;top:18px;z-index:3;color:#fff;font-size:19px}
      .luxuryLiveNote{margin-top:13px;color:#686868;font-size:9px;letter-spacing:.08em;text-transform:uppercase}
      @media(max-width:900px){.luxuryLiveGrid{grid-template-columns:repeat(2,1fr)}.luxuryLiveHead{display:block}.luxuryLiveStatus{margin-top:18px}}
      @media(max-width:560px){.luxuryLiveGrid{grid-template-columns:1fr}.luxuryLiveCard{min-height:300px}.luxuryLiveSection{padding-top:58px}}
    `;
    document.head.appendChild(style);
    baseSection.insertAdjacentElement('afterend',section);

    const grid=document.getElementById('luxuryLiveGrid');
    const status=document.getElementById('luxuryLiveStatusText');
    if(!grid)return;

    const renderSet=(items,offset)=>{
      const n=items.length;
      const visible=Array.from({length:4},(_,i)=>items[(offset+i)%n]);
      grid.querySelectorAll('.luxuryLiveCard').forEach(x=>x.classList.add('swap'));
      setTimeout(()=>{
        grid.innerHTML=visible.map(item=>{
          const img=item.image?`<img src="${String(item.image).replace(/"/g,'&quot;')}" alt="" loading="lazy" onerror="this.parentElement.classList.add('noImage');this.remove()">`:'';
          const count=item.count?`${item.count} current styles`:'Official live page';
          const title=(item.title||'Latest official edit').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          return `<a class="luxuryLiveCard" href="${String(item.url).replace(/"/g,'&quot;')}" target="_blank" rel="noopener noreferrer"><span class="luxuryLiveImage">${img}</span><span class="luxuryLiveShade"></span><span class="luxuryLiveArrow">↗</span><span class="luxuryLiveBody"><span class="luxuryLiveBrand">${item.brand}</span><span class="luxuryLiveLabel">${item.label||'LIVE EDIT'}</span><span class="luxuryLiveTitle">${title}</span><span class="luxuryLiveCount">${count}</span></span></a>`;
        }).join('');
      },260);
      setTimeout(()=>grid.querySelectorAll('.luxuryLiveCard').forEach(x=>x.classList.remove('swap')),290);
    };

    try{
      const feedUrl='https://boaqzdyfsosswqvjgsjn.supabase.co/functions/v1/brand-live-feed';
      const r=await fetch(feedUrl,{headers:{apikey:'sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky'}});
      if(!r.ok)throw new Error('LIVE_FEED_'+r.status);
      const payload=await r.json();
      let items=Array.isArray(payload.items)?payload.items.filter(x=>x?.brand&&x?.url):[];
      if(!items.length)throw new Error('NO_LIVE_ITEMS');
      status.textContent='LIVE · OFFICIAL PAGES';
      const usable=items.length<4?[...items,...items,...items].slice(0,4):items;
      let offset=0;
      renderSet(usable,offset);
      let timer=setInterval(()=>{offset=(offset+1)%usable.length;renderSet(usable,offset)},4500);
      section.addEventListener('mouseenter',()=>clearInterval(timer));
      section.addEventListener('mouseleave',()=>{clearInterval(timer);timer=setInterval(()=>{offset=(offset+1)%usable.length;renderSet(usable,offset)},4500)});
      // Re-check official pages periodically so the feed changes as those sites change.
      setInterval(async()=>{
        try{
          const rr=await fetch(feedUrl,{headers:{apikey:'sb_publishable_JlneB01f5LDJ4VBO_n1E7Q_jXn5JBky'}});
          if(!rr.ok)return;
          const next=await rr.json();
          if(Array.isArray(next.items)&&next.items.length)items=next.items.filter(x=>x?.brand&&x?.url);
        }catch{}
      },5*60*1000);
    }catch(err){
      console.error('luxury live feed',err);
      status.textContent='OFFICIAL FEED · RETRYING';
      const fallback=[
        {brand:'BALENCIAGA',label:'NEW ARRIVALS',title:'Official men’s new arrivals',url:'https://www.balenciaga.com/en-us/men/discover-men/new-arrivals-for-men'},
        {brand:'PRADA',label:'NEW IN',title:'Official men’s new-in edit',url:'https://www.prada.com/eu/en/mens/new-in/c/10182EU'},
        {brand:'DIOR',label:'WHAT’S NEW',title:'Official men’s latest arrivals',url:'https://www.dior.com/en_pl/fashion/mens-fashion/whats-new-for-men'},
        {brand:'MONCLER',label:'NEW IN',title:'Official men’s new-in edit',url:'https://www.moncler.com/en-us/men/new-in/view-all-new-arrivals'},
        {brand:'GUCCI',label:'NEW IN',title:'Official men’s new-in edit',url:'https://www.gucci.com/pl/en_gb/ca/men-c-men'},
        {brand:'BURBERRY',label:'NEW ARRIVALS',title:'Official men’s new arrivals',url:'https://pl.burberry.com/l/mens-clothing/new-arrivals/'},
        {brand:'LOUIS VUITTON',label:'LIVE EDIT',title:'Official Louis Vuitton site',url:'https://us.louisvuitton.com/eng-us/homepage'},
        {brand:'SAINT LAURENT',label:'LIVE EDIT',title:'Official Saint Laurent site',url:'https://www.ysl.com/en-us'}
      ];
      let offset=0;renderSet(fallback,offset);setInterval(()=>{offset=(offset+1)%fallback.length;renderSet(fallback,offset)},4500);
    }
  };

  injectLuxuryLive();
  hydrateLiveLooks();
})();
