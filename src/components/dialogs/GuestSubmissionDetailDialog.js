import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, User, Mail, Phone, Building2, Package, DollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { StandardDialog } from '../StandardDialog';
import { formatPrice } from '../../utils/formatters';
import { downloadPDF } from '../../utils/pdfHelpers';
import { api } from '../../utils/api';
export function GuestSubmissionDetailDialog({ isOpen, onClose, submission }) {
    const [isDownloading, setIsDownloading] = useState(false);
    if (!isOpen || !submission)
        return null;
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        catch {
            return 'Invalid Date';
        }
    };
    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true);
            console.log('Downloading PDF for guest submission:', submission.id);
            // Get the full guest scenario data from the database
            const scenarioData = await api.getGuestScenarioData(submission.id);
            if (!scenarioData) {
                alert('Scenario data not found. Cannot generate PDF.');
                return;
            }
            // Load current configurations for PDF display
            const configDefinitions = await api.loadConfigurations();
            // Prepare PDF data
            const pdfData = {
                config: scenarioData.config,
                legacyConfig: scenarioData.config,
                configDefinitions: configDefinitions.filter(config => config.isActive),
                selectedItems: scenarioData.selectedItems,
                categories: scenarioData.categories,
                globalDiscount: scenarioData.globalDiscount,
                globalDiscountType: scenarioData.globalDiscountType,
                globalDiscountApplication: scenarioData.globalDiscountApplication,
                summary: scenarioData.summary
            };
            // Generate and download the PDF
            downloadPDF(pdfData);
            console.log('✅ PDF downloaded successfully for guest submission:', submission.id);
        }
        catch (error) {
            console.error('❌ Failed to download PDF for guest submission:', submission.id, error);
            alert('Failed to download PDF. Please try again.');
        }
        finally {
            setIsDownloading(false);
        }
    };
    // Extract scenario data from the correct database structure (scenario_data with underscore)
    const scenarioData = submission.scenario_data || {};
    const summary = scenarioData.summary || {};
    const selectedItems = scenarioData.selectedItems || [];
    const config = scenarioData.config || {};
    // Get pricing from scenario_data.summary
    const oneTimeTotal = summary.oneTimeTotal || 0;
    const monthlyTotal = summary.monthlyTotal || 0;
    const yearlyTotal = summary.yearlyTotal || 0;
    const totalProjectCost = submission.total_price || summary.totalProjectCost || 0;
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { children: "Guest Submission Details" }), _jsx(Badge, { variant: "outline", className: "font-mono", children: submission.submissionCode })] }), description: `Submitted on ${formatDate(submission.createdAt)}`, size: "xl", primaryAction: {
            label: isDownloading ? 'Generating...' : 'Download PDF',
            onClick: handleDownloadPDF,
            loading: isDownloading,
            icon: _jsx(Download, { className: "h-4 w-4" })
        }, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4" }), "Contact Information"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Name" }), _jsxs("p", { className: "font-medium", children: [submission.firstName, " ", submission.lastName] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Company" }), _jsxs("p", { className: "font-medium flex items-center gap-2", children: [_jsx(Building2, { className: "h-3 w-3" }), submission.companyName] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Email" }), _jsxs("p", { className: "font-medium flex items-center gap-2", children: [_jsx(Mail, { className: "h-3 w-3" }), submission.email] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Phone" }), _jsxs("p", { className: "font-medium flex items-center gap-2", children: [_jsx(Phone, { className: "h-3 w-3" }), submission.phoneNumber] })] })] })] }), _jsx(Separator, {}), config && Object.keys(config).length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Client Configuration" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg", children: [config.clientName && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Client Name" }), _jsx("p", { className: "font-medium", children: config.clientName })] })), config.projectName && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Project Name" }), _jsx("p", { className: "font-medium", children: config.projectName })] })), config.debitCards > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Debit Cards" }), _jsx("p", { className: "font-medium", children: config.debitCards.toLocaleString() })] })), config.creditCards > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Credit Cards" }), _jsx("p", { className: "font-medium", children: config.creditCards.toLocaleString() })] })), config.monthlyAuthorizations > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Monthly Authorizations" }), _jsx("p", { className: "font-medium", children: config.monthlyAuthorizations.toLocaleString() })] })), config.monthlySettlements > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Monthly Settlements" }), _jsx("p", { className: "font-medium", children: config.monthlySettlements.toLocaleString() })] }))] })] }), _jsx(Separator, {})] })), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Selected Services (", selectedItems.length, ")"] }), _jsx("div", { className: "space-y-2", children: selectedItems.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: item.item?.name || item.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Quantity: ", item.quantity, " \u00D7 ", formatPrice(item.unitPrice || 0)] })] }), _jsx("div", { className: "text-right", children: _jsx("p", { className: "font-semibold", children: formatPrice((item.quantity || 0) * (item.unitPrice || 0)) }) })] }, index))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-4 w-4" }), "Fee Summary"] }), _jsxs("div", { className: "space-y-3 p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "One-time Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(oneTimeTotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Monthly Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(monthlyTotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Yearly Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(yearlyTotal) })] }), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between text-lg", children: [_jsx("span", { className: "font-semibold", children: "Total Project Cost:" }), _jsx("span", { className: "font-bold text-primary", children: formatPrice(totalProjectCost) })] })] })] })] }) }));
}
