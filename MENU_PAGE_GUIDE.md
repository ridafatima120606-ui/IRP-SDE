# Menu Browsing Page - Documentation

## Overview

The Menu Browsing Page is a fully-featured culinary interface that allows authenticated users to explore the restaurant's menu with advanced filtering, mood-based recommendations, and sustainability scoring. It integrates with the backend menu API endpoints and provides real-time filtering, search, and pagination.

## Features

### 1. **Menu Item Display**
- Grid layout (responsive: 1 col mobile → 4 cols desktop)
- Item cards with:
  - High-quality food images
  - Item name and description
  - Price display
  - Preparation time
  - Category badge
  - Availability status
  - Favorites toggle

### 2. **Sustainability Badges**
Displays eco-friendly metrics with visual indicators:
- 🌱 **Vegan** - No animal products
- 🥬 **Vegetarian** - No meat
- 🌍 **Local** - Locally sourced ingredients
- 🍃 **Organic** - No synthetic pesticides
- ♻️ **Carbon Neutral** - Offset emissions
- 📦 **Eco Packaging** - Recyclable/compostable
- 🤝 **Fair Trade** - Ethical sourcing
- 🌾 **Seasonal** - In-season ingredients

### 3. **Mood-Based Filtering**
Filter items by dining mood:
- **HAPPY** (Yellow) - Celebratory dishes
- **ROMANTIC** (Red) - Intimate dining options
- **CALM** (Blue) - Soothing, peaceful dishes
- **ENERGETIC** (Orange) - Vibrant, bold flavors
- **ADVENTUROUS** (Purple) - Exotic, experimental
- **COMFORTABLE** (Green) - Familiar, comforting

### 4. **Advanced Search & Filtering**
- **Text Search** - Search by name or ingredient
- **Category Filter** - Filter by dish category (APPETIZER, MAIN, DESSERT, etc.)
- **Price Range** - Min/max price filtering
- **Mood Tag** - Find dishes matching your current vibe
- **Real-time Results** - Updates as you filter
- **Reset Filters** - One-click to clear all filters

### 5. **Pagination**
- 12 items per page (configurable)
- Page number buttons for direct navigation
- Previous/Next buttons for navigation
- Shows current range (e.g., "Showing 1 to 12 of 47 items")

### 6. **Cart Management**
- Add items to cart with visual feedback
- Cart count badge in header
- Items persist in localStorage
- "Added to Cart" confirmation

### 7. **Favorites System**
- Heart icon to favorite items
- Favorites persist in localStorage
- Visual indicator for favorited items

## File Structure

```
frontend/
├── app/
│   └── menu/
│       └── page.tsx              # Main menu page component
├── components/
│   └── menu/
│       ├── MenuCard.tsx          # Individual menu item card
│       └── MenuGrid.tsx          # Grid layout with filters
├── services/
│   └── menu.ts                   # API service for menu endpoints
└── hooks/
    └── useMenu.ts                # Custom hook for menu state management
```

## Component Details

### MenuPage (`app/menu/page.tsx`)

**Purpose**: Main page component that orchestrates the menu browsing experience.

**Key Features**:
- Authentication check on mount
- Local storage for cart and favorites
- Navigation header with cart badge and logout
- Event handlers for cart and favorites

**Dependencies**:
```typescript
- useMenu hook for state management
- menuService for API calls
- MenuGrid component for display
```

**Data Flow**:
```
MenuPage
├── Loads user auth
├── Initializes useMenu hook
├── Manages cart/favorites in localStorage
├── Handles user interactions
└── Renders MenuGrid
```

### MenuGrid (`components/menu/MenuGrid.tsx`)

**Purpose**: Container component that manages filter UI and displays menu items in a grid.

**Key Features**:
- Search bar with real-time filtering
- Multi-field filter panel:
  - Category dropdown
  - Mood dropdown
  - Min/max price inputs
- Results count and pagination info
- Empty state messaging
- Loading skeletons
- Error handling
- Pagination controls

**Filter Panel Layout** (Responsive Grid):
```
Desktop (5 columns):
[Category] [Mood] [Min Price] [Max Price] [Sort]

Tablet (3 columns):
[Category] [Mood] [Min Price]
[Max Price] [Sort]

Mobile (2 columns):
[Category] [Mood]
[Min Price] [Max Price]
```

**Props**:
```typescript
interface MenuGridProps {
  items: MenuItem[]
  categories: string[]
  isLoading: boolean
  error: string | null
  selectedCategory?: string
  searchQuery: string
  minPrice?: number
  maxPrice?: number
  selectedMood?: string
  onCategoryChange: (category: string | undefined) => void
  onSearchChange: (query: string) => void
  onMinPriceChange: (price: number | undefined) => void
  onMaxPriceChange: (price: number | undefined) => void
  onMoodChange: (mood: string | undefined) => void
  onResetFilters: () => void
  onAddToCart?: (item: MenuItem) => void
  onFavorite?: (item: MenuItem) => void
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  onNextPage?: () => void
  onPrevPage?: () => void
  onPageChange?: (page: number) => void
  total: number
  limit: number
}
```

