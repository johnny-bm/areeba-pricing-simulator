import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { GripVertical } from 'lucide-react';
function DraggableRow({ children, index, onDragStart, onDragOver, onDrop, onDragEnd, isDragging, isDropTarget, onClick }) {
    return (_jsxs(TableRow, { draggable: true, onDragStart: () => onDragStart(index), onDragOver: (e) => onDragOver(e, index), onDrop: (e) => onDrop(e, index), onDragEnd: onDragEnd, onClick: onClick, className: `
        transition-all duration-200 cursor-move
        ${isDragging ? 'opacity-50 bg-muted' : ''} 
        ${isDropTarget ? 'bg-accent border-primary border-2' : ''} 
        ${onClick ? 'hover:bg-muted/50' : ''}
      `, children: [_jsx(TableCell, { className: "w-8 p-2", children: _jsx(GripVertical, { className: "h-4 w-4 text-muted-foreground" }) }), children] }));
}
export function DraggableTable({ headers, items, onReorder, renderRow, onRowClick, getItemKey }) {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const draggedItem = useRef(null);
    const handleDragStart = (index) => {
        setDraggedIndex(index);
        draggedItem.current = items[index];
    };
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };
    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedItem.current === null || draggedIndex === dropIndex) {
            return;
        }
        const newItems = [...items];
        // Remove the dragged item from its original position
        newItems.splice(draggedIndex, 1);
        // Insert it at the new position
        newItems.splice(dropIndex, 0, draggedItem.current);
        onReorder(newItems);
        handleDragEnd();
    };
    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        draggedItem.current = null;
    };
    return (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsx("div", { className: "max-h-[600px] overflow-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "sticky top-0 bg-background z-10", children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-8" }), headers.map((header, index) => (_jsx(TableHead, { children: header }, index)))] }) }), _jsx(TableBody, { children: items.map((item, index) => (_jsx(DraggableRow, { index: index, onDragStart: handleDragStart, onDragOver: handleDragOver, onDrop: handleDrop, onDragEnd: handleDragEnd, isDragging: draggedIndex === index, isDropTarget: dragOverIndex === index, onClick: onRowClick ? () => onRowClick(item) : undefined, children: renderRow(item, index) }, getItemKey(item)))) })] }) }) }));
}
