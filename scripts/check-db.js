const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
Promise.all([
  p.product.count(),
  p.category.count(),
  p.governorate.count(),
  p.shippingRate.count(),
  p.bundleRule.count(),
  p.reel.count(),
  p.storeSetting.count(),
  p.homepageContent.count(),
]).then((r) => console.log("products,cats,govs,rates,rules,reels,settings,home:", r))
  .finally(() => p.$disconnect());
