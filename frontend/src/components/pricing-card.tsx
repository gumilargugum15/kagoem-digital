import { Check } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types/api";

export function PricingCard({
  plan,
  currency = "IDR",
  monthlyEquivalent,
  selected = false,
  onSelect,
}: {
  plan: SubscriptionPlan;
  currency?: string;
  monthlyEquivalent?: string | null;
  selected?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
}) {
  const isCustom = plan.price === null;
  const ctaLabel =
    plan.cta_label ?? (isCustom ? "Hubungi Kami" : selected ? "Terpilih" : "Pilih Paket");

  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl border p-6 shadow-soft transition-all sm:p-8",
        selected && !isCustom
          ? "relative border-primary ring-2 ring-primary bg-card shadow-elegant"
          : plan.is_highlighted
            ? "relative border-primary bg-card shadow-elegant scale-[1.02]"
            : "border-border bg-card hover-lift",
      )}
    >
      {plan.is_highlighted && !selected && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary-bg rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-elegant">
          Paling Populer
        </span>
      )}
      {selected && !isCustom && (
        <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 gradient-primary-bg rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow-elegant">
          <Check className="h-3 w-3" /> Terpilih
        </span>
      )}

      <h3 className="font-display text-xl font-bold text-navy">{plan.name}</h3>
      {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}

      <div className="mt-5">
        {isCustom ? (
          <span className="font-display text-3xl font-extrabold text-navy">Custom</span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-extrabold text-navy">
              {formatCurrency(plan.price, currency)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {plan.billing_interval === "monthly" ? "bulan" : "tahun"}
            </span>
          </div>
        )}
        {monthlyEquivalent && (
          <p className="mt-1 text-xs text-muted-foreground">
            Setara {formatCurrency(monthlyEquivalent, currency)} / bulan
          </p>
        )}
      </div>

      {plan.plan_features && plan.plan_features.length > 0 && (
        <ul className="mt-6 flex-1 space-y-2.5 text-sm text-navy">
          {plan.plan_features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {feature.feature}
                {feature.value ? `: ${feature.value}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        onClick={() => onSelect?.(plan)}
        variant={selected || plan.is_highlighted ? "default" : "outline"}
        className="mt-8 w-full py-5"
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
