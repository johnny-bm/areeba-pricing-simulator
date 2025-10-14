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

export type PricingTypeType = {
  id: string;
  name: string;
  description: string;
  value: string;
  isActive: boolean;
  supportsRecurring?: boolean;
  supportsTiered?: boolean;
  display_order?: number;
}

export const createPricingTypeColumns = (
  onEdit: (type: PricingTypeType) => void,
  onDelete: (type: PricingTypeType) => void,
  onDuplicate: (type: PricingTypeType) => void,
  onToggleActive: (typeId: string) => void
): ColumnDef<PricingTypeType>[] => [
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
  
  // Value column
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const value = row.getValue("value") as string
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {value}
        </Badge>
      )
    },
  },
  
  // Features column
  {
    id: "features",
    header: "Features",
    cell: ({ row }) => {
      const type = row.original
      return (
        <div className="flex gap-1">
          {type.supportsRecurring && (
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              Recurring
            </Badge>
          )}
          {type.supportsTiered && (
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              Tiered
            </Badge>
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
      const type = row.original
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Toggle Active Switch */}
          <Switch
            checked={type.isActive}
            onCheckedChange={() => onToggleActive(type.id)}
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
              <DropdownMenuItem onClick={() => onEdit(type)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(type)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(type)}
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
