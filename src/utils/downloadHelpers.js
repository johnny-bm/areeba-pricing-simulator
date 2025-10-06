import { formatPrice, formatNumber } from './formatters';
export const generateCSVData = (data) => {
    const { config, selectedItems, globalDiscount, globalDiscountType = 'percentage', summary } = data;
    let csv = 'Pricing Simulator Export\n\n';
    // Client Information
    csv += 'CLIENT INFORMATION\n';
    csv += `Client Name,${config.clientName}\n`;
    csv += `Project Name,${config.projectName}\n`;
    csv += `Prepared By,${config.preparedBy}\n`;
    csv += `Global Discount,${globalDiscountType === 'percentage' ? `${globalDiscount}%` : formatPrice(globalDiscount)}\n\n`;
    // Card Configuration
    csv += 'CARD CONFIGURATION\n';
    csv += `Debit Cards,${config.hasDebitCards ? formatNumber(config.debitCards) : 'Not Selected'}\n`;
    csv += `Credit Cards,${config.hasCreditCards ? formatNumber(config.creditCards) : 'Not Selected'}\n`;
    csv += `Prepaid Cards,${config.hasPrepaidCards ? formatNumber(config.prepaidCards) : 'Not Selected'}\n\n`;
    // Transaction Volumes
    csv += 'MONTHLY VOLUMES\n';
    csv += `Authorizations,${formatNumber(config.monthlyAuthorizations)}\n`;
    csv += `Settlements,${formatNumber(config.monthlySettlements)}\n`;
    csv += `3D Secure,${formatNumber(config.monthly3DS)}\n`;
    csv += `SMS Alerts,${formatNumber(config.monthlySMS)}\n`;
    csv += `Push Notifications,${formatNumber(config.monthlyNotifications)}\n`;
    csv += `Card Deliveries,${formatNumber(config.monthlyDeliveries)}\n\n`;
    // Selected Items
    csv += 'SELECTED ITEMS\n';
    csv += 'Item Name,Description,Quantity,Unit Price,Discount,Is Free,Row Total\n';
    selectedItems.forEach(item => {
        let rowTotal = 0;
        if (!item.isFree) {
            const subtotal = item.quantity * item.unitPrice;
            let discountAmount = 0;
            if (item.discountType === 'percentage') {
                discountAmount = subtotal * (item.discount / 100);
            }
            else {
                discountAmount = item.discount * item.quantity;
            }
            rowTotal = Math.max(0, subtotal - discountAmount);
        }
        const discountDisplay = item.discountType === 'percentage' ? `${item.discount}%` : formatPrice(item.discount);
        csv += `"${item.item.name}","${item.item.description}",${formatNumber(item.quantity)},${formatPrice(item.unitPrice)},${discountDisplay},${item.isFree ? 'Yes' : 'No'},${formatPrice(rowTotal)}\n`;
    });
    csv += '\n';
    // Summary
    csv += 'COST SUMMARY\n';
    csv += `One-time Total,${formatPrice(summary.oneTimeTotal)}\n`;
    csv += `Monthly Total,${formatPrice(summary.monthlyTotal)}\n`;
    csv += `Yearly Total,${formatPrice(summary.yearlyTotal)}\n`;
    csv += `Total Project Cost,${formatPrice(summary.totalProjectCost)}\n`;
    return csv;
};
export const downloadCSV = (data) => {
    const csvContent = generateCSVData(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const fileName = `pricing-simulator-${data.config.clientName || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
