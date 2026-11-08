import { getProductBySlug, getProducts } from "@/lib/catalog";
import ProductDetailClient from "./ProductDetailClient";
import type { Product } from "@/data/products";
import type { ProductDTO } from "@/lib/catalog";

function toStatic(p: ProductDTO): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: p.price,
    compareAt: p.compareAt ?? p.price,
    badge: p.badge ? { ar: p.badge, en: p.badge } : null,
    category: (p.categorySlug ?? "gadgets") as Product["category"],
    image: p.primaryImage ?? "/brand/no-image.svg",
    gallery: (p.media ?? []).filter((m) => m.type === "IMAGE").map((m) => m.url),
    specs: p.specs,
    installation: { ar: "", en: "" },
    reviews: [],
    stock: p.stock,
    soldCount: 0,
    rating: 0,
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "GearTech" };
  return {
    title: `${product.title.en} — GearTech @geartechjo`,
    description: product.description.en,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return <ProductDetailClient slug={slug} product={product ? toStatic(product) : null} />;
}
