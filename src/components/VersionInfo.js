import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { VERSION_INFO, getVersionString, getSimpleVersion } from '../utils/version';
export function VersionInfo({ simple = true, onClick }) {
    const [showDetailed, setShowDetailed] = useState(false);
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
        else {
            setShowDetailed(!showDetailed);
        }
    };
    if (simple && !showDetailed) {
        return (_jsx("span", { className: "cursor-pointer hover:text-foreground transition-colors", onClick: handleClick, title: "Click for version details", children: getSimpleVersion() }));
    }
    return (_jsxs("div", { className: "text-xs space-y-1", children: [_jsx("div", { className: "cursor-pointer hover:text-foreground transition-colors font-medium", onClick: handleClick, children: getVersionString() }), showDetailed && (_jsxs("div", { className: "text-muted-foreground space-y-0.5", children: [_jsxs("div", { children: ["Build: ", VERSION_INFO.build] }), _jsxs("div", { children: ["Updated: ", new Date(VERSION_INFO.timestamp).toLocaleString()] })] }))] }));
}
