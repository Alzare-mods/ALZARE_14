// admin.js - admin panel with localStorage + optional Firebase
let products = [];

async function loadAdmin(){
  const saved = localStorage.getItem('alzare_products_data');
  if(saved){ products = JSON.parse(saved); renderProductsList(); return; }
  const resp = await fetch('products.json'); products = await resp.json(); renderProductsList();
}

function renderProductsList(){
  const list = document.getElementById('productsList'); list.innerHTML = '';
  products.forEach(p=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<img src="${p.images[0]||''}" style="width:120px;height:120px;object-fit:cover;border-radius:8px"><div style="padding-left:8px"><strong>${p.name}</strong><div>${p.category}</div><div>$${p.price}</div><div><button onclick="editProduct(${p.id})">Editar</button> <button onclick="deleteProduct(${p.id})">Eliminar</button></div></div>`;
    list.appendChild(div);
  });
}

document.getElementById('images').addEventListener('change', async function(e){
  const files = Array.from(e.target.files);
  const previews = document.getElementById('imgPreview'); previews.innerHTML='';
  const urls = await Promise.all(files.map(f=>fileToDataURL(f)));
  urls.forEach(u=>{ const img=document.createElement('img'); img.src=u; img.style.width='100px'; img.style.height='100px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; previews.appendChild(img); });
  e.target.dataset.urls = JSON.stringify(urls);
});

function fileToDataURL(file){
  return new Promise((res,rej)=>{ const reader=new FileReader(); reader.onload=()=>res(reader.result); reader.onerror=rej; reader.readAsDataURL(file); });
}

document.getElementById('saveProduct').addEventListener('click', function(){
  const idField = document.getElementById('productId').value;
  const product = {
    id: idField ? parseInt(idField) : Date.now(),
    name: document.getElementById('name').value,
    price: parseFloat(document.getElementById('price').value)||0,
    category: document.getElementById('category').value||'Unisex',
    images: JSON.parse(document.getElementById('images').dataset.urls||'[]'),
    sizes: document.getElementById('sizes').value.split(',').map(s=>s.trim()).filter(Boolean),
    colors: document.getElementById('colors').value.split(',').map(s=>s.trim()).filter(Boolean),
    variants: (()=>{ try{ const v=JSON.parse(document.getElementById('variants').value); return Array.isArray(v)?v:[] }catch(e){return []}})()
  };
  const idx = products.findIndex(p=>p.id===product.id);
  if(idx>=0) products[idx]=product; else products.push(product);
  localStorage.setItem('alzare_products_data', JSON.stringify(products));
  alert('Guardado en tu navegador (localStorage). Para almacenamiento en la nube configura Firebase en admin-config.json.');
  renderProductsList(); clearForm();
});

function editProduct(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  document.getElementById('productId').value = p.id; document.getElementById('name').value=p.name;
  document.getElementById('price').value = p.price; document.getElementById('category').value=p.category;
  document.getElementById('sizes').value = (p.sizes||[]).join(','); document.getElementById('colors').value = (p.colors||[]).join(',');
  document.getElementById('variants').value = JSON.stringify(p.variants||[], null, 2);
  const previews = document.getElementById('imgPreview'); previews.innerHTML=''; (p.images||[]).forEach(u=>{ const img=document.createElement('img'); img.src=u; img.style.width='100px'; img.style.height='100px'; img.style.objectFit='cover'; img.style.borderRadius='6px'; previews.appendChild(img); });
  document.getElementById('images').dataset.urls = JSON.stringify(p.images||[]);
}

function deleteProduct(id){ if(!confirm('Eliminar?')) return; products = products.filter(p=>p.id!==id); localStorage.setItem('alzare_products_data', JSON.stringify(products)); renderProductsList(); }

document.getElementById('exportJSON').addEventListener('click', function(){ const data = JSON.stringify(products, null, 2); const blob = new Blob([data], {type:'application/json'}); const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='products.json'; a.click(); URL.revokeObjectURL(url); });

document.getElementById('restoreSample').addEventListener('click', async function(){ if(!confirm('Restaurar ejemplos?')) return; const resp = await fetch('products.json'); products = await resp.json(); localStorage.setItem('alzare_products_data', JSON.stringify(products)); renderProductsList(); });

loadAdmin();


// ADMIN NOTE: this admin supports multiple images per product.
// When uploading images, the admin will store them as Data URLs in localStorage
// and write an "images" array for each product. Variants support per-variant stock.
