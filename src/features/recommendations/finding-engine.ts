import type {
  AssessmentScoringResult,
  RiskSignal,
} from "@/features/scoring/types";

import {
  AGENTIC_CODING_SIGNAL_IDS,
  CRITICAL_DATA_SIGNAL_IDS,
  DECISION_IMPACT_SIGNAL_IDS,
  GOVERNANCE_SIGNAL_IDS,
  HIGH_DATA_SIGNAL_IDS,
  VISIBILITY_SIGNAL_IDS,
  VENDOR_SIGNAL_IDS,
} from "./constants";
import type {
  AssessmentFinding,
  FindingCategoryId,
  FindingConfidence,
  FindingSeverity,
} from "./types";

function severityRank(sev: FindingSeverity): number {
  if (sev === "critical") return 4;
  if (sev === "high") return 3;
  if (sev === "medium") return 2;
  return 1;
}

function maxSeverity(a: FindingSeverity, b: FindingSeverity): FindingSeverity {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function signalToFindingSeverity(
  severity: RiskSignal["severity"],
): FindingSeverity {
  return severity;
}

function signalsForIds(
  signals: RiskSignal[],
  ids: readonly string[],
): RiskSignal[] {
  const idSet = new Set(ids);
  return signals.filter((s) => idSet.has(s.signalId));
}

function minSignalConfidence(signals: RiskSignal[]): FindingConfidence {
  if (signals.length === 0) return "medium";
  const ranks = signals.map((s) =>
    s.confidence === "high" ? 3 : s.confidence === "medium" ? 2 : 1,
  );
  const min = Math.min(...ranks);
  if (min <= 1) return "low";
  if (min === 2) return "medium";
  return "high";
}

function buildFinding(input: {
  findingId: string;
  categoryId: FindingCategoryId;
  title: string;
  summary: string;
  signals: RiskSignal[];
}): AssessmentFinding | null {
  if (input.signals.length === 0) return null;

  const severity = input.signals.reduce<FindingSeverity>(
    (acc, s) => maxSeverity(acc, signalToFindingSeverity(s.severity)),
    "low",
  );

  const evidence = [...new Set(input.signals.flatMap((s) => s.evidence))].slice(
    0,
    8,
  );

  return {
    findingId: input.findingId,
    categoryId: input.categoryId,
    severity,
    title: input.title,
    summary: input.summary,
    sourceSignalIds: input.signals.map((s) => s.signalId),
    evidence,
    confidence: minSignalConfidence(input.signals),
  };
}

export function generateFindings(
  scoringResult: AssessmentScoringResult,
): AssessmentFinding[] {
  const { signals } = scoringResult;
  const findings: AssessmentFinding[] = [];

  const visibilitySignals = signalsForIds(signals, VISIBILITY_SIGNAL_IDS);
  const criticalDataSignals = signalsForIds(signals, CRITICAL_DATA_SIGNAL_IDS);
  const highDataSignals = signalsForIds(signals, HIGH_DATA_SIGNAL_IDS).filter(
    (s) => !criticalDataSignals.some((c) => c.signalId === s.signalId),
  );
  const generalDataSignals = signals.filter(
    (s) =>
      s.categoryId === "data_exposure" &&
      !criticalDataSignals.some((c) => c.signalId === s.signalId) &&
      !highDataSignals.some((h) => h.signalId === s.signalId),
  );
  const governanceSignals = signalsForIds(signals, GOVERNANCE_SIGNAL_IDS);
  const vendorSignals = signalsForIds(signals, VENDOR_SIGNAL_IDS);
  const agenticSignals = signalsForIds(signals, AGENTIC_CODING_SIGNAL_IDS);
  const decisionSignals = signalsForIds(signals, DECISION_IMPACT_SIGNAL_IDS);

  const visibilityFinding = buildFinding({
    findingId: "finding_visibility_inventory_gap",
    categoryId: "visibility_and_inventory",
    title: "AI tool visibility appears limited",
    summary:
      "Based on the provided answers, the organization may have limited inventory, logging, or investigation capability for AI tool usage.",
    signals: visibilitySignals,
  });
  if (visibilityFinding) findings.push(visibilityFinding);

  const criticalDataFinding = buildFinding({
    findingId: "finding_critical_data_exposure",
    categoryId: "data_exposure",
    title: "Critical sensitive data exposure may be possible",
    summary:
      "Signals suggest highly sensitive data types (such as secrets, health, or identity data) may enter AI tools and should be validated internally.",
    signals: criticalDataSignals,
  });
  if (criticalDataFinding) findings.push(criticalDataFinding);

  const highDataFinding = buildFinding({
    findingId: "finding_high_data_exposure",
    categoryId: "data_exposure",
    title: "Sensitive data exposure may be possible",
    summary:
      "Answers suggest customer, employee, financial, legal, or claims data may enter AI tools without consistent guardrails.",
    signals: highDataSignals,
  });
  if (highDataFinding) findings.push(highDataFinding);

  const generalDataFinding = buildFinding({
    findingId: "finding_general_data_exposure",
    categoryId: "data_exposure",
    title: "Data exposure through AI workflows may be present",
    summary:
      "File uploads, transcripts, or other data-handling patterns may increase exposure scope in AI tools.",
    signals: generalDataSignals,
  });
  if (generalDataFinding) findings.push(generalDataFinding);

  const governanceFinding = buildFinding({
    findingId: "finding_governance_gaps",
    categoryId: "governance_controls",
    title: "AI governance controls may be incomplete",
    summary:
      "Policy, ownership, sensitive-data rules, or approved-tool clarity may be limited based on the provided answers.",
    signals: governanceSignals,
  });
  if (governanceFinding) findings.push(governanceFinding);

  const vendorFinding = buildFinding({
    findingId: "finding_vendor_tool_risk",
    categoryId: "vendor_and_tool_risk",
    title: "Vendor and tool risk factors may be present",
    summary:
      "Selected or unknown tools, profile confidence, and vendor review gaps may increase uncertainty about controls and data handling.",
    signals: vendorSignals,
  });
  if (vendorFinding) findings.push(vendorFinding);

  const agenticFinding = buildFinding({
    findingId: "finding_agentic_coding_risk",
    categoryId: "agentic_and_coding_risk",
    title: "Developer or agentic AI risk may be elevated",
    summary:
      "Coding assistants, repository access, connected tools, or command execution may expand the blast radius if controls are weak.",
    signals: agenticSignals,
  });
  if (agenticFinding) findings.push(agenticFinding);

  const decisionFinding = buildFinding({
    findingId: "finding_decision_impact_risk",
    categoryId: "decision_impact_risk",
    title: "AI-assisted decisions may need stronger review",
    summary:
      "AI outputs may influence people-impacting or regulated decisions where human review and boundaries should be validated internally.",
    signals: decisionSignals,
  });
  if (decisionFinding) findings.push(decisionFinding);

  return findings;
}
