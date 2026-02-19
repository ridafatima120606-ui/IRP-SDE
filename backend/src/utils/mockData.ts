import fs from 'fs';
import path from 'path';

// Mock menu items for demo purposes (persisted to local JSON file in dev)
const MOCK_DATA_DIR = path.resolve(process.cwd(), 'data');
const MOCK_MENU_FILE = path.join(MOCK_DATA_DIR, 'mock-menu.json');

const loadMockMenuItems = (): any[] => {
  try {
    if (!fs.existsSync(MOCK_DATA_DIR)) {
      fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MOCK_MENU_FILE)) {
      fs.writeFileSync(MOCK_MENU_FILE, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(MOCK_MENU_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load persisted mock menu data:', error);
    return [];
  }
};

export const persistMockMenuItems = () => {
  try {
    if (!fs.existsSync(MOCK_DATA_DIR)) {
      fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MOCK_MENU_FILE, JSON.stringify(mockMenuItems, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Failed to persist mock menu data:', error);
  }
};

export const mockMenuItems: any[] = loadMockMenuItems();
