import { useState, useCallback, useMemo } from 'react';
export function usePricingCalculation(selectedItems) {
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [globalDiscountType, setGlobalDiscountType] = useState('percentage');
    const [globalDiscountApplication, setGlobalDiscountApplication] = useState('none');
    const calculateItemTotal = useCallback((item) => {
        if (item.isFree)
            return 0;
        const subtotal = item.quantity * item.unitPrice;
        let discountAmount = 0;
        if (item.discountType === 'percentage') {
            discountAmount = subtotal * (item.discount / 100);
        }
        else {
            discountAmount = item.discount * item.quantity;
        }
        return Math.max(0, subtotal - discountAmount);
    }, []);
    const applyGlobalDiscount = useCallback((total, isOneTime) => {
        if (globalDiscountApplication === 'none' || globalDiscount === 0) {
            return total;
        }
        const shouldApplyDiscount = globalDiscountApplication === 'both' ||
            (globalDiscountApplication === 'onetime' && isOneTime) ||
            (globalDiscountApplication === 'monthly' && !isOneTime);
        if (!shouldApplyDiscount) {
            return total;
        }
        let discountAmount = 0;
        if (globalDiscountType === 'percentage') {
            discountAmount = total * (globalDiscount / 100);
        }
        else {
            discountAmount = globalDiscount;
        }
        return Math.max(0, total - discountAmount);
    }, [globalDiscount, globalDiscountType, globalDiscountApplication]);
    const summary = useMemo(() => {
        const oneTimeItems = selectedItems.filter(item => item.item.categoryId === 'setup' || isOneTimeUnit(item.item.unit));
        const monthlyItems = selectedItems.filter(item => item.item.categoryId !== 'setup' && !isOneTimeUnit(item.item.unit));
        const oneTimeSubtotal = oneTimeItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const monthlySubtotal = monthlyItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const oneTimeFinal = applyGlobalDiscount(oneTimeSubtotal, true);
        const monthlyFinal = applyGlobalDiscount(monthlySubtotal, false);
        const yearlyFinal = monthlyFinal * 12;
        const totalProjectCost = oneTimeFinal + yearlyFinal;
        const originalPrice = selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalSavings = originalPrice - totalProjectCost;
        const savingsRate = originalPrice > 0 ? (totalSavings / originalPrice) * 100 : 0;
        return {
            oneTimeTotal: oneTimeFinal,
            monthlyTotal: monthlyFinal,
            yearlyTotal: yearlyFinal,
            totalProjectCost,
            savings: {
                totalSavings,
                discountSavings: totalSavings,
                freeSavings: 0,
                originalPrice,
                savingsRate,
            },
            itemCount: selectedItems.length,
        };
    }, [selectedItems, calculateItemTotal, applyGlobalDiscount]);
    const updateGlobalDiscount = useCallback((discount) => {
        setGlobalDiscount(discount);
    }, []);
    const updateGlobalDiscountType = useCallback((type) => {
        setGlobalDiscountType(type);
    }, []);
    const updateGlobalDiscountApplication = useCallback((application) => {
        setGlobalDiscountApplication(application);
    }, []);
    return {
        summary,
        globalDiscount,
        globalDiscountType,
        globalDiscountApplication,
        updateGlobalDiscount,
        updateGlobalDiscountType,
        updateGlobalDiscountApplication,
        calculateItemTotal,
    };
}
// Helper function to check if unit is one-time
function isOneTimeUnit(unit) {
    return unit === 'onetime' || unit === 'per_setup' || unit === 'per_installation';
}
