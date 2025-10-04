import { PricingItem, PricingTier, SelectedItem, ClientConfig } from '../types/pricing';

export interface TierCalculationResult {
  totalPrice: number;
  activeTiers: {
    tierId: string;
    tierName: string;
    tierQuantity: number;
    tierUnitPrice: number;
    tierTotal: number;
  }[];
}

/**
 * Calculate the total price and breakdown for a tiered pricing item
 */
export function calculateTieredPrice(
  item: PricingItem,
  quantity: number
): TierCalculationResult {
  if (!item.tiers || item.tiers.length === 0 || item.pricingType !== 'tiered') {
    // Fallback to simple pricing
    return {
      totalPrice: item.defaultPrice * quantity,
      activeTiers: []
    };
  }

  // Sort tiers by minimum quantity
  const sortedTiers = [...item.tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  
  let remainingQuantity = quantity;
  let totalPrice = 0;
  const activeTiers: TierCalculationResult['activeTiers'] = [];

  // Process each tier
  for (const tier of sortedTiers) {
    if (remainingQuantity <= 0) break;

    // Check if this tier applies
    if (quantity >= tier.minQuantity) {
      // Calculate how much of this tier to use
      let tierQuantity = 0;
      
      if (tier.maxQuantity === null) {
        // Unlimited tier - use all remaining quantity
        tierQuantity = remainingQuantity;
      } else {
        // Limited tier - use up to the max for this tier
        const tierCapacity = tier.maxQuantity - tier.minQuantity + 1;
        tierQuantity = Math.min(remainingQuantity, tierCapacity);
      }

      if (tierQuantity > 0) {
        const tierTotal = tierQuantity * tier.unitPrice;
        totalPrice += tierTotal;
        remainingQuantity -= tierQuantity;

        activeTiers.push({
          tierId: tier.id,
          tierName: tier.name || 'Unnamed Tier',
          tierQuantity,
          tierUnitPrice: tier.unitPrice,
          tierTotal
        });
      }
    }
  }

  // If there's still remaining quantity, use the fallback price
  if (remainingQuantity > 0) {
    const fallbackTotal = remainingQuantity * item.defaultPrice;
    totalPrice += fallbackTotal;

    activeTiers.push({
      tierId: 'fallback',
      tierName: 'Fallback Rate',
      tierQuantity: remainingQuantity,
      tierUnitPrice: item.defaultPrice,
      tierTotal: fallbackTotal
    });
  }

  return {
    totalPrice,
    activeTiers
  };
}

/**
 * Get the effective unit price for a specific quantity (for display purposes)
 * For tiered pricing, returns the highest tier price that applies to the current quantity
 */
export function getEffectiveUnitPrice(item: PricingItem, quantity: number): number {
  if (item.pricingType !== 'tiered' || !item.tiers || item.tiers.length === 0) {
    return item.defaultPrice;
  }

  // For tiered pricing, return the price of the highest tier that applies
  // This gives users a better understanding of the actual tier pricing structure
  const sortedTiers = [...item.tiers].sort((a, b) => a.minQuantity - b.minQuantity);
  
  // Find the highest tier that applies to this quantity
  let applicableTier = null;
  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity) {
      if (tier.maxQuantity === null || tier.maxQuantity === undefined || quantity <= tier.maxQuantity) {
        applicableTier = tier;
      }
    }
  }
  
  // Return the price of the applicable tier, or fallback to default price
  return applicableTier ? applicableTier.unitPrice : item.defaultPrice;
}

/**
 * Get the average unit price for a specific quantity (for reporting purposes only)
 * This should NOT be used for display in the main UI as it can be misleading
 */
export function getAverageUnitPrice(item: PricingItem, quantity: number): number {
  if (item.pricingType !== 'tiered' || !item.tiers || item.tiers.length === 0) {
    return item.defaultPrice;
  }

  const result = calculateTieredPrice(item, quantity);
  return quantity > 0 ? result.totalPrice / quantity : item.defaultPrice;
}

/**
 * Format tier range for display
 */
export function formatTierRange(tier: PricingTier): string {
  if (tier.maxQuantity === null) {
    return `${tier.minQuantity.toLocaleString()}+`;
  } else {
    return `${tier.minQuantity.toLocaleString()} - ${tier.maxQuantity?.toLocaleString() || '∞'}`;
  }
}

/**
 * Get the best tier for a given quantity (for recommendations)
 */
