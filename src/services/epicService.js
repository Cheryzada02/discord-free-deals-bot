const axios = require('axios');
const config = require('../config');

async function fetchEpicPromotions() {
  const url = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': config.userAgent } });
    const elements = res.data.data.Catalog.searchStore.elements || [];
    const freebies = [];

    for (const el of elements) {
      if (!el.promotions) continue;
      const offers = el.promotions.promotionalOffers || [];
      const upcoming = el.promotions.upcomingPromotionalOffers || [];

      if (offers.length && offers[0].promotionalOffers.length) {
        const promo = offers[0].promotionalOffers[0];
        freebies.push({
          id: el.id || el.productSlug || el.title,
          title: el.title,
          url: `https://store.epicgames.com/p/${el.catalogNs.mappings?.[0]?.pageSlug || el.productSlug || ''}`,
          image: el.keyImages?.[0]?.url || null,
          startDate: promo.startDate,
          endDate: promo.endDate,
          type: 'free'
        });
      } else if (upcoming.length && upcoming[0].promotionalOffers.length) {
        const promo = upcoming[0].promotionalOffers[0];
        freebies.push({
          id: el.id || el.productSlug || el.title,
          title: el.title,
          url: `https://store.epicgames.com/p/${el.catalogNs.mappings?.[0]?.pageSlug || el.productSlug || ''}`,
          image: el.keyImages?.[0]?.url || null,
          startDate: promo.startDate,
          endDate: promo.endDate,
          type: 'upcoming'
        });
      }
    }

    return freebies;
  } catch (err) {
    console.error('Epic service error:', err.message);
    return [];
  }
}

module.exports = { fetchEpicPromotions };
