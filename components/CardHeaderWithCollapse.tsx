import { CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CardHeaderWithCollapseProps {
  title: string;
  description: string;
  isCollapsed: boolean;
  onToggle: () => void;
  showCollapseButton?: boolean;
  variant?: 'main' | 'sub'; // Add variant prop
}

export function CardHeaderWithCollapse({
  title,
  description,
  isCollapsed,
  onToggle,
  showCollapseButton = true,
  variant = 'main'
}: CardHeaderWithCollapseProps) {
  
  // For sub-cards, the entire header is clickable with just a chevron icon
  if (variant === 'sub') {
    return (
      <CardHeader 
        className="border-b cursor-pointer hover:bg-muted/50 transition-colors p-[24px]"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-[12px]">{description}</CardDescription>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isCollapsed ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </CardHeader>
    );
  }
  
  // For main cards, only the button is clickable
  return (
    <CardHeader className="border-b p-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-[12px]">{description}</CardDescription>
        </div>
        {showCollapseButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="text-xs"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Expand All
              </>
            ) : (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Collapse All
              </>
            )}
          </Button>
        )}
      </div>
    </CardHeader>
  );
}