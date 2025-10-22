import { useState, useRef, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GripVertical, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

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

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface DataTableProps<T> {
  // Table configuration
  title: string;
  description?: string;
  headers: string[];
  items: T[];
  
  // Row rendering and identification
  renderRow: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  
  // Actions
  onReorder?: (items: T[]) => void;
  actionButton?: React.ReactNode;
  
  // Search and filtering
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  filterOptions?: {
    key: keyof T;
    label: string;
    options: FilterOption[];
  }[];
  
  // Pagination
  itemsPerPage?: number;
  
  // Loading and empty states
  isLoading?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: React.ReactNode;
  emptyStateAction?: React.ReactNode;
}

export function DataTable<T>({ 
  title,
  description,
  headers, 
  items, 
  renderRow,
  getItemKey,
  onRowClick,
  onReorder,
  actionButton,
  searchPlaceholder = 'Search items...',
  searchFields = [],
  filterOptions = [],
  itemsPerPage = 20,
  isLoading = false,
  emptyStateTitle = 'No items found',
  emptyStateDescription = 'There are no items to display.',
  emptyStateIcon,
  emptyStateAction
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItem = useRef<T | null>(null);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    // Ensure items is always an array to prevent "items is not iterable" error
    const safeItems = Array.isArray(items) ? items : [];
    let filtered = [...safeItems];

    // Apply search filter
    if (searchTerm && searchFields.length > 0) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(term);
          }
          if (typeof value === 'number') {
            return value.toString().includes(term);
          }
          if (Array.isArray(value)) {
            return value.some(v => 
              typeof v === 'string' && v.toLowerCase().includes(term)
            );
          }
          return false;
        })
      );
    }

    // Apply category/field filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        filtered = filtered.filter(item => {
          const value = item[filterKey as keyof T];
          // Handle boolean values as strings
          if (typeof value === 'boolean') {
            return value.toString() === filterValue;
          }
          return value === filterValue;
        });
      }
    });

    return filtered;
  }, [items, searchTerm, searchFields, activeFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setCurrentPage(0);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    if (!onReorder) return;
    setDraggedIndex(index);
    draggedItem.current = paginatedItems[index];
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!onReorder) return;
    e.preventDefault();
    
    if (draggedIndex === null || draggedItem.current === null || draggedIndex === dropIndex) {
      return;
    }

    const newPageItems = [...paginatedItems];
    newPageItems.splice(draggedIndex, 1);
    newPageItems.splice(dropIndex, 0, draggedItem.current);
    
    // Reconstruct the full array with reordered page items
    const startIndex = currentPage * itemsPerPage;
    const newItems = [...filteredItems];
    newPageItems.forEach((item, index) => {
      newItems[startIndex + index] = item;
    });
    
    onReorder(newItems);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItem.current = null;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, newPage)));
  };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {isLoading ? (
        <div className="border rounded-lg p-8">
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      ) : filteredItems.length === 0 && searchTerm === '' && activeFilterCount === 0 ? (
        /* Empty state - only show when no filters/search active */
        <div className="border rounded-lg p-8">
          <div className="text-center">
            {emptyStateIcon && (
              <div className="flex justify-center mb-4">
                {emptyStateIcon}
              </div>
            )}
            <h3 className="text-lg font-medium mb-2">{emptyStateTitle}</h3>
            <p className="text-muted-foreground mb-4">{emptyStateDescription}</p>
            {emptyStateAction}
          </div>
        </div>
      ) : (
        <>
          {/* Main Content Card */}
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background">
              <div className="flex justify-between items-center">
                <h2 className="text-lg">{title}</h2>
                <div className="[&>button]:h-8 [&>button]:text-sm">
                  {actionButton}
                </div>
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {/* Search and Filters */}
            {(searchFields.length > 0 || filterOptions.length > 0) && (
              <div className="p-4 border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  {searchFields.length > 0 && (
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={searchPlaceholder}
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  {filterOptions.map(filter => (
                    <div key={filter.key as string} className="min-w-[180px]">
                      <Select
                        value={activeFilters[filter.key as string] || 'all'}
                        onValueChange={(value) => handleFilterChange(filter.key as string, value)}
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder={filter.label} />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {filter.label}</SelectItem>
                          {filter.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label}</span>
                                {option.count !== undefined && (
                                  <Badge variant="secondary" className="ml-2">
                                    {option.count}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                {/* Active filters indicator */}
                {activeFilterCount > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    <Badge variant="secondary">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveFilters({});
                        setSearchTerm('');
                        setCurrentPage(0);
                      }}
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* No results state */}
            {filteredItems.length === 0 && (searchTerm !== '' || activeFilterCount > 0) ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No items found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="max-h-[600px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        {onReorder && <TableHead className="w-8"></TableHead>}
                        {headers.map((header, index) => (
                          <TableHead key={index}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((item, index) => (
                        onReorder ? (
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
                        ) : (
                          <TableRow
                            key={getItemKey(item)}
                            onClick={onRowClick ? () => onRowClick(item) : undefined}
                            className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                          >
                            {renderRow(item, index)}
                          </TableRow>
                        )
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                  <div className="flex items-center justify-between p-4 border-t bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                      Showing {currentPage * itemsPerPage + 1} to {Math.min((currentPage + 1) * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                      {filteredItems.length !== items.length && (
                        <span className="ml-1">
                          (filtered from {items.length} total)
                        </span>
                      )}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <span className="text-sm">
                          Page {currentPage + 1} of {totalPages}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}