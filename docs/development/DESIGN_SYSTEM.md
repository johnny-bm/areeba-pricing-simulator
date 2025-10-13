# areeba Design System

**Version**: 1.0.0  
**Based on**: shadcn/ui + Tailwind CSS  
**Last Updated**: 2024-12-19

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Component Standards](#component-standards)
3. [Styling Standards](#styling-standards)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing System](#spacing-system)
7. [Layout Patterns](#layout-patterns)
8. [Forms](#forms)
9. [Accessibility](#accessibility)
10. [Code Review Checklist](#code-review-checklist)

---

## Philosophy

### Core Principles

1. **Consistency Over Creativity**
   - Use existing components before creating new ones
   - Follow established patterns
   - Maintain visual and behavioral consistency

2. **shadcn/ui First**
   - Always use shadcn/ui components
   - Extend components, don't recreate them
   - Contribute improvements back to the component

3. **Design Tokens Over Hardcoded Values**
   - Use Tailwind's predefined scale
   - Use semantic color names (primary, secondary, destructive)
   - Never hardcode colors, spacing, or sizes

4. **Accessibility By Default**
   - All components must be keyboard navigable
   - Include proper ARIA labels
   - Support screen readers

---

## Component Standards

### Rule 1: Always Use shadcn/ui Components

**Components Available:**
- Alert - `@/components/ui/alert`
- Alert Dialog - `@/components/ui/alert-dialog`
- Aspect Ratio - `@/components/ui/aspect-ratio`
- Avatar - `@/components/ui/avatar`
- Badge - `@/components/ui/badge`
- Breadcrumb - `@/components/ui/breadcrumb`
- Button - `@/components/ui/button`
- Calendar - `@/components/ui/calendar`
- Card - `@/components/ui/card`
- Carousel - `@/components/ui/carousel`
- Chart - `@/components/ui/chart`
- Checkbox - `@/components/ui/checkbox`
- Collapsible - `@/components/ui/collapsible`
- Color Indicator - `@/components/ui/color-indicator`
- Command - `@/components/ui/command`
- Context Menu - `@/components/ui/context-menu`
- Dialog - `@/components/ui/dialog`
- Drawer - `@/components/ui/drawer`
- Dropdown Menu - `@/components/ui/dropdown-menu`
- Form - `@/components/ui/form`
- Hover Card - `@/components/ui/hover-card`
- Input - `@/components/ui/input`
- Input OTP - `@/components/ui/input-otp`
- Label - `@/components/ui/label`
- Menubar - `@/components/ui/menubar`
- Navigation Menu - `@/components/ui/navigation-menu`
- Pagination - `@/components/ui/pagination`
- Popover - `@/components/ui/popover`
- Progress - `@/components/ui/progress`
- Radio Group - `@/components/ui/radio-group`
- Resizable - `@/components/ui/resizable`
- Scroll Area - `@/components/ui/scroll-area`
- Select - `@/components/ui/select`
- Separator - `@/components/ui/separator`
- Sheet - `@/components/ui/sheet`
- Sidebar - `@/components/ui/sidebar`
- Skeleton - `@/components/ui/skeleton`
- Slider - `@/components/ui/slider`
- Sonner - `@/components/ui/sonner`
- Spinner - `@/components/ui/spinner`
- Switch - `@/components/ui/switch`
- Table - `@/components/ui/table`
- Tabs - `@/components/ui/tabs`
- Textarea - `@/components/ui/textarea`
- Toggle - `@/components/ui/toggle`
- Toggle Group - `@/components/ui/toggle-group`
- Tooltip - `@/components/ui/tooltip`

### ❌ Anti-Pattern: Custom Buttons
```tsx
// NEVER DO THIS
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### ✅ Correct: Use shadcn Button
```tsx
import { Button } from '@/components/ui/button'

<Button>Click Me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button size="sm">Small</Button>
```

### Available Button Variants
```tsx
// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Rule 2: Compose Complex Components
When building custom components, compose with shadcn primitives:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({ title, message, onConfirm }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{message}</p>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Styling Standards

### Rule 1: Use Tailwind Utilities Only

**NEVER use:**
- ❌ Inline styles: `style={{ ... }}`
- ❌ Hardcoded hex: `bg-[#3B82F6]`
- ❌ Arbitrary pixels: `w-[250px]`
- ❌ Custom CSS classes (except when absolutely necessary)

**ALWAYS use:**
- ✅ Tailwind utilities: `bg-blue-500`
- ✅ Design tokens: `bg-primary`
- ✅ Predefined scale: `w-64`

### ❌ Anti-Pattern: Hardcoded Values
```tsx
<div 
  className="bg-[#3B82F6] w-[250px] h-[100px]"
  style={{ backgroundColor: '#3B82F6' }}
>
```

### ✅ Correct: Use Tailwind Scale
```tsx
<div className="bg-blue-500 w-64 h-24">
```

---

## Color System

### Semantic Colors (Preferred)
Use these for consistent theming and dark mode support:

| Token | Usage | Example |
|-------|-------|---------|
| `bg-background` | Page/container background | Main content areas |
| `bg-foreground` | Text on background | Primary text |
| `bg-card` | Card backgrounds | Content cards |
| `bg-card-foreground` | Text on cards | Card text |
| `bg-primary` | Brand primary color | Primary CTAs |
| `text-primary` | Text in primary color | Links, emphasis |
| `bg-secondary` | Secondary actions | Less important buttons |
| `bg-destructive` | Danger/delete actions | Delete buttons |
| `text-destructive` | Error text | Error messages |
| `bg-muted` | Subtle backgrounds | Disabled states |
| `text-muted-foreground` | Subdued text | Helper text, captions |
| `bg-accent` | Highlights | Hover states |
| `border` | Default borders | Dividers, card borders |

### Example Usage
```tsx
<Card className="bg-card border">
  <CardHeader>
    <CardTitle className="text-card-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Subdued content text
  </CardContent>
  <CardFooter>
    <Button className="bg-primary">Primary Action</Button>
    <Button variant="destructive">Delete</Button>
  </CardFooter>
</Card>
```

### Utility Colors
Only when semantic colors don't fit:

**Status Colors:**
- Success: `bg-green-500`, `text-green-700`
- Warning: `bg-yellow-500`, `text-yellow-700`
- Error: `bg-red-500`, `text-red-700` (prefer `bg-destructive`)
- Info: `bg-blue-500`, `text-blue-700`

**Neutral Colors:**
- `gray-50` through `gray-950` for specific gray shades

---

## Typography

### Font Sizes
| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Tiny labels, captions |
| `text-sm` | 14px | 20px | Small body, helper text |
| `text-base` | 16px | 24px | Default body text |
| `text-lg` | 18px | 28px | Emphasized body |
| `text-xl` | 20px | 28px | Small headings |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page headings |
| `text-4xl` | 36px | 40px | Hero text |

### Font Weights
| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, strong emphasis |
| `font-bold` | 700 | Very strong emphasis |

### Typography Examples
```tsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Heading</h2>
<p className="text-base font-normal">Body text paragraph</p>
<span className="text-sm text-muted-foreground">Helper text</span>
```

---

## Spacing System

### The Scale (based on 4px)
| Class | Size | Usage |
|-------|------|-------|
| `p-0`, `m-0` | 0px | No spacing |
| `p-1`, `m-1` | 4px | Minimal spacing |
| `p-2`, `m-2` | 8px | Tight spacing |
| `p-3`, `m-3` | 12px | Small spacing |
| `p-4`, `m-4` | 16px | Default spacing |
| `p-6`, `m-6` | 24px | Medium spacing |
| `p-8`, `m-8` | 32px | Large spacing |
| `p-12`, `m-12` | 48px | Extra large spacing |
| `p-16`, `m-16` | 64px | Huge spacing |

### Gap Utility
Prefer `gap` over margins for flex/grid layouts:

```tsx
// ✅ Use gap
<div className="flex gap-4">
  <Button>One</Button>
  <Button>Two</Button>
</div>

// ❌ Avoid margins between siblings
<div className="flex">
  <Button className="mr-4">One</Button>
  <Button>Two</Button>
</div>
```

---

## Layout Patterns

### Flexbox (Most Common)
```tsx
// Horizontal layout
<div className="flex items-center gap-4">
  <span>Label:</span>
  <Input />
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  <Card />
  <Card />
</div>

// Space between
<div className="flex justify-between items-center">
  <h2>Title</h2>
  <Button>Action</Button>
</div>

// Center content
<div className="flex justify-center items-center min-h-screen">
  <Card>Centered content</Card>
</div>
```

### Grid Layouts
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Card />
  <Card />
  <Card />
</div>
```

### Container Patterns
```tsx
// Page container
<div className="container mx-auto px-4 py-8">
  <h1>Page Content</h1>
</div>

// Max-width content
<div className="max-w-2xl mx-auto">
  <Card>Centered narrow content</Card>
</div>
```

---

## Forms

### Standard Form Pattern
```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input 
      id="email" 
      type="email" 
      placeholder="you@example.com"
      required
    />
  </div>
  
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <Input 
      id="password" 
      type="password"
      required
    />
  </div>
  
  <Button type="submit" className="w-full">
    Submit
  </Button>
</form>
```

### Form Layout Options
```tsx
// Single column (default)
<div className="space-y-4">
  <FormField />
  <FormField />
</div>

// Two columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField />
  <FormField />
</div>

// Inline form
<div className="flex gap-2">
  <Input className="flex-1" />
  <Button>Submit</Button>
</div>
```

---

## Accessibility

### Required Practices

**Always pair Label with Input**
```tsx
<Label htmlFor="field-id">Label Text</Label>
<Input id="field-id" />
```

**Use semantic HTML**
```tsx
// ✅ Good
<Button type="submit">Submit</Button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
```

**Include ARIA labels for icon buttons**
```tsx
<Button size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>
```

**Provide alt text for images**
```tsx
<img src="..." alt="Descriptive text" />
```

**Use proper heading hierarchy**
```tsx
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
```

---

## Code Review Checklist

Before merging any PR with UI changes, verify:

### Components
- [ ] Uses shadcn/ui components (not custom recreations)
- [ ] Uses component variants (not custom classes)
- [ ] Properly composed (doesn't rebuild existing components)

### Styling
- [ ] No hardcoded hex colors (`bg-[#...]`)
- [ ] No arbitrary pixel values (`w-[250px]`)
- [ ] No inline styles (`style={{...}}`)
- [ ] Uses semantic color tokens where possible
- [ ] Uses Tailwind spacing scale

### Responsive Design
- [ ] Mobile-first approach (`w-full md:w-64`)
- [ ] Tested on mobile, tablet, desktop
- [ ] No horizontal scroll on mobile

### Accessibility
- [ ] Labels paired with form inputs
- [ ] ARIA labels on icon buttons
- [ ] Keyboard navigation works
- [ ] Sufficient color contrast

### Code Quality
- [ ] No console.log statements
- [ ] TypeScript has no errors
- [ ] Component is reusable
- [ ] Follows existing patterns

---

## Violations & Migration

See `docs/DESIGN_VIOLATIONS.md` for current violations.

### Migration Strategy

**Priority Levels:**
- **P0 (Critical)**: Hardcoded colors, inline styles
- **P1 (High)**: Arbitrary values, non-shadcn components
- **P2 (Medium)**: Accessibility issues
- **P3 (Low)**: Optimization opportunities

**Rules:**
- New features: Must follow ALL rules
- Bug fixes: Fix violations in files you touch
- Refactors: Systematically migrate components

**Target**: 100% compliance in 3 months

### Questions?

- Check component source: `cat src/components/ui/[component].tsx`
- Read shadcn docs: https://ui.shadcn.com
- Check Tailwind docs: https://tailwindcss.com
- Ask in team chat

---

*This is a living document. Update it as patterns evolve.*
