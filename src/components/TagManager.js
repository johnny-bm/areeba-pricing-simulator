import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Plus, Edit, Trash2, Tags, Copy } from 'lucide-react';
import { DataTable } from './DataTable';
import { TagDialog } from './dialogs/TagDialog';
export function TagManager({ services, onUpdateServices }) {
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState(null);
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    // Extract and organize tags from services
    const tagData = useMemo(() => {
        const tagMap = new Map();
        services.forEach(service => {
            if (service.tags && service.tags.length > 0) {
                service.tags.forEach(tag => {
                    if (!tagMap.has(tag)) {
                        tagMap.set(tag, { count: 0, items: [] });
                    }
                    const tagInfo = tagMap.get(tag);
                    tagInfo.count++;
                    tagInfo.items.push(service);
                });
            }
        });
        return Array.from(tagMap.entries())
            .map(([name, info]) => ({ name, ...info }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [services]);
    const handleCreateTag = () => {
        setSelectedTag(null);
        setIsCreatingTag(true);
        setIsTagDialogOpen(true);
    };
    const handleSaveNewTag = async (tagName) => {
        // Check if tag already exists
        if (tagData.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
            alert('Tag already exists');
            throw new Error('Tag already exists');
        }
        // Show success message and guidance
        alert(`Tag "${tagName}" created successfully! You can now assign it to services through the service editor.`);
    };
    const handleViewTag = (tag) => {
        setSelectedTag(tag);
        setIsCreatingTag(false);
        setIsTagDialogOpen(true);
    };
    const handleDeleteTag = async (tagName) => {
        // Remove the tag from all services that have it
        const updatedServices = services.map(service => ({
            ...service,
            tags: service.tags ? service.tags.filter(tag => tag !== tagName) : []
        }));
        await onUpdateServices(updatedServices);
    };
    const handleQuickDelete = async (tagName) => {
        const confirmed = window.confirm(`Are you sure you want to delete tag "${tagName}" from all services? This action cannot be undone.`);
        if (!confirmed)
            return;
        try {
            await handleDeleteTag(tagName);
        }
        catch (error) {
            alert(`Failed to delete tag: ${error.message || 'Unknown error'}`);
        }
    };
    const handleDuplicateTag = (tagName) => {
        const newTagName = prompt(`Create a duplicate of tag "${tagName}".\n\nEnter the new tag name:`, `${tagName} Copy`);
        if (!newTagName || newTagName.trim() === '')
            return;
        // Check if tag already exists
        if (tagData.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
            alert('A tag with this name already exists. Please choose a different name.');
            return;
        }
        alert(`Tag "${newTagName}" created successfully! You can now assign it to services through the service editor.`);
    };
    return (_jsxs("div", { children: [_jsx(DataTable, { title: "Tags", headers: ['Tag Name', 'Usage Count', 'Services', 'Actions'], items: tagData, getItemKey: (tag) => tag.name, onRowClick: handleViewTag, searchFields: ['name'], searchPlaceholder: "Search tags...", filterOptions: [], actionButton: _jsxs(Button, { onClick: handleCreateTag, size: "sm", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Tag"] }), emptyStateTitle: "No tags found", emptyStateDescription: "Tags are created when you assign them to services. Create your first tag or add tags to services.", emptyStateIcon: _jsx(Tags, { className: "h-12 w-12 text-muted-foreground" }), emptyStateAction: _jsxs(Button, { onClick: handleCreateTag, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create First Tag"] }), renderRow: (tag) => (_jsxs(_Fragment, { children: [_jsx(TableCell, { children: _jsx(Badge, { variant: "outline", children: tag.name }) }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "secondary", children: [tag.count, " service", tag.count !== 1 ? 's' : ''] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "text-sm text-muted-foreground max-w-xs", children: [tag.items.slice(0, 3).map(item => item.name).join(', '), tag.items.length > 3 && ` +${tag.items.length - 3} more`] }) }), _jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleViewTag(tag), title: "View tag details", children: _jsx(Edit, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDuplicateTag(tag.name), title: "Duplicate tag", children: _jsx(Copy, { className: "h-3 w-3" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleQuickDelete(tag.name), className: "text-red-600 hover:text-red-700", title: "Delete tag", children: _jsx(Trash2, { className: "h-3 w-3" }) })] }) })] })) }), _jsx(TagDialog, { isOpen: isTagDialogOpen, onClose: () => {
                    setIsTagDialogOpen(false);
                    setSelectedTag(null);
                    setIsCreatingTag(false);
                }, tag: selectedTag, onDeleteTag: handleDeleteTag, onCreateTag: handleSaveNewTag, isCreating: isCreatingTag })] }));
}
