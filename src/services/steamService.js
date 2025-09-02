// src/services/steamService.js
import axios from 'axios';
import cheerio from 'cheerio';
import { config } from '../config.js';

export async function fetchSteamDiscounts(count = 50) {
  try {
    const url = `https://store.steampowered.com/search/results/?query&start=0&count=${count}&filter=discounts&format=json`;
    const res = await axios.get(url, { headers: { 'User-Agent': config.userAgent } });
    const html = res.data.results_html || '';

    const $ = cheerio.load(html);
    const items = [];

    $('.search_result_row').each((i, el) => {
      const row = $(el);
      const href = row.attr('href');
      const title = row.find('.title').text().trim();
      const discount = row.find('.search_discount').text().trim();
      const discountPercentMatch = discount.match(/-?\d+%/);
      const discountPercent = discountPercentMatch ? discountPercentMatch[0] : null;

      const priceFinal = row.find('.search_price_discount_combined .discount_final_price').text().trim();
      const appid = row.attr('data-ds-appid');

      items.push({
        id: appid,
        title: title,
        url: href,
        discountPercent: discountPercent,
        finalPrice: priceFinal || null,
        image: row.find('img').attr('src')
      });
    });

    return items;
  } catch (err) {
    console.error('Steam service error:', err.message);
    return [];
  }
}
