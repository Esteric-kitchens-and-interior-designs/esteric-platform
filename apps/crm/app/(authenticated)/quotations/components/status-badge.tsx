import type { QuotationStatus } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { quotationStatusLabel, quotationStatusVariant } from "../lib/helpers";

export const QuotationStatusBadge = ({
  status,
}: {
  status: QuotationStatus;
}) => (
  <Badge variant={quotationStatusVariant[status]}>
    {quotationStatusLabel[status]}
  </Badge>
);
