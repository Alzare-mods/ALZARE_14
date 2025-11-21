// app.js - Advanced ALZARÉ frontend
let products = [];
let cart = JSON.parse(localStorage.getItem('alzare_cart')||'[]');
let productsLoadKey = 'alzare_products_data'; // local override set by admin

// load products (admin override -> products.json)
function loadProducts(){
  const saved = localStorage.getItem(productsLoadKey);
  if(saved){
    products = JSON.parse(saved);
    renderCatalog(products);
  } else {
    fetch('products.json').then(r=>r.json()).then(data=>{ products=data; renderCatalog(products); });
  }
}

function renderCatalog(list){
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';
  list.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.images[0]||''}" alt="${escapeHtml(p.name)}">
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">${p.price.toFixed(2)} USD</div>
      <div><button class="btn" onclick="openProduct(${p.id})">Ver / Comprar</button></div>
    `;
    catalog.appendChild(div);
  });
  updateCartCount();
}

function filterCategory(cat){
  if(cat==='Todos') renderCatalog(products);
  else renderCatalog(products.filter(p=>p.category===cat));
}

function openProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const modal = document.getElementById('productModal');
  modal.classList.remove('hidden');
  modal.innerHTML = productModalHTML(p);
}

function productModalHTML(p){
  // build variant selectors
  const sizes = Array.from(new Set((p.variants||[]).map(v=>v.size))).filter(Boolean);
  const colors = Array.from(new Set((p.variants||[]).map(v=>v.color))).filter(Boolean);
  const images = p.images || [];
  return `
    <div style="display:flex;gap:18px;align-items:flex-start">
      <div style="flex:1">
        <div class="gallery">
          ${images.map((s,i)=>`<img src="${s}" style="width:100%;margin-bottom:8px;border-radius:8px" alt="img${i}">`).join('')}
        </div>
      </div>
      <div style="flex:1">
        <h2>${escapeHtml(p.name)}</h2>
        <div class="price">${p.price.toFixed(2)} USD</div>
        <div>
          <label>Talla
            <select id="selSize">${sizes.map(s=>`<option>${s}</option>`).join('')}</select>
          </label>
          <label>Color
            <select id="selColor">${colors.map(c=>`<option>${c}</option>`).join('')}</select>
          </label>
          <label>Cantidad
            <input id="qty" type="number" value="1" min="1" style="width:80px">
          </label>
        </div>
        <div style="margin-top:12px">
          <button class="btn" onclick="addToCartVariant(${p.id})">Agregar al carrito</button>
          <button class="btn" onclick="buyNowWhatsVariant(${p.id})">Comprar por WhatsApp</button>
        </div>
        <p style="margin-top:12px;color:rgba(255,255,255,0.75)">${escapeHtml(p.description||'')}</p>
      </div>
    </div>
    <div style="text-align:right;margin-top:12px"><button onclick="closeModal()">Cerrar</button></div>
  `;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function closeModal(){ document.getElementById('productModal').classList.add('hidden'); }

function findVariant(product, size, color){
  return (product.variants||[]).find(v=>v.size===size && v.color===color);
}

function addToCartVariant(productId){
  const p = products.find(x=>x.id===productId);
  const size = document.getElementById('selSize').value;
  const color = document.getElementById('selColor').value;
  const qty = parseInt(document.getElementById('qty').value) || 1;
  const variant = findVariant(p,size,color);
  if(variant && variant.stock < qty){ return alert('Stock insuficiente para esa variante.'); }
  const price = variant ? variant.price : p.price;
  cart.push({id:p.id,sku:variant?variant.sku:null,name:p.name,size,color,price,qty});
  localStorage.setItem('alzare_cart', JSON.stringify(cart));
  updateCartCount();
  alert('Añadido al carrito');
}

function buyNowWhatsVariant(productId){
  const p = products.find(x=>x.id===productId);
  const size = document.getElementById('selSize').value;
  const color = document.getElementById('selColor').value;
  const qty = parseInt(document.getElementById('qty').value) || 1;
  const variant = findVariant(p,size,color);
  const price = variant ? variant.price : p.price;
  const phone = "0000000000"; // REPLACE with your number
  const msg = `Hola, quiero comprar: ${p.name} - Talla:${size} - Color:${color} - Cant:${qty} - Precio:${price} USD`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');
}

function updateCartCount(){ document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+(i.qty||1),0); }

function toggleCart(){
  const panel = document.getElementById('cartPanel');
  if(panel.classList.contains('hidden')){ panel.classList.remove('hidden'); renderCart(); } else panel.classList.add('hidden');
}

function renderCart(){
  const items = document.getElementById('cartItems');
  items.innerHTML = '';
  let subtotal = 0;
  cart.forEach((it,idx)=>{
    subtotal += it.price * (it.qty||1);
    items.innerHTML += `<div style="margin-bottom:10px"><strong>${escapeHtml(it.name)}</strong><div>${it.size} • ${it.color}</div><div>$${it.price.toFixed(2)}</div><div>Qty: <input type="number" value="${it.qty}" min="1" onchange="changeQty(${idx},this.value)"></div><div><button onclick="removeItem(${idx})">Eliminar</button></div></div>`;
  });
  const shipping = subtotal>100?0:10;
  const discount = Number(localStorage.getItem('alzare_coupon_val')||0);
  const grand = subtotal + shipping - discount;
  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('shipping').textContent = shipping.toFixed(2);
  document.getElementById('discount').textContent = discount.toFixed(2);
  document.getElementById('grandTotal').textContent = grand.toFixed(2);
}

function changeQty(i,v){ cart[i].qty = parseInt(v)||1; localStorage.setItem('alzare_cart', JSON.stringify(cart)); renderCart(); updateCartCount(); }
function removeItem(i){ cart.splice(i,1); localStorage.setItem('alzare_cart', JSON.stringify(cart)); renderCart(); updateCartCount(); }

// Coupon
document.addEventListener('click', function(e){
  if(e.target && e.target.id==='applyCoupon'){
    const code = document.getElementById('coupon').value.trim();
    // basic demo coupons
    if(code==='ALZARE10'){ localStorage.setItem('alzare_coupon_val','10'); alert('Cupón aplicado: $10'); } else { alert('Cupón inválido'); }
    renderCart();
  }
  if(e.target && e.target.id==='checkoutWhats'){
    if(cart.length===0) return alert('Carrito vacío');
    let msg = "Hola, quiero comprar estos productos:%0A";
    let total = 0;
    cart.forEach(it=>{ msg += `- ${it.name} (${it.size}, ${it.color}) x${it.qty} — $${it.price}%0A`; total += it.price * (it.qty||1); });
    msg += `%0ATotal: $${total.toFixed(2)}`;
    const phone = "0000000000"; // REPLACE with your phone
    window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
  }
  if(e.target && e.target.id==='checkoutStripe'){
    alert('Botón Stripe: para aceptar pagos reales necesita un backend. Ver README para pasos.');
  }
});

loadProducts();
