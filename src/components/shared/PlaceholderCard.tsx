import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type PlaceholderCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function PlaceholderCard({
  title,
  description,
  children,
  className,
}: PlaceholderCardProps) {
  const titleId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <Card className={className} aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children ? <CardContent className="pt-0">{children}</CardContent> : null}
    </Card>
  );
}
