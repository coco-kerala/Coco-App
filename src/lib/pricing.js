const BASE_PRICE = 150;
const PER_TREE = 80;
const BULK_DISCOUNT_THRESHOLD = 10;
const BULK_DISCOUNT_RATE = 0.1;

export function calculateServicePrice(treeCount) {
  let price = BASE_PRICE + treeCount * PER_TREE;
  if (treeCount >= BULK_DISCOUNT_THRESHOLD) {
    price *= 1 - BULK_DISCOUNT_RATE;
  }
  return Math.round(price);
}
