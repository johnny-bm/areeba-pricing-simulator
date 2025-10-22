import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { NumberInput } from '../../../components/NumberInput';
import { PricingItem, SelectedItem } from '../../../types/domain';
import { formatPrice } from '../../../utils/formatters';
import { PRICING_TYPES } from '../constants';
import { Plus, Minus, Trash2, Edit } from 'lucide-react';

interface PricingItemCardProps {
  item: PricingItem;
  selectedItem?: SelectedItem;
  onAddItem: (item: PricingItem, quantity: number) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem?: (item: PricingItem) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export function PricingItemCard({
  item,
  selectedItem,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  isSelected = false,
  showActions = true,
}: PricingItemCardProps) {
  const [quantity, setQuantity] = useState(selectedItem?.quantity || 1);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (isSelected && selectedItem) {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleAddItem = () => {
    onAddItem(item, quantity);
  };

  const handleRemoveItem = () => {
    onRemoveItem(item.id);
  };

  const handleEditItem = () => {
    if (onEditItem) {
      onEditItem(item);
    }
  };

  const getPricingBadge = () => {
    if (item.pricingType === PRICING_TYPES.TIERED) {
      return <Badge variant="secondary" className="text-xs">📊 Volume Pricing</Badge>;
    }
    return null;
  };

  const getCategoryBadge = () => {
    const categoryColors: Record<string, string> = {
      setup: 'bg-blue-100 text-blue-800',
      hosting: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800',
      support: 'bg-orange-100 text-orange-800',
      integration: 'bg-pink-100 text-pink-800',
    };

    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${categoryColors[item.categoryId] || 'bg-gray-100 text-gray-800'}`}
      >
        {item.categoryId}
      </Badge>
    );
  };

  return (
    <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {item.name}
            </CardTitle>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {showActions && onEditItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditItem}
              className="h-6 w-6 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {getCategoryBadge()}
          {getPricingBadge()}
          {item.tags && item.tags.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {item.tags.length} tag{item.tags.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Pricing Display */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {formatPrice(item.defaultPrice)}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.pricingType === PRICING_TYPES.TIERED ? 'Starting from' : 'per unit'}
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Label className="text-xs">Quantity:</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <NumberInput
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                className="h-6 w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Total Price */}
          {isSelected && selectedItem && (
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Total:</span>
              <span className="font-mono">
                {formatPrice(selectedItem.quantity * selectedItem.unitPrice)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex gap-2">
              {isSelected ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveItem}
                  className="flex-1"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAddItem}
                  className="flex-1"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add to Quote
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
