import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { EXTERNAL_URLS } from '../config/api';
import { CreditCard, ArrowRight, Calculator, Zap } from 'lucide-react';
import { UserProfileHeader } from './UserProfileHeader';
import WordMarkRed from '../imports/WordMarkRed';
export function SimulatorLanding({ onSelectSimulator, onOpenAdmin, onLogout }) {
    const simulators = [
        {
            id: 'issuing-simulator',
            title: 'Issuing & Processing',
            description: 'Calculate costs for card issuing, payment processing, hosting, and transaction fees with detailed configuration options.',
            icon: _jsx(CreditCard, { className: "h-8 w-8" }),
            available: true
        },
        {
            id: 'acquiring-simulator',
            title: 'Acquiring Solutions',
            description: 'Price merchant acquisition services, payment acceptance, and settlement solutions.',
            icon: _jsx(Calculator, { className: "h-8 w-8" }),
            available: false,
            comingSoon: true
        },
        {
            id: 'digital-banking-simulator',
            title: 'Digital Banking',
            description: 'Estimate costs for digital banking platform implementation and ongoing operations.',
            icon: _jsx(Zap, { className: "h-8 w-8" }),
            available: false,
            comingSoon: true
        }
    ];
    return (_jsx("div", { className: "min-h-screen bg-background p-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-12 relative", children: [_jsx("div", { className: "absolute top-0 right-0", children: _jsx(UserProfileHeader, { onLogout: onLogout }) }), _jsx("div", { className: "w-32 h-8 mx-auto mb-6", children: _jsx(WordMarkRed, {}) }), _jsx("h1", { className: "text-3xl mb-4", children: "Pricing Simulators" }), _jsx("p", { className: "text-muted-foreground text-lg max-w-2xl mx-auto", children: "Select a pricing simulator to configure and calculate costs for your payment solutions" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: simulators.map((simulator) => (_jsxs(Card, { className: `relative transition-all duration-200 ${simulator.available
                            ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                            : 'opacity-60 cursor-not-allowed'}`, onClick: () => simulator.available && onSelectSimulator(simulator.id), children: [simulator.comingSoon && (_jsx("div", { className: "absolute top-3 right-3 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full", children: "Coming Soon" })), _jsxs(CardHeader, { className: "pb-4", children: [_jsx("div", { className: "flex items-center gap-3 mb-3", children: _jsx("div", { className: `p-2 rounded-lg ${simulator.available
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-muted text-muted-foreground'}`, children: simulator.icon }) }), _jsx(CardTitle, { className: "text-lg", children: simulator.title }), _jsx(CardDescription, { className: "text-sm leading-relaxed", children: simulator.description })] }), _jsx(CardContent, { className: "pt-0", children: _jsx(Button, { className: "w-full", disabled: !simulator.available, variant: simulator.available ? "default" : "secondary", children: simulator.available ? (_jsxs(_Fragment, { children: ["Start Simulation", _jsx(ArrowRight, { className: "h-4 w-4 ml-2" })] })) : ('Coming Soon') }) })] }, simulator.id))) }), _jsxs("div", { className: "mt-16 text-center", children: [_jsx("h2", { className: "text-xl mb-6", children: "Why Use Our Pricing Simulators?" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto", children: _jsx(Calculator, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-sm", children: "Accurate Pricing" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Get precise cost estimates based on your specific configuration and usage patterns" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto", children: _jsx(Zap, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-sm", children: "Real-time Updates" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "See cost changes instantly as you modify your configuration parameters" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto", children: _jsx(CreditCard, { className: "h-6 w-6" }) }), _jsx("h3", { className: "text-sm", children: "Comprehensive Coverage" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Cover all aspects of your payment solution from setup to ongoing operations" })] })] })] }), _jsx("footer", { className: "mt-16 pt-8 border-t border-border", children: _jsxs("div", { className: "text-center text-sm text-muted-foreground", children: [_jsxs("p", { children: ["areeba \u00A9 ", new Date().getFullYear(), ". All Rights Reserved."] }), _jsxs("div", { className: "flex justify-center gap-4 mt-2", children: [_jsx("a", { href: EXTERNAL_URLS.AREEBA_PRIVACY, target: "_blank", rel: "noopener noreferrer", className: "hover:text-foreground transition-colors", children: "Privacy" }), _jsx("a", { href: EXTERNAL_URLS.AREEBA_WEBSITE, target: "_blank", rel: "noopener noreferrer", className: "hover:text-foreground transition-colors", children: "About areeba" })] })] }) })] }) }));
}
