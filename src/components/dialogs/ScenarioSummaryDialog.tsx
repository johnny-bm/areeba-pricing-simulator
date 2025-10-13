import { StandardDialog } from "../StandardDialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { formatPrice } from "../../utils/formatters";
import { DynamicClientConfig, SelectedItem, Category } from "../../types/domain";
import { isOneTimeUnit } from "../../utils/unitClassification";
import { PdfGenerator } from "../../features/pdfBuilder/components/PdfGenerator";
import { useActiveTemplate } from "../../features/pdfBuilder/hooks/usePdfBuilder";

interface ScenarioSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioId: string;
  simulatorType: string;
  clientConfig: DynamicClientConfig;
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
  };
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'fixed';
  globalDiscountApplication?: 'none' | 'both' | 'monthly' | 'onetime';
}

export function ScenarioSummaryDialog({
  open,
  onOpenChange,
  scenarioId,
  simulatorType,
  clientConfig,
  summary,
  selectedItems,
  categories,
  globalDiscount = 0,
  globalDiscountType = 'percentage',
  globalDiscountApplication = 'none'
}: ScenarioSummaryDialogProps) {
  // Get active template for this simulator
  const { template, loading: templateLoading } = useActiveTemplate(simulatorType);
  
  const oneTimeItems = selectedItems.filter(item => 
    item.item.categoryId === 'setup' || isOneTimeUnit(item.item.unit)
  );
  const monthlyItems = selectedItems.filter(item => 
    item.item.categoryId !== 'setup' && !isOneTimeUnit(item.item.unit)
  );

  // Group items by category
  const groupedItems = selectedItems.reduce((acc, item) => {
    const category = item.item.categoryId;
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

          {/* PDF Generation */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h4 className="font-medium">Generate PDF</h4>
                  <p className="text-sm text-muted-foreground">
                    {template ? (
                      <>Using template: <strong>{template.template_name}</strong></>
                    ) : templateLoading ? (
                      'Loading template information...'
                    ) : (
                      'No template configured - using default PDF format'
                    )}
                  </p>
                </div>
              </div>
              
              {template ? (
                <PdfGenerator
                  simulatorType={simulatorType}
                  clientName={clientConfig.clientName}
                  projectName={clientConfig.projectName}
                  pricingData={{
                    selected_items: selectedItems,
                    categories: categories,
                    global_discount: globalDiscount,
                    global_discount_type: globalDiscountType,
                    global_discount_application: globalDiscountApplication,
                    summary: summary,
                    config: clientConfig
                  }}
                  onPdfGenerated={(url) => {
                    // // console.log('PDF generated successfully:', url);
                    onOpenChange(false);
                  }}
                  className="w-full"
                />
              ) : !templateLoading ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No PDF Template Configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There's no PDF template configured for this simulator. Create a template in the admin panel to generate professional PDFs.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      onOpenChange(false);
                      // Navigate to admin panel
                      window.open('/admin/pdf-builder/templates', '_blank');
                    }}
                  >
                    Create PDF Template
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading template information...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </StandardDialog>
  );
}
