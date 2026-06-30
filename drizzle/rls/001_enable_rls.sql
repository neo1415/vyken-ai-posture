-- Vyken AI Risk Assessment Hub — RLS baseline (Module 3)
-- Enables Row Level Security on all application tables.
-- No permissive anonymous policies are created in this module.
-- Server-side repositories use DATABASE_URL (direct Postgres) for controlled writes.
-- Supabase anon/authenticated policies will be added when auth and public read requirements are implemented.

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_profile_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_selected_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy posture (deferred to auth/server-route modules):
-- * No anonymous SELECT on leads, reports, answers, scores, signals, findings, recommendations, admin tables.
-- * Public read for published tool data may be added in Module 4/6 with narrow USING clauses.
-- * Public INSERT only via validated server routes (not direct anon table access).
-- * Admin policies require authenticated admin role (Module: Admin Auth).
