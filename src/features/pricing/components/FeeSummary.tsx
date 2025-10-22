import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { NumberInput } from '../../../components/NumberInput';
import { SelectedItem, Category, DynamicClientConfig } from '../../../types/domain';
import { formatPrice } from '../../../utils/formatters';
import { usePricingCalculation } from '../hooks/usePricingCalculation';
import { DISCOUNT_TYPES, DISCOUNT_APPLICATIONS } from '../constants';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../components/ui/collapsible';

interface FeeSummaryProps {
  selectedItems: SelectedItem[];
  categories: Category[];
  clientConfig: DynamicClientConfig;
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
  isGuestMode?: boolean;
  guestContactSubmitted?: boolean;
  onShowGuestContactForm?: () => void;
}

export function FeeSummary({ 
  selectedItems, 
  categories,
  clientConfig,
  onSubmit,
  isSubmitting = false,
  isGuestMode = false,
  guestContactSubmitted = false,
  onShowGuestContactForm
}: FeeSummaryProps) {
  const [showDiscountDetails, setShowDiscountDetails] = useState(false);
  
  const {
    summary,
    globalDiscount,
    globalDiscountType,
    globalDiscountApplication,
    updateGlobalDiscount,
    updateGlobalDiscountType,
    updateGlobalDiscountApplication,
  } = usePricingCalculation(selectedItems);

  const handleSubmit = async () => {
    if (onSubmit) {
      await onSubmit();
    }
  };

  const handleShowGuestContactForm = () => {
    if (onShowGuestContactForm) {
      onShowGuestContactForm();
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Global Discount Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Global Discount</Label>
              <Collapsible open={showDiscountDetails} onOpenChange={setShowDiscountDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    {showDiscountDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="discount-amount" className="text-xs">Amount</Label>
                <NumberInput
                  id="discount-amount"
                  value={globalDiscount}
                  onChange={(value) => updateGlobalDiscount(value)}
                  placeholder="0"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="discount-type" className="text-xs">Type</Label>
                <Select value={globalDiscountType} onValueChange={updateGlobalDiscountType}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DISCOUNT_TYPES.PERCENTAGE}>%</SelectItem>
                    <SelectItem value={DISCOUNT_TYPES.FIXED}>$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount-application" className="text-xs">Apply To</Label>
                <Select value={globalDiscountApplication} onValueChange={updateGlobalDiscountApplication}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DISCOUNT_APPLICATIONS.NONE}>None</SelectItem>
                    <SelectItem value={DISCOUNT_APPLICATIONS.BOTH}>Both</SelectItem>
                    <SelectItem value={DISCOUNT_APPLICATIONS.MONTHLY}>Monthly Only</SelectItem>
                    <SelectItem value={DISCOUNT_APPLICATIONS.ONETIME}>One-time Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">One-time Costs</span>
              <span className="text-sm font-mono">{formatPrice(summary.oneTimeTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Costs</span>
              <span className="text-sm font-mono">{formatPrice(summary.monthlyTotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Yearly Costs</span>
              <span className="text-sm font-mono">{formatPrice(summary.yearlyTotal)}</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Project Cost (Year 1)</span>
              <span className="font-mono">{formatPrice(summary.totalProjectCost)}</span>
            </div>

            {summary.savings.totalSavings > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-green-800">
                  <span className="text-sm font-medium">Total Savings</span>
                  <span className="text-sm font-mono font-semibold">
                    {formatPrice(summary.savings.totalSavings)} ({summary.savings.savingsRate.toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isGuestMode && !guestContactSubmitted ? (
              <Button 
                onClick={handleShowGuestContactForm}
                className="flex-1"
                size="lg"
              >
                Get Quote
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quote'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
