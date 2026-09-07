(() => {
  const routes = {
    home: '/',
    looks: '/catalog.html?view=looks',
    categories: '/catalog.html?view=categories',
    brands: '/catalog.html?view=brands',
    newdrops: '/catalog.html?view=newdrops',
    mylook: '/my-look.html',
    search: '/catalog.html?view=search'
  };
  document.querySelectorAll('[data-open]').forEach((el) => {
    const key = el.getAttribute('data-open');
    const href = routes[key];
    if (!href) return;
    el.onclick = (event) => {
      event.preventDefault();
      window.location.href = href;
    };
  });
})();
