function shortPrice(priceCents) {
  if (!priceCents && priceCents !== 0) return null;
  return (priceCents / 100).toFixed(2);
}

module.exports = { shortPrice };
