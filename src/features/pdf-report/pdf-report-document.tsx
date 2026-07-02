import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ReportContext } from "@/features/report-context/types";

import { PDF_BRAND, PDF_PAGE, PDF_REPORT_TITLE } from "./constants";
import {
  formatConfidenceLabel,
  formatEffortLabel,
  formatPdfDate,
  formatPriorityLabel,
  formatRiskLevelLabel,
  formatSeverityLabel,
  PDF_CONFIDENTIALITY_NOTE,
  PDF_PRIMARY_DISCLAIMER,
} from "./pdf-text";

const styles = StyleSheet.create({
  coverPage: {
    backgroundColor: PDF_BRAND.background,
    color: PDF_BRAND.text,
    padding: PDF_PAGE.margin,
    fontFamily: "Helvetica",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "100%",
  },
  page: {
    backgroundColor: "#ffffff",
    color: "#111827",
    paddingTop: PDF_PAGE.margin + PDF_PAGE.headerHeight,
    paddingBottom: PDF_PAGE.margin + PDF_PAGE.footerHeight,
    paddingHorizontal: PDF_PAGE.margin,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.45,
  },
  header: {
    position: "absolute",
    top: 24,
    left: PDF_PAGE.margin,
    right: PDF_PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.border,
    paddingBottom: 6,
  },
  headerBrand: {
    fontSize: 9,
    color: PDF_BRAND.primary,
    fontWeight: 700,
  },
  headerTitle: {
    fontSize: 9,
    color: "#64748b",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: PDF_PAGE.margin,
    right: PDF_PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
    fontSize: 8,
    color: "#64748b",
  },
  coverBrand: {
    fontSize: 12,
    color: PDF_BRAND.primary,
    letterSpacing: 2,
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 12,
  },
  coverCompany: {
    fontSize: 16,
    color: PDF_BRAND.muted,
    marginBottom: 24,
  },
  coverMeta: {
    fontSize: 11,
    color: PDF_BRAND.muted,
    marginBottom: 6,
  },
  coverNote: {
    marginTop: 32,
    fontSize: 10,
    color: PDF_BRAND.muted,
    maxWidth: 420,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: PDF_BRAND.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  paragraph: {
    marginBottom: 6,
    color: "#334155",
  },
  muted: {
    color: "#64748b",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    color: PDF_BRAND.primary,
  },
  bulletText: {
    flex: 1,
    color: "#334155",
  },
  chip: {
    fontSize: 9,
    color: PDF_BRAND.primary,
    marginBottom: 4,
  },
  scoreLarge: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
});

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function PageChrome({ companyName }: { companyName: string | null }) {
  return (
    <>
      <View style={styles.header} fixed>
        <Text style={styles.headerBrand}>Vyken Security</Text>
        <Text style={styles.headerTitle}>
          {companyName ?? "Assessment Report"}
        </Text>
      </View>
      <View style={styles.footer} fixed>
        <Text>{PDF_CONFIDENTIALITY_NOTE}</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

type PdfReportDocumentProps = {
  context: ReportContext;
};

export function PdfReportDocument({ context }: PdfReportDocumentProps) {
  const topFindings = context.findings
    .slice(0, 3)
    .map((finding) => finding.title);
  const generatedLabel = formatPdfDate(context.generatedAt);

  return (
    <Document title={PDF_REPORT_TITLE} author="Vyken Security">
      <Page size={PDF_PAGE.size} style={styles.coverPage}>
        <Text style={styles.coverBrand}>VYKEN SECURITY</Text>
        <Text style={styles.coverTitle}>{PDF_REPORT_TITLE}</Text>
        {context.company.companyName ? (
          <Text style={styles.coverCompany}>{context.company.companyName}</Text>
        ) : null}
        <Text style={styles.coverMeta}>Generated: {generatedLabel}</Text>
        <Text style={styles.coverMeta}>
          Overall risk:{" "}
          {formatRiskLevelLabel(context.riskSummary.overallRiskLevel)}
        </Text>
        <Text style={styles.coverMeta}>
          Confidence:{" "}
          {formatConfidenceLabel(context.riskSummary.confidenceLevel)}
        </Text>
        <Text style={styles.coverNote}>{PDF_CONFIDENTIALITY_NOTE}</Text>
      </Page>

      <Page size={PDF_PAGE.size} style={styles.page} wrap>
        <PageChrome companyName={context.company.companyName} />

        <View style={styles.section}>
          <SectionTitle title="Executive Summary" />
          <Text style={styles.scoreLarge}>
            {context.riskSummary.overallScore}/100 —{" "}
            {formatRiskLevelLabel(context.riskSummary.overallRiskLevel)} risk
          </Text>
          <Text style={styles.paragraph}>{context.riskSummary.headline}</Text>
          <Text style={styles.paragraph}>
            {context.riskSummary.explanation}
          </Text>
          {topFindings.length > 0 ? (
            <View style={{ marginTop: 6 }}>
              <Text style={[styles.paragraph, { fontWeight: 700 }]}>
                Top summary factors
              </Text>
              <BulletList items={topFindings} />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Company Context" />
          <Text style={styles.paragraph}>
            Industry: {context.company.industry}
          </Text>
          <Text style={styles.paragraph}>
            Company size: {context.company.companySize}
          </Text>
          <Text style={styles.paragraph}>
            Country/region: {context.company.countryRegion}
          </Text>
          <Text style={styles.paragraph}>
            Respondent role: {context.company.respondentRole}
          </Text>
          {context.company.departmentFunction ? (
            <Text style={styles.paragraph}>
              Department/function: {context.company.departmentFunction}
            </Text>
          ) : null}
          <Text style={styles.paragraph}>
            Sensitive/regulated data:{" "}
            {context.company.handlesSensitiveOrRegulatedData}
          </Text>
          <Text style={styles.paragraph}>Main AI concerns:</Text>
          <BulletList items={context.company.mainAiConcerns} />
        </View>

        <View style={styles.section}>
          <SectionTitle title="AI Tool Context" />
          <Text style={styles.paragraph}>
            Selected tools: {context.tools.toolCount}
          </Text>
          {context.tools.hasNotSureSelection ? (
            <Text style={styles.paragraph}>
              Includes a not-sure tool selection.
            </Text>
          ) : null}
          {context.tools.knownTools.map((tool) => (
            <View key={tool.slug} style={styles.card}>
              <Text style={styles.cardTitle}>{tool.name}</Text>
              <Text style={styles.muted}>
                {tool.category} · Profile confidence: {tool.profileConfidence}
              </Text>
            </View>
          ))}
          {context.tools.unknownTools.map((tool) => (
            <View
              key={`${tool.name}-${tool.url ?? "unknown"}`}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{tool.name}</Text>
              {tool.url ? <Text style={styles.muted}>{tool.url}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Risk Score Summary" />
          <Text style={styles.paragraph}>
            Overall score: {context.riskSummary.overallScore}/100
          </Text>
          <Text style={styles.paragraph}>
            Risk level:{" "}
            {formatRiskLevelLabel(context.riskSummary.overallRiskLevel)}
          </Text>
          <Text style={styles.paragraph}>
            Confidence:{" "}
            {formatConfidenceLabel(context.riskSummary.confidenceLevel)}
          </Text>
          <Text style={styles.paragraph}>
            Findings: {context.findings.length} · Recommendations:{" "}
            {context.recommendations.length}
          </Text>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Category Risk Breakdown" />
          {context.categoryScores.map((category) => (
            <View key={category.categoryId} style={styles.card}>
              <Text style={styles.cardTitle}>{category.label}</Text>
              <Text style={styles.chip}>
                {category.score}/100 ·{" "}
                {formatRiskLevelLabel(category.riskLevel)} risk
              </Text>
              <Text style={styles.paragraph}>{category.explanation}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Key Findings" />
          {context.findings.map((finding) => (
            <View key={finding.findingId} style={styles.card}>
              <Text style={styles.chip}>
                {formatSeverityLabel(finding.severity)} ·{" "}
                {formatConfidenceLabel(finding.confidence)}
              </Text>
              <Text style={styles.cardTitle}>{finding.title}</Text>
              <Text style={styles.paragraph}>{finding.summary}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Recommended Next Steps" />
          {context.recommendations.map((recommendation, index) => (
            <View key={recommendation.recommendationId} style={styles.card}>
              <Text style={styles.chip}>
                {formatPriorityLabel(recommendation.priority)} ·{" "}
                {formatEffortLabel(recommendation.effort)}
              </Text>
              <Text style={styles.cardTitle}>
                {index + 1}. {recommendation.title}
              </Text>
              <Text style={styles.paragraph}>{recommendation.summary}</Text>
              <Text style={[styles.paragraph, { fontWeight: 700 }]}>
                Implementation steps
              </Text>
              <BulletList items={recommendation.implementationSteps} />
              <Text style={[styles.paragraph, { fontWeight: 700 }]}>
                Why this matters
              </Text>
              <Text style={styles.paragraph}>
                {recommendation.whyThisMatters}
              </Text>
              {recommendation.caveats.length > 0 ? (
                <>
                  <Text style={[styles.paragraph, { fontWeight: 700 }]}>
                    Caveats
                  </Text>
                  <BulletList items={recommendation.caveats} />
                </>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Methodology" />
          <BulletList items={context.appendix.methodology} />
          <Text style={[styles.paragraph, { marginTop: 8, fontWeight: 700 }]}>
            Frameworks referenced
          </Text>
          <BulletList items={context.appendix.frameworksReferenced} />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Limitations and Caveats" />
          <Text style={styles.paragraph}>{PDF_PRIMARY_DISCLAIMER}</Text>
          <BulletList items={context.appendix.limitations} />
        </View>
      </Page>
    </Document>
  );
}
