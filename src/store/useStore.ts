"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  PRODUCTS,
  BUNDLES,
  FREE_DELIVERY_THRESHOLD,
  type Lang,
  type Product,
} from "@/data/products";

export interface CartItem {
  productId: string;
  slug: string;
  title: { ar: string; en: string };
  price: number;
  compareAt: number;
  image: string;
  qty: number;
}

export interface AdminProduct extends Product {
  source: string;
  landedCost: number;
}

export interface PricingRule {
  id: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
}

interface State {
  lang: Lang;
  cart: CartItem[];
  activeQuickView: string | null;
  adminProducts: AdminProduct[];
  pricingRules: PricingRule[];
  searchQuery: string;
  activeCategory: string | "all";

  setLang: (lang: Lang) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: string) => void;
  addAdminProduct: (product: AdminProduct) => void;
  removeAdminProduct: (id: string) => void;
  addPricingRule: (rule: Omit<PricingRule, "id">) => void;
  removePricingRule: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      lang: "ar",
      cart: [],
      activeQuickView: null,
      adminProducts: [],
      pricingRules: [],
      searchQuery: "",
      activeCategory: "all",

      setLang: (lang) => set({ lang }),

      addToCart: (product, qty = 1) =>
        set((state) => {
          const existing = state.cart.find(
            (i) => i.productId === product.id
          );
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === product.id
                  ? { ...i, qty: Math.min(i.qty + qty, 99) }
                  : i
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                compareAt: product.compareAt,
                image: product.image,
                qty,
              },
            ],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.productId !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => ({
          cart:
            qty <= 0
              ? state.cart.filter((i) => i.productId !== productId)
              : state.cart.map((i) =>
                  i.productId === productId
                    ? { ...i, qty: Math.min(qty, 99) }
                    : i
                ),
        })),

      clearCart: () => set({ cart: [] }),

      openQuickView: (slug) => set({ activeQuickView: slug }),
      closeQuickView: () => set({ activeQuickView: null }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),

      addAdminProduct: (product) =>
        set((state) => ({
          adminProducts: [...state.adminProducts, product],
        })),

      removeAdminProduct: (id) =>
        set((state) => ({
          adminProducts: state.adminProducts.filter((p) => p.id !== id),
        })),

      addPricingRule: (rule) =>
        set((state) => ({
          pricingRules: [
            ...state.pricingRules,
            { ...rule, id: `rule_${Date.now()}` },
          ],
        })),

      removePricingRule: (id) =>
        set((state) => ({
          pricingRules: state.pricingRules.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "geartech-store",
      partialize: (state) => ({
        lang: state.lang,
        cart: state.cart,
        adminProducts: state.adminProducts,
        pricingRules: state.pricingRules,
      }),
    }
  )
);

export const ALL_PRODUCTS = (): Product[] => [
  ...PRODUCTS,
  ...(useStore.getState().adminProducts as Product[]),
];

export const cartCount = (cart: CartItem[]): number =>
  cart.reduce((sum, i) => sum + i.qty, 0);

export const cartSubtotal = (cart: CartItem[]): number =>
  cart.reduce((sum, i) => sum + i.price * i.qty, 0);

export const bestBundleFor = (count: number) => {
  const eligible = BUNDLES.filter((b) => count >= b.minQty);
  if (eligible.length === 0) return null;
  return eligible.reduce((a, b) => (b.discountPct > a.discountPct ? b : a));
};

export const applyPricingRules = (
  price: number,
  rules: PricingRule[]
): number => {
  return rules.reduce((acc, rule) => {
    if (rule.type === "percent") return acc * (1 - rule.value / 100);
    return Math.max(0, acc - rule.value);
  }, price);
};

export const deliveryFeeFor = (
  subtotal: number,
  governorateFee: number,
  hasFreeDelivery: boolean
): number => {
  if (hasFreeDelivery) return 0;
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return governorateFee;
};
