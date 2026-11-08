export const dynamic = "force-dynamic";

import { getProducts } from "@/lib/catalog";
import HomeClient from "@/components/storefront/HomeClient";

export default async function HomePage() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}
