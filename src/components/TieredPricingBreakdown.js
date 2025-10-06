import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getEffectiveUnitPrice } from '../utils/tieredPricing';
import { formatPrice } from '../utils/formatters';
import { PRICING_TYPES } from '../config/database';
export function TieredPricingBreakdown({ item, quantity, clientConfig }) {
    if (item.pricingType !== PRICING_TYPES.TIERED || !item.tiers || item.tiers.length === 0 || quantity === 0) {
        return null;
    }
    const currentTierPrice = getEffectiveUnitPrice(item, quantity);
    const totalPrice = quantity * currentTierPrice;
    return (_jsxs("div", { className: "mt-3 p-3 bg-green-50 border border-green-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "text-green-600", children: "\uD83D\uDCCA" }), _jsx("span", { className: "text-xs font-medium text-green-900", children: "Volume Pricing Calculation" }), _jsx("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded", children: "Current Tier Rate" })] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("div", { className: "flex justify-between items-center text-green-800", children: [_jsxs("span", { children: [quantity.toLocaleString(), " \u00D7 ", formatPrice(currentTierPrice), " (current tier rate)"] }), _jsx("span", { className: "font-medium", children: formatPrice(totalPrice) })] }), _jsx("div", { className: "border-t border-green-300 pt-1 mt-2", children: _jsxs("div", { className: "flex justify-between items-center font-medium text-green-900", children: [_jsx("span", { children: "Total Cost:" }), _jsx("span", { children: formatPrice(totalPrice) })] }) }), (() => {
                        const standardPrice = quantity * item.defaultPrice;
                        const savings = standardPrice - totalPrice;
                        const savingsPercentage = standardPrice > 0 ? (savings / standardPrice) * 100 : 0;
                        if (savings > 0) {
                            return (_jsxs("div", { className: "bg-green-100 border border-green-300 rounded-md px-2 py-1.5 mt-2", children: [_jsxs("div", { className: "flex justify-between items-center text-xs text-green-600", children: [_jsx("span", { children: "\uD83D\uDCB0 Volume Savings:" }), _jsx("span", { className: "font-medium", children: formatPrice(savings) })] }), _jsxs("div", { className: "flex justify-between items-center text-xs text-green-600 mt-0.5", children: [_jsx("span", { children: "Savings Rate:" }), _jsxs("span", { className: "font-medium", children: [savingsPercentage.toFixed(1), "% off standard"] })] }), _jsxs("div", { className: "text-xs text-green-500 mt-1 text-center italic", children: ["vs ", formatPrice(item.defaultPrice), " standard rate"] })] }));
                        }
                        return null;
                    })()] })] }));
}
