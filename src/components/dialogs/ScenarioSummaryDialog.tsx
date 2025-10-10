import { StandardDialog } from "../StandardDialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import { DynamicClientConfig, SelectedItem, Category } from "../../types/pricing";
import { isOneTimeUnit } from "../../utils/unitClassification";

interface ScenarioSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioId: string;
  clientConfig: DynamicClientConfig;
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
  };
  selectedItems: SelectedItem[];
  categories: Category[];
  onDownloadPDF: () => void;
}

export function ScenarioSummaryDialog({
  open,
  onOpenChange,
  scenarioId,
  clientConfig,
  summary,
  selectedItems,
  categories,
  onDownloadPDF
}: ScenarioSummaryDialogProps) {
  const oneTimeItems = selectedItems.filter(item => 
    item.item.category === 'setup' || isOneTimeUnit(item.item.unit)
  );
  const monthlyItems = selectedItems.filter(item => 
    item.item.category !== 'setup' && !isOneTimeUnit(item.item.unit)
  );

  // Group items by category
  const groupedItems = selectedItems.reduce((acc, item) => {
    const category = item.item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <StandardDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title="Scenario Saved Successfully!"
      description="Your pricing scenario has been saved to the database."
      size="lg"
      secondaryActions={[
        {
          label: 'Close',
          onClick: () => onOpenChange(false)
        }
      ]}
      primaryAction={{
        label: 'Download PDF',
        onClick: () => {
          onDownloadPDF();
          onOpenChange(false);
        },
        icon: <Download className="h-4 w-4" />
      }}
    >

        <div className="space-y-4">
          {/* Scenario Details */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Scenario ID:</span>
                  <p className="font-mono text-xs break-all">{scenarioId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Client Name:</span>
                  <p>{clientConfig.clientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Project Name:</span>
                  <p>{clientConfig.projectName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Prepared By:</span>
                  <p>{clientConfig.preparedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Summary */}
          <div className="space-y-2">
            <h3 className="font-medium">Selected Services</h3>
            <Card>
              <CardContent className="pt-4 space-y-2">
                {Object.keys(groupedItems).length > 0 ? (
                  Object.entries(groupedItems).map(([categoryId, items]) => (
                    <div key={categoryId} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {getCategoryName(categoryId)}:
                      </span>
                      <span>{items.length} service{items.length !== 1 ? 's' : ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No services selected</p>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Services:</span>
                  <span>{selectedItems.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary */}
          <div className="space-y-2">
            <h3 className="font-medium">Cost Summary</h3>
            <Card className="bg-accent/50">
              <CardContent className="pt-4 space-y-3">
                {(summary.oneTimeTotal > 0 || oneTimeItems.length > 0) && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">One-time Total:</span>
                    <span className="font-medium">{formatPrice(summary.oneTimeTotal)}</span>
                  </div>
                )}
                
                {(summary.monthlyTotal > 0 || monthlyItems.length > 0) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Total:</span>
                      <span className="font-medium">{formatPrice(summary.monthlyTotal)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Yearly Total:</span>
                      <span className="font-medium">{formatPrice(summary.yearlyTotal)}</span>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Project Cost:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(summary.totalProjectCost)}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  One-time + First year costs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Download Options */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Ready to Download</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your scenario has been saved and is now available as a PDF report. 
                    The report will be generated with the latest data from the database.
                  </p>
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    💡 <strong>Tip:</strong> After downloading the HTML file, open it in your browser and use <strong>Print to PDF</strong> (Ctrl+P or Cmd+P) to save it as a PDF document.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </StandardDialog>
  );
}
