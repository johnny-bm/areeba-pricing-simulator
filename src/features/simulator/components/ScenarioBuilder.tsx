/**
 * ScenarioBuilder - Card-Based Layout
 * Version: 2.1.0
 * Last Updated: 2025-09-30
 * This component uses cards for a cleaner, more visual layout
 */
// React imports
import React, { useState, useMemo, useCallback } from 'react';

// External library imports
import { Edit, X, Search, ChevronDown, ChevronUp } from "lucide-react";

// Internal type imports
import { SelectedItem, ClientConfig, Category } from "../types/domain";

// Internal utility imports
import { formatPrice } from "../utils/formatters";
import { getEffectiveUnitPrice, getConfigBasedQuantity } from "../utils/tieredPricing";

// Internal component imports
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../../../components/ui/collapsible";
import { NumberInput } from "./NumberInput";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";
import { StandardDialog } from "./StandardDialog";

/**
 * Props for the ScenarioBuilder component
 */
interface ScenarioBuilderProps {
  /** Array of selected pricing items */
  selectedItems: SelectedItem[];
  /** Callback to update a selected item */
  onUpdateItem: (id: string, updates: Partial<Omit<SelectedItem, 'id' | 'item'>>) => void;
  /** Callback to remove a selected item */
  onRemoveItem: (id: string) => void;
  /** Client configuration object */
  clientConfig: ClientConfig;
  /** Array of available categories */
  categories: Category[];
  /** Whether the component is in guest mode */
  isGuestMode?: boolean;
}

/**
 * ScenarioBuilder component for managing selected pricing items
 * 
 * This component provides a card-based interface for users to view, edit, and manage
 * their selected pricing items. It supports filtering, searching, and bulk operations.
 * 
 * @param props - Component props
 * @returns JSX element
 */
