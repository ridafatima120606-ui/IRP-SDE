// Script to add images to menu items via API
const menuImages = {
  'Grilled Salmon': 'https://images.unsplash.com/photo-1580959375944-abd7e991f971?w=400&h=300&fit=crop',
  'Margherita Pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305c9?w=400&h=300&fit=crop',
  'Caesar Salad': 'https://images.unsplash.com/photo-1550304317-33cebc30ccb9?w=400&h=300&fit=crop',
  'Spaghetti Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221fcb3b?w=400&h=300&fit=crop',
  'Beef Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  'Pad Thai': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
  'Tom Yum Soup': 'https://images.unsplash.com/photo-1609501676725-7186f017a4b8?w=400&h=300&fit=crop',
  'Sushi Platter': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
  'Tikka Masala': 'https://images.unsplash.com/photo-1596040813453-8db3f99fcbab?w=400&h=300&fit=crop',
  'Black Truffle Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
  'Grilled Vegetables': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'Vegan Buddha Bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'Chicken Teriyaki': 'https://images.unsplash.com/photo-1585937421200-86f2f92a4501?w=400&h=300&fit=crop',
  'Fish and Chips': 'https://images.unsplash.com/photo-1619885090072-cf3e61f3f26b?w=400&h=300&fit=crop',
  'Vegetable Curry': 'https://images.unsplash.com/photo-1626654321773-dae6f689be10?w=400&h=300&fit=crop',
  'Greek Moussaka': 'https://images.unsplash.com/photo-1626654321782-d59d6f0dfa0d?w=400&h=300&fit=crop',
  'Lobster Bisque': 'https://images.unsplash.com/photo-1476124369475-5b2c71a37d33?w=400&h=300&fit=crop',
  'Duck Confit': 'https://images.unsplash.com/photo-1484521118772-bc1a93fb27ae?w=400&h=300&fit=crop',
  'Tiramisu': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop',
  'Chocolate Cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
  'Cheesecake': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&h=300&fit=crop',
  'Crème Brûlée': 'https://images.unsplash.com/photo-1535920527894-b400132ba339?w=400&h=300&fit=crop',
};

const API_BASE = 'http://localhost:5000/api/v1';

async function getMenuItems() {
  try {
    const response = await fetch(`${API_BASE}/menu/items?limit=100`);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data).substring(0, 200));
    if (data.data && data.data.items) {
      return data.data.items;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }
}

async function updateMenuItemImage(itemId, imageUrl) {
  try {
    const response = await fetch(`${API_BASE}/menu/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageUrl }),
    });
    
    if (response.ok) {
      console.log(`✓ Updated item ${itemId} with image`);
      return true;
    } else {
      console.error(`✗ Failed to update item ${itemId}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    return false;
  }
}

async function addImagesToMenu() {
  console.log('Fetching menu items...');
  const items = await getMenuItems();
  
  if (items.length === 0) {
    console.log('No menu items found');
    return;
  }

  console.log(`Found ${items.length} menu items. Adding images...`);

  for (const item of items) {
    // Look for a matching image by name
    const matchedImage = Object.entries(menuImages).find(
      ([name]) => item.name.toLowerCase().includes(name.toLowerCase()) || 
                  name.toLowerCase().includes(item.name.toLowerCase())
    );

    if (matchedImage) {
      await updateMenuItemImage(item.id, matchedImage[1]);
    } else {
      // Use a random image as default
      const defaultImages = [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1612874742237-6526221fcb3b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1626654321773-dae6f689be10?w=400&h=300&fit=crop',
      ];
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      await updateMenuItemImage(item.id, randomImage);
    }
  }

  console.log('✓ Finished adding images to menu items!');
}

addImagesToMenu();
