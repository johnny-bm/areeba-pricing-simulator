// Example: React component pattern
// This shows how to structure React components in Clean Architecture

import React from 'react';
import { PricingItem } from '@/core/domain/pricing/entities/PricingItem';
import { Money } from '@/core/domain/pricing/value-objects/Money';

interface PricingCardProps {
  item: PricingItem;
  onUpdate?: (item: PricingItem) => void;
  onDelete?: (itemId: string) => void;
  editable?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  item,
  onUpdate,
  onDelete,
  editable = false
}) => {
  const handlePriceChange = (newPrice: number) => {
    if (onUpdate) {
      const updatedItem = item.updatePrice(new Money(newPrice, item.basePrice.currency));
      onUpdate(updatedItem);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (onUpdate) {
      const updatedItem = item.updateQuantity(new Quantity(newQuantity, item.quantity.unit));
      onUpdate(updatedItem);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id.value);
    }
  };

  return (
    <div className="pricing-card">
      <div className="pricing-card__header">
        <h3 className="pricing-card__title">{item.name}</h3>
        {editable && (
          <button 
            className="pricing-card__delete"
            onClick={handleDelete}
            aria-label="Delete item"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="pricing-card__content">
        <div className="pricing-card__field">
          <label>Base Price</label>
          {editable ? (
            <input
              type="number"
              value={item.basePrice.amount}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              min="0"
              step="0.01"
            />
          ) : (
            <span>{item.basePrice.amount} {item.basePrice.currency}</span>
          )}
        </div>
        
        <div className="pricing-card__field">
          <label>Quantity</label>
          {editable ? (
            <input
              type="number"
              value={item.quantity.value}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              min="1"
            />
          ) : (
            <span>{item.quantity.value} {item.quantity.unit}</span>
          )}
        </div>
        
        <div className="pricing-card__total">
          <strong>Total: {item.total.amount} {item.total.currency}</strong>
        </div>
      </div>
    </div>
  );
};

// Example usage:
// <PricingCard
//   item={pricingItem}
//   onUpdate={handleItemUpdate}
//   onDelete={handleItemDelete}
//   editable={true}
// />
