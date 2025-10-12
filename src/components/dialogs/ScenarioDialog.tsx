import { useState } from 'react';
import { Download, User, Building2, Calendar, Package, DollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { StandardDialog } from '../StandardDialog';
import { ScenarioSummary } from '../../types/domain';
import { formatPrice } from '../../utils/formatters';
import { api } from '../../utils/api';
import { downloadPDF } from '../../utils/pdfHelpers';

interface ScenarioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ScenarioSummary | null;
}

export function ScenarioDialog({ isOpen, onClose, scenario }: ScenarioDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load full scenario data when dialog opens
  useState(() => {
    if (isOpen && scenario && !scenarioData && !isLoadingData) {
      setIsLoadingData(true);
      api.getScenarioData(scenario.scenarioId)
        .then(data => {
          setScenarioData(data);
        })
        .catch(error => {
          console.error('Failed to load scenario data:', error);
        })
        .finally(() => {
          setIsLoadingData(false);
        });
    }
  });

  // Reset data when dialog closes
  if (!isOpen && scenarioData) {
    setScenarioData(null);
  }

  if (!isOpen || !scenario) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      console.log('Downloading PDF for scenario:', scenario.scenarioId);
      
      // Get the full scenario data from the database
      const fullScenarioData = scenarioData || await api.getScenarioData(scenario.scenarioId);
      
      if (!fullScenarioData) {
        alert('Scenario data not found. Cannot generate PDF.');
        return;
      }

      // Load current configurations for PDF display
      const configDefinitions = await api.loadConfigurations();
      
      // Prepare PDF data
      const pdfData = {
        config: fullScenarioData.config,
        legacyConfig: fullScenarioData.config,
        configDefinitions: configDefinitions.filter(config => config.is_active),
        selectedItems: fullScenarioData.selectedItems,
        categories: fullScenarioData.categories,
        globalDiscount: fullScenarioData.globalDiscount,
        globalDiscountType: fullScenarioData.globalDiscountType,
        globalDiscountApplication: fullScenarioData.globalDiscountApplication,
        summary: fullScenarioData.summary
      };
      
      // Generate and download the PDF
      downloadPDF(pdfData);
      
      console.log('✅ PDF downloaded successfully for scenario:', scenario.scenarioId);
    } catch (error) {
      console.error('❌ Failed to download PDF for scenario:', scenario.scenarioId, error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract data from loaded scenario
  const selectedItems = scenarioData?.selectedItems || [];
  const config = scenarioData?.config || {};
  const summary = scenarioData?.summary || scenario || {};
  
  // Get pricing values
  const oneTimeTotal = summary.oneTimeTotal || scenario.oneTimeTotal || 0;
  const monthlyTotal = summary.monthlyTotal || scenario.monthlyTotal || 0;
  const yearlyTotal = summary.yearlyTotal || (monthlyTotal * 12) || 0;
  const totalProjectCost = scenario.totalProjectCost || (oneTimeTotal + yearlyTotal) || 0;

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>Scenario Details</span>
          {scenario.submissionCode && (
            <Badge variant="outline" className="font-mono">
              {scenario.submissionCode}
            </Badge>
          )}
        </div>
      }
      description={`Created on ${formatDate(scenario.createdAt)}`}
      size="lg"
      primaryAction={{
        label: isDownloading ? 'Generating...' : 'Download PDF',
        onClick: handleDownloadPDF,
        loading: isDownloading,
        icon: <Download className="h-4 w-4" />
      }}
    >
          <div className="space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Client Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                  <p className="font-medium">{scenario.clientName || config.clientName || 'Unknown Client'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Name</p>
                  <p className="font-medium">{scenario.projectName || config.projectName || 'Untitled Project'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Prepared By</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {scenario.preparedBy || config.preparedBy || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Created</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {new Date(scenario.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Client Configuration */}
            {config && Object.keys(config).length > 0 && (
              <>
                <div>
                  <h3 className="font-semibold mb-4">Client Configuration</h3>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    {config.debitCards > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Debit Cards</p>
                        <p className="font-medium">{config.debitCards.toLocaleString()}</p>
                      </div>
                    )}
                    {config.creditCards > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Credit Cards</p>
                        <p className="font-medium">{config.creditCards.toLocaleString()}</p>
                      </div>
                    )}
                    {config.monthlyAuthorizations > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Authorizations</p>
                        <p className="font-medium">{config.monthlyAuthorizations.toLocaleString()}</p>
                      </div>
                    )}
                    {config.monthlySettlements > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Settlements</p>
                        <p className="font-medium">{config.monthlySettlements.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Selected Services */}
            {isLoadingData ? (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Selected Services
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                  Loading services...
                </div>
              </div>
            ) : selectedItems.length > 0 ? (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Selected Services ({selectedItems.length})
                </h3>
                <div className="space-y-2">
                  {selectedItems.map((item: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.item?.name || item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatPrice(item.unitPrice || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice((item.quantity || 0) * (item.unitPrice || 0))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Selected Services
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Badge variant="outline">
                    {scenario.itemCount} items
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Service details not available in summary view
                  </p>
                </div>
              </div>
            )}

            <Separator />

            {/* Fee Summary */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Fee Summary
              </h3>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">One-time Cost:</span>
                  <span className="font-semibold">{formatPrice(oneTimeTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Cost:</span>
                  <span className="font-semibold">{formatPrice(monthlyTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yearly Cost:</span>
                  <span className="font-semibold">{formatPrice(yearlyTotal)}</span>
                </div>
                
                {scenario.globalDiscount && scenario.globalDiscount > 0 && scenario.globalDiscountApplication !== 'none' && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount Applied:</span>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-xs">
                          {scenario.globalDiscountType === 'percentage' 
                            ? `${scenario.globalDiscount}%` 
                            : formatPrice(scenario.globalDiscount)
                          }
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {scenario.globalDiscountApplication === 'both' ? 'Both' :
                           scenario.globalDiscountApplication === 'monthly' ? 'Monthly' :
                           scenario.globalDiscountApplication === 'onetime' ? 'One-time' :
                           'None'}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Project Cost:</span>
                  <span className="font-bold text-primary">
                    {formatPrice(totalProjectCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
    </StandardDialog>
  );
}
