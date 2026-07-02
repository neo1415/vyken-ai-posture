import type { AnswerMap, SelectedToolContext } from "./types";

/**
 * Determines whether the agentic/coding section should be shown and required.
 * Pure function — safe for client preview and server revalidation.
 */
export function isAgenticSectionRequired(
  toolContext: SelectedToolContext,
  answers: AnswerMap,
): boolean {
  if (toolContext.categorySlugs.includes("coding_assistant")) {
    return true;
  }
  if (toolContext.categorySlugs.includes("automation_agent")) {
    return true;
  }
  if (toolContext.codingAssistantRelevance) {
    return true;
  }
  if (toolContext.agenticOrConnectedRelevance) {
    return true;
  }

  const mainTasks = answers.main_ai_tasks;
  if (Array.isArray(mainTasks)) {
    if (mainTasks.includes("coding")) {
      return true;
    }
    if (mainTasks.includes("workflow_automation")) {
      return true;
    }
  }

  const dataEntering = answers.data_entering_ai;
  if (Array.isArray(dataEntering)) {
    if (dataEntering.includes("source_code")) {
      return true;
    }
    if (dataEntering.includes("logs")) {
      return true;
    }
    if (dataEntering.includes("api_keys_secrets_tokens")) {
      return true;
    }
  }

  const devWorkflows = answers.developer_workflows_involved;
  if (devWorkflows === "yes" || devWorkflows === "sometimes") {
    return true;
  }

  return false;
}

export function getActiveSectionIds(
  toolContext: SelectedToolContext,
  answers: AnswerMap,
): string[] {
  const base = [
    "usage_context",
    "data_exposure",
    "governance_controls",
    "visibility_auditability",
  ];
  if (isAgenticSectionRequired(toolContext, answers)) {
    return [...base, "agentic_coding"];
  }
  return base;
}
