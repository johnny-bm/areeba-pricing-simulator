import { jsx as _jsx } from "react/jsx-runtime";
import { Input } from "./ui/input";
import { formatNumber, parseFormattedNumber, formatDecimalNumber, parseFormattedDecimal } from "../utils/formatters";
import { useState, useEffect } from "react";
export function NumberInput({ id, value, onChange, placeholder, min = 0, max, step, disabled, className, allowDecimals = false }) {
    const isDecimal = allowDecimals || (step !== undefined && step < 1);
    const [displayValue, setDisplayValue] = useState(() => {
        if (value === 0)
            return '';
        return isDecimal ? formatDecimalNumber(value) : formatNumber(value);
    });
    useEffect(() => {
        if (value === 0) {
            setDisplayValue('');
        }
        else {
            setDisplayValue(isDecimal ? formatDecimalNumber(value) : formatNumber(value));
        }
    }, [value, isDecimal]);
    const handleChange = (e) => {
        const inputValue = e.target.value;
        // Allow empty string
        if (inputValue === '') {
            setDisplayValue('');
            onChange(0);
            return;
        }
        // For decimal inputs, allow partial decimal values (like "0." or ".4")
        if (isDecimal) {
            // Allow digits, decimal point, and commas
            const cleanValue = inputValue.replace(/[^\d.,]/g, '');
            // Handle partial decimal inputs - allow user to type "0." or ".4"
            if (cleanValue === '0' || cleanValue === '0.' || cleanValue.startsWith('.')) {
                setDisplayValue(cleanValue);
                return; // Don't call onChange yet for partial inputs
            }
            const numericValue = parseFormattedDecimal(cleanValue);
            if (!isNaN(numericValue)) {
                // Apply min/max constraints
                const constrainedValue = Math.max(min, max ? Math.min(max, numericValue) : numericValue);
                setDisplayValue(cleanValue); // Keep user's input format during typing
                onChange(constrainedValue);
            }
        }
        else {
            // For integer inputs, use comma formatting
            const cleanValue = inputValue.replace(/[^\d,]/g, '');
            const numericValue = parseFormattedNumber(cleanValue);
            if (!isNaN(numericValue)) {
                // Apply min/max constraints
                const constrainedValue = Math.max(min, max ? Math.min(max, numericValue) : numericValue);
                setDisplayValue(formatNumber(constrainedValue));
                onChange(constrainedValue);
            }
        }
    };
    const handleBlur = () => {
        // Ensure proper formatting on blur
        if (value >= 0) { // Changed from value > 0 to value >= 0 to handle 0.4 case
            if (isDecimal) {
                setDisplayValue(formatDecimalNumber(value));
            }
            else {
                setDisplayValue(formatNumber(value));
            }
        }
    };
    const isFilled = value > 0;
    return (_jsx(Input, { id: id, type: "text", value: displayValue, onChange: handleChange, onBlur: handleBlur, placeholder: placeholder, disabled: disabled, className: `${className || ''} ${isFilled ? 'bg-white border-border-filled shadow-sm' : ''}` }));
}
