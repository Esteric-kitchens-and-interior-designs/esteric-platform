import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Brand hex equivalents of the gold/charcoal design tokens
// (packages/design-system/styles/globals.css) — PDF rendering can't read
// CSS custom properties, so these are hardcoded approximations.
const GOLD = "#C9A24B";
const CHARCOAL = "#292520";
const MUTED = "#6b6459";
const BORDER = "#e5e0d8";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: CHARCOAL,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: GOLD,
    paddingBottom: 16,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 700,
    color: CHARCOAL,
  },
  companyMeta: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  quoteTitleBlock: {
    alignItems: "flex-end",
  },
  quoteNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: GOLD,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 1,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  table: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: CHARCOAL,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  colDescription: { width: "46%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnitPrice: { width: "21%", textAlign: "right" },
  colTotal: { width: "21%", textAlign: "right" },
  totalsBlock: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 3,
  },
  totalsLabel: { color: MUTED },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: GOLD,
  },
  grandTotalLabel: { fontSize: 12, fontWeight: 700, color: CHARCOAL },
  grandTotalValue: { fontSize: 12, fontWeight: 700, color: GOLD },
  terms: {
    marginTop: 24,
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
});

export interface QuotationPdfItem {
  description: string;
  quantity: number;
  total: number;
  unitPrice: number;
}

export interface QuotationPdfData {
  createdAt: string;
  currency: string;
  customerAddress?: string | null;
  customerEmail: string;
  customerName: string;
  discountAmount: number;
  items: QuotationPdfItem[];
  quoteNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  termsAndConditions?: string | null;
  title: string;
  total: number;
  validUntil?: string | null;
}

const money = (value: number, currency: string) =>
  `${currency} ${value.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const QuotationPdfDocument = ({ data }: { data: QuotationPdfData }) => (
  <Document
    author="Esteric Kitchens & Interior Designs Ltd"
    title={`${data.quoteNumber} - ${data.title}`}
  >
    <Page size="A4" style={styles.page}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.companyName}>
            Esteric Kitchens & Interior Designs Ltd
          </Text>
          <Text style={styles.companyMeta}>Nairobi, Kenya</Text>
          <Text style={styles.companyMeta}>info@ekiinteriors.com</Text>
        </View>
        <View style={styles.quoteTitleBlock}>
          <Text style={styles.quoteNumber}>{data.quoteNumber}</Text>
          <Text style={styles.companyMeta}>Quotation</Text>
          <Text style={styles.companyMeta}>{data.createdAt}</Text>
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={{ maxWidth: "60%" }}>
          <Text style={styles.sectionLabel}>Prepared for</Text>
          <Text>{data.customerName}</Text>
          <Text style={styles.companyMeta}>{data.customerEmail}</Text>
          {data.customerAddress ? (
            <Text style={styles.companyMeta}>{data.customerAddress}</Text>
          ) : null}
        </View>
        <View>
          <Text style={styles.sectionLabel}>Valid until</Text>
          <Text>{data.validUntil ?? "N/A"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Project</Text>
        <Text style={{ fontSize: 12, fontWeight: 700 }}>{data.title}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colDescription]}>
            Description
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnitPrice]}>
            Unit Price
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
        </View>
        {data.items.map((item, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: one-shot PDF render (react-pdf), not an interactive/reconciled list — items have no stable id at this stage
          <View key={`${item.description}-${index}`} style={styles.tableRow}>
            <Text style={styles.colDescription}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colUnitPrice}>
              {money(item.unitPrice, data.currency)}
            </Text>
            <Text style={styles.colTotal}>
              {money(item.total, data.currency)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsBlock}>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Subtotal</Text>
          <Text>{money(data.subtotal, data.currency)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Tax ({data.taxRate}%)</Text>
          <Text>{money(data.taxAmount, data.currency)}</Text>
        </View>
        <View style={styles.totalsRow}>
          <Text style={styles.totalsLabel}>Discount</Text>
          <Text>-{money(data.discountAmount, data.currency)}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>
            {money(data.total, data.currency)}
          </Text>
        </View>
      </View>

      {data.termsAndConditions ? (
        <View style={styles.terms}>
          <Text style={styles.sectionLabel}>Terms & Conditions</Text>
          <Text>{data.termsAndConditions}</Text>
        </View>
      ) : null}

      <Text fixed style={styles.footer}>
        Esteric Kitchens & Interior Designs Ltd — This quotation is valid until
        the date specified above unless otherwise agreed in writing.
      </Text>
    </Page>
  </Document>
);