### MenuCard (`components/menu/MenuCard.tsx`)

**Purpose**: Individual menu item card with all item details and interaction options.

**Key Features**:
- Item image with fallback icon
- Item details:
  - Name, description
  - Price (bold, orange)
  - Prep time with clock icon
  - Category badge
  - Availability status
- Mood tags (up to 2 visible, +N more)
- Sustainability badges (up to 3 visible, +N more)
- Add to Cart button with feedback
- Favorite toggle button

**States**:
- **Normal**: All buttons functional
- **Unavailable**: Grayed out, disabled Add to Cart
- **Added to Cart**: Button turns green with checkmark
- **Favorited**: Heart fills with red color

**Image Fallback**:
```
If image fails to load:
Shows gradient background with Utensils icon
```

**Props**:
```typescript
interface MenuCardProps {
  item: MenuItem
  onAddToCart?: (item: MenuItem) => void
  onFavorite?: (item: MenuItem) => void
}
```

### useMenu Hook (`hooks/useMenu.ts`)

**Purpose**: Custom React hook managing all menu data fetching and filtering logic.

**State Variables**:
```typescript
- items: MenuItem[]              // Current page items
- categories: string[]           // All available categories
- isLoading: boolean             // Loading state
- error: string | null           // Error message
- total: number                  // Total items count
- selectedCategory?: string      // Active category filter
- searchQuery: string            // Search text
- minPrice?, maxPrice?           // Price range filters
- selectedMood?: string          // Mood filter
- offset: number                 // Pagination offset
```

**Methods**:
```typescript
setSelectedCategory(category)     // Update category filter
setSearchQuery(query)              // Update search
setMinPrice(price)                 // Update min price
setMaxPrice(price)                 // Update max price
setSelectedMood(mood)              // Update mood filter
updateFilters(filters)            // Update multiple filters
resetFilters()                     // Clear all filters
goToPage(pageNumber)              // Navigate to page
refetch()                         // Manual refetch
```

**Returned Values**:
```typescript
{
  // Data
  items, categories, isLoading, error, total,
  
  // Filter states
  selectedCategory, searchQuery, minPrice, maxPrice, selectedMood,
  
  // Filter updaters
  setSelectedCategory, setSearchQuery, setMinPrice, setMaxPrice, 
  setSelectedMood, updateFilters, resetFilters,
  
  // Pagination
  offset, limit, currentPage, totalPages, hasNextPage, hasPrevPage,
  goToPage,
  
  // Refetch
  refetch
}
```

**Filter Logic**:
- Filters are applied via query parameters to backend
- Resetting pagination when filters change (back to page 0)
- Debounced search (handled by backend)
- Real-time updates with useEffect

## API Integration

### Menu Service (`services/menu.ts`)

**Endpoints Used**:

1. **getAllMenuItems**
```typescript
GET /api/v1/menu?category=MAIN&search=pasta&limit=12&offset=0&minPrice=5&maxPrice=25&moodTag=HAPPY
```

2. **getCategories**
```typescript
GET /api/v1/menu/categories
Returns: { categories: string[] }
```

**Response Format**:
```typescript
interface MenuResponse {
  status: string
  message: string
  data: {
    total: number
    limit: number
    offset: number
    items: MenuItem[]
  }
  timestamp: string
}
```

**MenuItem Structure**:
```typescript
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  moodTags: string[]
  suitableFor: string[]
  prepTime: number
  ingredients: string[]
  available: boolean
  createdAt: string
  sustainabilityMetrics?: {
    isVegan: boolean
    isVegetarian: boolean
    isLocal: boolean
    isOrganic: boolean
    isCarbonNeutral: boolean
    ecoPackaging: boolean
    isFairTrade: boolean
    isSeasonal: boolean
    wasteReduction: number
  }
  sustainabilityScore?: {
    total: number
    badges: string[]
  }
}
```

## Styling

### Design System

