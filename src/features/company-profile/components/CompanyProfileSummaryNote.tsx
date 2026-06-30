import { Card, CardContent } from "@/components/ui/Card";
import { COMPANY_PROFILE_COPY } from "@/features/company-profile/constants";

export function CompanyProfileSummaryNote() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6">
        <p className="text-foreground text-sm leading-relaxed">
          {COMPANY_PROFILE_COPY.supportingCopy}
        </p>
      </CardContent>
    </Card>
  );
}
