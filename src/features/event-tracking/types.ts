import type {
  AdminAuditAction,
  ClientCtaDestination,
  LeadEventType,
  PublicAssessmentEventAction,
  SourcePage,
} from "./constants";

export type SafeEventMetadata = Partial<
  Record<
    | "sourcePage"
    | "riskLevel"
    | "reportStatus"
    | "followUpInterest"
    | "ctaDestination"
    | "leadStatus"
    | "toolCount"
    | "unknownToolCount"
    | "hasNotSure"
    | "forceResend",
    string | number | boolean
  >
>;

export type TrackCtaClickInput = {
  publicToken: string;
  destination: ClientCtaDestination;
  sourcePage: SourcePage;
  ctaLabel?: string;
};

export type TrackPublicAssessmentEventInput = {
  publicToken: string;
  action: PublicAssessmentEventAction;
  metadata?: SafeEventMetadata;
};

export type TrackLeadEventInput = {
  leadId: string;
  eventType: LeadEventType;
  metadata?: SafeEventMetadata;
};

export type TrackAdminAuditEventInput = {
  action: AdminAuditAction;
  entityType: string;
  entityId?: string | null;
  metadata?: SafeEventMetadata;
};

export type EventTrackingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type RequestReportEmailActionState = EventTrackingActionState;
