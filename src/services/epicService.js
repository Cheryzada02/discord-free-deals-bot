// src/services/epicService.js
import { config } from '../config.js';

// fetch nativo + fallback
let fetchFn = globalThis.fetch;
if (typeof fetchFn !== 'function') {
  const { default: nodeFetch } = await import('node-fetch');
  fetchFn = nodeFetch;
}

/**
 * Obtiene juegos gratis actuales y próximos de Epic Games Store.
 * Filtra SOLO los gratuitos activos (precio 0).
 * Devuelve: [{ id, title, url, description, image/thumbnail/keyImages }]
 */
export async function fetchEpicPromotions() {
  const url =
    'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=es-ES&country=US&allowCountries=US';

  const res = await fetchFn(url, {
    headers: { 'user-agent': config.userAgent }
  });
  if (!res.ok) throw new Error(`Epic API ${res.status}`);

  const json = await res.json();
  const elements = json?.data?.Catalog?.searchStore?.elements || [];

  const nowFree = [];

  for (const el of elements) {
    const title = el.title;
    const productSlug = el.productSlug || el.catalogNs?.mappings?.[0]?.pageSlug;
    const url = productSlug ? `https://store.epicgames.com/p/${productSlug}` : null;

    // Intentar sacar imagen principal
    const keyImages = el.keyImages || [];
    const promoImage =
      keyImages.find(k => /OfferImage|DieselStoreFrontWide/i.test(k.type))?.url ||
      keyImages[0]?.url ||
      null;

    // Verificar si está gratis (promotions y price 0)
    const price = el.price;
    const isFree = price?.totalPrice?.discountPrice === 0;

    if (!isFree) continue; // SOLO GRATIS

    nowFree.push({
      id: el.id || url,
      title,
      url,
      description: el.description || 'Gratis por tiempo limitado',
      image: promoImage,
      thumbnail: promoImage,
      keyImages
    });
  }

  return nowFree;
}
