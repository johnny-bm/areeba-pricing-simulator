import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RefreshCw, Calendar, User, Building2, FileText, DollarSign, Download, Eye } from 'lucide-react';
import { ScenarioSummary } from '../types/domain';
import { formatPrice } from '../utils/formatters';
import { api } from '../utils/api';
import { downloadPDF } from '../utils/pdfHelpers';
import { ScenarioDialog } from './dialogs/ScenarioDialog';

interface ScenarioHistoryTabProps {
  scenarios: ScenarioSummary[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ScenarioHistoryTab({ scenarios, isLoading, onRefresh }: ScenarioHistoryTabProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSummary | null>(null);
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);

  const handleScenarioClick = (scenario: ScenarioSummary) => {
    setSelectedScenario(scenario);
    setShowScenarioDialog(true);
  };
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleDownloadPDF = async (scenarioId: string) => {
    try {
      
      // Get the full scenario data from the database
      const scenarioData = await api.getScenarioData(scenarioId);
      
      if (!scenarioData) {
        alert('Scenario data not found. Cannot generate PDF.');
        return;
      }

      // Load current configurations for PDF display
      const configDefinitions = await api.loadConfigurations();
      
      // Prepare PDF data (matching the format used in App.tsx)
      const pdfData = {
        config: {
          ...scenarioData.config,
          configValues: {} // Add missing configValues property
        },
        legacyConfig: scenarioData.config, // Use as legacy config for backward compatibility
        configDefinitions: configDefinitions.filter(config => config.is_active),
        selectedItems: scenarioData.selectedItems,
        categories: scenarioData.categories,
        globalDiscount: scenarioData.globalDiscount,
        globalDiscountType: scenarioData.globalDiscountType as 'percentage' | 'fixed',
        globalDiscountApplication: scenarioData.globalDiscountApplication as 'none' | 'both' | 'monthly' | 'onetime',
        summary: scenarioData.summary
      };
      
      // Generate and download the PDF
      downloadPDF(pdfData);

    } catch (error) {
      console.error('❌ Failed to download PDF for scenario:', scenarioId, error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Scenario History</h3>
          <Button onClick={onRefresh} size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Scenario History</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} saved
          </span>
          <Button onClick={onRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {scenarios.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No scenarios saved yet</h4>
            <p className="text-sm text-muted-foreground">
              Scenario data will appear here when users download PDFs from the pricing simulator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Client & Project</TableHead>
                  <TableHead>Prepared By</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>One-time Cost</TableHead>
                  <TableHead>Monthly Cost</TableHead>
                  <TableHead>Total Project Cost</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow 
                  key={scenario.scenarioId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleScenarioClick(scenario)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {scenario.clientName || 'Unknown Client'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scenario.projectName || 'Untitled Project'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {scenario.preparedBy || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateShort(scenario.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(scenario.createdAt).split(', ')[1]}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {scenario.itemCount} items
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(scenario.oneTimeTotal)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(scenario.monthlyTotal)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-primary">
                      {formatPrice(scenario.totalProjectCost)}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadPDF(scenario.scenarioId)}
                        title="Download PDF"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      )}

      <ScenarioDialog
        isOpen={showScenarioDialog}
        onClose={() => {
          setShowScenarioDialog(false);
          setSelectedScenario(null);
        }}
        scenario={selectedScenario}
      />
    </div>
  );
}