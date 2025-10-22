"use client"

import React from 'react';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface BulkDeleteButtonProps {
  selectedCount: number;
  onDelete: () => void;
  isDeleting?: boolean;
  itemName?: string;
  className?: string;
}

export function BulkDeleteButton({ 
  selectedCount, 
  onDelete, 
  isDeleting = false, 
  itemName = 'item',
  className = ''
}: BulkDeleteButtonProps) {
  if (selectedCount === 0) return null;

  return (
    <Button 
      variant="destructive" 
      onClick={onDelete}
      disabled={isDeleting}
      className={className}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? 'Deleting...' : `Delete ${selectedCount} ${itemName}${selectedCount > 1 ? 's' : ''}`}
    </Button>
  );
}
