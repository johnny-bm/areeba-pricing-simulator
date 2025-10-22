import { Button } from '../ui/button';
import { Pencil, Trash2, Copy, Check, X, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggle?: () => void;
  isActive?: boolean;
  isDeleting?: boolean;
  isDuplicating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'destructive';
  className?: string;
  showMore?: boolean;
  onMore?: () => void;
}

export function ActionButtons({
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  isActive,
  isDeleting = false,
  isDuplicating = false,
  size = 'sm',
  variant = 'ghost',
  className,
  showMore = false,
  onMore
}: ActionButtonsProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {onEdit && (
        <Button
          size={size}
          variant={variant}
          onClick={onEdit}
          className="h-8 w-8 p-0"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      
      {onToggle && (
        <Button
          size={size}
          variant={variant}
          onClick={onToggle}
          className="h-8 w-8 p-0"
          title={isActive ? 'Deactivate' : 'Activate'}
        >
          {isActive ? (
            <X className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      )}
      
      {onDuplicate && (
        <Button
          size={size}
          variant={variant}
          onClick={onDuplicate}
          disabled={isDuplicating}
          className="h-8 w-8 p-0"
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
      
      {onDelete && (
        <Button
          size={size}
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      
      {showMore && onMore && (
        <Button
          size={size}
          variant={variant}
          onClick={onMore}
          className="h-8 w-8 p-0"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
