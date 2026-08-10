import type { QuotationStatus } from "@repo/database";
import { Badge } from "@repo/design-system/components/ui/badge";
import { quotationStatusTone, toneClass } from "../../lib/badges";
import { quotationStatusLabel } from "../lib/helpers";

export const QuotationStatusBadge = ({
  status,
}: {
  status: QuotationStatus;
}) => (
  <Badge className={toneClass(quotationStatusTone[status])} variant="outline">
    {quotationStatusLabel[status]}
  </Badge>
);
