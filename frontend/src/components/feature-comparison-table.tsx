import { Check, X } from "lucide-react";
import type { SubscriptionPlan } from "@/types/api";

function limitLabel(value: number | null): string {
  if (value === null) return "Unlimited";
  return String(value);
}

export function FeatureComparisonTable({ plans }: { plans: SubscriptionPlan[] }) {
  if (plans.length === 0) return null;

  const showLimits = plans.some(
    (p) => p.max_users !== null || p.max_branches !== null || p.max_products !== null,
  );

  const featureNames = Array.from(
    new Set(plans.flatMap((p) => (p.plan_features ?? []).map((f) => f.feature))),
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-3 font-semibold text-navy">Feature</th>
            {plans.map((plan) => (
              <th key={plan.id} className="px-4 py-3 text-center font-semibold text-navy">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showLimits && (
            <>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">Users</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-navy">
                    {limitLabel(plan.max_users)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">Branches</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-navy">
                    {limitLabel(plan.max_branches)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">Products</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-3 text-center text-navy">
                    {limitLabel(plan.max_products)}
                  </td>
                ))}
              </tr>
            </>
          )}
          {featureNames.map((name) => (
            <tr key={name} className="border-t border-border">
              <td className="px-4 py-3 text-muted-foreground">{name}</td>
              {plans.map((plan) => {
                const feature = plan.plan_features?.find((f) => f.feature === name);
                return (
                  <td key={plan.id} className="px-4 py-3 text-center">
                    {feature ? (
                      feature.value ? (
                        <span className="text-navy">{feature.value}</span>
                      ) : (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      )
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
