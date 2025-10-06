import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { NumberInput } from './NumberInput';
export function TieredPricingEditor({ tiers, unit, onUpdateTiers }) {
    const addTier = () => {
        const newTier = {
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
    const updateTier = (tierId, updates) => {
        const updatedTiers = tiers.map(tier => tier.id === tierId ? { ...tier, ...updates } : tier);
        onUpdateTiers(updatedTiers);
    };
    const removeTier = (tierId) => {
        const updatedTiers = tiers.filter(tier => tier.id !== tierId);
        onUpdateTiers(updatedTiers);
    };
    const formatTierRange = (tier) => {
        if (tier.maxQuantity === null) {
            return `${tier.minQuantity.toLocaleString()}+`;
        }
        else {
            return `${tier.minQuantity.toLocaleString()} - ${tier.maxQuantity.toLocaleString()}`;
        }
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Pricing Tiers *" }), _jsxs(Button, { type: "button", size: "sm", onClick: addTier, variant: "outline", children: [_jsx(Plus, { className: "h-4 w-4 mr-1" }), "Add Tier"] })] }), tiers.length === 0 ? (_jsx("div", { className: "text-center py-4 text-muted-foreground text-sm border-2 border-dashed rounded-lg", children: "No tiers defined. Click \"Add Tier\" to create volume-based pricing." })) : (_jsx("div", { className: "space-y-3", children: tiers.map((tier, index) => (_jsx(Card, { className: "border-l-4 border-l-primary", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", children: tier.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [formatTierRange(tier), " ", unit] })] }), _jsx(Button, { type: "button", size: "sm", variant: "ghost", onClick: () => removeTier(tier.id), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-2", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Tier Name" }), _jsx(Input, { value: tier.name, onChange: (e) => updateTier(tier.id, { name: e.target.value }), placeholder: "Tier name", className: "text-xs" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Min Quantity" }), _jsx(NumberInput, { value: tier.minQuantity, onChange: (value) => updateTier(tier.id, { minQuantity: value }), placeholder: "1", allowDecimals: false, className: "text-xs" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Max Quantity" }), _jsx(NumberInput, { value: tier.maxQuantity || 0, onChange: (value) => updateTier(tier.id, { maxQuantity: value === 0 ? null : value }), placeholder: "Unlimited", allowDecimals: false, className: "text-xs" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Unit Price" }), _jsx(NumberInput, { value: tier.unitPrice, onChange: (value) => updateTier(tier.id, { unitPrice: value }), placeholder: "0.00", allowDecimals: true, className: "text-xs" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t", children: [_jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Description (Optional)" }), _jsx(Textarea, { value: tier.description || '', onChange: (e) => updateTier(tier.id, { description: e.target.value }), placeholder: "Describe this tier (e.g., 'Perfect for small businesses')", className: "text-xs min-h-[60px]" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx(Label, { className: "text-xs", children: "Config Reference (Optional)" }), _jsxs(Select, { value: tier.configReference || 'none', onValueChange: (value) => updateTier(tier.id, { configReference: value === 'none' ? undefined : value }), children: [_jsx(SelectTrigger, { className: "text-xs", children: _jsx(SelectValue, { placeholder: "Link to config field" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "none", children: "None" }), _jsx(SelectItem, { value: "debitCards", children: "Debit/Prepaid/Virtual Cards" }), _jsx(SelectItem, { value: "creditCards", children: "Credit Cards" }), _jsx(SelectItem, { value: "monthlyAuthorizations", children: "Monthly Authorizations" }), _jsx(SelectItem, { value: "monthlySettlements", children: "Monthly Settlements" }), _jsx(SelectItem, { value: "monthly3DS", children: "Monthly 3DS" }), _jsx(SelectItem, { value: "monthlySMS", children: "Monthly SMS" }), _jsx(SelectItem, { value: "monthlyNotifications", children: "Monthly Notifications" }), _jsx(SelectItem, { value: "monthlyDeliveries", children: "Monthly Deliveries" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Show which config value influences this tier" })] })] })] }) }) }, tier.id))) }))] }));
}
