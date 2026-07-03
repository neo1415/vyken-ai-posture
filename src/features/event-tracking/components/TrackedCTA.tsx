"use client";

import { useActionState, useTransition } from "react";

import {
  eventTrackingActionInitialState,
  trackCtaClickAction,
} from "@/features/event-tracking/actions";
import type {
  ClientCtaDestination,
  SourcePage,
} from "@/features/event-tracking/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type TrackedCTAProps = {
  publicToken: string;
  destination: ClientCtaDestination;
  sourcePage: SourcePage;
  label: string;
  variant?: "primary" | "secondary";
  className?: string;
  onAfterTrack?: () => void;
};

export function TrackedCTA({
  publicToken,
  destination,
  sourcePage,
  label,
  variant = "secondary",
  className,
  onAfterTrack,
}: TrackedCTAProps) {
  const [, formAction, isPending] = useActionState(
    trackCtaClickAction,
    eventTrackingActionInitialState,
  );
  const [isScrolling, startTransition] = useTransition();

  return (
    <form
      action={formAction}
      className={cn("inline-flex", className)}
      onSubmit={() => {
        if (onAfterTrack) {
          startTransition(() => {
            onAfterTrack();
          });
        }
      }}
    >
      <input type="hidden" name="publicToken" value={publicToken} />
      <input type="hidden" name="destination" value={destination} />
      <input type="hidden" name="sourcePage" value={sourcePage} />
      <input type="hidden" name="ctaLabel" value={label} />
      <Button
        type="submit"
        variant={variant}
        disabled={isPending || isScrolling}
      >
        {isPending ? "Sending…" : label}
      </Button>
    </form>
  );
}
