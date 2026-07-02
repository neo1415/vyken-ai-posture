import { LeadCaptureForm } from "./LeadCaptureForm";

type LeadCaptureCardProps = {
  publicToken: string;
  leadAlreadyCaptured: boolean;
};

export function LeadCaptureCard({
  publicToken,
  leadAlreadyCaptured,
}: LeadCaptureCardProps) {
  return (
    <LeadCaptureForm
      publicToken={publicToken}
      leadAlreadyCaptured={leadAlreadyCaptured}
    />
  );
}
