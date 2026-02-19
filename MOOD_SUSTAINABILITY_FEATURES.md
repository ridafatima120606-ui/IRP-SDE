# Mood-Based Dining & Sustainability Features

## Overview

The Smart Dining System now includes two innovative features:
1. **Mood-Based Dining Recommendations** - Personalized dining experience based on customer mood
2. **Sustainability Scoring** - Eco-friendly metrics for menu items

---

## 🎭 Mood-Based Dining Recommendations

### How It Works

Customers select their dining mood, and the system recommends:
- **Suitable Dishes** - Menu items matched to the mood
- **Table Suggestions** - Seating positions with appropriate ambiance
- **Lighting Preferences** - Optimal lighting for the mood
- **Music Genre** - Background music recommendations

### Supported Moods

| Mood | Icon | Characteristics | Suggested Table Type | Lighting |
|------|------|-----------------|----------------------|----------|
| Romantic | 💕 | Intimate, elegant, cozy | Window/Corner | Dim |
| Family | 👨‍👩‍👧‍👦 | Fun, casual, interactive | Center/Large | Bright |
| Business | 💼 | Professional, quiet | Private Booth | Moderate |
| Birthday | 🎉 | Festive, celebratory | Center/Private | Bright |

### Database Schema

```prisma
// Mood model
model Mood {
  id          String @id @default(cuid())
  name        String @unique
  description String?
  icon        String?
  color       String?
}

// Mood Preference model
model MoodPreference {
  id                 String @id @default(cuid())
  userId             String @unique
  currentMood        String?
  preferredTableType String?
  lightingPreference String?
  musicPreference    String?
  user               User @relation(...)
}

// Updated MenuItem model
model MenuItem {
  // ... existing fields ...
  moodTags    String[] @default([])  // Romantic, Family, Business, Birthday
  suitableFor String[] @default([])  // Romantic Dinner, Family Meal, etc.
}

// Updated Table model
model Table {
  // ... existing fields ...
  tableType String?   // Regular, VIP, Window, Private
  ambiance  String?   // Romantic, Family-friendly, Business, Casual
}
```

### API Endpoints

```
// Get all moods
GET /api/v1/moods

// Get recommendations for mood
GET /api/v1/moods/:id/recommendations
Response:
{
  "mood": { ... },
  "recommendedDishes": [ ... ],
  "suggestedTables": [ ... ],
  "ambiance": {
    "lighting": "Dim",
    "musicGenre": "Jazz/Classical",
    "tableType": "Window or Corner"
  },
  "estimatedCost": 35.50
}

// Set mood preference for user
POST /api/v1/moods/:id/preferences
Body: {
  "preferredTableType": "Window",
  "lightingPreference": "Dim",
  "musicPreference": "Jazz"
}

// Get menu items filtered by mood
GET /api/v1/moods/:id/menu

// Get tables suitable for mood
GET /api/v1/moods/:id/tables
```

### Frontend Components

Located in `frontend/components/mood/`:

#### MoodSelector.tsx
```typescript
import MoodSelector from '@/components/mood/MoodSelector';

<MoodSelector 
  onMoodSelect={(moodId) => console.log(moodId)}
  selectedMood={selectedMood}
/>
```

Features:
- Beautiful mood selection UI with animations
- Framer Motion transitions
- Real-time mood selection updates

#### Usage Hook: useMoodRecommendation

```typescript
import { useMoodRecommendation } from '@/hooks/useMoodRecommendation';

const MyComponent = () => {
  const {
    selectedMood,
    recommendations,
    isLoading,
    error,
    getMoodRecommendations,
    setMoodPreference,
    getTableSuggestions,
  } = useMoodRecommendation();

  const handleMoodChange = async (moodId: string) => {
    await getMoodRecommendations(moodId);
  };

  return (
    <div>
      {/* Display recommendations */}
      {recommendations && (
        <div>
          <h3>Recommended for {selectedMood}</h3>
          {recommendations.recommendedDishes.map(dish => (
            <div key={dish.id}>{dish.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Algorithm: Mood-Based Recommendation

Located in `backend/src/algorithms/moodBasedRecommendation.ts`

#### Scoring System
Each dish is scored (0-100) based on:
- **Mood Tags** (+50) - If dish has matching mood tag
- **Category Match** (+30) - If category matches mood preferences
- **Price Tier** (+10) - Premium for romantic/business, budget-friendly for family
- **Prep Time** (+10) - Quick service for business mood

Example:
```typescript
const score = scoreDishForMood(dish, 'ROMANTIC');
// Returns 0-100 score based on factors above
```

#### Key Functions

```typescript
// Get recommendations for a mood
getMenuRecommendations(menuItems: any[], mood: string, limit?: number)

// Get complete mood recommendation
generateMoodRecommendation(moodName: string, menuItems: any[], availableTables: any[])

