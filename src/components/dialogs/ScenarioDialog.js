import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Download, User, Building2, Calendar, Package, DollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { StandardDialog } from '../StandardDialog';
import { formatPrice } from '../../utils/formatters';
import { api } from '../../utils/api';
import { downloadPDF } from '../../utils/pdfHelpers';
export function ScenarioDialog({ isOpen, onClose, scenario }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [scenarioData, setScenarioData] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    // Load full scenario data when dialog opens
    useState(() => {
        if (isOpen && scenario && !scenarioData && !isLoadingData) {
            setIsLoadingData(true);
            api.getScenarioData(scenario.scenarioId)
                .then(data => {
                setScenarioData(data);
            })
                .catch(error => {
                console.error('Failed to load scenario data:', error);
            })
                .finally(() => {
                setIsLoadingData(false);
            });
        }
    });
    // Reset data when dialog closes
    if (!isOpen && scenarioData) {
        setScenarioData(null);
    }
    if (!isOpen || !scenario)
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
            console.log('Downloading PDF for scenario:', scenario.scenarioId);
            // Get the full scenario data from the database
            const fullScenarioData = scenarioData || await api.getScenarioData(scenario.scenarioId);
            if (!fullScenarioData) {
                alert('Scenario data not found. Cannot generate PDF.');
                return;
            }
            // Load current configurations for PDF display
            const configDefinitions = await api.loadConfigurations();
            // Prepare PDF data
            const pdfData = {
                config: fullScenarioData.config,
                legacyConfig: fullScenarioData.config,
                configDefinitions: configDefinitions.filter(config => config.isActive),
                selectedItems: fullScenarioData.selectedItems,
                categories: fullScenarioData.categories,
                globalDiscount: fullScenarioData.globalDiscount,
                globalDiscountType: fullScenarioData.globalDiscountType,
                globalDiscountApplication: fullScenarioData.globalDiscountApplication,
                summary: fullScenarioData.summary
            };
            // Generate and download the PDF
            downloadPDF(pdfData);
            console.log('✅ PDF downloaded successfully for scenario:', scenario.scenarioId);
        }
        catch (error) {
            console.error('❌ Failed to download PDF for scenario:', scenario.scenarioId, error);
            alert('Failed to download PDF. Please try again.');
        }
        finally {
            setIsDownloading(false);
        }
    };
    // Extract data from loaded scenario
    const selectedItems = scenarioData?.selectedItems || [];
    const config = scenarioData?.config || {};
    const summary = scenarioData?.summary || scenario.summary || {};
    // Get pricing values
    const oneTimeTotal = summary.oneTimeTotal || scenario.oneTimeTotal || 0;
    const monthlyTotal = summary.monthlyTotal || scenario.monthlyTotal || 0;
    const yearlyTotal = summary.yearlyTotal || (monthlyTotal * 12) || 0;
    const totalProjectCost = scenario.totalProjectCost || (oneTimeTotal + yearlyTotal) || 0;
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { children: "Scenario Details" }), scenario.submissionCode && (_jsx(Badge, { variant: "outline", className: "font-mono", children: scenario.submissionCode }))] }), description: `Created on ${formatDate(scenario.createdAt)}`, size: "xl", primaryAction: {
            label: isDownloading ? 'Generating...' : 'Download PDF',
            onClick: handleDownloadPDF,
            loading: isDownloading,
            icon: _jsx(Download, { className: "h-4 w-4" })
        }, children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Building2, { className: "h-4 w-4" }), "Client Information"] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Client Name" }), _jsx("p", { className: "font-medium", children: scenario.clientName || config.clientName || 'Unknown Client' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Project Name" }), _jsx("p", { className: "font-medium", children: scenario.projectName || config.projectName || 'Untitled Project' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Prepared By" }), _jsxs("p", { className: "font-medium flex items-center gap-2", children: [_jsx(User, { className: "h-3 w-3" }), scenario.preparedBy || config.preparedBy || 'Unknown'] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Date Created" }), _jsxs("p", { className: "font-medium flex items-center gap-2", children: [_jsx(Calendar, { className: "h-3 w-3" }), new Date(scenario.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })] })] })] })] }), _jsx(Separator, {}), config && Object.keys(config).length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Client Configuration" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg", children: [config.debitCards > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Debit Cards" }), _jsx("p", { className: "font-medium", children: config.debitCards.toLocaleString() })] })), config.creditCards > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Credit Cards" }), _jsx("p", { className: "font-medium", children: config.creditCards.toLocaleString() })] })), config.monthlyAuthorizations > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Monthly Authorizations" }), _jsx("p", { className: "font-medium", children: config.monthlyAuthorizations.toLocaleString() })] })), config.monthlySettlements > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Monthly Settlements" }), _jsx("p", { className: "font-medium", children: config.monthlySettlements.toLocaleString() })] }))] })] }), _jsx(Separator, {})] })), isLoadingData ? (_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Selected Services"] }), _jsx("div", { className: "p-4 bg-muted/50 rounded-lg text-center text-muted-foreground", children: "Loading services..." })] })) : selectedItems.length > 0 ? (_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Selected Services (", selectedItems.length, ")"] }), _jsx("div", { className: "space-y-2", children: selectedItems.map((item, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: item.item?.name || item.name }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Quantity: ", item.quantity, " \u00D7 ", formatPrice(item.unitPrice || 0)] })] }), _jsx("div", { className: "text-right", children: _jsx("p", { className: "font-semibold", children: formatPrice((item.quantity || 0) * (item.unitPrice || 0)) }) })] }, index))) })] })) : (_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Selected Services"] }), _jsxs("div", { className: "p-4 bg-muted/50 rounded-lg text-center", children: [_jsxs(Badge, { variant: "outline", children: [scenario.itemCount, " items"] }), _jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Service details not available in summary view" })] })] })), _jsx(Separator, {}), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(DollarSign, { className: "h-4 w-4" }), "Fee Summary"] }), _jsxs("div", { className: "space-y-3 p-4 bg-muted/50 rounded-lg", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "One-time Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(oneTimeTotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Monthly Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(monthlyTotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Yearly Cost:" }), _jsx("span", { className: "font-semibold", children: formatPrice(yearlyTotal) })] }), scenario.globalDiscount && scenario.globalDiscount > 0 && scenario.globalDiscountApplication !== 'none' && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Discount Applied:" }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { variant: "secondary", className: "text-xs", children: scenario.globalDiscountType === 'percentage'
                                                                ? `${scenario.globalDiscount}%`
                                                                : formatPrice(scenario.globalDiscount) }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: scenario.globalDiscountApplication === 'both' ? 'Both' :
                                                                scenario.globalDiscountApplication === 'monthly' ? 'Monthly' :
                                                                    scenario.globalDiscountApplication === 'onetime' ? 'One-time' :
                                                                        'None' })] })] })] })), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between text-lg", children: [_jsx("span", { className: "font-semibold", children: "Total Project Cost:" }), _jsx("span", { className: "font-bold text-primary", children: formatPrice(totalProjectCost) })] })] })] })] }) }));
}
