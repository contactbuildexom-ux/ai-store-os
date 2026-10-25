"use client";

import { useCallback, useEffect, useState } from "react";
import { isPublicPricingPlan, type PublicPricingPlan } from "@/lib/pricing-plan-catalog";

type PricingResponse = {
  plans: PublicPricingPlan[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function usePricingPlans() {
  const [plans, setPlans] = useState<PublicPricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const refresh = useCallback(() => setRefreshVersion((version) => version + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlans() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/pricing", {
          cache: "no-store",
          signal: controller.signal,
        });
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          throw new Error("The pricing service returned an invalid response.");
        }
        if (!response.ok) {
          throw new Error(
            isRecord(body) && typeof body.error === "string"
              ? body.error
              : "Unable to load pricing plans.",
          );
        }
        if (!isRecord(body) || !Array.isArray(body.plans) || !body.plans.every(isPublicPricingPlan)) {
          throw new Error("The pricing service returned invalid plan data.");
        }
        const result: PricingResponse = { plans: body.plans };
        setPlans(result.plans);
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unable to load pricing plans.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadPlans();
    return () => controller.abort();
  }, [refreshVersion]);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [refresh]);

  return { plans, loading, error, refresh };
}
