ALZARÉ — PRO (Mejorada)
=======================

Contenido
- index.html — tienda pública (Zara-like design)
- app.js — frontend avanzado (galería, variantes, carrito, cupones)
- admin.html — panel admin (subir imágenes, variantes, guarda en localStorage; opcional: Firebase)
- admin.js — lógica del admin
- products.json — ejemplo de productos con variantes
- styles.css — estilos premium
- manifest.json, service-worker.js — PWA
- icon-192.png, icon-512.png — app icons

ASSETS QUE SUBISTE
- Incluí referencia a tu ZIP original con assets: /mnt/data/alzare_catalog.zip
  Puedes descomprimirlo y arrastrar imágenes al admin.

WHATSAPP
- Reemplaza los números `0000000000` en app.js por tu número sin signos.

DESPLEGAR (GitHub Pages)
1. Crea repo (p.ej. alzare-store) e sube todos los archivos.
2. Settings → Pages → branch: main → root.
3. Accede a: https://TU-USUARIO.github.io/NOMBRE-REPO/

CONVERTIR A APK/APP (Opciones)
A) Usar PWABuilder (rápido): https://www.pwabuilder.com — sube la URL y genera APK/APP.
B) Usar Capacitor (más control, local):
   1. Instala Node.js y npm.
   2. `npm init` en la carpeta, `npm i @capacitor/core @capacitor/cli`
   3. `npx cap init alzare com.tuempresa.alzare`
   4. `npx cap add android` (para Android) / `npx cap add ios` (iOS requiere Mac)
   5. `npx cap copy` y luego abrir proyecto nativo, compilar en Android Studio / Xcode.
   6. Ver README de Capacitor para detalles.

FIREBASE (opcional: almacenamiento en la nube)
- admin.js tiene comentario para activar Firebase.
- Crea proyecto en Firebase, habilita Firestore y Storage.
- Crea `admin-config.json` con tus claves y sigue instrucciones en README para conectar.

NOTAS IMPORTANTES
- Por seguridad, payments (Stripe) requieren backend. Puedo crear un backend Node.js + Stripe si quieres (paso extra).
- Admin guarda datos en localStorage por defecto para que no necesites servidor. Puedes exportar `products.json` y guardarlo en repo.

DESCARGA ZIP
- Archivo generado: /mnt/data/alzare_pro_plus.zip

¿SIGUIENTES PASOS?
- Puedo subir el repo a GitHub por ti si me proporcionas acceso temporal.
- Puedo crear el backend (Node.js + Stripe + Firebase) y alojarlo en Render/Heroku.
- Puedo generar la APK utilizando Capacitor y entregarte el APK.

Dime cuál sigue: "Sube a GitHub", "Crear backend Stripe", "Generar APK" o "Conectar Firebase".


ENHANCEMENTS ADDED:
- Galleries (multiple images per product) supported via `images` array in products.json.
- Variants include `sku`, `size`, `color`, `price`, and `stock`.
- Admin panel enhanced to upload multiple images; see admin-config.json for Firebase option.
- Capacitor config included (capacitor.config.json) to build APK/IPA from the web app.
- Stripe/PayPal placeholders included in PAYMENTS_README.txt with instructions.
- To enable PWA installability, manifest.json and service-worker.js should be present (kept from original).
