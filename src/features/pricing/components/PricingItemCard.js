import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Label } from '../../../shared/components/ui/label';
import { NumberInput } from '../../../components/NumberInput';
import { formatPrice } from '../../../utils/formatters';
import { PRICING_TYPES } from '../constants';
import { Plus, Minus, Trash2, Edit } from 'lucide-react';
export function PricingItemCard({ item, selectedItem, onAddItem, onUpdateQuantity, onRemoveItem, onEditItem, isSelected = false, showActions = true, }) {
    const [quantity, setQuantity] = useState(selectedItem?.quantity || 1);
    const handleQuantityChange = (newQuantity) => {
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
            return _jsx(Badge, { variant: "secondary", className: "text-xs", children: "\uD83D\uDCCA Volume Pricing" });
        }
        return null;
    };
    const getCategoryBadge = () => {
        const categoryColors = {
            setup: 'bg-blue-100 text-blue-800',
            hosting: 'bg-green-100 text-green-800',
            processing: 'bg-purple-100 text-purple-800',
            support: 'bg-orange-100 text-orange-800',
            integration: 'bg-pink-100 text-pink-800',
        };
        return (_jsx(Badge, { variant: "outline", className: `text-xs ${categoryColors[item.categoryId] || 'bg-gray-100 text-gray-800'}`, children: item.categoryId }));
    };
    return (_jsxs(Card, { className: `transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(CardTitle, { className: "text-sm font-medium line-clamp-2", children: item.name }), item.description && (_jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: item.description }))] }), showActions && onEditItem && (_jsx(Button, { variant: "ghost", size: "sm", onClick: handleEditItem, className: "h-6 w-6 p-0", children: _jsx(Edit, { className: "h-3 w-3" }) }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [getCategoryBadge(), getPricingBadge(), item.tags && item.tags.length > 0 && (_jsxs(Badge, { variant: "outline", className: "text-xs", children: [item.tags.length, " tag", item.tags.length !== 1 ? 's' : ''] }))] })] }), _jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-lg font-semibold", children: formatPrice(item.defaultPrice) }), _jsx("span", { className: "text-xs text-muted-foreground", children: item.pricingType === PRICING_TYPES.TIERED ? 'Starting from' : 'per unit' })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Label, { className: "text-xs", children: "Quantity:" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuantityChange(Math.max(1, quantity - 1)), disabled: quantity <= 1, className: "h-6 w-6 p-0", children: _jsx(Minus, { className: "h-3 w-3" }) }), _jsx(NumberInput, { value: quantity, onChange: handleQuantityChange, min: 1, className: "h-6 w-16 text-center" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleQuantityChange(quantity + 1), className: "h-6 w-6 p-0", children: _jsx(Plus, { className: "h-3 w-3" }) })] })] }), isSelected && selectedItem && (_jsxs("div", { className: "flex justify-between items-center text-sm font-medium", children: [_jsx("span", { children: "Total:" }), _jsx("span", { className: "font-mono", children: formatPrice(selectedItem.quantity * selectedItem.unitPrice) })] })), showActions && (_jsx("div", { className: "flex gap-2", children: isSelected ? (_jsxs(Button, { variant: "destructive", size: "sm", onClick: handleRemoveItem, className: "flex-1", children: [_jsx(Trash2, { className: "mr-1 h-3 w-3" }), "Remove"] })) : (_jsxs(Button, { size: "sm", onClick: handleAddItem, className: "flex-1", children: [_jsx(Plus, { className: "mr-1 h-3 w-3" }), "Add to Quote"] })) }))] }) })] }));
}