export function getBestTierForQuantity(item: PricingItem, quantity: number): PricingTier | null {
  if (item.pricingType !== 'tiered' || !item.tiers || item.tiers.length === 0) {
    return null;
  }

  // Find the tier that applies to this quantity
  const applicableTiers = item.tiers.filter(tier => 
    quantity >= tier.minQuantity && 
    (tier.maxQuantity === null || tier.maxQuantity === undefined || quantity <= tier.maxQuantity)
  );

  if (applicableTiers.length === 0) {
    return null;
  }

  // Return the tier with the lowest unit price
  return applicableTiers.sort((a, b) => a.unitPrice - b.unitPrice)[0];
}

/**
 * Get the auto-calculated quantity based on client configuration
 * Simple system: sum the values from specified config fields
 */
export function getConfigBasedQuantity(item: PricingItem, config: ClientConfig): number {
  // Use normalized fields with fallback to legacy fields
  const quantityFields = item.quantitySourceFields || [];
  
  if (quantityFields.length > 0) {
    let totalQuantity = 0;
    
    for (const fieldName of quantityFields) {
      const configValue = config[fieldName];
      if (typeof configValue === 'number') {
        totalQuantity += configValue;
      } else if (typeof configValue === 'boolean') {
        totalQuantity += configValue ? 1 : 0;
      }
    }
    
    const multiplier = item.quantityMultiplier || 1;
    return Math.max(0, totalQuantity * multiplier);
  }
  
  // Default quantity if no config fields specified
  return 1;
}

/**
 * Get a human-readable description of which config fields drive the quantity
 */
export function getQuantitySourceDescription(item: PricingItem): string | null {
  const quantityFields = item.quantitySourceFields || [];
  
  if (quantityFields.length === 0) {
    return null;
  }

  const sourceDescriptions: Record<keyof ClientConfig, string> = {
    clientName: 'Client Name',
    projectName: 'Project Name', 
    preparedBy: 'Prepared By',
    hasDebitCards: 'Debit/Prepaid/Virtual Cards Enabled',
    hasCreditCards: 'Credit Cards Enabled',
    debitCards: 'Number of Debit/Prepaid/Virtual Cards',
    creditCards: 'Number of Credit Cards',
    monthlyAuthorizations: 'Monthly Authorizations',
    monthlySettlements: 'Monthly Settlements',
    monthly3DS: 'Monthly 3DS Transactions',
    monthlySMS: 'Monthly SMS Messages',
    monthlyNotifications: 'Monthly Notifications',
    monthlyDeliveries: 'Monthly Deliveries'
  };

  const descriptions = quantityFields.map(field => 
    sourceDescriptions[field] || `Dynamic Field (${field})`
  );
  
  const multiplier = item.quantityMultiplier || 1;
  const combinedDescription = descriptions.join(' + ');
  
  if (multiplier === 1) {
    return `Automatically calculated from: ${combinedDescription}`;
  } else {
    return `Automatically calculated from: (${combinedDescription}) × ${multiplier}`;
  }
}

/**
 * Check if a tier's breakdown should reference config values
 */
export function getTierConfigContext(tier: PricingTier, config: ClientConfig): string | null {
  if (!tier.configReference) {
    return null;
  }

  const configValue = config[tier.configReference];
  const sourceDescriptions: Record<keyof ClientConfig, string> = {
    clientName: 'Client Name',
    projectName: 'Project Name', 
    preparedBy: 'Prepared By',
    hasDebitCards: 'Debit/Prepaid/Virtual Cards',
    hasCreditCards: 'Credit Cards',
    debitCards: 'Debit/Prepaid/Virtual Cards',
    creditCards: 'Credit Cards',
    monthlyAuthorizations: 'Authorizations/month',
    monthlySettlements: 'Settlements/month',
    monthly3DS: '3DS Transactions/month',
    monthlySMS: 'SMS Messages/month',
    monthlyNotifications: 'Notifications/month',
    monthlyDeliveries: 'Deliveries/month'
  };

  const description = sourceDescriptions[tier.configReference];
  
  if (typeof configValue === 'number') {
    return `Based on ${description}: ${configValue.toLocaleString()}`;
  }
  
  if (typeof configValue === 'boolean') {
    return `Based on ${description}: ${configValue ? 'Enabled' : 'Disabled'}`;
  }
  
  return `Based on ${description}`;
}