import { memo } from 'react';
import { PricingItemCard } from './PricingItemCard';
import { PricingItem, SelectedItem } from '../../../types/domain';

interface PricingItemCardMemoProps {
  item: PricingItem;
  selectedItem?: SelectedItem;
  onAddItem: (item: PricingItem, quantity: number) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem?: (item: PricingItem) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export const PricingItemCardMemo = memo<PricingItemCardMemoProps>(
  function PricingItemCardMemo({
    item,
    selectedItem,
    onAddItem,
    onUpdateQuantity,
    onRemoveItem,
    onEditItem,
    isSelected = false,
    showActions = true,
  }) {
    return (
      <PricingItemCard
        item={item}
        selectedItem={selectedItem}
        onAddItem={onAddItem}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
        onEditItem={onEditItem}
        isSelected={isSelected}
        showActions={showActions}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.name === nextProps.item.name &&
      prevProps.item.defaultPrice === nextProps.item.defaultPrice &&
      prevProps.item.pricingType === nextProps.item.pricingType &&
      prevProps.item.categoryId === nextProps.item.categoryId &&
      prevProps.item.isActive === nextProps.item.isActive &&
      prevProps.item.isArchived === nextProps.item.isArchived &&
      prevProps.selectedItem?.quantity === nextProps.selectedItem?.quantity &&
      prevProps.selectedItem?.unitPrice === nextProps.selectedItem?.unitPrice &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.showActions === nextProps.showActions
    );
  }
);
