import { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { PricingTier, ClientConfig } from '../../../types/domain';
import { NumberInput } from '../../../components/NumberInput';

interface TieredPricingEditorProps {
  tiers: PricingTier[];
  unit: string;
  onUpdateTiers: (tiers: PricingTier[]) => void;
}

export function TieredPricingEditor({ tiers, unit, onUpdateTiers }: TieredPricingEditorProps) {
  const addTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Tier ${tiers.length + 1}`,
      minQuantity: tiers.length === 0 ? 1 : (tiers[tiers.length - 1].maxQuantity || 0) + 1,
      maxQuantity: null,
      unitPrice: 0,
      description: '',
      configReference: undefined
    };
    
    onUpdateTiers([...tiers, newTier]);
  };

  const updateTier = (tierId: string, updates: Partial<PricingTier>) => {
    const updatedTiers = tiers.map(tier =>
      tier.id === tierId ? { ...tier, ...updates } : tier
    );
    onUpdateTiers(updatedTiers);
  };

  const removeTier = (tierId: string) => {
    const updatedTiers = tiers.filter(tier => tier.id !== tierId);
    onUpdateTiers(updatedTiers);
  };

  const formatTierRange = (tier: PricingTier): string => {
    if (tier.maxQuantity === null) {
      return `${tier.minQuantity.toLocaleString()}+`;
    } else {
      return `${tier.minQuantity.toLocaleString()} - ${tier.maxQuantity.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Pricing Tiers *</Label>
      </div>
      
      {tiers.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
          No tiers defined. Click "Add Tier" to create volume-based pricing.
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <Card key={tier.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tier.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTierRange(tier)} {unit}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTier(tier.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Tier Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                        placeholder="Tier name"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Min Quantity</Label>
                      <NumberInput
                        value={tier.minQuantity}
                        onChange={(value) => updateTier(tier.id, { minQuantity: value })}
                        placeholder="1"
                        allowDecimals={false}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Quantity</Label>
                      <NumberInput
                        value={tier.maxQuantity || 0}
                        onChange={(value) => updateTier(tier.id, { maxQuantity: value === 0 ? null : value })}
                        placeholder="Unlimited"
                        allowDecimals={false}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <NumberInput
                        value={tier.unitPrice}
                        onChange={(value) => updateTier(tier.id, { unitPrice: value })}
                        placeholder="0.00"
                        allowDecimals={true}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button 
          type="button"
          size="sm" 
          onClick={addTier}
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tier
        </Button>
      </div>
    </div>
  );
}