// Score individual dish for mood
scoreDishForMood(dish: any, moodName: string): number
```

---

## 🌱 Sustainability Scoring

### How It Works

Every menu item has a sustainability score (0-100) calculated based on:
- **Carbon Footprint** (30% weight) - kg CO2 emissions
- **Vegetarian Score** (25% weight) - Vegan, Vegetarian, or Meat
- **Local Sourcing** (25% weight) - Distance from restaurant
- **Organic/Quality** (20% weight) - Organic certification, seasonal availability

### Sustainability Score Categories

| Score | Level | Recommendation |
|-------|-------|-----------------|
| 85-100 | Excellent | 🌟 Highly sustainable choice! |
| 70-84 | Good | ✅ Good sustainable option |
| 50-69 | Moderate | ⚠️ Moderate environmental impact |
| 0-49 | Low | ❌ Consider eco-friendly alternatives |

### Sustainability Badges

Dishes can earn multiple badges:

| Badge | Icon | Criteria |
|-------|------|----------|
| Vegan | 🌱 | No animal products |
| Vegetarian | 🥬 | No meat |
| Local | 🌍 | Locally sourced ingredients |
| Organic | 🍃 | No synthetic pesticides |
| Carbon Neutral | ♻️ | Offset emissions |
| Eco Packaging | 📦 | Recyclable/compostable |
| Fair Trade | 🤝 | Fair wages and ethics |
| Seasonal | 🌾 | In-season ingredients |
| Low Carbon | 💨 | < 0.5 kg CO2 |

### Database Schema

```prisma
// Sustainability Metrics model
model SustainabilityMetrics {
  id                  String @id @default(cuid())
  menuItemId          String @unique
  carbonFootprint     Float        // kg CO2
  waterUsage          Float?       // liters
  transportDistance   Int?         // km
  isLocalIngredient   Boolean @default(false)
  isOrganic           Boolean @default(false)
  isVegan             Boolean @default(false)
  isVegetarian        Boolean @default(false)
  isSeasonal          Boolean @default(false)
  packagingType       String?
  sustainabilityScore Int @default(0) // 0-100
  badges              String[] @default([])
  menuItem            MenuItem @relation(...)
}

// Ingredient Source model
model IngredientSource {
  id              String @id @default(cuid())
  name            String
  origin          String
  distance        Int              // km from restaurant
  isLocalSource   Boolean
  carbonFootprint Float
  isOrganic       Boolean @default(false)
  isFairTrade     Boolean @default(false)
}
```

### API Endpoints

```
// Get sustainability score for dish
GET /api/v1/sustainability/score/:menuItemId
Response:
{
  "overallScore": 85,
  "carbonScore": 90,
  "vegetarianScore": 100,
  "localScore": 80,
  "organicScore": 95,
  "badges": [
    { "icon": "🌱", "label": "Vegan", "description": "No animal products" },
    { "icon": "🌍", "label": "Local", "description": "Locally sourced..." }
  ],
  "recommendation": "🌟 Highly sustainable choice!"
}

// Get all dishes with sustainability scores
GET /api/v1/sustainability/dishes

// Get restaurant sustainability metrics
GET /api/v1/sustainability/summary
Response:
{
  "averageSustainabilityScore": 72,
  "totalDishes": 45,
  "veganOptions": 8,
  "vegetarianOptions": 12,
  "localSourcedDishes": 28,
  "organicDishes": 18,
  "totalCarbonFootprint": "245.60 kg CO2",
  "recommendationLevel": "✅ Good sustainable option"
}

// Get ingredient details
GET /api/v1/sustainability/ingredients/:id

// Get admin dashboard data
GET /api/v1/sustainability/dashboard

// Add sustainability metrics (Admin)
POST /api/v1/sustainability/metrics
Body: { ... }

// Update sustainability metrics (Admin)
PUT /api/v1/sustainability/metrics/:id
```

### Frontend Components

Located in `frontend/components/sustainability/`:

#### SustainabilityBadges.tsx
```typescript
import SustainabilityBadges from '@/components/sustainability/SustainabilityBadges';

<SustainabilityBadges
  badges={score.badges}
  size="medium"  // small, medium, large
/>
```

Features:
- Displays sustainability badges with tooltips
- Hover effects for descriptions
- Responsive sizing

#### SustainabilityScoreDisplay.tsx
```typescript
import SustainabilityScoreDisplay from '@/components/sustainability/SustainabilityScoreDisplay';

// Full display
<SustainabilityScoreDisplay score={score} />

// Compact display
<SustainabilityScoreDisplay score={score} compact={true} />
```

Features:
- Animated score display
- Individual metric breakdown
- Badge showcase
- Recommendation message
- Color-coded scoring

#### Usage Hook: useSustainability

```typescript
import { useSustainability } from '@/hooks/useSustainability';

