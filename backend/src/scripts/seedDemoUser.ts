import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async function seedDemoUser() {
  try {
    console.log('Seeding demo user...');

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    });

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword('password123');

    // Create the demo user
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User',
        phone: '9876543210',
        role: 'CUSTOMER',
      },
    });

    // Create loyalty points for the demo user
    await prisma.loyaltyPoints.create({
      data: {
        userId: user.id,
        points: 500,
        tier: 'GOLD',
      },
    });

    console.log('Demo user created successfully:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error seeding demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoUser();
