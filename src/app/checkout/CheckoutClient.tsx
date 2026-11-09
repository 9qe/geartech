"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { placeOrderAction } from "@/app/actions/checkout";
import { bestBundleFor, cartSubtotal, deliveryFeeFor, useStore } from "@/store/useStore";
import { BRAND, formatJOD } from "@/data/products";
import { cn, t } from "@/lib/utils";

type PaymentMethod = "cod" | "cliq";

interface FormErrors {
  name?: string;
  phone?: string;
  altPhone?: string;
  governorate?: string;
  address?: string;
}

const PHONE_RE = /^07\d{8}$/;

interface CheckoutProps {
  governorates: { id: string; label: { ar: string; en: string }; deliveryFee: number }[];
  freeShippingThreshold: number;
  whatsappNumber: string | null;
  cliq: { alias: string; beneficiary: string; iban: string; instructions: string };
}

export default function CheckoutClient(props: CheckoutProps) {
  const { governorates: GOVERNORATES = [], freeShippingThreshold: FREE_DELIVERY_THRESHOLD = 25, whatsappNumber: WHATSAPP_NUMBER = null } = props;
  const lang = useStore((s) => s.lang);
  const cart = useStore((s) => s.cart);
  const setQty = useStore((s) => s.setQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const clearCart = useStore((s) => s.clearCart);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [governorateId, setGovernorateId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [errors, setErrors] = useState<FormErrors>({});
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);

  const itemTotal = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cartSubtotal(cart);
  const bundle = bestBundleFor(itemTotal);
  const discountAmount = bundle
    ? (subtotal * bundle.discountPct) / 100
    : 0;
  const discountedSubtotal = subtotal - discountAmount;

  const governorate = GOVERNORATES.find((g) => g.id === governorateId);
  const governorateFee = governorate?.deliveryFee ?? 0;
  const deliveryFee = deliveryFeeFor(
    discountedSubtotal,
    governorateFee,
    bundle?.freeDelivery ?? false
  );
  const total = discountedSubtotal + deliveryFee;

  const freeDeliveryUnlocked =
    (bundle?.freeDelivery ?? false) || discountedSubtotal >= FREE_DELIVERY_THRESHOLD;
  const toFreeDelivery = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD - discountedSubtotal
  );
  const freeDeliveryPct = Math.min(
    100,
    (discountedSubtotal / FREE_DELIVERY_THRESHOLD) * 100
  );

  const paymentLabel =
    payment === "cod"
      ? lang === "ar"
        ? "الدفع عند الاستلام"
        : "Cash on Delivery"
      : lang === "ar"
        ? "تحويل CliQ فوري"
        : "CliQ Instant Transfer";

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (name.trim().length < 3) {
      next.name =
        lang === "ar"
          ? "اكتب اسمك الكامل (3 أحرف على الأقل)"
          : "Enter your full name (min 3 characters)";
    }
    if (!PHONE_RE.test(phone.trim())) {
      next.phone =
        lang === "ar"
          ? "رقم غير صحيح — الصيغة الأردنية 07XXXXXXXX"
          : "Invalid number — Jordanian format 07XXXXXXXX";
    }
    if (altPhone.trim() && !PHONE_RE.test(altPhone.trim())) {
      next.altPhone =
        lang === "ar"
          ? "الرقم البديل غير صحيح — 07XXXXXXXX"
          : "Alternate number must be 07XXXXXXXX";
    }
    if (!governorateId) {
      next.governorate =
        lang === "ar" ? "اختر المحافظة" : "Select your governorate";
    }
    if (address.trim().length < 8) {
      next.address =
        lang === "ar"
          ? "اكتب العنوان بالتفصيل (شارع، رقم عمارة، إشارة)"
          : "Write the full address (street, building, landmark)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildWhatsAppMessage = (): string => {
    const lines: string[] =
      lang === "ar"
        ? [`*طلب جديد — ${BRAND.name}*`, ""]
        : [`*New Order — ${BRAND.name}*`, ""];

    cart.forEach((item) => {
      lines.push(
        lang === "ar"
          ? `• ${item.title.ar} × ${item.qty} — ${formatJOD(
              item.price * item.qty
            )}`
          : `• ${item.title.en} × ${item.qty} — ${formatJOD(
              item.price * item.qty
            )}`
      );
    });

    lines.push("");
    lines.push(
      lang === "ar"
        ? `المجموع: ${formatJOD(subtotal)}`
        : `Subtotal: ${formatJOD(subtotal)}`
    );
    if (bundle && discountAmount > 0) {
      lines.push(
        lang === "ar"
          ? `خصم ${bundle.name.ar} (-${bundle.discountPct}%): -${formatJOD(
              discountAmount
            )}`
          : `Discount ${bundle.name.en} (-${bundle.discountPct}%): -${formatJOD(
              discountAmount
            )}`
      );
    }
    lines.push(
      lang === "ar"
        ? `التوصيل: ${deliveryFee === 0 ? "مجاني" : formatJOD(deliveryFee)}`
        : `Delivery: ${deliveryFee === 0 ? "Free" : formatJOD(deliveryFee)}`
    );
    lines.push(
      lang === "ar"
        ? `*الإجمالي: ${formatJOD(total)}*`
        : `*Total: ${formatJOD(total)}*`
    );
    lines.push("");
    lines.push(
      lang === "ar"
        ? `الاسم: ${name.trim()}`
        : `Name: ${name.trim()}`
    );
    lines.push(
      lang === "ar"
        ? `الهاتف: ${phone.trim()}`
        : `Phone: ${phone.trim()}`
    );
    if (altPhone.trim()) {
      lines.push(
        lang === "ar"
          ? `هاتف بديل: ${altPhone.trim()}`
          : `Alt phone: ${altPhone.trim()}`
      );
    }
    lines.push(
      governorate
        ? lang === "ar"
          ? `المحافظة: ${t(governorate.label, "ar")}`
          : `Governorate: ${t(governorate.label, "en")}`
        : ""
    );
    lines.push(
      lang === "ar"
        ? `العنوان: ${address.trim()}`
        : `Address: ${address.trim()}`
    );
    if (notes.trim()) {
      lines.push(
        lang === "ar" ? `ملاحظات: ${notes.trim()}` : `Notes: ${notes.trim()}`
      );
    }
    lines.push("");
    lines.push(
      lang === "ar" ? `طريقة الدفع: ${paymentLabel}` : `Payment: ${paymentLabel}`
    );

    return lines.join("\n").replace(/^\n+|\n+$/g, "");
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppMessage());
  if (WHATSAPP_NUMBER) window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await placeOrderAction({
        fullName: name.trim(),
        phone: phone.trim(),
        governorateId,
        city: "",
        area: "",
        street: address.trim(),
        addressDetails: "",
        notes: notes.trim(),
        paymentMethod: payment === "cod" ? "COD" : "CLIQ",
        cliqReference: "",
        cart: cart.map((i) => ({ productId: i.productId, quantity: i.qty })),
      });
      if (!res.ok) {
        setPlaceError(res.error);
        return;
      }
      setPlacedOrder(res.orderNumber);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPlaceError("ORDER_FAILED");
    } finally {
      setPlacing(false);
    }
  };

  const followUpMessage = () =>
    encodeURIComponent(
      lang === "ar"
        ? `مرحباً ${BRAND.name} — بخصوص الطلب ${placedOrder} بإسمي ${name.trim()}.`
        : `Hi ${BRAND.name} — following up on order ${placedOrder} under ${name.trim()}.`
    );

  /* ── Success state ─────────────────────────────────────── */
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-obsidian">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full bg-volt/15 p-5"
          >
            <CheckCircle2 className="h-14 w-14 text-volt" />
          </motion.div>

          <h1 className="text-2xl font-black text-white">
            {lang === "ar" ? "تم استلام طلبك!" : "Order Confirmed!"}
          </h1>

          <div className="glass w-full rounded-2xl p-6">
            <span className="text-[11px] font-black tracking-widest text-white/45 uppercase">
              {lang === "ar" ? "رقم الطلب" : "Order Number"}
            </span>
            <p
              className="mt-1 text-3xl font-black text-volt text-glow-volt"
              dir="ltr"
            >
              {placedOrder}
            </p>

            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-start text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-white/50">
                  {lang === "ar" ? "الاسم" : "Name"}
                </span>
                <span className="font-bold text-white/90">{name.trim()}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/50">
                  {lang === "ar" ? "الهاتف" : "Phone"}
                </span>
                <span className="font-bold text-white/90" dir="ltr">
                  {phone.trim()}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/50">
                  {lang === "ar" ? "المحافظة" : "Governorate"}
                </span>
                <span className="font-bold text-white/90">
                  {governorate ? t(governorate.label, lang) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/50">
                  {lang === "ar" ? "طريقة الدفع" : "Payment"}
                </span>
                <span className="font-bold text-white/90">{paymentLabel}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-white/50">
                  {lang === "ar" ? "الإجمالي" : "Total"}
                </span>
                <span className="font-black text-volt">{formatJOD(total)}</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
              {lang === "ar"
                ? "بتوصلك مكالمة تأكيد من جير تيك خلال دقائق — والدفع عند الاستلام عند بابك."
                : "GearTech will call you to confirm within minutes — pay cash at your door."}
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${followUpMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-6 py-3.5 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
          >
            {lang === "ar"
              ? "تابع الطلب عبر الواتساب"
              : "Follow up on WhatsApp"}
            <Zap className="h-4 w-4" />
          </a>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-black text-white/55 hover:text-volt"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {lang === "ar" ? "رجوع للمتجر" : "Back to store"}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Empty cart ────────────────────────────────────────── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian">
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-5 px-4 text-center">
          <div className="glass rounded-full p-6">
            <ShoppingBag className="h-12 w-12 text-white/25" />
          </div>
          <h1 className="text-xl font-black text-white">
            {lang === "ar" ? "سلتك فاضية" : "Your cart is empty"}
          </h1>
          <p className="max-w-sm text-sm text-white/55">
            {lang === "ar"
              ? "ما في طلب بدون منتجات — اختر إكسسوارك وارجع لهون."
              : "An order needs gear — pick your accessory and come back."}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-volt px-6 py-3 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
          >
            {lang === "ar" ? "تسوّق الآن" : "Shop Now"}
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  /* ── Checkout ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="border-b border-white/10 bg-carbon/60">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-white/50">
          <Link href="/" className="font-bold hover:text-volt">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="font-bold text-white/85">
            {lang === "ar" ? "إتمام الطلب" : "Checkout"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-black text-white sm:text-3xl">
          {lang === "ar" ? "إتمام الطلب" : "Checkout"}
        </h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* ── Form ──────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Contact */}
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-volt uppercase">
                <Truck className="h-4 w-4" />
                {lang === "ar" ? "بيانات التوصيل" : "Delivery Details"}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/65">
                    {lang === "ar" ? "الاسم الكامل *" : "Full Name *"}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder={
                      lang === "ar" ? "مثال: أحمد الخطيب" : "e.g. Ahmad Al-Khateeb"
                    }
                    className={cn(
                      "rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none",
                      errors.name
                        ? "border-racing focus:border-racing"
                        : "border-white/15 focus:border-volt"
                    )}
                  />
                  {errors.name && (
                    <span className="text-[11px] font-bold text-racing">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/65">
                    {lang === "ar" ? "رقم الهاتف *" : "Phone Number *"}
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d]/g, ""));
                      if (errors.phone)
                        setErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    placeholder="07XXXXXXXX"
                    className={cn(
                      "rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none",
                      errors.phone
                        ? "border-racing focus:border-racing"
                        : "border-white/15 focus:border-volt"
                    )}
                  />
                  {errors.phone && (
                    <span className="text-[11px] font-bold text-racing">
                      {errors.phone}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/65">
                    {lang === "ar"
                      ? "رقم بديل (اختياري)"
                      : "Alternate Phone (optional)"}
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    value={altPhone}
                    onChange={(e) => {
                      setAltPhone(e.target.value.replace(/[^\d]/g, ""));
                      if (errors.altPhone)
                        setErrors((p) => ({ ...p, altPhone: undefined }));
                    }}
                    placeholder="07XXXXXXXX"
                    className={cn(
                      "rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none",
                      errors.altPhone
                        ? "border-racing focus:border-racing"
                        : "border-white/15 focus:border-volt"
                    )}
                  />
                  {errors.altPhone && (
                    <span className="text-[11px] font-bold text-racing">
                      {errors.altPhone}
                    </span>
                  )}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/65">
                    {lang === "ar" ? "المحافظة *" : "Governorate *"}
                  </span>
                  <select
                    value={governorateId}
                    onChange={(e) => {
                      setGovernorateId(e.target.value);
                      if (errors.governorate)
                        setErrors((p) => ({ ...p, governorate: undefined }));
                    }}
                    className={cn(
                      "rounded-xl border bg-white/5 px-4 py-3 text-sm text-white focus:outline-none",
                      errors.governorate
                        ? "border-racing"
                        : "border-white/15 focus:border-volt",
                      !governorateId && "text-white/40"
                    )}
                  >
                    <option value="" className="bg-carbon text-white">
                      {lang === "ar" ? "اختر المحافظة" : "Select governorate"}
                    </option>
                    {GOVERNORATES.map((g) => (
                      <option
                        key={g.id}
                        value={g.id}
                        className="bg-carbon text-white"
                      >
                        {t(g.label, lang)} —{" "}
                        {lang === "ar"
                          ? g.deliveryFee === 0
                            ? "توصيل مجاني"
                            : `التوصيل ${formatJOD(g.deliveryFee)}`
                          : g.deliveryFee === 0
                            ? "free delivery"
                            : `delivery ${formatJOD(g.deliveryFee)}`}
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <span className="text-[11px] font-bold text-racing">
                      {errors.governorate}
                    </span>
                  )}
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/65">
                  {lang === "ar" ? "العنوان بالتفصيل *" : "Full Address *"}
                </span>
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address)
                      setErrors((p) => ({ ...p, address: undefined }));
                  }}
                  rows={3}
                  placeholder={
                    lang === "ar"
                      ? "الشارع، رقم العمارة، الدور، أقرب إشارة"
                      : "Street, building number, floor, nearest landmark"
                  }
                  className={cn(
                    "rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none",
                    errors.address
                      ? "border-racing focus:border-racing"
                      : "border-white/15 focus:border-volt"
                  )}
                />
                {errors.address && (
                  <span className="text-[11px] font-bold text-racing">
                    {errors.address}
                  </span>
                )}
              </label>

              <label className="mt-4 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/65">
                  {lang === "ar" ? "ملاحظات (اختياري)" : "Notes (optional)"}
                </span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "مثال: اتصل قبل التوصيل بنص ساعة"
                      : "e.g. Call me 30 min before delivery"
                  }
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-volt focus:outline-none"
                />
              </label>
            </section>

            {/* Payment */}
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black tracking-widest text-volt uppercase">
                <Wallet className="h-4 w-4" />
                {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPayment("cod")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-all",
                    payment === "cod"
                      ? "border-volt bg-volt/10 glow-volt"
                      : "border-white/15 bg-white/5 hover:border-volt/40"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <Wallet
                      className={cn(
                        "h-5 w-5",
                        payment === "cod" ? "text-volt" : "text-white/50"
                      )}
                    />
                    {payment === "cod" && (
                      <CheckCircle2 className="h-4.5 w-4.5 text-volt" />
                    )}
                  </span>
                  <span className="text-sm font-black text-white">
                    {lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
                  </span>
                  <span className="text-[11px] text-white/55">
                    {lang === "ar"
                      ? "ادفع كاش للمندوب عند وصول الطلب"
                      : "Pay the courier in cash at your door"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayment("cliq")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-all",
                    payment === "cliq"
                      ? "border-volt bg-volt/10 glow-volt"
                      : "border-white/15 bg-white/5 hover:border-volt/40"
                  )}
                >
                  <span className="flex w-full items-center justify-between">
                    <Zap
                      className={cn(
                        "h-5 w-5",
                        payment === "cliq" ? "text-volt" : "text-white/50"
                      )}
                    />
                    {payment === "cliq" && (
                      <CheckCircle2 className="h-4.5 w-4.5 text-volt" />
                    )}
                  </span>
                  <span className="text-sm font-black text-white">
                    {lang === "ar"
                      ? "تحويل CliQ فوري"
                      : "CliQ Instant Transfer"}
                  </span>
                  <span className="text-[11px] text-white/55">
                    {lang === "ar"
                      ? "حوّل فوراً وأرسل الإثبات"
                      : "Transfer now and send proof"}
                  </span>
                </button>
              </div>

              <AnimatePresence>
                {payment === "cliq" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 rounded-xl border border-volt/30 bg-volt/5 p-4 text-xs leading-relaxed text-white/75">
                      <p className="mb-2 font-black text-volt">
                        {lang === "ar"
                          ? "تعليمات التحويل عبر CliQ"
                          : "CliQ Transfer Instructions"}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-white/55">
                            {lang === "ar" ? "اسم المستلم" : "Recipient name"}
                          </span>
                          <span className="font-black text-white">
                            {BRAND.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-white/55">IBAN</span>
                          <span
                            className="font-black text-white"
                            dir="ltr"
                          >
                            JO94 CBJO 0010 0000 0000 0131 0003 02
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-white/55">
                            {lang === "ar" ? "المبلغ" : "Amount"}
                          </span>
                          <span className="font-black text-volt">
                            {formatJOD(total)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 rounded-lg bg-racing/15 p-2.5 font-bold text-racing">
                        {lang === "ar"
                          ? "بعد التحويل أرسل صورة الإيصال عبر الواتساب لتفعيل الطلب."
                          : "After transferring, send the screenshot via WhatsApp to confirm the order."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {placeError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {placeError}
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-volt px-6 py-4 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
              >
                <CheckCircle2 className="h-4.5 w-4.5" />
                {lang === "ar" ? "تأكيد الطلب" : "Place Order"}
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-volt/50 px-6 py-4 text-sm font-black text-volt transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
              >
                <Zap className="h-4.5 w-4.5" />
                {lang === "ar"
                  ? "طلب سريع عبر الواتساب"
                  : "Quick Order via WhatsApp"}
              </button>
            </div>

            <p className="text-center text-[11px] text-white/40">
              {lang === "ar"
                ? "بتأكيدك للطلب توافق على التواصل معك لتأكيد التوصيل — بدون أي دفع مسبق إلا عند الاستلام."
                : "Placing the order lets us contact you to confirm delivery — no payment upfront unless you choose CliQ."}
            </p>
          </div>

          {/* ── Order summary ─────────────────────────────── */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="glass rounded-2xl p-5">
              <h2 className="mb-4 flex items-center justify-between text-sm font-black tracking-widest text-volt uppercase">
                <span>
                  {lang === "ar" ? "ملخص الطلب" : "Order Summary"}
                </span>
                <span className="text-[11px] text-white/45 normal-case">
                  {lang === "ar" ? `${itemTotal} قطعة` : `${itemTotal} items`}
                </span>
              </h2>

              <ul className="flex flex-col gap-3">
                {cart.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={t(item.title, lang)}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="line-clamp-2 text-xs font-bold text-white">
                        {t(item.title, lang)}
                      </span>
                      <span className="text-[11px] font-black text-volt">
                        {formatJOD(item.price)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQty(item.productId, item.qty - 1)
                          }
                          aria-label="−"
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15 text-white/70 hover:border-volt hover:text-volt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQty(item.productId, item.qty + 1)
                          }
                          aria-label="+"
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15 text-white/70 hover:border-volt hover:text-volt"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label={
                            lang === "ar" ? "حذف المنتج" : "Remove item"
                          }
                          className="ms-auto flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:text-racing"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-xs font-black text-white/85"
                      dir="ltr"
                    >
                      {formatJOD(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-white/55">
                    {lang === "ar" ? "المجموع" : "Subtotal"}
                  </span>
                  <span className="font-bold text-white/90">
                    {formatJOD(subtotal)}
                  </span>
                </div>

                {bundle && discountAmount > 0 && (
                  <div className="flex justify-between gap-3 text-racing">
                    <span className="font-bold">
                      {lang === "ar"
                        ? `خصم ${bundle.name.ar}`
                        : `Discount ${bundle.name.en}`}
                    </span>
                    <span className="font-black">
                      -{formatJOD(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="text-white/55">
                    {lang === "ar" ? "التوصيل" : "Delivery"}
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      deliveryFee === 0 ? "text-volt" : "text-white/90"
                    )}
                  >
                    {deliveryFee === 0
                      ? lang === "ar"
                        ? "مجاني"
                        : "Free"
                      : formatJOD(deliveryFee)}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <span className="text-sm font-black text-white">
                    {lang === "ar" ? "الإجمالي" : "Total"}
                  </span>
                  <span className="text-lg font-black text-volt text-glow-volt">
                    {formatJOD(total)}
                  </span>
                </div>
              </div>

              {/* Free delivery progress */}
              <div className="mt-4 rounded-xl border border-volt/25 bg-volt/5 p-3">
                {freeDeliveryUnlocked ? (
                  <p className="flex items-center gap-2 text-[11px] font-black text-volt">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {lang === "ar"
                      ? "التوصيل مجاني على هذا الطلب!"
                      : "Free delivery unlocked on this order!"}
                  </p>
                ) : (
                  <>
                    <p className="mb-2 text-[11px] font-bold text-white/70">
                      {lang === "ar"
                        ? `زود ${formatJOD(
                            toFreeDelivery
                          )} وخد التوصيل مجاني`
                        : `Add ${formatJOD(
                            toFreeDelivery
                          )} more to unlock free delivery`}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-volt transition-all duration-500"
                        style={{ width: `${freeDeliveryPct}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-white/40">
                      {lang === "ar"
                        ? `التوصيل مجاني فوق ${formatJOD(
                            FREE_DELIVERY_THRESHOLD
                          )}`
                        : `Free delivery over ${formatJOD(
                            FREE_DELIVERY_THRESHOLD
                          )}`}
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-6 py-3.5 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95 lg:hidden"
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              {lang === "ar"
                ? `تأكيد الطلب — ${formatJOD(total)}`
                : `Place Order — ${formatJOD(total)}`}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
