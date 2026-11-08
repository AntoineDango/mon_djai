import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or guest session ID
  email: text('email').notNull(),
  name: text('name'),
  dailyThreshold: integer('daily_threshold').default(2000).notNull(), // default 2 000 FCFA
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expense Categories
export const expenseCategories = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').default('#3b82f6').notNull(),
  icon: text('icon').default('tag').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Income Sources
export const incomeSources = pgTable('income_sources', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').default('#10b981').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // in FCFA
  categoryId: integer('category_id').references(() => expenseCategories.id, { onDelete: 'set null' }),
  description: text('description'),
  transactionDate: text('transaction_date').notNull(), // YYYY-MM-DD
  transactionTime: text('transaction_time').notNull(), // HH:mm
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Incomes
export const incomes = pgTable('incomes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // in FCFA
  sourceId: integer('source_id').references(() => incomeSources.id, { onDelete: 'set null' }),
  description: text('description'),
  transactionDate: text('transaction_date').notNull(), // YYYY-MM-DD
  transactionTime: text('transaction_time').notNull(), // HH:mm
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  incomes: many(incomes),
  categories: many(expenseCategories),
  sources: many(incomeSources),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
  source: one(incomeSources, {
    fields: [incomes.sourceId],
    references: [incomeSources.id],
  }),
}));
