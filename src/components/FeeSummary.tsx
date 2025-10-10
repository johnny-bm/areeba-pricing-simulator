import { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { NumberInput } from "./NumberInput";
import { SelectedItem, Category, DynamicClientConfig } from "../types/pricing";
import { formatPrice } from "../utils/formatters";
import { calculateTieredPrice, getQuantitySourceDescription } from "../utils/tieredPricing";
import { isOneTimeUnit } from "../utils/unitClassification";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ColorIndicator } from "./ui/color-indicator";

interface FeeSummaryProps {
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  globalDiscountApplication: 'none' | 'both' | 'monthly' | 'onetime';
  onGlobalDiscountChange: (discount: number) => void;
  onGlobalDiscountTypeChange: (type: 'percentage' | 'fixed') => void;
  onGlobalDiscountApplicationChange: (application: 'none' | 'both' | 'monthly' | 'onetime') => void;
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
  globalDiscount, 
  globalDiscountType,
  globalDiscountApplication,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onGlobalDiscountApplicationChange,
  clientConfig,
  onSubmit,
  isSubmitting = false,
  isGuestMode = false,
  guestContactSubmitted = false,
  onShowGuestContactForm
}: FeeSummaryProps) {

  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [showDiscountDetails, setShowDiscountDetails] = useState(false);


  const calculateRowTotal = (item: SelectedItem) => {
    if (item.isFree) return 0;
    
    // For tiered pricing items, use calculateTieredPrice to get the correct total
    let subtotal = 0;
    if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
      const tieredResult = calculateTieredPrice(item.item, item.quantity);
      subtotal = tieredResult.totalPrice;
    } else {
      subtotal = item.quantity * item.unitPrice;
    }
    
    const discountApplication = item.discountApplication || 'total';
    
    if (discountApplication === 'unit') {
      let effectiveUnitPrice = item.unitPrice;
      
      if (item.discountType === 'percentage') {
        effectiveUnitPrice = item.unitPrice * (1 - item.discount / 100);
      } else {
        effectiveUnitPrice = item.unitPrice - item.discount;
      }
      
      effectiveUnitPrice = Math.max(0, effectiveUnitPrice);
      return effectiveUnitPrice * item.quantity;
    } else {
      let discountAmount = 0;
      if (item.discountType === 'percentage') {
        discountAmount = subtotal * (item.discount / 100);
      } else {
        discountAmount = item.discount * item.quantity;
      }
      
      return Math.max(0, subtotal - discountAmount);
    }
  };

  const oneTimeItems = selectedItems.filter(item => 
    item.item.category === 'setup' || isOneTimeUnit(item.item.unit)
  );
  const monthlyItems = selectedItems.filter(item => 
    item.item.category !== 'setup' && !isOneTimeUnit(item.item.unit)
  );

  const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  
  let oneTimeFinal, monthlyFinal;
  
  if (globalDiscountApplication === 'none') {
    oneTimeFinal = oneTimeSubtotal;
    monthlyFinal = monthlySubtotal;
  } else if (globalDiscountApplication === 'both') {
    if (globalDiscountType === 'percentage') {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
      monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
    } else {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
      monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
    }
  } else if (globalDiscountApplication === 'monthly') {
    oneTimeFinal = oneTimeSubtotal;
    if (globalDiscountType === 'percentage') {
      monthlyFinal = Math.max(0, monthlySubtotal - (monthlySubtotal * (globalDiscount / 100)));
    } else {
      monthlyFinal = Math.max(0, monthlySubtotal - globalDiscount);
    }
  } else if (globalDiscountApplication === 'onetime') {
    monthlyFinal = monthlySubtotal;
    if (globalDiscountType === 'percentage') {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - (oneTimeSubtotal * (globalDiscount / 100)));
    } else {
      oneTimeFinal = Math.max(0, oneTimeSubtotal - globalDiscount);
    }
  } else {
    oneTimeFinal = oneTimeSubtotal;
    monthlyFinal = monthlySubtotal;
  }
  
  const yearlyFinal = monthlyFinal * 12;

  const rowDiscountTotal = selectedItems.reduce((sum, item) => {
    if (item.isFree) return sum;
    
    // Calculate before discount total using the same logic as calculateRowTotal
    let beforeDiscount = 0;
    if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
      const tieredResult = calculateTieredPrice(item.item, item.quantity);
      beforeDiscount = tieredResult.totalPrice;
    } else {
      beforeDiscount = item.quantity * item.unitPrice;
    }
    
    const afterDiscount = calculateRowTotal(item);
    return sum + (beforeDiscount - afterDiscount);
  }, 0);

  const totalSubtotal = oneTimeSubtotal + monthlySubtotal;
  
  let globalDiscountAmount = 0;
  if (globalDiscount > 0 && globalDiscountApplication !== 'none') {
    const oneTimeGlobalDiscount = oneTimeSubtotal - oneTimeFinal;
    const monthlyGlobalDiscount = monthlySubtotal - monthlyFinal;
    globalDiscountAmount = oneTimeGlobalDiscount + monthlyGlobalDiscount;
  }

  const totalDiscountAmount = rowDiscountTotal + globalDiscountAmount;

  const groupedItems = selectedItems.reduce((acc, item) => {
    if (!acc[item.item.category]) {
      acc[item.item.category] = [];
    }
    acc[item.item.category].push(item);
    return acc;
  }, {} as Record<string, SelectedItem[]>);

  const sortedCategories = categories
    .filter(cat => groupedItems[cat.id])
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const getCategoryTotal = (categoryId: string) => {
    const items = groupedItems[categoryId] || [];
    return items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  };

  // Calculate savings
  const totalOriginalPrice = selectedItems.reduce((sum, item) => {
    if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
      const tieredResult = calculateTieredPrice(item.item, item.quantity);
      return sum + tieredResult.totalPrice;
    } else {
      return sum + (item.quantity * item.unitPrice);
    }
  }, 0);
  
  const totalFinalPrice = oneTimeFinal + monthlyFinal;
  const totalSavings = totalOriginalPrice - totalFinalPrice;
  
  const freeSavings = selectedItems.reduce((sum, item) => {
    if (item.isFree) {
      if (item.item.pricingType === 'tiered' && item.item.tiers && item.item.tiers.length > 0) {
        const tieredResult = calculateTieredPrice(item.item, item.quantity);
        return sum + tieredResult.totalPrice;
      } else {
        return sum + (item.quantity * item.unitPrice);
      }
    }
    return sum;
  }, 0);
  
  const discountSavings = totalSavings - freeSavings;
  const savingsRate = totalOriginalPrice > 0 ? (totalSavings / totalOriginalPrice) * 100 : 0;

  return (
    <Card>
      <CardHeaderWithCollapse
        title="Fee Summary"
        description="Total costs and pricing breakdown"
        isCollapsed={false}
        onToggle={() => {}}
        showCollapseButton={false}
      />
      <CardContent className="space-y-3">
        {/* Global Discount Controls - Compact Version - Hidden in guest mode */}
        {!isGuestMode && (
          <>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Global Discount</h3>
              <div className="flex gap-2">
                <Select 
                  value={globalDiscountApplication} 
                  onValueChange={onGlobalDiscountApplicationChange}
                >
                  <SelectTrigger className="h-9 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="monthly">Monthly Only</SelectItem>
                    <SelectItem value="onetime">One-time Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <NumberInput
                  value={globalDiscount}
                  onChange={onGlobalDiscountChange}
                  min={0}
                  max={globalDiscountType === 'percentage' ? 100 : undefined}
                  step={globalDiscountType === 'percentage' ? 0.1 : 0.01}
                  placeholder="0"
                  className="h-9 w-24"
                  allowDecimals={true}
                  disabled={globalDiscountApplication === 'none'}
                />
                
                <Select 
                  value={globalDiscountType} 
                  onValueChange={onGlobalDiscountTypeChange}
                  disabled={globalDiscountApplication === 'none'}
                >
                  <SelectTrigger className="h-9 w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
          </>
        )}

        {/* Detailed breakdown with blur overlay for guests */}
        <div className={isGuestMode && !guestContactSubmitted ? 'relative' : ''}>
          {/* Collapsible Category Breakdown */}
          <Collapsible open={showCategoryBreakdown} onOpenChange={setShowCategoryBreakdown}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between py-2 hover:bg-muted/50 transition-colors rounded px-2">
                <h3 className="text-sm font-medium">Cost by Category</h3>
                {showCategoryBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 pb-2">
                {sortedCategories.map(category => {
                  const items = groupedItems[category.id];
                  if (!items || items.length === 0) return null;
                  
                  const categoryTotal = getCategoryTotal(category.id);
                  const freeItemsCount = items.filter(item => item.isFree).length;
                  
                  return (
                    <div key={category.id} className="flex justify-between items-center text-sm px-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ColorIndicator 
                          color={category.color}
                          size="sm"
                        />
                        <span className="text-xs">
                          {category.name} ({items.length}
                          {!isGuestMode && freeItemsCount > 0 && <span className="text-emerald-600 ml-1">· {freeItemsCount} free</span>})
                        </span>
                      </div>
                      <span className={`text-xs ${!isGuestMode && categoryTotal === 0 && freeItemsCount > 0 ? "text-emerald-600" : ""}`}>
                        {formatPrice(categoryTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Discount Breakdown - Collapsible - Hidden in guest mode */}
          {!isGuestMode && totalDiscountAmount > 0 && (
            <>
              <Collapsible open={showDiscountDetails} onOpenChange={setShowDiscountDetails}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between py-2 hover:bg-muted/50 transition-colors rounded px-2">
                    <h3 className="text-sm font-medium">Discount Details</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-destructive">-{formatPrice(totalDiscountAmount)}</span>
                      {showDiscountDetails ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 pb-2 px-2">
                    {rowDiscountTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">Service Discounts</span>
                        <span className="text-destructive text-xs">-{formatPrice(rowDiscountTotal)}</span>
                      </div>
                    )}
                    {globalDiscount > 0 && globalDiscountApplication !== 'none' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground text-xs">
                          Global ({globalDiscountType === 'percentage' ? `${globalDiscount}%` : formatPrice(globalDiscount)})
                        </span>
                        <span className="text-destructive text-xs">-{formatPrice(globalDiscountAmount)}</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Separator />
            </>
          )}

          {/* Simplified Savings Summary - Single Row - Hidden in guest mode */}
          {!isGuestMode && totalSavings > 0 && (
            <>
              <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-200 dark:border-emerald-800">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">
                  💰 Total Savings ({savingsRate.toFixed(1)}% off)
                </span>
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {formatPrice(totalSavings)}
                </span>
              </div>
              
              <Separator />
            </>
          )}

          {/* Final Totals - Compact */}
          <div className="space-y-2">
            {(oneTimeFinal > 0 || oneTimeItems.length > 0) && (
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">One-time Total</span>
                <span className={`text-sm font-medium ${!isGuestMode && oneTimeFinal === 0 ? 'text-emerald-600' : ''}`}>
                  {formatPrice(oneTimeFinal)}
                  {!isGuestMode && oneTimeFinal === 0 && oneTimeItems.some(item => item.isFree) && 
                    <span className="text-xs ml-1">(free)</span>
                  }
                </span>
              </div>
            )}
            
            {(monthlyFinal > 0 || monthlyItems.length > 0) && (
              <div className="flex justify-between items-center p-2 bg-primary/5 rounded">
                <span className="text-sm font-medium">Monthly Total</span>
                <span className={`text-sm font-medium ${!isGuestMode && monthlyFinal === 0 ? 'text-emerald-600' : ''}`}>
                  {formatPrice(monthlyFinal)}
                  {!isGuestMode && monthlyFinal === 0 && monthlyItems.some(item => item.isFree) && 
                    <span className="text-xs ml-1">(free)</span>
                  }
                </span>
              </div>
            )}
            
            {(monthlyFinal > 0 || monthlyItems.length > 0) && (
              <div className="flex justify-between items-center p-2 bg-primary/10 rounded">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Yearly Total</span>
                  <span className="text-xs text-muted-foreground">Monthly × 12</span>
                </div>
                <span className={`font-bold ${!isGuestMode && yearlyFinal === 0 ? 'text-emerald-600' : 'text-primary'}`}>
                  {formatPrice(yearlyFinal)}
                  {!isGuestMode && yearlyFinal === 0 && monthlyItems.some(item => item.isFree) && 
                    <span className="text-xs ml-1">(free)</span>
                  }
                </span>
              </div>
            )}
          </div>
          
          {/* Guest mode blur overlay */}
          {isGuestMode && !guestContactSubmitted && (
            <div className="absolute inset-0 backdrop-blur-md bg-background/30 dark:bg-background/30 flex items-center justify-center rounded-lg">
              <Button 
                size="lg"
                onClick={onShowGuestContactForm}
                className="shadow-lg"
              >
                View Full Pricing Details
              </Button>
            </div>
          )}
        </div>

        {/* Summary Card - Always visible, even for guests */}
        <Card className="p-2 bg-accent">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Total Project Cost</span>
              <div className="text-xs text-muted-foreground">One-time + First year</div>
            </div>
            <span className={`font-bold ${!isGuestMode && oneTimeFinal + yearlyFinal === 0 ? 'text-emerald-600' : ''}`}>
              {formatPrice(oneTimeFinal + yearlyFinal)}
              {!isGuestMode && oneTimeFinal + yearlyFinal === 0 && selectedItems.some(item => item.isFree) && 
                <span className="text-xs ml-1">(free)</span>
              }
            </span>
          </div>
        </Card>

        {/* Submit Button */}
        {selectedItems.length > 0 && onSubmit && (
          <>
            <Separator />
            <Button 
              onClick={onSubmit}
              disabled={
                isSubmitting || 
                !clientConfig.clientName || 
                !clientConfig.projectName || 
                (!isGuestMode && !clientConfig.preparedBy)
              }
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving Scenario...' : 'Submit & Generate Report'}
            </Button>
            {(!clientConfig.clientName || !clientConfig.projectName || (!isGuestMode && !clientConfig.preparedBy)) && (
              <p className="text-xs text-orange-600 dark:text-orange-400 text-center">
                {isGuestMode 
                  ? 'Please fill in Client Name and Project Name fields to submit'
                  : 'Please fill in Client Name, Project Name, and Prepared By fields to submit'
                }
              </p>
            )}
          </>
        )}

        {/* Compact Legal Disclaimer */}
        <div className="p-2 bg-muted/30 rounded text-xs text-muted-foreground">
          <p className="font-medium mb-0.5">Disclaimer</p>
          <p className="text-[10px] leading-relaxed">
            Pricing is for information only and may change. Final pricing depends on requirements and contracts. Not a binding offer. Contact your areeba representative for confirmed pricing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
