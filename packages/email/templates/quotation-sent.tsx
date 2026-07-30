import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface QuotationSentTemplateProps {
  readonly currency: string;
  readonly customerName: string;
  readonly pdfUrl: string;
  readonly quoteNumber: string;
  readonly title: string;
  readonly total: string;
  readonly validUntil?: string;
}

export const QuotationSentTemplate = ({
  customerName,
  quoteNumber,
  title,
  total,
  currency,
  validUntil,
  pdfUrl,
}: QuotationSentTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>
        Your quotation {quoteNumber} from Esteric Kitchens & Interior Designs
      </Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-1 font-semibold text-2xl text-zinc-950">
                Quotation {quoteNumber}
              </Text>
              <Text className="m-0 text-zinc-500">
                Dear {customerName}, thank you for the opportunity. Please find
                your quotation for &ldquo;{title}&rdquo; attached below.
              </Text>
              <Hr className="my-4" />
              <Text className="m-0 text-zinc-950">
                <strong>Total:</strong> {currency} {total}
              </Text>
              {validUntil ? (
                <Text className="m-0 text-zinc-500">
                  Valid until {validUntil}
                </Text>
              ) : null}
              <Section className="mt-6">
                <Button
                  className="rounded-md bg-zinc-950 px-5 py-3 text-center font-medium text-sm text-white"
                  href={pdfUrl}
                >
                  View quotation PDF
                </Button>
              </Section>
              <Hr className="my-4" />
              <Text className="m-0 text-xs text-zinc-400">
                Esteric Kitchens & Interior Designs Ltd
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

QuotationSentTemplate.PreviewProps = {
  customerName: "Jane Wanjiru",
  quoteNumber: "Q-2026-0001",
  title: "Modern Kitchen Remodel",
  total: "450,000.00",
  currency: "KES",
  validUntil: "31 Aug 2026",
  pdfUrl: "https://example.com/quotation.pdf",
};

export default QuotationSentTemplate;
