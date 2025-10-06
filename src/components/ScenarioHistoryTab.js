import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { RefreshCw, FileText, Download } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { api } from '../utils/api';
import { downloadPDF } from '../utils/pdfHelpers';
import { ScenarioDialog } from './dialogs/ScenarioDialog';
export function ScenarioHistoryTab({ scenarios, isLoading, onRefresh }) {
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [showScenarioDialog, setShowScenarioDialog] = useState(false);
    const handleScenarioClick = (scenario) => {
        setSelectedScenario(scenario);
        setShowScenarioDialog(true);
    };
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        catch {
            return 'Invalid Date';
        }
    };
    const handleDownloadPDF = async (scenarioId) => {
        try {
            // Get the full scenario data from the database
            const scenarioData = await api.getScenarioData(scenarioId);
            if (!scenarioData) {
                alert('Scenario data not found. Cannot generate PDF.');
                return;
            }
            // Load current configurations for PDF display
            const configDefinitions = await api.loadConfigurations();
            // Prepare PDF data (matching the format used in App.tsx)
            const pdfData = {
                config: scenarioData.config,
                legacyConfig: scenarioData.config, // Use as legacy config for backward compatibility
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
        }
        catch (error) {
            console.error('❌ Failed to download PDF for scenario:', scenarioId, error);
            alert('Failed to download PDF. Please try again.');
        }
    };
    const formatDateShort = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
        catch {
            return 'Invalid Date';
        }
    };
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-medium", children: "Scenario History" }), _jsxs(Button, { onClick: onRefresh, size: "sm", disabled: true, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-1 animate-spin" }), "Loading..."] })] }), _jsx("div", { className: "space-y-3", children: [...Array(5)].map((_, i) => (_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Skeleton, { className: "h-6 w-16" }), _jsx(Skeleton, { className: "h-6 w-20" })] })] }) }) }, i))) })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-medium", children: "Scenario History" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-sm text-muted-foreground", children: [scenarios.length, " scenario", scenarios.length !== 1 ? 's' : '', " saved"] }), _jsxs(Button, { onClick: onRefresh, size: "sm", variant: "outline", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-1" }), "Refresh"] })] })] }), scenarios.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx(FileText, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }), _jsx("h4", { className: "font-medium mb-2", children: "No scenarios saved yet" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Scenario data will appear here when users download PDFs from the pricing simulator." })] }) })) : (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsx("div", { className: "max-h-[600px] overflow-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "sticky top-0 bg-background z-10", children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Client & Project" }), _jsx(TableHead, { children: "Prepared By" }), _jsx(TableHead, { children: "Date Created" }), _jsx(TableHead, { children: "Items" }), _jsx(TableHead, { children: "One-time Cost" }), _jsx(TableHead, { children: "Monthly Cost" }), _jsx(TableHead, { children: "Total Project Cost" }), _jsx(TableHead, { className: "w-[120px]", children: "Actions" })] }) }), _jsx(TableBody, { children: scenarios.map((scenario) => (_jsxs(TableRow, { className: "cursor-pointer hover:bg-muted/50", onClick: () => handleScenarioClick(scenario), children: [_jsx(TableCell, { children: _jsxs("div", { className: "space-y-1", children: [_jsx("div", { className: "font-medium", children: scenario.clientName || 'Unknown Client' }), _jsx("div", { className: "text-sm text-muted-foreground", children: scenario.projectName || 'Untitled Project' })] }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: scenario.preparedBy || 'Unknown' }) }), _jsxs(TableCell, { children: [_jsx("div", { className: "text-sm", children: formatDateShort(scenario.createdAt) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatDate(scenario.createdAt).split(', ')[1] })] }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "outline", children: [scenario.itemCount, " items"] }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: formatPrice(scenario.oneTimeTotal) }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-medium", children: formatPrice(scenario.monthlyTotal) }) }), _jsx(TableCell, { children: _jsx("div", { className: "font-semibold text-primary", children: formatPrice(scenario.totalProjectCost) }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsx("div", { className: "flex gap-1", children: _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDownloadPDF(scenario.scenarioId), title: "Download PDF", children: _jsx(Download, { className: "h-3 w-3" }) }) }) })] }, scenario.scenarioId))) })] }) }) })), _jsx(ScenarioDialog, { isOpen: showScenarioDialog, onClose: () => {
                    setShowScenarioDialog(false);
                    setSelectedScenario(null);
                }, scenario: selectedScenario })] }));
}
