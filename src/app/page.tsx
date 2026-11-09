export const dynamic = "force-dynamic";

import { getProducts, getReels } from "@/lib/catalog";
import HomeClient from "@/components/storefront/HomeClient";

export default async function HomePage() {
  const [products, reels] = await Promise.all([getProducts(), getReels()]);
  return <HomeClient products={products} reels={reels} />;
}
