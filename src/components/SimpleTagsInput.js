import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus } from 'lucide-react';
export function SimpleTagsInput({ tags = [], onAddTag, onRemoveTag, placeholder = "Add tags..." }) {
    const [inputValue, setInputValue] = useState('');
    const handleAddTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !tags.includes(trimmedValue)) {
            onAddTag(trimmedValue);
            setInputValue('');
        }
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };
    return (_jsxs("div", { className: "space-y-2", children: [tags.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, index) => (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [tag, _jsx(Button, { size: "sm", variant: "ghost", className: "h-auto p-0 ml-1 hover:bg-transparent", onClick: () => onRemoveTag(tag), children: _jsx(X, { className: "h-3 w-3" }) })] }, `${tag}-${index}`))) })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { placeholder: placeholder, value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: handleInputKeyDown, className: "flex-1" }), _jsx(Button, { type: "button", onClick: handleAddTag, disabled: !inputValue.trim() || tags.includes(inputValue.trim()), size: "sm", children: _jsx(Plus, { className: "h-4 w-4" }) })] })] }));
}
