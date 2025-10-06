import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import { PricingItemCard } from './PricingItemCard';
export const PricingItemCardMemo = memo(function PricingItemCardMemo({ item, selectedItem, onAddItem, onUpdateQuantity, onRemoveItem, onEditItem, isSelected = false, showActions = true, }) {
    return (_jsx(PricingItemCard, { item: item, selectedItem: selectedItem, onAddItem: onAddItem, onUpdateQuantity: onUpdateQuantity, onRemoveItem: onRemoveItem, onEditItem: onEditItem, isSelected: isSelected, showActions: showActions }));
}, (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (prevProps.item.id === nextProps.item.id &&
        prevProps.item.name === nextProps.item.name &&
        prevProps.item.defaultPrice === nextProps.item.defaultPrice &&
        prevProps.item.pricingType === nextProps.item.pricingType &&
        prevProps.item.categoryId === nextProps.item.categoryId &&
        prevProps.item.isActive === nextProps.item.isActive &&
        prevProps.item.isArchived === nextProps.item.isArchived &&
        prevProps.selectedItem?.quantity === nextProps.selectedItem?.quantity &&
        prevProps.selectedItem?.unitPrice === nextProps.selectedItem?.unitPrice &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.showActions === nextProps.showActions);
});
