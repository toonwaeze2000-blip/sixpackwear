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

  // Premium brand directory directly below Shop the Look.
  const injectLuxuryBrands=()=>{
    if(document.getElementById('luxuryBrands'))return;
    const lookGrid=document.querySelector('.looksGrid');
    const baseSection=lookGrid?.closest('.section');
    if(!baseSection)return;
    const section=document.createElement('section');
    section.id='luxuryBrands';
    section.className='section luxurySection';
    section.innerHTML=`
      <div class="kicker">Luxury edit</div>
      <h2>Luxury Houses</h2>
      <p class="luxuryLead">Explore official maisons and their latest men's collections.</p>
      <div class="luxuryGrid">
        <a class="luxuryCard" href="https://www.balenciaga.com/en-pl/" target="_blank" rel="noopener noreferrer"><strong>BALENCIAGA</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://eu.louisvuitton.com/eng-e1/homepage" target="_blank" rel="noopener noreferrer"><strong>LOUIS VUITTON</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://www.prada.com/ww/en.html" target="_blank" rel="noopener noreferrer"><strong>PRADA</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://www.gucci.com/int/en/" target="_blank" rel="noopener noreferrer"><strong>GUCCI</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://www.dior.com/en_pl" target="_blank" rel="noopener noreferrer"><strong>DIOR</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://www.ysl.com/en-pl" target="_blank" rel="noopener noreferrer"><strong>SAINT LAURENT</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://www.moncler.com/ru-ru/" target="_blank" rel="noopener noreferrer"><strong>MONCLER</strong><span>Official site ↗</span></a>
        <a class="luxuryCard" href="https://int.burberry.com/" target="_blank" rel="noopener noreferrer"><strong>BURBERRY</strong><span>Official site ↗</span></a>
      </div>`;
    const style=document.createElement('style');
    style.id='luxuryBrandsStyle';
    style.textContent=`.luxuryLead{max-width:620px;color:#777;font-size:12px;line-height:1.6;margin:-4px 0 28px}.luxuryGrid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #292929;border-left:1px solid #292929}.luxuryCard{min-height:150px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #292929;border-bottom:1px solid #292929;background:linear-gradient(180deg,#0b0b0b,#070707);text-decoration:none;transition:transform .22s,border-color .22s,background .22s}.luxuryCard strong{font-size:18px;letter-spacing:.03em;color:#f4f4f0}.luxuryCard span{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#777}.luxuryCard:hover{transform:translateY(-3px);background:#101010;border-color:#565656}.luxuryCard:hover span{color:#fff}@media(max-width:900px){.luxuryGrid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.luxuryGrid{grid-template-columns:1fr}.luxuryCard{min-height:120px}}`;
    document.head.appendChild(style);
    baseSection.insertAdjacentElement('afterend',section);
  };

  injectLuxuryBrands();
  hydrateLiveLooks();
})();