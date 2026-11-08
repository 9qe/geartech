import { getGovernoratesWithRates, getStoreSettings } from "@/lib/catalog";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [govs, settings] = await Promise.all([getGovernoratesWithRates(), getStoreSettings()]);
  const governorates = govs.map((g) => ({
    id: g.id,
    label: g.name,
    deliveryFee: g.rate ? g.rate.feeFils / 1000 : 0,
  }));
  return (
    <CheckoutClient
      governorates={governorates}
      freeShippingThreshold={(settings.freeShippingThresholdFils ?? 25000) / 1000}
      whatsappNumber={settings.whatsappNumber ?? null}
      cliq={{
        alias: settings.cliqAlias ?? "",
        beneficiary: settings.cliqBeneficiary ?? "GearTech",
        iban: settings.cliqIban ?? "",
        instructions: settings.cliqInstructions ?? "",
      }}
    />
  );
}
