// src/utils.js
import { config } from './config.js';

/** Precio en centavos -> string con símbolo de moneda */
export function shortPrice(priceCents, currency = config.currency, locale = config.locale) {
  if (priceCents === null || priceCents === undefined || isNaN(priceCents)) return null;
  const value = Number(priceCents) / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/** Clave estable por proveedor (id o url) */
export function makeItemKey(provider, item) {
  const base = item?.id?.toString().trim() || item?.url?.toString().trim();
  if (!base) return null;
  return `${provider}:${base}`;
}

/**
 * Clave para Steam dependiente del precio final.
 * Evita repetir el mismo aviso si el precio no cambió.
 */
export function makeSteamPriceKey(item) {
  const id = item?.id?.toString().trim() || item?.url?.toString().trim();
  const price = (item?.finalPriceCents ?? '').toString();
  if (!id || !price) return null;
  return `steam:${id}@${price}`;
}
