// src/services/steamService.js
import { config } from '../config.js';
import { shortPrice } from '../utils.js';

// fetch nativo + fallback
let fetchFn = globalThis.fetch;
if (typeof fetchFn !== 'function') {
  const { default: nodeFetch } = await import('node-fetch');
  fetchFn = nodeFetch;
}

/**
 * Obtiene juegos en oferta desde "featuredcategories" y filtra por descuento mínimo.
 * @param {number} minDiscount porcentaje mínimo (e.g., 20)
 * @param {number} limit tope de items a retornar
 * Devuelve objetos con imagen y precio formateado.
 */
export async function fetchSteamDiscounts(minDiscount = 20, limit = 50) {
  const url = 'https://store.steampowered.com/api/featuredcategories?cc=us&l=english';
  const res = await fetchFn(url, {
    headers: { 'user-agent': config.userAgent }
  });
  if (!res.ok) throw new Error(`Steam API ${res.status}`);

  const json = await res.json();
  // specials.specials_items o specials.items (varía)
  const specials =
    json?.specials?.items ||
    json?.specials?.specials_items ||
    [];

  const items = [];
  for (const it of specials) {
    const appid = it?.id || it?.appid;
    const title = it?.name;
    const headerImage = it?.header_image; // imagen grande
    const url = appid ? `https://store.steampowered.com/app/${appid}` : null;

    const discountPercent = it?.discount_percent ?? it?.discountPercent ?? 0;
    const originalPriceCents = it?.original_price ?? it?.originalPrice ?? null; // ya viene en centavos
    const finalPriceCents = it?.final_price ?? it?.finalPrice ?? null;

    if (typeof discountPercent !== 'number' || discountPercent < minDiscount) continue;

    const originalPriceFormatted = shortPrice(originalPriceCents);
    const finalPriceFormatted = shortPrice(finalPriceCents);

    items.push({
      id: appid || url,
      title,
      url,
      headerImage,
      image: headerImage,
      thumbnail: headerImage,
      discountPercent,
      originalPriceCents,
      finalPriceCents,
      originalPriceFormatted,
      finalPriceFormatted,
      description: null
    });

    if (items.length >= limit) break;
  }

  return items;
}
