import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tags, Trash2, Package } from 'lucide-react';
export function TagDialog({ isOpen, onClose, tag, onDeleteTag, onCreateTag, isCreating = false }) {
    const [newTagName, setNewTagName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        if (isOpen) {
            if (isCreating) {
                setNewTagName('');
            }
        }
    }, [isOpen, isCreating]);
    const handleDelete = async () => {
        if (!tag)
            return;
        if (confirm(`Delete tag "${tag.name}" from all items?`)) {
            try {
                setIsDeleting(true);
                await onDeleteTag(tag.name);
                onClose();
            }
            catch (error) {
                console.error('Failed to delete tag:', error);
                alert(`Failed to delete tag: ${error.message || 'Unknown error'}`);
            }
            finally {
                setIsDeleting(false);
            }
        }
    };
    const handleCreateTag = async () => {
        if (!newTagName.trim() || !onCreateTag)
            return;
        try {
            setIsSaving(true);
            await onCreateTag(newTagName.trim());
            onClose();
        }
        catch (error) {
            console.error('Failed to create tag:', error);
            alert(`Failed to create tag: ${error.message || 'Unknown error'}`);
        }
        finally {
            setIsSaving(false);
        }
    };
    // Creating new tag
    if (isCreating) {
        return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Tags, { className: "h-5 w-5" }), _jsx("span", { children: "Create New Tag" })] }), description: "Create a new tag that can be assigned to services", size: "sm", secondaryActions: [
                {
                    label: 'Cancel',
                    onClick: onClose
                }
            ], primaryAction: {
                label: isSaving ? 'Creating...' : 'Create Tag',
                onClick: handleCreateTag,
                loading: isSaving,
                disabled: !newTagName.trim()
            }, children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "tag-name", children: "Tag Name *" }), _jsx(Input, { id: "tag-name", value: newTagName, onChange: (e) => setNewTagName(e.target.value), placeholder: "Enter tag name", onKeyDown: (e) => {
                            if (e.key === 'Enter' && newTagName.trim()) {
                                handleCreateTag();
                            }
                        } })] }) }));
    }
    // Viewing existing tag
    if (!tag)
        return null;
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Tags, { className: "h-5 w-5" }), _jsx("span", { children: "Tag Details" })] }), description: `View and manage the "${tag.name}" tag`, size: "lg", destructiveActions: [{
                label: isDeleting ? 'Deleting...' : 'Delete Tag',
                onClick: handleDelete,
                loading: isDeleting,
                icon: _jsx(Trash2, { className: "h-4 w-4" })
            }], secondaryActions: [
            {
                label: 'Close',
                onClick: onClose
            }
        ], children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-1", children: _jsx(CardTitle, { className: "text-base flex items-center gap-2", children: _jsx(Badge, { variant: "outline", className: "text-sm", children: tag.name }) }) }), _jsx(CardContent, { className: "space-y-2 py-2", children: _jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "space-y-0.5", children: [_jsx("div", { className: "text-sm text-muted-foreground", children: "Usage Count" }), _jsxs(Badge, { variant: "secondary", children: [tag.count, " item", tag.count !== 1 ? 's' : ''] })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-1", children: _jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4" }), "Items using this tag"] }) }), _jsx(CardContent, { className: "py-2", children: _jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: tag.items.map((item, index) => (_jsx("div", { className: "flex items-center justify-between p-2 rounded-md border", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: item.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: item.description })] }) }, item.id || index))) }) })] })] }) }));
}
