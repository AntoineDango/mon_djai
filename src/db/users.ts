import { db } from './index.ts';
import { users, expenseCategories, incomeSources } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  dailyThreshold: number;
}

const DEFAULT_CATEGORIES = [
  { name: 'Transport', color: '#3b82f6', icon: 'car' },
  { name: 'Nourriture', color: '#f59e0b', icon: 'utensils' },
  { name: 'Imprévus', color: '#ef4444', icon: 'alert-triangle' },
  { name: 'Famille', color: '#8b5cf6', icon: 'users' },
  { name: 'Autres', color: '#64748b', icon: 'more-horizontal' },
];

const DEFAULT_SOURCES = [
  { name: 'GLM', color: '#10b981' },
  { name: 'SOLIDARITY PROJECT', color: '#06b6d4' },
  { name: 'CIC (Stage)', color: '#6366f1' },
  { name: 'Autres revenus', color: '#84cc16' },
];

export async function getOrCreateUser(uid: string, email: string, name?: string): Promise<UserProfile> {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    let currentUser = existing[0];

    if (!currentUser) {
      const inserted = await db.insert(users)
        .values({
          uid,
          email: email || 'antoinedango@gmail.com',
          name: name || 'Antoine DANGO',
          dailyThreshold: 2000,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: email || 'antoinedango@gmail.com',
            name: name || 'Antoine DANGO',
            updatedAt: new Date(),
          },
        })
        .returning();
      currentUser = inserted[0];
    }

    // Seed default categories if none exist
    const categories = await db.select().from(expenseCategories).where(eq(expenseCategories.userId, uid));
    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await db.insert(expenseCategories).values({
          userId: uid,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          isDefault: true,
        });
      }
    }

    // Seed default sources if none exist
    const sources = await db.select().from(incomeSources).where(eq(incomeSources.userId, uid));
    if (sources.length === 0) {
      for (const src of DEFAULT_SOURCES) {
        await db.insert(incomeSources).values({
          userId: uid,
          name: src.name,
          color: src.color,
          isDefault: true,
        });
      }
    }

    return currentUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database user lookup failed', { cause: error });
  }
}

export async function updateUserThreshold(uid: string, threshold: number): Promise<UserProfile> {
  try {
    const updated = await db.update(users)
      .set({ dailyThreshold: threshold, updatedAt: new Date() })
      .where(eq(users.uid, uid))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error in updateUserThreshold:', error);
    throw new Error('Failed to update threshold', { cause: error });
  }
}
