const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  await p.shippingRate.deleteMany({ where: { governorate: { slug: "salt" } } });
  const r = await p.governorate.deleteMany({ where: { slug: "salt" } });
  console.log("removed salt rows:", r.count);
  await p.$disconnect();
})();
