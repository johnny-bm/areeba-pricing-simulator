"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Switch } from "@/shared/components/ui/switch"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

export type TieredTemplateType = {
  id: string;
  name: string;
  description: string;
  tiers: Array<{
    min: number;
    max: number | null;
    price: number;
    unit: string;
  }>;
  isActive: boolean;
  display_order?: number;
}

export const createTieredTemplateColumns = (
  onEdit: (template: TieredTemplateType) => void,
  onDelete: (template: TieredTemplateType) => void,
  onDuplicate: (template: TieredTemplateType) => void,
  onToggleActive: (templateId: string) => void
): ColumnDef<TieredTemplateType>[] => [
  // Selection checkbox
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
  },
  
  // Sortable name column
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  
  // Description column
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {description || "—"}
        </div>
      )
    },
  },
  
  // Tiers column
  {
    accessorKey: "tiers",
    header: "Tiers",
    cell: ({ row }) => {
      const tiers = row.getValue("tiers") as Array<{min: number; max: number | null; price: number; unit: string}>
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {tiers?.length || 0} tier{tiers?.length !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  
  // Price range column
  {
    id: "priceRange",
    header: "Price Range",
    cell: ({ row }) => {
      const tiers = row.original.tiers
      if (!tiers || tiers.length === 0) return <span className="text-muted-foreground">—</span>
      
      const minPrice = Math.min(...tiers.map(t => t.price))
      const maxPrice = Math.max(...tiers.map(t => t.price))
      
      return (
        <div className="text-sm">
          <span className="font-medium">${minPrice.toFixed(2)}</span>
          {minPrice !== maxPrice && (
            <>
              <span className="text-muted-foreground"> - </span>
              <span className="font-medium">${maxPrice.toFixed(2)}</span>
            </>
          )}
        </div>
      )
    },
  },
  
  // Display order column
  {
    accessorKey: "display_order",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Order
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const order = row.getValue("display_order") as number
      return (
        <Badge variant="outline">
          {order || "—"}
        </Badge>
      )
    },
  },
  
  // Status badge (SEMANTIC COLORS!)
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean
      return (
        <Badge 
          variant="outline"
          className={isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  
  // Actions column
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const template = row.original
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Toggle Active Switch */}
          <Switch
            checked={template.isActive}
            onCheckedChange={() => onToggleActive(template.id)}
            className="data-[state=unchecked]:bg-gray-200"
          />
          {/* Kebab Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(template)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(template)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
