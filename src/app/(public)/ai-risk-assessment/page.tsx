import { CompanyProfileWizard } from "@/features/company-profile/components/CompanyProfileWizard";
import { COMPANY_PROFILE_COPY } from "@/features/company-profile/constants";

export default function CompanyProfilePage() {
  return (
    <div className="vyken-grid-bg vyken-radial-glow relative -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 sm:py-10">
      <div className="relative mx-auto max-w-4xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {COMPANY_PROFILE_COPY.brandLabel}
          </p>
          <span className="vyken-pill">
            {COMPANY_PROFILE_COPY.freeToolLabel}
          </span>
        </header>

        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            {COMPANY_PROFILE_COPY.pageTitle}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
            {COMPANY_PROFILE_COPY.supportingCopy}
          </p>
        </div>

        <CompanyProfileWizard />
      </div>
    </div>
  );
}
