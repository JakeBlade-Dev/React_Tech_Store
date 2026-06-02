# Tech Store 360 — frontend (minimal)

Pasos rápidos para arrancar la app y conectar Firebase Auth.

1. Instalar dependencias:

```bash
npm install
```

2. Establecer la configuración de Firebase en `src/firebase.js` (reemplazar `REPLACE_ME`).

3. Diseño y estilo

- Se integró Bootstrap y una paleta de colores en `src/index.css` (grises y azules).
- Componentes añadidos: `src/components/Header.jsx`, `src/components/ProductCard.jsx`.
- Página principal con una cuadrícula de productos de ejemplo: `src/pages/Home.jsx`.

4. Ejecutar en modo desarrollo:

3. Ejecutar en modo desarrollo:

```bash
npm run dev
```

Notas:
- El archivo `src/utils/api.js` añade la cabecera `Authorization: Bearer <token>` si hay un JWT en `localStorage`.
- Las páginas `Users`, `Products`, `Purchases` están preparadas para usar APIs protegidas.
