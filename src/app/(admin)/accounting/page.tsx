import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounting</CardTitle>
        <CardDescription>Manage financial data and reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Accounting features coming soon.</p>
        </div>
      </CardContent>
    </Card>
  );
}
