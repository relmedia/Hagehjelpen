import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type EngagementRow, formatCount } from "@/lib/analytics-shared";

/**
 * Nettsiden er én lang forside, så i stedet for «mest besøkte sider» viser vi
 * hvor langt ned folk kommer og hvilke verktøy de bruker. Andelen er av alle
 * besøkende i perioden, og søylen bak raden gjør trakten lett å lese.
 */
export function EngagementCard({
  title,
  description,
  emptyText,
  rows,
}: {
  readonly title: string;
  readonly description: string;
  readonly emptyText: string;
  readonly rows: EngagementRow[];
}) {
  return (
    <Card className="h-full gap-2">
      <CardHeader>
        <CardTitle className="font-normal">{title}</CardTitle>
        <p className="text-muted-foreground text-xs">{description}</p>
      </CardHeader>

      <CardContent className="px-0">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted-foreground text-sm">{emptyText}</p>
        ) : (
          <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
            <TableHeader className="[&_tr]:border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8" />
                <TableHead className="h-8 w-24 text-right font-normal">Besøkende</TableHead>
                <TableHead className="h-8 w-20 text-right font-normal">Andel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border/50">
              {rows.map((row) => (
                <TableRow className="hover:bg-transparent" key={row.label}>
                  <TableCell className="relative max-w-0 truncate py-3 font-medium">
                    <span
                      aria-hidden
                      className="bg-primary/10 absolute inset-y-1 left-0 rounded-sm"
                      style={{ width: `${Math.min(row.share, 1) * 100}%` }}
                    />
                    <span className="relative">{row.label}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.visitors)}</TableCell>
                  <TableCell className="text-right text-muted-foreground tabular-nums">
                    {(row.share * 100).toLocaleString("nb-NO", { maximumFractionDigits: 1 })} %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