**Colors**:
- **Primary**: Orange-600 (#EA580C) - Actions, highlights
- **Secondary**: Gray-900 (#111827) - Text, cards
- **Accent**: Red-500 (#EF4444) - Favorites
- **Background**: Gray-50 (#F9FAFB) - Page background

**Typography**:
- **Headings**: Bold, 24-48px
- **Body**: Regular, 14-16px
- **Labels**: Semibold, 12-14px

**Spacing**:
- Gap between items: 24px
- Card padding: 16px
- Section padding: 32px

**Responsive Breakpoints**:
```css
Mobile   320-640px   (1 column)
Tablet   640-1024px  (2 columns)
Desktop  1024-1280px (3 columns)
XL       1280px+     (4 columns)
```

## Usage Examples

### Basic Usage in Page

```typescript
import MenuPage from '@/app/menu/page';

// User navigates to /menu
// Page checks authentication
// Loads categories and initial items
// Displays full menu UI
```

### Adding to Cart

```typescript
const handleAddToCart = (item: MenuItem) => {
  setCartItems(prev => {
    const updated = [...prev, item];
    localStorage.setItem('cart_items', JSON.stringify(updated));
    return updated;
  });
};

// Item persists in localStorage
// Cart badge updates
// Can retrieve later for checkout
```

### Filtering Example

```typescript
// User selects "MAIN" category
onCategoryChange('MAIN');

// useMenu hook updates selectedCategory
// Triggers side effect with new filter value
// Calls menuService.getMenuItems({ category: 'MAIN' })
// Updates items array
// Component re-renders with filtered results
```

### Search Example

```typescript
// User types "carbonara" in search
onSearchChange('carbonara');

// Hook updates searchQuery state
// API call: ?search=carbonara
// Results filter to matching items
// Other filters remain active
```

## Error Handling

### API Errors

1. **Network Error**
   - Displayed in red error box
   - Suggestion to check internet connection
   - Retry capability

2. **404 - Menu Not Found**
   - Shows "No items found"
   - Suggests resetting filters
   - Graceful empty state

3. **500 - Server Error**
   - Displays error message
   - Logs to console for debugging
   - User can retry

### Auth Errors

- If user not authenticated (no token)
- Redirects to `/auth/login`
- Clears cart and favorites on logout

## Performance Optimizations

1. **Image Lazy Loading**
   - Next.js Image component with optimization
   - Fallback placeholder icon

2. **Pagination**
   - Only loads 12 items per page
   - Reduces DOM nodes and memory

3. **Memoization**
   - `useMemo` for hasActiveFilters check
   - Prevents unnecessary re-renders

4. **localStorage Caching**
   - Cart items persist across sessions
   - Favorites saved locally
   - No API calls for local data

## Testing Scenarios

### Scenario 1: Browse All Items
```
1. Navigate to /menu
2. See all categories loaded
3. Items display in grid
4. Default limit: 12 items
5. Pagination shows multiple pages
```

### Scenario 2: Filter by Category
```
1. Open category dropdown
2. Select "MAIN"
3. Grid updates to show only main courses
4. Item count updates
5. Page resets to 1
```

### Scenario 3: Search + Filter Combination
```
1. Type "salad" in search
2. Select "VEGETARIAN" mood
3. Both filters apply together
4. Results show items matching both criteria
5. Other filters remain available
```

### Scenario 4: Price Range Filtering
```
1. Enter Min: $10, Max: $25
2. Only items in range display
3. Cards still show sustainability badges
4. Add to cart works normally
```

### Scenario 5: Add Multiple Items to Cart
```
1. Add pasta → Cart shows "1"
2. Add dessert → Cart shows "2"
3. Add same pasta again → Count stays "2"
4. Navigate away → Cart persists
5. Return to menu → Cart still has 2 items
```

### Scenario 6: Favorite Items
```
1. Click heart on item
2. Heart fills with red
3. Navigate to dashboard
4. Return to menu
5. Heart still filled (localStorage)
```

## Future Enhancements

1. **Sorting Options**
   - Sort by: Price (low-high, high-low)
   - Sort by: Popularity
   - Sort by: Newest items
   - Sort by: Rating

2. **Item Details Modal**
   - Click card to see full details
   - Larger images
   - Complete ingredient list
   - Customer reviews
   - Allergen information

3. **Quick Customize**
   - Add special instructions
   - Choose portion size
   - Customize ingredients
   - Add sides/extras

4. **Wish List**
   - Save favorite combinations
   - Share with dining companions
   - Pre-order favorites

5. **AI Recommendations**
   - "Based on your mood..."
   - "Customers also ordered..."
   - "New items you might like"

6. **Accessibility**
   - ARIA labels for categories
   - Keyboard navigation
   - Screen reader support
   - High contrast mode

## Deployment Checklist

- [x] Components created and tested
- [x] API integration implemented
- [x] Authentication check added
- [x] Error handling configured
- [x] Styling complete
- [x] Responsive design verified
- [x] localStorage working
- [x] Pagination functional
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Performance audit passed
- [ ] Accessibility audit passed
- [ ] Security review completed

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Mobile Safari | 14+ | ✅ Full support |
| Chrome Mobile | 90+ | ✅ Full support |

## Troubleshooting

### Menu items not loading
```
- Check: Is user authenticated?
- Check: Backend API running on :5000?
- Check: NEXT_PUBLIC_API_URL set correctly?
- Solution: Verify backend health check endpoint
```

### Images not displaying
```
- Image URLs in database may be invalid
- Fallback icon displays (Utensils)
- This is expected behavior
- Solution: Upload valid image URLs to menu items
```

### Filters not working
```
- Verify selectedCategory/mood in query params
- Check browser console for API errors
- Solution: Clear localStorage, refresh page
```

### Cart not persisting
```
- localStorage disabled in browser?
- Private/Incognito mode?
- Solution: Enable localStorage or use regular mode
```

## Related Documentation

- [API Testing Guide](./API_TESTING_GUIDE.md) - Menu endpoint examples
- [Frontend Auth Guide](./FRONTEND_AUTH_GUIDE.md) - Authentication setup
- [Backend Implementation Summary](./BACKEND_IMPLEMENTATION_SUMMARY.md) - Menu controller details
- [Quick Start Guide](./QUICK_START_GUIDE.md) - Environment setup
