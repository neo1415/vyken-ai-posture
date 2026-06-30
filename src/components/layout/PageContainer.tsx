import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
};

const sizeClasses = {
  default: "max-w-5xl",
  wide: "max-w-6xl",
  narrow: "max-w-3xl",
} as const;

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
