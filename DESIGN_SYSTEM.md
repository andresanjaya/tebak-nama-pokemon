# Pokemon Pokedex - Design System Documentation

This document outlines the design system implementation based on the official Pokemon design guidelines.

## Overview

The application follows a clean, modern design inspired by the official Pokemon aesthetic with accurate type colors, circular Pokemon displays, and a minimal white interface.

## Color Palette

### Pokemon Type Colors

Exact hex values from the official Pokemon design system:

- **Water**: `#6890F0` - Blue
- **Fire**: `#F08030` - Orange  
- **Grass**: `#78C850` - Green
- **Electric**: `#F8D030` - Yellow
- **Psychic**: `#F85888` - Pink/Magenta
- **Ice**: `#98D8D8` - Cyan
- **Dragon**: `#7038F8` - Purple
- **Dark**: `#705848` - Brown
- **Fairy**: `#EE99AC` - Light Pink
- **Normal**: `#A8A878` - Beige
- **Fighting**: `#C03028` - Red
- **Flying**: `#A890F0` - Light Purple
- **Poison**: `#A040A0` - Purple
- **Ground**: `#E0C068` - Tan
- **Rock**: `#B8A038` - Brown-Yellow
- **Bug**: `#A8B820` - Lime
- **Ghost**: `#705898` - Dark Purple
- **Steel**: `#B8B8D0` - Gray-Purple

### UI Colors

- **Primary Background**: `#F9FAFB` (gray-50) - Light gray for app background
- **Card Background**: `#FFFFFF` - Pure white
- **Text Primary**: `#111827` (gray-900) - Dark gray/black
- **Text Secondary**: `#6B7280` (gray-500) - Medium gray
- **Text Tertiary**: `#9CA3AF` (gray-400) - Light gray
- **Accent Color**: `#3B82F6` (blue-500) - Blue for active states
- **Border**: `#E5E7EB` (gray-200) - Light gray borders

## Layout Structure

### Pokedex List Page

```
┌─────────────────────────────────┐
│  Search Bar                     │
│  [All types ▼] [Lowest num ▼]  │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ N°001      ┌─────┐      │   │
│  │ Bulbasaur  │  🖼️  │ ●   │   │
│  │ ●Grass     └─────┘      │   │
│  │ ●Poison              ♡  │   │
│  └─────────────────────────┘   │
│                                 │
│  [More Pokemon Cards...]        │
└─────────────────────────────────┘
```

**Components:**
- Search input with icon (gray-100 background)
- Filter buttons (black rounded-full pills with chevron)
- Pokemon cards (white background, horizontal layout)
- Circular Pokemon image with type-colored background
- Small heart icon for favorites

### Detail Page

```
┌─────────────────────────────────┐
│  ← [Type Color Background]   ♡ │
│                                 │
│  Pokemon Name                   │
│  N°025                          │
│  ●Electric                      │
│                                 │
│         ┌───────────┐           │
│         │  ○ Image  │           │
│         │    ○○○○   │           │
│         └───────────┘           │
│                                 │
├─────────────────────────────────┤
│  [White Rounded Card Content]   │
│                                 │
│  Description text...            │
│                                 │
│  ┌─────────┐  ┌─────────┐      │
│  │ Weight  │  │ Height  │      │
│  └─────────┘  └─────────┘      │
│                                 │
│  Category: Electric Pokemon     │
│  Abilities: Static, Lightning   │
│                                 │
│  Base Stats:                    │
│  HP      45  ████░░░░           │
│  Attack  49  ████░░░░           │
│  Defense 49  ████░░░░           │
│  Speed   45  ████░░░░           │
│                                 │
│  Evolution:                     │
│  Pichu → Pikachu → Raichu      │
└─────────────────────────────────┘
```

**Components:**
- Full-page type-colored background
- Large circular Pokemon image (white/20 opacity circle)
- White rounded card content area
- Info grid (2 columns)
- Stat bars with dynamic colors
- Clean typography hierarchy

## Typography

### Font Family
- System font stack (default): -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, etc.

### Font Sizes
- **Heading 1**: 2xl (30px) - Page titles
- **Heading 2**: xl (24px) - Section titles  
- **Heading 3**: lg (20px) - Subsections
- **Body Large**: base (16px) - Pokemon names
- **Body**: sm (14px) - Labels, descriptions
- **Caption**: xs (12px) - Pokemon numbers, metadata

### Font Weights
- **Bold**: 700 - Pokemon names, section titles
- **Semibold**: 600 - Stat values
- **Medium**: 500 - Labels, buttons
- **Regular**: 400 - Body text

## Components

### Pokemon Card

**Dimensions:**
- Width: Full width minus padding
- Height: Auto (based on content)
- Padding: 12px (p-3)
- Border Radius: 12px (rounded-xl)
- Background: White
- Shadow: Small (shadow-sm)

**Layout:**
- Horizontal flex layout
- Left: Pokemon info (flex-1)
- Right: Circular image (80x80px)
- Pokemon number: N°001 format in gray-400
- Name: Bold, capitalized
- Type badges: Horizontal row with 6px gap
- Favorite heart: 24x24px circle, top-right of image

### Type Badge

