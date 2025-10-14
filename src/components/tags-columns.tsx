"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { ArrowUpDown, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"

export type TagDataType = {
  name: string;
  count: number;
  items: any[];
}

export const createTagColumns = (
  onView: (tag: TagDataType) => void,
  onDelete: (tagName: string) => void,
  onDuplicate: (tagName: string) => void
): ColumnDef<TagDataType>[] => [
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
  
  // Sortable tag name column
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tag Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const tagName = row.getValue("name") as string
      return (
        <div className="font-medium">
          {tagName}
        </div>
      )
    },
  },
  
  // Usage count column
  {
    accessorKey: "count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Usage Count
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.getValue("count") as number
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {count} service{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  
  // Services column
  {
    accessorKey: "items",
    header: "Services",
    cell: ({ row }) => {
      const items = row.getValue("items") as any[]
      return (
        <div className="text-sm text-muted-foreground max-w-xs">
          {items.slice(0, 3).map(item => item.name).join(', ')}
          {items.length > 3 && ` +${items.length - 3} more`}
        </div>
      )
    },
  },
  
  // Actions column
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const tag = row.original
      return (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Kebab Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(tag)}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(tag.name)}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(tag.name)}
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
