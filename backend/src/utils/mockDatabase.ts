/**
 * Mock Database Service
 * Provides in-memory data storage for development/testing
 * when PostgreSQL is not available
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export interface MockOrder {
  id: string;
  userId: string;
  items: Array<{ menuItemId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface MockReservation {
  id: string;
  userId: string;
  tableId: string;
  date: Date;
  time: string;
  guests: number;
  status: string;
}

class MockDatabase {
  private users: Map<string, MockUser> = new Map();
  private menuItems: Map<string, MockMenuItem> = new Map();
  private orders: Map<string, MockOrder> = new Map();
  private reservations: Map<string, MockReservation> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Users
    const mockUsers: MockUser[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9999999999',
        role: 'customer'
      },
      {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '8888888888',
        role: 'admin'
      }
    ];

    mockUsers.forEach(user => this.users.set(user.id, user));

    // Mock Menu Items
    const mockMenuItems: MockMenuItem[] = [
      {
        id: '1',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato cream sauce',
        price: 280,
        category: 'MAIN_COURSE',
        imageUrl: 'https://images.unsplash.com/photo-1585867741668-8a91b4c9a5a0?w=500',
        available: true
      },
      {
        id: '2',
        name: 'Veg Biryani',
        description: 'Fragrant rice with mixed vegetables',
        price: 220,
        category: 'MAIN_COURSE',
        imageUrl: 'https://images.unsplash.com/photo-1589521471156-da93af43d3a9?w=500',
        available: true
      },
      {
        id: '3',
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime soda with fresh ingredients',
        price: 80,
        category: 'DRINKS',
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba2a7fc5c514?w=500',
        available: true
      }
    ];

    mockMenuItems.forEach(item => this.menuItems.set(item.id, item));
  }

  // User Methods
  getUserById(id: string): MockUser | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): MockUser | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  getAllUsers(): MockUser[] {
    return Array.from(this.users.values());
  }

  createUser(user: Omit<MockUser, 'id'>): MockUser {
    const id = Date.now().toString();
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  updateUser(id: string, data: Partial<MockUser>): MockUser | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Menu Item Methods
  getMenuItemById(id: string): MockMenuItem | undefined {
    return this.menuItems.get(id);
  }

  getAllMenuItems(): MockMenuItem[] {
    return Array.from(this.menuItems.values());
  }

  getMenuItemsByCategory(category: string): MockMenuItem[] {
    return Array.from(this.menuItems.values()).filter(
      item => item.category === category
    );
  }

  searchMenuItems(query: string): MockMenuItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.menuItems.values()).filter(
      item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
  }

  createMenuItem(item: Omit<MockMenuItem, 'id'>): MockMenuItem {
    const id = Date.now().toString();
    const newItem = { ...item, id };
    this.menuItems.set(id, newItem);
    return newItem;
  }

  updateMenuItem(id: string, data: Partial<MockMenuItem>): MockMenuItem | undefined {
    const item = this.menuItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...data };
    this.menuItems.set(id, updated);
    return updated;
  }

  deleteMenuItem(id: string): boolean {
    return this.menuItems.delete(id);
  }

  // Order Methods
  getOrderById(id: string): MockOrder | undefined {
    return this.orders.get(id);
  }

  getUserOrders(userId: string): MockOrder[] {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  getAllOrders(): MockOrder[] {
    return Array.from(this.orders.values());
  }

  createOrder(
    userId: string,
    items: Array<{ menuItemId: string; quantity: number; price: number }>
  ): MockOrder {
    const id = Date.now().toString();
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: MockOrder = {
      id,
      userId,
      items,
      totalAmount,
      status: 'PENDING',
      createdAt: new Date()
    };
    this.orders.set(id, order);
    return order;
  }

  updateOrderStatus(id: string, status: string): MockOrder | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;
    order.status = status;
    return order;
  }

  // Reservation Methods
  getReservationById(id: string): MockReservation | undefined {
    return this.reservations.get(id);
  }

  getUserReservations(userId: string): MockReservation[] {
    return Array.from(this.reservations.values()).filter(r => r.userId === userId);
  }

  getAllReservations(): MockReservation[] {
    return Array.from(this.reservations.values());
  }

  createReservation(reservation: Omit<MockReservation, 'id'>): MockReservation {
    const id = Date.now().toString();
    const newReservation = { ...reservation, id };
    this.reservations.set(id, newReservation);
    return newReservation;
  }

  updateReservation(id: string, data: Partial<MockReservation>): MockReservation | undefined {
    const reservation = this.reservations.get(id);
    if (!reservation) return undefined;
    const updated = { ...reservation, ...data };
    this.reservations.set(id, updated);
    return updated;
  }

  cancelReservation(id: string): boolean {
    const reservation = this.reservations.get(id);
    if (!reservation) return false;
    reservation.status = 'CANCELLED';
    return true;
  }

  // Stats Methods
  getStats() {
    return {
      totalUsers: this.users.size,
      totalMenuItems: this.menuItems.size,
      totalOrders: this.orders.size,
      totalReservations: this.reservations.size,
      totalRevenue: Array.from(this.orders.values()).reduce(
        (sum, order) => sum + (order.status === 'COMPLETED' ? order.totalAmount : 0),
        0
      )
    };
  }

  // Clear all data (for testing)
  reset() {
    this.users.clear();
    this.menuItems.clear();
    this.orders.clear();
    this.reservations.clear();
    this.initializeMockData();
  }
}

export const mockDatabase = new MockDatabase();