const MyComponent = () => {
  const {
    sustainabilityScores,
    isLoading,
    error,
    getSustainabilityScore,
    getAllSustainabilityScores,
    getRestaurantMetrics,
    filterBySustainability,
  } = useSustainability();

  const handleGetScore = async (menuItemId: string) => {
    const score = await getSustainabilityScore(menuItemId);
    console.log(score);
  };

  return (
    <div>
      {/* Display sustainability info */}
    </div>
  );
};
```

### Algorithm: Sustainability Scoring

Located in `backend/src/algorithms/sustainabilityScore.ts`

#### Scoring Breakdown

1. **Carbon Score** (0-100)
   - Formula: `100 - (carbonFootprint / maxCarbon) * 100`
   - Max carbon: 10 kg CO2
   - Lower carbon = higher score

2. **Vegetarian Score** (0-100)
   - Vegan: 100
   - Vegetarian: 75
   - Meat: 0

3. **Local Score** (0-100)
   - Local ingredients: 80
   - < 100km: 70
   - 100-500km: 40
   - > 500km: 10

4. **Organic Score** (0-100)
   - Organic: +50
   - Seasonal: +50
   - Maximum: 100

#### Overall Score Formula
```
overallScore = (
  carbonScore × 0.3 +
  vegetarianScore × 0.25 +
  localScore × 0.25 +
  organicScore × 0.2
)
```

#### Key Functions

```typescript
// Calculate score for a dish
calculateSustainabilityScore(data: SustainabilityData): SustainabilityScore

// Get badges for a dish
getSustainabilityBadges(data: SustainabilityData): Badge[]

// Filter dishes by minimum score
filterBySustainability(items: any[], minScore: number): string[]

// Compare sustainability of multiple items
compareSustainability(items: any[]): Array<{...}>

// Get restaurant metrics
calculateRestaurantSustainabilityMetrics(allDishes: any[])
```

---

## 📊 Integration Examples

### Example: Menu Item with Mood & Sustainability

```typescript
interface MenuItemComplete {
  id: string;
  name: string;
  price: number;
  
  // Mood features
  moodTags: ['Romantic', 'Vegetarian'];
  suitableFor: ['Romantic Dinner', 'Date Night'];
  
  // Sustainability features
  carbonFootprint: 1.2;
  sustainability: {
    overallScore: 88;
    badges: ['🌱 Vegan', '🌍 Local', '🍃 Organic'];
  };
}
```

### Example: Complete Recommendation Flow

```typescript
// 1. User selects mood
const mood = 'ROMANTIC';

// 2. Get recommendations
const recommendations = await generateMoodRecommendation(
  mood,
  menuItems,
  tables
);

// 3. Filter by sustainability
const sustainableDishes = recommendations.recommendedDishes
  .filter(dish => {
    const score = calculateSustainabilityScore(dish);
    return score.overallScore >= 70;
  });

// 4. Display to user
display({
  mood: recommendations.mood,
  dishes: sustainableDishes,
  tables: recommendations.suggestedTables,
  ambiance: recommendations.ambiance,
});
```

---

## 📝 Data Entry for Admins

Admins need to input sustainability data for each menu item:

```typescript
POST /api/v1/menu/:id/sustainability
{
  "carbonFootprint": 1.5,        // kg CO2
  "waterUsage": 50,              // liters
  "transportDistance": 25,       // km
  "isLocalIngredient": true,
  "isOrganic": true,
  "isVegan": false,
  "isVegetarian": true,
  "isSeasonal": true,
  "packagingType": "Recyclable"
}
```

Tool recommendation: Create an admin interface for data entry to make this easier.

---

## 🗄️ Database Migration

After updating the schema, run:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_mood_sustainability_features
```

---

## 🎨 Styling Notes

- Uses Tailwind CSS for styling
- Framer Motion for animations
- Color scheme:
  - Mood moods: Gradient colors (pink, blue, gray, yellow)
  - Sustainability: Green theme for high scores, red for low

---

## 🚀 Implementation Checklist

- [x] Database schema updated
- [x] Backend algorithms created
- [x] Frontend components created
- [x] Frontend hooks created
- [ ] Backend routes implementation (TODO)
- [ ] Backend controllers implementation (TODO)
- [ ] Database migration (TODO)
- [ ] API testing (TODO)
- [ ] UI integration testing (TODO)

---

## 📚 References

- [Mood-Based Recommendation Algorithm](../../backend/src/algorithms/moodBasedRecommendation.ts)
- [Sustainability Scoring Algorithm](../../backend/src/algorithms/sustainabilityScore.ts)
- [Frontend Components](../../frontend/components/)
- [Frontend Hooks](../../frontend/hooks/)

---

Last Updated: February 2025
