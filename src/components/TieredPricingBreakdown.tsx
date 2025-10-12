import { PricingItem, ClientConfig } from '../types/domain';
import { getEffectiveUnitPrice } from '../utils/tieredPricing';
import { formatPrice } from '../utils/formatters';
import { PRICING_TYPES } from '../config/database';

interface TieredPricingBreakdownProps {
  item: PricingItem;
  quantity: number;
  clientConfig: ClientConfig;
}

export function TieredPricingBreakdown({ item, quantity, clientConfig }: TieredPricingBreakdownProps) {
  if (item.pricingType !== PRICING_TYPES.TIERED || !item.tiers || item.tiers.length === 0 || quantity === 0) {
    return null;
  }

  const currentTierPrice = getEffectiveUnitPrice(item, quantity);
  const totalPrice = quantity * currentTierPrice;

  return (
    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600">📊</span>
        <span className="text-xs font-medium text-green-900">Volume Pricing Calculation</span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
          Current Tier Rate
        </span>
      </div>
      
      <div className="space-y-1 text-xs">
        {/* Simplified calculation display */}
        <div className="flex justify-between items-center text-green-800">
          <span>
            {quantity.toLocaleString()} × {formatPrice(currentTierPrice)} (current tier rate)
          </span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        
        {/* Summary row */}
        <div className="border-t border-green-300 pt-1 mt-2">
          <div className="flex justify-between items-center font-medium text-green-900">
            <span>Total Cost:</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
        
        {/* Enhanced savings indicator */}
        {(() => {
          const standardPrice = quantity * item.defaultPrice;
          const savings = standardPrice - totalPrice;
          const savingsPercentage = standardPrice > 0 ? (savings / standardPrice) * 100 : 0;
          
          if (savings > 0) {
            return (
              <div className="bg-green-100 border border-green-300 rounded-md px-2 py-1.5 mt-2">
                <div className="flex justify-between items-center text-xs text-green-600">
                  <span>💰 Volume Savings:</span>
                  <span className="font-medium">{formatPrice(savings)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-green-600 mt-0.5">
                  <span>Savings Rate:</span>
                  <span className="font-medium">{savingsPercentage.toFixed(1)}% off standard</span>
                </div>
                <div className="text-xs text-green-500 mt-1 text-center italic">
                  vs {formatPrice(item.defaultPrice)} standard rate
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
}