export const ScenarioBuilder = React.memo(function ScenarioBuilder({ 
  selectedItems, 
  onUpdateItem, 
  onRemoveItem, 
  clientConfig, 
  categories,
  isGuestMode = false
}: ScenarioBuilderProps) {
  const [editingItem, setEditingItem] = useState<SelectedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [allCardsExpanded, setAllCardsExpanded] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [allCategoriesExpanded, setAllCategoriesExpanded] = useState<boolean>(true);

  /**
   * Gets the current calculated quantity for auto-synced items
   * @param selectedItem - The selected item to get quantity for
   * @returns The current quantity
   */
  const getCurrentQuantity = (selectedItem: SelectedItem): number => {
    // Always return the actual selected quantity, not recalculate from config
    return selectedItem.quantity;
  };

  /**
   * Calculates the total price for a selected item including discounts
   * @param item - The selected item to calculate total for
   * @returns The calculated total price
   */
  const calculateRowTotal = (item: SelectedItem) => {
    if (item.isFree) return 0;
    
    const currentQuantity = getCurrentQuantity(item);
    const discountApplication = item.discountApplication || 'total';
    
    if (discountApplication === 'unit') {
      let effectiveUnitPrice = item.unitPrice;
      
      if (item.discountType === 'percentage') {
        effectiveUnitPrice = item.unitPrice * (1 - item.discount / 100);
      } else {
        effectiveUnitPrice = item.unitPrice - item.discount;
      }
      
      effectiveUnitPrice = Math.max(0, effectiveUnitPrice);
      return effectiveUnitPrice * currentQuantity;
    } else {
      const subtotal = currentQuantity * item.unitPrice;
      
      let discountAmount = 0;
      if (item.discountType === 'percentage') {
        discountAmount = subtotal * (item.discount / 100);
      } else {
        discountAmount = item.discount * currentQuantity;
      }
      
      return Math.max(0, subtotal - discountAmount);
    }
  };

  const getCategoryName = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }, [categories]);

  const handleEditItem = useCallback((item: SelectedItem) => {
    setEditingItem(item);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditingItem(null);
  }, []);

  const handleUpdateEditingItem = useCallback((updates: Partial<Omit<SelectedItem, 'id' | 'item'>>) => {
    if (editingItem) {
      // If quantity is being updated and this is a tiered pricing item, recalculate unit price
      if (updates.quantity !== undefined && editingItem.item.pricingType === 'tiered') {
        const newUnitPrice = getEffectiveUnitPrice(editingItem.item, updates.quantity);
        updates.unitPrice = newUnitPrice;
      }
      
      onUpdateItem(editingItem.id, updates);
      // Update local editing state
      setEditingItem({ ...editingItem, ...updates });
    }
  }, [editingItem, onUpdateItem]);

  const handleQuickRemove = useCallback((item: SelectedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveItem(item.id);
  }, [onRemoveItem]);

  const toggleCardExpanded = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  const handleToggleAllCards = useCallback(() => {
    const newExpandedValue = !allCardsExpanded;
    
    // Expand/collapse all categories
    const newCategoryState: Record<string, boolean> = {};
    selectedCategories.forEach(cat => {
      newCategoryState[cat.id] = newExpandedValue;
    });
    setExpandedCategories(newCategoryState);
    setAllCategoriesExpanded(newExpandedValue);
    
    // Expand/collapse all service cards
    const newCardState: Record<string, boolean> = {};
    selectedItems.forEach(item => {
      newCardState[item.id] = newExpandedValue;
    });
    setExpandedCards(newCardState);
    setAllCardsExpanded(newExpandedValue);
  }, [allCardsExpanded, selectedCategories, selectedItems]);

  const handleToggleAllCategories = () => {
    const newExpandedValue = !allCategoriesExpanded;
    
    // Expand/collapse all categories
    const newCategoryState: Record<string, boolean> = {};
    categories.forEach(cat => {
      newCategoryState[cat.id] = newExpandedValue;
    });
    setExpandedCategories(newCategoryState);
    setAllCategoriesExpanded(newExpandedValue);
    
    // Expand/collapse all service cards
    const newCardState: Record<string, boolean> = {};
    selectedItems.forEach(item => {
      newCardState[item.id] = newExpandedValue;
    });
    setExpandedCards(newCardState);
    setAllCardsExpanded(newExpandedValue);
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let result = selectedItems;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return (
          item.item.name.toLowerCase().includes(query) ||
          item.item.description.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(item => item.item.categoryId === filterCategory);
    }
    
    return result;
  }, [selectedItems, searchQuery, filterCategory]);

  // Get unique categories from selected items
  const selectedCategories = useMemo(() => {
    const categoryIds = new Set(selectedItems.map(item => item.item.categoryId));
    return categories
      .filter(cat => categoryIds.has(cat.id))
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [selectedItems, categories]);

  // Group filtered items by category
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<string, SelectedItem[]>();
    
    filteredItems.forEach(item => {
      const categoryId = item.item.categoryId;
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(item);
    });
    
    return grouped;
  }, [filteredItems]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeaderWithCollapse
          title="Selected Services"
          description={`${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`}
          isCollapsed={!allCardsExpanded}
          onToggle={handleToggleAllCards}
          showCollapseButton={selectedItems.length > 0}
        />
        <CardContent className="space-y-4 pt-6 pb-6">
          {selectedItems.length > 0 ? (
            <>
              {/* Search and Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search selected services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {selectedCategories.length > 1 && (
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {selectedCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Service Cards Grouped by Category */}
              <div className="space-y-3">
                {categories
                  .filter(category => itemsByCategory.has(category.id))
                  .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                  .map((category) => {
                    const categoryItems = itemsByCategory.get(category.id) || [];
                    const isCategoryExpanded = expandedCategories[category.id] ?? allCategoriesExpanded;
                    
                    return (
                      <Collapsible
                        key={category.id}
                        open={isCategoryExpanded}
                        onOpenChange={() => toggleCategoryExpanded(category.id)}
                      >
                        <div className="border rounded-lg">
                          {/* Category Header */}
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg">
                              <div className="flex items-center gap-3">
                                <ChevronDown className={`h-5 w-5 transition-transform ${isCategoryExpanded ? 'transform rotate-0' : 'transform -rotate-90'}`} />
                                <div>
                                  <h3 className="font-medium">{category.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {categoryItems.length} service{categoryItems.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary">
                                {categoryItems.length}
                              </Badge>
                            </div>
                          </CollapsibleTrigger>

                          {/* Category Items */}
                          <CollapsibleContent>
                            <div className="p-3 space-y-2 border-t">
                              {categoryItems.map((selectedItem) => {
                                const currentQuantity = getCurrentQuantity(selectedItem);
                                const total = calculateRowTotal(selectedItem);
                                const hasAutoQuantity = (selectedItem.item.quantitySourceFields || []).length > 0;
                                const isExpanded = expandedCards[selectedItem.id] ?? allCardsExpanded;
                                
                                return (
                                  <Card
                                    key={selectedItem.id}
                                    className="transition-all hover:shadow-md"
                                  >
                                    <CardContent className="p-[12px]">
                                      {/* Super Compact Collapsed/Expanded Layout */}
                                      
                                      {/* Collapsed State - Minimal Info */}
                                      <div className="flex items-start justify-between gap-3">
                                        {/* Left: Service Name + Total Price */}
                                        <div className="flex-1 min-w-0">
                                          <div 
                                            className="font-medium truncate cursor-pointer mb-1 text-[14px]"
                                            onClick={() => handleEditItem(selectedItem)}
                                            title={selectedItem.item.name}
                                          >
                                            {selectedItem.item.name}
                                          </div>
                                          <div className="text-sm">
                                            {selectedItem.isFree ? (
                                              <div className="flex items-center gap-1.5">
                                                <span className="line-through text-muted-foreground">
                                                  {formatPrice(currentQuantity * selectedItem.unitPrice)}
                                                </span>
                                                <span className="text-green-600 font-medium">
                                                  {formatPrice(0)}
                                                </span>
                                              </div>
                                            ) : selectedItem.discount > 0 ? (
                                              <div className="flex items-center gap-1.5">
                                                <span className="line-through text-muted-foreground text-[12px]">
                                                  {formatPrice(currentQuantity * selectedItem.unitPrice)}
                                                </span>
                                                <span className="font-medium text-foreground text-[12px] text-[13px]">
                                                  {formatPrice(total)}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="font-medium text-muted-foreground">{formatPrice(total)}</span>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Right: Chevron Only */}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => toggleCardExpanded(selectedItem.id, e)}
                                          className="h-8 w-8 p-0 flex-shrink-0"
                                          title={isExpanded ? "Collapse" : "Expand"}
                                        >
                                          {isExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </div>
                                      
                                      {/* Expanded State - Full Details */}
                                      {isExpanded && (
                                        <div className="mt-3 border-t space-y-3 pt-3">
                                          {/* Quantity Breakdown */}
                                          <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Quantity Breakdown</span>
                                            <span className="font-medium">
                                              {currentQuantity.toLocaleString()} × {formatPrice(selectedItem.unitPrice)}
                                            </span>
                                          </div>
                                          
                                          {/* Badges Section */}
                                          <div className="flex items-center gap-1 flex-wrap">
                                            {!isGuestMode && selectedItem.isFree && (
                                              <Badge variant="default" className="bg-green-600 text-xs">
                                                FREE
                                              </Badge>
                                            )}
                                            {selectedItem.item.pricingType === 'tiered' && (
                                              <Badge variant="secondary" className="text-xs">
                                                Tiered Pricing
                                              </Badge>
                                            )}
                                            {hasAutoQuantity && (
                                              <Badge variant="outline" className="text-xs">
                                                Auto Quantity
                                              </Badge>
                                            )}
                                            {!isGuestMode && selectedItem.discount > 0 && !selectedItem.isFree && (
                                              <Badge variant="secondary" className="text-xs">
                                                Discount: -{selectedItem.discount}{selectedItem.discountType === 'percentage' ? '%' : ' USD'}
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          {/* Pricing Details */}
                                          {(selectedItem.isFree || selectedItem.discount > 0) && (
                                            <div className="flex items-center justify-between text-sm">
                                              <span className="text-muted-foreground">Total</span>
                                              <div className="flex items-center gap-2">
                                                {selectedItem.isFree ? (
                                                  <>
                                                    <span className="line-through text-muted-foreground">
                                                      {formatPrice(currentQuantity * selectedItem.unitPrice)}
                                                    </span>
                                                    <span className="font-medium text-green-600">
                                                      {formatPrice(0)}
                                                    </span>
                                                  </>
                                                ) : selectedItem.discount > 0 ? (
                                                  <>
                                                    <span className="line-through text-muted-foreground">
                                                      {formatPrice(currentQuantity * selectedItem.unitPrice)}
                                                    </span>
                                                    <span className="font-medium">
                                                      {formatPrice(total)}
                                                    </span>
                                                  </>
                                                ) : null}
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Action Links */}
                                          <div className="flex items-center gap-4 pt-2 border-t text-sm">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditItem(selectedItem);
                                              }}
                                              className="text-primary hover:underline text-[14px] no-underline"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={(e) => handleQuickRemove(selectedItem, e)}
                                              className="text-destructive hover:underline"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
              </div>

              {/* Empty Filter State */}
              {filteredItems.length === 0 && selectedItems.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No services match your filter</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No services selected</p>
              <p className="text-sm">Add services from the library to start building your scenario</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Item Dialog */}
      <StandardDialog
        isOpen={!!editingItem}
        onClose={handleCloseEditor}
        title="Edit Service"
        description="Configure pricing and discounts for this service"
        size="lg"
        primaryAction={{
          label: 'Done',
          onClick: handleCloseEditor,
          variant: 'default'
        }}
        destructiveActions={editingItem ? [{
          label: 'Remove',
          onClick: () => {
            onRemoveItem(editingItem.id);
            handleCloseEditor();
          },
          variant: 'destructive',
          icon: <X className="h-4 w-4" />
        }] : []}
      >
        {editingItem && (
          <div className="space-y-4">
              {/* Service Info */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">{editingItem.item.name}</h4>
                <p className="text-sm text-muted-foreground">{editingItem.item.description}</p>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="edit-quantity">
                  Quantity
                  {((editingItem.item.quantitySourceFields || []).length > 0) && (
                    <span className="ml-1 text-xs text-blue-600" title="Quantity automatically calculated from configuration">
                      🔄 Auto
                    </span>
                  )}
                </Label>
                {((editingItem.item.quantitySourceFields || []).length > 0) ? (
                  <div className="h-10 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md cursor-not-allowed flex items-center justify-between">
                    <span className="text-foreground">
                      {getCurrentQuantity(editingItem).toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-600">
                      Automatically calculated
                    </span>
                  </div>
                ) : (
                  <NumberInput
                    id="edit-quantity"
                    value={editingItem.quantity}
                    onChange={(value) => handleUpdateEditingItem({ quantity: value })}
                  />
                )}
              </div>

              {/* Unit Price - Hidden in guest mode */}
              {!isGuestMode && (
                <div>
                  <Label htmlFor="edit-unitPrice">
                    {editingItem.item.pricingType === 'tiered' ? 'Current Tier Price (USD)' : 'Unit Price (USD)'}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <NumberInput
                      id="edit-unitPrice"
                      value={editingItem.item.pricingType === 'tiered' ? 
                        getEffectiveUnitPrice(editingItem.item, getCurrentQuantity(editingItem)) : 
                        editingItem.unitPrice
                      }
                      onChange={(value) => handleUpdateEditingItem({ unitPrice: value })}
                      min={0}
                      step={0.01}
                      disabled={editingItem.isFree || editingItem.item.pricingType === 'tiered'}
                      className="pl-8"
                      allowDecimals={true}
                    />
                  </div>
                  {editingItem.item.pricingType === 'tiered' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Price is automatically determined by quantity tier
                    </p>
                  )}
                </div>
              )}

              {/* Discount - Hidden in guest mode */}
              {!isGuestMode && (
                <div>
                  <Label>Discount</Label>
                  <div className="flex gap-2">
                    <NumberInput
                      value={editingItem.discount}
                      onChange={(value) => handleUpdateEditingItem({ discount: value })}
                      min={0}
                      max={editingItem.discountType === 'percentage' ? 100 : undefined}
                      step={editingItem.discountType === 'percentage' ? 0.1 : 0.01}
                      disabled={editingItem.isFree}
                      className="flex-1"
                      allowDecimals={true}
                    />
                    <Select 
                      value={editingItem.discountType} 
                      onValueChange={(value: 'percentage' | 'fixed') => handleUpdateEditingItem({
                        discountType: value,
                        discount: 0
                      })}
                      disabled={editingItem.isFree}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Discount Application - Hidden in guest mode */}
              {!isGuestMode && (
                <div>
                  <Label>Apply Discount To</Label>
                  <Select 
                    value={editingItem.discountApplication || 'total'} 
                    onValueChange={(value: 'unit' | 'total') => handleUpdateEditingItem({
                      discountApplication: value
                    })}
                    disabled={editingItem.isFree}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">Unit Price</SelectItem>
                      <SelectItem value="total">Total Price</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {editingItem.discountApplication === 'unit' 
                      ? 'Discount is applied to each unit, then multiplied by quantity'
                      : 'Discount is applied to the total price (quantity × unit price)'}
                  </p>
                </div>
              )}

              {/* Make Free Switch - Hidden in guest mode */}
              {!isGuestMode && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <Label htmlFor="edit-free" className="mb-0">Make this service free</Label>
                  <Switch
                    id="edit-free"
                    checked={editingItem.isFree}
                    onCheckedChange={(checked) => handleUpdateEditingItem({
                      isFree: checked,
                      ...(checked ? { discount: 0 } : {})
                    })}
                  />
                </div>
              )}

              {/* Price Summary */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Price Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{getCurrentQuantity(editingItem).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price:</span>
                    <span>
                      {editingItem.item.pricingType === 'tiered' 
                        ? formatPrice(getEffectiveUnitPrice(editingItem.item, getCurrentQuantity(editingItem)))
                        : formatPrice(editingItem.unitPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(getCurrentQuantity(editingItem) * editingItem.unitPrice)}</span>
                  </div>
                  {editingItem.discount > 0 && !editingItem.isFree && (
                    <div className="flex justify-between text-blue-600">
                      <span>Discount:</span>
                      <span>
                        -{editingItem.discount}{editingItem.discountType === 'percentage' ? '%' : ' USD'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total:</span>
                    <span className={editingItem.isFree ? 'text-green-600' : ''}>
                      {formatPrice(calculateRowTotal(editingItem))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
      </StandardDialog>
    </div>
  );
});