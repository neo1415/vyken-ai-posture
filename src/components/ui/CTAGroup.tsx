import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type CTAGroupAlignment = "left" | "center" | "right";

export type CTAGroupProps = {
  children: ReactNode;
  alignment?: CTAGroupAlignment;
  className?: string;
};

export function CTAGroup({
  children,
  alignment = "left",
  className,
}: CTAGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-3",
        alignment === "center" && "justify-center",
        alignment === "right" && "justify-end",
        className,
      )}
    >
      {children}
    </div>
  );
}
