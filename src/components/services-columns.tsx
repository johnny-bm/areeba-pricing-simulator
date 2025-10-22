"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Switch } from "./ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { PricingItem } from "@/types/domain"
import { formatPrice } from "@/utils/formatters"

export type ServiceType = PricingItem

export const createServiceColumns = (
  categories: any[],
  onEdit: (service: PricingItem) => void,
  onDelete: (service: PricingItem) => void,
  onDuplicate: (service: PricingItem) => void,
  onToggleActive: (serviceId: string) => void,
  deletingServiceId?: string | null
): ColumnDef<ServiceType>[] => [
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
    cell: ({ row }) => {
      const service = row.original
      return (
        <div>
          <div className="font-medium">{service.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {service.description || "—"}
          </div>
        </div>
      )
    },
  },
  
  // Category column
  {
    accessorKey: "categoryId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const categoryId = row.getValue("categoryId") as string
      const category = categories.find(cat => cat.id === categoryId)
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {category?.name || categoryId}
        </Badge>
      )
    },
  },
  
  // Price column
  {
    accessorKey: "defaultPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("defaultPrice") as number
      return <span className="font-medium">{formatPrice(price)}</span>
    },
  },
  
  // Unit column
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => {
      const unit = row.getValue("unit") as string
      return <span className="text-sm text-muted-foreground">{unit}</span>
    },
  },
  
  // Pricing Type column
  {
    accessorKey: "pricingType",
    header: "Type",
    cell: ({ row }) => {
      const pricingType = row.getValue("pricingType") as string
      const isTiered = pricingType === 'tiered'
      return (
        <Badge 
          variant="outline"
          className={isTiered ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}
        >
          {isTiered ? 'Tiered' : 'Simple'}
        </Badge>
      )
    },
  },
  
  // Tags column
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[] | undefined
      if (!tags || tags.length === 0) {
        return <span className="text-muted-foreground">—</span>
      }
      
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
              +{tags.length - 2} more
            </Badge>
          )}
        </div>
      )
    },
  },
  
  // Status badge (SEMANTIC COLORS!)
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
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
      const service = row.original
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Toggle Active Switch */}
          <Switch
            checked={service.is_active ?? true}
            onCheckedChange={() => onToggleActive(service.id)}
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
              <DropdownMenuItem onClick={() => onEdit(service)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(service)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(service)}
                className="text-red-600"
                disabled={deletingServiceId === service.id}
              >
                {deletingServiceId === service.id ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Deleting...
                  </div>
                ) : (
                  "Delete"
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
