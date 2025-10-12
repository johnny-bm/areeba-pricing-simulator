/**
 * ItemLibrary - Card-Based Layout
 * Version: 2.1.0
 * Last Updated: 2025-09-30
 * This component uses cards for a cleaner, more visual layout
 */
import { useState, useMemo } from 'react';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Plus, Minus, ChevronDown, ChevronUp, Sparkles, X, Search } from "lucide-react";
import { PricingItem, ClientConfig, Category, SelectedItem } from "../types/domain";
import { formatPrice } from "../utils/formatters";
import { CardHeaderWithCollapse } from "./CardHeaderWithCollapse";

interface ItemLibraryProps {
  items: PricingItem[];
  categories: Category[];
  selectedItemIds: string[];
  selectedItems: SelectedItem[];
  onAddItem: (item: PricingItem) => void;
  onRemoveItem: (itemId: string) => void;
  clientConfig: ClientConfig;
}

export function ItemLibrary({ 
  items, 
  categories, 
  selectedItemIds, 
  selectedItems, 
  onAddItem, 
  onRemoveItem, 
  clientConfig 
}: ItemLibraryProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [showAllTags, setShowAllTags] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [allCategoriesExpanded, setAllCategoriesExpanded] = useState<boolean>(true);

  // Create sorted categories based on order_index
  const sortedCategories = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [];
    }
    return [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [categories]);

  // Get all unique tags across all items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  // Get smart suggestions based on currently selected items
  const smartSuggestions = useMemo(() => {
    if (selectedItemIds.length === 0) return [];

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const selectedTagCounts: Record<string, number> = {};
    
    // Count tags from selected items
    selectedItems.forEach(item => {
      item.tags?.forEach(tag => {
        selectedTagCounts[tag] = (selectedTagCounts[tag] || 0) + 1;
      });
    });

    // Find items with similar tags that aren't already selected
    const suggestions = items
      .filter(item => !selectedItemIds.includes(item.id))
      .map(item => {
        let score = 0;
        item.tags?.forEach(tag => {
          score += selectedTagCounts[tag] || 0;
        });
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ item }) => item);

    return suggestions;
  }, [items, selectedItemIds]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  const handleToggleItem = (item: PricingItem) => {
    const isSelected = selectedItemIds.includes(item.id);
    if (isSelected) {
      const selectedItemToRemove = selectedItems.find(selected => selected.item.id === item.id);
      if (selectedItemToRemove) {
        onRemoveItem(selectedItemToRemove.id);
      }
    } else {
      onAddItem(item);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleToggleAllCategories = () => {
    const newOpenState: Record<string, boolean> = {};
    const newExpandedState = !allCategoriesExpanded;
    
    sortedCategories.forEach(cat => {
      newOpenState[cat.id] = newExpandedState;
    });
    setOpenCategories(newOpenState);
    setAllCategoriesExpanded(newExpandedState);
  };

  // Filter items based on selected tags and search
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(item => {
        return item.tags && selectedTags.every(selectedTag => item.tags!.includes(selectedTag));
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }
    
    return result;
  }, [items, selectedTags, searchQuery]);

  // Group filtered items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, PricingItem[]> = {};
    filteredItems.forEach(item => {
      if (!grouped[item.categoryId]) {
        grouped[item.categoryId] = [];
      }
      grouped[item.categoryId].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const displayedTags = showAllTags ? allTags : allTags.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card>
        <CardHeaderWithCollapse
          title="Service Library"
          description={`${selectedItemIds.length} selected · ${filteredItems.length} available`}
          isCollapsed={!allCategoriesExpanded}
          onToggle={handleToggleAllCategories}
          showCollapseButton={sortedCategories.length > 1}
        />
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Filter by tags</span>
                {(selectedTags.length > 0 || searchQuery.trim()) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {displayedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length > 6 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="h-6 px-2 text-xs"
                  >
                    {showAllTags ? 'Show less' : `+${allTags.length - 6} more`}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && selectedTags.length === 0 && !searchQuery.trim() && (
            <div className="border border-primary/20 bg-primary/5 rounded-lg">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Suggested Services</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="h-6 px-2 text-xs"
                  >
                    {showSuggestions ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showSuggestions && (
                  <div className="space-y-2">
                    {smartSuggestions.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id);
                      return (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => handleToggleItem(item)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium mb-1">{item.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {item.description}
                                </div>
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {item.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{item.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-sm font-medium">
                                  {item.pricingType === 'tiered' ? (
                                    <div className="text-right">
                                      <Badge variant="default" className="text-xs mb-1">Tiered</Badge>
                                      <div className="text-muted-foreground text-xs">
                                        from {formatPrice(item.tiers?.[0]?.unitPrice || item.defaultPrice)}
                                      </div>
                                    </div>
                                  ) : (
                                    formatPrice(item.defaultPrice)
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "default" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleItem(item);
                                  }}
                                >
                                  {isSelected ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Sections */}
          <div className="space-y-3">
            {sortedCategories.map(category => {
              const categoryItems = itemsByCategory[category.id] || [];
              if (categoryItems.length === 0) return null;

              const isOpen = openCategories[category.id] ?? allCategoriesExpanded; // Default to allCategoriesExpanded state

              return (
                <Collapsible
                  key={category.id}
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.id)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{category.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {categoryItems.length}
                          </Badge>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t">
                        {/* Compact List View */}
                        <div className="divide-y">
                          {categoryItems.map((item) => {
                            const isSelected = selectedItemIds.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                                  isSelected ? 'bg-muted' : ''
                                }`}
                                onClick={() => handleToggleItem(item)}
                              >
                                {/* Left: Service Name & Description */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium mb-0.5 text-[14px]">{item.name}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-1 text-[12px]">
                                    {item.description}
                                  </div>
                                </div>
                                
                                {/* Right: Price + Billing Type + Button */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {/* Price with billing type badge */}
                                  <div className="text-right">
                                    {item.pricingType === 'tiered' ? (
                                      <>
                                        <div className="text-sm font-medium">
                                          {formatPrice(item.tiers?.[0]?.unitPrice || item.defaultPrice)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Tiered · {item.unit}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="text-sm font-medium">
                                          {formatPrice(item.defaultPrice)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {item.unit}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  
                                  {/* Add/Remove Button */}
                                  <Button
                                    size="sm"
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleItem(item);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    {isSelected ? (
                                      <Minus className="h-4 w-4" />
                                    ) : (
                                      <Plus className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No services found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}