import { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { GripVertical } from 'lucide-react';

interface DraggableRowProps {
  children: React.ReactNode;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
  onClick?: () => void;
}

function DraggableRow({ 
  children, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd,
  isDragging, 
  isDropTarget,
  onClick 
}: DraggableRowProps) {
  return (
    <TableRow
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        transition-all duration-200 cursor-move
        ${isDragging ? 'opacity-50 bg-muted' : ''} 
        ${isDropTarget ? 'bg-accent border-primary border-2' : ''} 
        ${onClick ? 'hover:bg-muted/50' : ''}
      `}
    >
      <TableCell className="w-8 p-2">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </TableCell>
      {children}
    </TableRow>
  );
}

interface DraggableTableProps<T> {
  headers: string[];
  items: T[];
  onReorder: (items: T[]) => void;
  renderRow: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  getItemKey: (item: T) => string;
}

export function DraggableTable<T>({ 
  headers, 
  items, 
  onReorder, 
  renderRow, 
  onRowClick,
  getItemKey 
}: DraggableTableProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItem = useRef<T | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
    draggedItem.current = items[index];
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[600px] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              {headers.map((header, index) => (
                <TableHead key={index}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <DraggableRow
                key={getItemKey(item)}
                index={index}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                isDropTarget={dragOverIndex === index}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {renderRow(item, index)}
              </DraggableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}