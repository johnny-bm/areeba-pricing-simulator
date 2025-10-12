# Component Inventory

## shadcn/ui Components Available

Generated: 2024-12-19

### Core Components
- [x] Alert - `@/components/ui/alert`
- [x] Alert Dialog - `@/components/ui/alert-dialog`
- [x] Aspect Ratio - `@/components/ui/aspect-ratio`
- [x] Avatar - `@/components/ui/avatar`
- [x] Badge - `@/components/ui/badge`
- [x] Breadcrumb - `@/components/ui/breadcrumb`
- [x] Button - `@/components/ui/button`
- [x] Calendar - `@/components/ui/calendar`
- [x] Card - `@/components/ui/card`
- [x] Carousel - `@/components/ui/carousel`
- [x] Chart - `@/components/ui/chart`
- [x] Checkbox - `@/components/ui/checkbox`
- [x] Collapsible - `@/components/ui/collapsible`
- [x] Color Indicator - `@/components/ui/color-indicator`
- [x] Command - `@/components/ui/command`
- [x] Context Menu - `@/components/ui/context-menu`
- [x] Dialog - `@/components/ui/dialog`
- [x] Drawer - `@/components/ui/drawer`
- [x] Dropdown Menu - `@/components/ui/dropdown-menu`
- [x] Form - `@/components/ui/form`
- [x] Hover Card - `@/components/ui/hover-card`
- [x] Input - `@/components/ui/input`
- [x] Input OTP - `@/components/ui/input-otp`
- [x] Label - `@/components/ui/label`
- [x] Menubar - `@/components/ui/menubar`
- [x] Navigation Menu - `@/components/ui/navigation-menu`
- [x] Pagination - `@/components/ui/pagination`
- [x] Popover - `@/components/ui/popover`
- [x] Progress - `@/components/ui/progress`
- [x] Radio Group - `@/components/ui/radio-group`
- [x] Resizable - `@/components/ui/resizable`
- [x] Scroll Area - `@/components/ui/scroll-area`
- [x] Select - `@/components/ui/select`
- [x] Separator - `@/components/ui/separator`
- [x] Sheet - `@/components/ui/sheet`
- [x] Sidebar - `@/components/ui/sidebar`
- [x] Skeleton - `@/components/ui/skeleton`
- [x] Slider - `@/components/ui/slider`
- [x] Sonner - `@/components/ui/sonner`
- [x] Spinner - `@/components/ui/spinner`
- [x] Switch - `@/components/ui/switch`
- [x] Table - `@/components/ui/table`
- [x] Tabs - `@/components/ui/tabs`
- [x] Textarea - `@/components/ui/textarea`
- [x] Toggle - `@/components/ui/toggle`
- [x] Toggle Group - `@/components/ui/toggle-group`
- [x] Tooltip - `@/components/ui/tooltip`

### Usage Statistics

Based on import analysis:

| Component | Usage Count | Status |
|-----------|-------------|--------|
| Button | 37+ | ✅ Heavily Used |
| Input | 19+ | ✅ Heavily Used |
| Card | 19+ | ✅ Heavily Used |
| Badge | 19+ | ✅ Heavily Used |
| Label | 17+ | ✅ Heavily Used |
| Table | 10+ | ✅ Well Used |
| Select | 9+ | ✅ Well Used |
| Alert | 7+ | ✅ Used |
| Textarea | 4+ | ✅ Used |
| Switch | 4+ | ✅ Used |
| Spinner | 4+ | ✅ Used |
| Separator | 4+ | ✅ Used |
| Dropdown Menu | 4+ | ✅ Used |
| Collapsible | 4+ | ✅ Used |
| Avatar | 4+ | ✅ Used |
| Dialog | 3+ | ✅ Used |
| Scroll Area | 2+ | ✅ Used |
| Checkbox | 2+ | ✅ Used |
| Skeleton | 1+ | ✅ Used |
| Sidebar | 1+ | ✅ Used |
| Progress | 1+ | ✅ Used |

### Components Not Yet Installed

Based on shadcn/ui catalog, these components are available but not installed:
- [ ] Accordion
- [ ] Calendar (installed but not used)
- [ ] Carousel (installed but not used)
- [ ] Chart (installed but not used)
- [ ] Command (installed but not used)
- [ ] Context Menu (installed but not used)
- [ ] Drawer (installed but not used)
- [ ] Form (installed but not used)
- [ ] Hover Card (installed but not used)
- [ ] Input OTP (installed but not used)
- [ ] Menubar (installed but not used)
- [ ] Navigation Menu (installed but not used)
- [ ] Pagination (installed but not used)
- [ ] Popover (installed but not used)
- [ ] Radio Group (installed but not used)
- [ ] Resizable (installed but not used)
- [ ] Sheet (installed but not used)
- [ ] Slider (installed but not used)
- [ ] Tabs (installed but not used)
- [ ] Toggle (installed but not used)
- [ ] Toggle Group (installed but not used)
- [ ] Tooltip (installed but not used)

### Custom Components

The following custom components exist outside of shadcn/ui:
- [ ] NumberInput - Custom number input component
- [ ] CardHeaderWithCollapse - Custom collapsible card header
- [ ] ColorIndicator - Custom color indicator component

### Recommendations

1. **High Priority**: Components with 10+ usage should be standardized
2. **Medium Priority**: Components with 4-9 usage should be reviewed for consistency
3. **Low Priority**: Components with 1-3 usage should be evaluated for necessity
4. **New Components**: Consider installing unused shadcn components for future use

### Path Inconsistencies

The codebase shows inconsistent import paths:
- `@/components/ui/` (preferred)
- `./ui/` (relative)
- `../ui/` (relative)
- `../../../components/ui/` (deep relative)
- `../../../shared/components/ui/` (shared relative)

**Recommendation**: Standardize all imports to use `@/components/ui/` for consistency.
