import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type AdminForbiddenProps = {
  title?: string;
  description?: string;
};

export function AdminForbidden({
  title = "Access restricted",
  description = "Your admin account can view this area but cannot perform this action.",
}: AdminForbiddenProps) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/admin/leads" className="text-primary text-sm font-medium">
          ← Back to leads
        </Link>
      </CardContent>
    </Card>
  );
}