**Dimensions:**
- Small: 10px vertical, 10px horizontal padding
- Medium: 12px vertical, 12px horizontal padding
- Border Radius: Full (rounded-full)
- Font: 12px (sm), white text, medium weight

**Background Colors:**
- Dynamic based on type (see Color Palette above)

### Stat Bar

**Structure:**
```
LABEL    VALUE  ████████░░░░░░
```

**Dimensions:**
- Label width: 64px (w-16), right-aligned
- Value width: 32px (w-8), right-aligned  
- Bar: Flexible width (flex-1)
- Bar height: 6px (h-1.5)
- Background: gray-200
- Fill: Dynamic type color
- Border Radius: Full (rounded-full)

### Bottom Navigation

**Layout:**
- Fixed at bottom
- 4 navigation items
- Height: 64px (h-16)
- Background: White
- Border top: gray-200

**Items:**
1. Pokédex (Pokeball icon when active, Home icon otherwise)
2. Regions (User icon)
3. Favorites (Heart icon, filled when active)
4. Games (Gamepad2 icon)

**Active State:**
- Icon color: blue-500
- Text color: blue-500
- Font weight: Medium

**Inactive State:**
- Icon color: gray-400
- Text color: gray-400
- Font weight: Regular

## Spacing System

### Container Padding
- Horizontal: 16px (px-4)
- Vertical: 16px (py-4)

### Component Spacing
- Between cards: 8px (space-y-2)
- Between sections: 24px (space-y-6)
- Between info items: 12px (space-y-3)

### Page Padding
- Bottom: 80px (pb-20) - To account for bottom navigation

## Border Radius

- **Small**: 8px (rounded-lg) - Inputs
- **Medium**: 12px (rounded-xl) - Cards, buttons
- **Large**: 24px (rounded-3xl) - Modals, detail card
- **Circle**: 9999px (rounded-full) - Badges, icons, Pokemon images

## Shadows

- **Small**: shadow-sm - Pokemon cards
- **Medium**: shadow-md - Not currently used
- **Large**: shadow-xl - Question cards
- **Extra Large**: shadow-2xl - Not currently used

## Interactions

### Animations

**Card Tap:**
- Scale: 0.98
- Duration: Instant (whileTap)

**Page Transitions:**
- Opacity: 0 → 1
- X position: 100px → 0 (enter), 0 → -100px (exit)
- Duration: 0.3s

**Modal Animations:**
- Backdrop: opacity 0 → 1
- Content: translateY(100%) → 0
- Transition: Spring animation (damping: 25)

**Stat Bars:**
- Width transition: 500ms
- Easing: Default

### Hover States

**Cards:**
- No hover effect on mobile
- Shadow increase on desktop (if applicable)

**Buttons:**
- Background color lightens/darkens
- Cursor: pointer

## Accessibility

### Focus States
- All interactive elements have visible focus rings
- Focus ring color: blue-500 with 50% opacity

### Color Contrast
- All text meets WCAG AA standards
- Type badge text (white) has sufficient contrast on all background colors

### Touch Targets
- Minimum size: 44x44px
- Bottom navigation items: 64px tall
- Buttons: Minimum 40px tall

## Responsive Design

### Mobile First
- Base design: 375px width (iPhone SE)
- Max width: 448px (max-w-md) for bottom navigation

### Breakpoints
- Not applicable - This is a mobile-only app

## Implementation Notes

### Type Colors File
Location: `/src/app/utils/typeColors.ts`

Contains:
- `typeColors`: Hex values for each type
- `typeLightColors`: Light variations for backgrounds (if needed)

### CSS Variables
- Not used extensively - Tailwind classes preferred
- Theme colors in `/src/styles/theme.css` (not modified for this design)

### Component Library
- Motion (framer-motion fork) for animations
- Lucide React for icons
- React Router for navigation
- Custom components (no external UI library)

## Design Principles

1. **Clarity**: Clean, uncluttered interface
2. **Consistency**: Same patterns across all pages
3. **Feedback**: Clear visual feedback for all interactions
4. **Performance**: Fast, smooth animations
5. **Authenticity**: True to Pokemon brand colors and style
6. **Accessibility**: Usable by everyone
7. **Delight**: Fun, playful interactions

## File Structure

```
src/app/
├── components/
│   ├── PokemonCard.tsx      # Main list card
│   ├── TypeBadge.tsx        # Type indicator
│   ├── StatBar.tsx          # Stat visualization
│   ├── BottomNav.tsx        # Bottom navigation
│   └── Layout.tsx           # Page wrapper
├── pages/
│   ├── PokedexPage.tsx      # Main list
│   ├── DetailPage.tsx       # Pokemon details
│   ├── FavoritesPage.tsx    # Saved Pokemon
│   ├── RegionsPage.tsx      # Regions (placeholder)
│   └── GamePage.tsx         # Quiz game
├── utils/
│   └── typeColors.ts        # Color definitions
└── styles/
    └── theme.css            # Base theme
```

## Future Enhancements

- Dark mode support (using official Pokemon dark palette)
- Advanced filtering (multiple types, stat ranges)
- Comparison view (side-by-side Pokemon)
- Animated evolutions
- Type effectiveness chart
- Search history
- Share functionality
