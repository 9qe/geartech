import { getProducts } from "@/lib/catalog";
import HomeClient from "@/components/storefront/HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  return <HomeClient products={products} />;
}
