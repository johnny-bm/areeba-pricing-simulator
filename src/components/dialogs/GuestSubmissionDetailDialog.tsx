import { useState } from 'react';
import { Download, User, Mail, Phone, Building2, Calendar, Package, DollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { StandardDialog } from '../StandardDialog';
import { formatPrice } from '../../utils/formatters';
import { downloadPDF } from '../../utils/pdfHelpers';
import { api } from '../../utils/api';

interface GuestSubmissionDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any | null;
}

export function GuestSubmissionDetailDialog({ 
  isOpen, 
  onClose, 
  submission 
}: GuestSubmissionDetailDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !submission) return null;

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
      console.log('Downloading PDF for guest submission:', submission.id);
      
      // Get the full guest scenario data from the database
      const scenarioData = await api.getGuestScenarioData(submission.id);
      
      if (!scenarioData) {
        alert('Scenario data not found. Cannot generate PDF.');
        return;
      }

      // Load current configurations for PDF display
      const configDefinitions = await api.loadConfigurations();
      
      // Prepare PDF data
      const pdfData = {
        config: scenarioData.config,
        legacyConfig: scenarioData.config,
        configDefinitions: configDefinitions.filter(config => config.isActive),
        selectedItems: scenarioData.selectedItems,
        categories: scenarioData.categories,
        globalDiscount: scenarioData.globalDiscount,
        globalDiscountType: scenarioData.globalDiscountType,
        globalDiscountApplication: scenarioData.globalDiscountApplication,
        summary: scenarioData.summary
      };
      
      // Generate and download the PDF
      downloadPDF(pdfData);
      
      console.log('✅ PDF downloaded successfully for guest submission:', submission.id);
    } catch (error) {
      console.error('❌ Failed to download PDF for guest submission:', submission.id, error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract scenario data from the correct database structure (scenario_data with underscore)
  const scenarioData = submission.scenario_data || {};
  const summary = scenarioData.summary || {};
  const selectedItems = scenarioData.selectedItems || [];
  const config = scenarioData.config || {};
  
  // Get pricing from scenario_data.summary
  const oneTimeTotal = summary.oneTimeTotal || 0;
  const monthlyTotal = summary.monthlyTotal || 0;
  const yearlyTotal = summary.yearlyTotal || 0;
  const totalProjectCost = submission.total_price || summary.totalProjectCost || 0;

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span>Guest Submission Details</span>
          <Badge variant="outline" className="font-mono">
            {submission.submissionCode}
          </Badge>
        </div>
      }
      description={`Submitted on ${formatDate(submission.createdAt)}`}
      size="xl"
      primaryAction={{
        label: isDownloading ? 'Generating...' : 'Download PDF',
        onClick: handleDownloadPDF,
        loading: isDownloading,
        icon: <Download className="h-4 w-4" />
      }}
    >
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">
                    {submission.firstName} {submission.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    {submission.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {submission.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {submission.phoneNumber}
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
                    {config.clientName && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                        <p className="font-medium">{config.clientName}</p>
                      </div>
                    )}
                    {config.projectName && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Project Name</p>
                        <p className="font-medium">{config.projectName}</p>
                      </div>
                    )}
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