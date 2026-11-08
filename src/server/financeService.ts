import { db } from '../db/index.ts';
import { expenses, incomes, expenseCategories, incomeSources, users } from '../db/schema.ts';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import ExcelJS from 'exceljs';

// Format FCFA helper
export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

// Current date in Africa/Abidjan timezone (UTC)
export function getAbidjanDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getAbidjanTime(): string {
  const d = new Date();
  return d.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Abidjan', hour: '2-digit', minute: '2-digit' });
}

// Service methods
export async function getCategories(userId: string) {
  try {
    return await db.select().from(expenseCategories).where(eq(expenseCategories.userId, userId));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Impossible de charger les catégories.', { cause: error });
  }
}

export async function addCategory(userId: string, data: { name: string; color?: string; icon?: string }) {
  try {
    const inserted = await db.insert(expenseCategories).values({
      userId,
      name: data.name,
      color: data.color || '#3b82f6',
      icon: data.icon || 'tag',
      isDefault: false,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error('Impossible d\'ajouter la catégorie.', { cause: error });
  }
}

export async function deleteCategory(userId: string, id: number) {
  try {
    await db.delete(expenseCategories).where(and(eq(expenseCategories.id, id), eq(expenseCategories.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Impossible de supprimer la catégorie.', { cause: error });
  }
}

export async function getSources(userId: string) {
  try {
    return await db.select().from(incomeSources).where(eq(incomeSources.userId, userId));
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw new Error('Impossible de charger les sources de revenus.', { cause: error });
  }
}

export async function addSource(userId: string, data: { name: string; color?: string }) {
  try {
    const inserted = await db.insert(incomeSources).values({
      userId,
      name: data.name,
      color: data.color || '#10b981',
      isDefault: false,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error adding source:', error);
    throw new Error('Impossible d\'ajouter la source de revenus.', { cause: error });
  }
}

export async function updateSource(userId: string, id: number, data: { name: string; color?: string }) {
  try {
    const updated = await db.update(incomeSources)
      .set({
        name: data.name,
        color: data.color || '#10b981',
      })
      .where(and(eq(incomeSources.id, id), eq(incomeSources.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error updating source:', error);
    throw new Error('Impossible de mettre à jour la source.', { cause: error });
  }
}

export async function deleteSource(userId: string, id: number) {
  try {
    await db.delete(incomeSources).where(and(eq(incomeSources.id, id), eq(incomeSources.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting source:', error);
    throw new Error('Impossible de supprimer la source.', { cause: error });
  }
}

export async function getExpenses(userId: string, filters?: { startDate?: string; endDate?: string; categoryId?: number }) {
  try {
    const conditions = [eq(expenses.userId, userId)];
    if (filters?.startDate) {
      conditions.push(gte(expenses.transactionDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(expenses.transactionDate, filters.endDate));
    }
    if (filters?.categoryId) {
      conditions.push(eq(expenses.categoryId, filters.categoryId));
    }

    const items = await db.select({
      id: expenses.id,
      userId: expenses.userId,
      amount: expenses.amount,
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.name,
      categoryColor: expenseCategories.color,
      categoryIcon: expenseCategories.icon,
      description: expenses.description,
      transactionDate: expenses.transactionDate,
      transactionTime: expenses.transactionTime,
      createdAt: expenses.createdAt,
      updatedAt: expenses.updatedAt,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(...conditions))
    .orderBy(desc(expenses.transactionDate), desc(expenses.transactionTime), desc(expenses.id));

    return items;
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw new Error('Impossible de récupérer les dépenses.', { cause: error });
  }
}

export async function addExpense(userId: string, data: { amount: number; categoryId?: number; description?: string; transactionDate?: string; transactionTime?: string }) {
  try {
    const date = data.transactionDate || getAbidjanDate();
    const time = data.transactionTime || getAbidjanTime();

    const inserted = await db.insert(expenses).values({
      userId,
      amount: Math.round(Number(data.amount)),
      categoryId: data.categoryId || null,
      description: data.description?.trim() || null,
      transactionDate: date,
      transactionTime: time,
    }).returning();

    return inserted[0];
  } catch (error) {
    console.error('Error adding expense:', error);
    throw new Error('Impossible d\'enregistrer la dépense.', { cause: error });
  }
}

export async function updateExpense(userId: string, id: number, data: { amount: number; categoryId?: number; description?: string; transactionDate: string; transactionTime?: string }) {
  try {
    const updated = await db.update(expenses)
      .set({
        amount: Math.round(Number(data.amount)),
        categoryId: data.categoryId || null,
        description: data.description?.trim() || null,
        transactionDate: data.transactionDate,
        transactionTime: data.transactionTime || getAbidjanTime(),
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error updating expense:', error);
    throw new Error('Impossible de mettre à jour la dépense.', { cause: error });
  }
}

export async function deleteExpense(userId: string, id: number) {
  try {
    await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw new Error('Impossible de supprimer la dépense.', { cause: error });
  }
}

export async function getIncomes(userId: string, filters?: { startDate?: string; endDate?: string; sourceId?: number }) {
  try {
    const conditions = [eq(incomes.userId, userId)];
    if (filters?.startDate) {
      conditions.push(gte(incomes.transactionDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(incomes.transactionDate, filters.endDate));
    }
    if (filters?.sourceId) {
      conditions.push(eq(incomes.sourceId, filters.sourceId));
    }

    const items = await db.select({
      id: incomes.id,
      userId: incomes.userId,
      amount: incomes.amount,
      sourceId: incomes.sourceId,
      sourceName: incomeSources.name,
      sourceColor: incomeSources.color,
      description: incomes.description,
      transactionDate: incomes.transactionDate,
      transactionTime: incomes.transactionTime,
      createdAt: incomes.createdAt,
      updatedAt: incomes.updatedAt,
    })
    .from(incomes)
    .leftJoin(incomeSources, eq(incomes.sourceId, incomeSources.id))
    .where(and(...conditions))
    .orderBy(desc(incomes.transactionDate), desc(incomes.transactionTime), desc(incomes.id));

    return items;
  } catch (error) {
    console.error('Error getting incomes:', error);
    throw new Error('Impossible de récupérer les revenus.', { cause: error });
  }
}

export async function addIncome(userId: string, data: { amount: number; sourceId?: number; description?: string; transactionDate?: string; transactionTime?: string }) {
  try {
    const date = data.transactionDate || getAbidjanDate();
    const time = data.transactionTime || getAbidjanTime();

    const inserted = await db.insert(incomes).values({
      userId,
      amount: Math.round(Number(data.amount)),
      sourceId: data.sourceId || null,
      description: data.description?.trim() || null,
      transactionDate: date,
      transactionTime: time,
    }).returning();

    return inserted[0];
  } catch (error) {
    console.error('Error adding income:', error);
    throw new Error('Impossible d\'enregistrer le revenu.', { cause: error });
  }
}

export async function updateIncome(userId: string, id: number, data: { amount: number; sourceId?: number; description?: string; transactionDate: string; transactionTime?: string }) {
  try {
    const updated = await db.update(incomes)
      .set({
        amount: Math.round(Number(data.amount)),
        sourceId: data.sourceId || null,
        description: data.description?.trim() || null,
        transactionDate: data.transactionDate,
        transactionTime: data.transactionTime || getAbidjanTime(),
        updatedAt: new Date(),
      })
      .where(and(eq(incomes.id, id), eq(incomes.userId, userId)))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Error updating income:', error);
    throw new Error('Impossible de mettre à jour le revenu.', { cause: error });
  }
}

export async function deleteIncome(userId: string, id: number) {
  try {
    await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting income:', error);
    throw new Error('Impossible de supprimer le revenu.', { cause: error });
  }
}

// Calculate comprehensive dashboard stats
export async function getDashboardStats(userId: string, filterRange?: { startDate?: string; endDate?: string }) {
  try {
    const today = getAbidjanDate();
    const currentMonthPrefix = today.substring(0, 7); // YYYY-MM
    
    // User profile to get current threshold
    const userRes = await db.select().from(users).where(eq(users.uid, userId));
    const dailyThreshold = userRes[0]?.dailyThreshold ?? 2000;

    // All expenses and incomes for user
    const allExpenses = await getExpenses(userId);
    const allIncomes = await getIncomes(userId);

    // Totals all time
    const totalIncome = allIncomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = allExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncome - totalExpense;

    // Monthly totals (current month)
    const monthExpensesList = allExpenses.filter(e => e.transactionDate.startsWith(currentMonthPrefix));
    const monthIncomesList = allIncomes.filter(i => i.transactionDate.startsWith(currentMonthPrefix));
    const monthExpense = monthExpensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const monthIncome = monthIncomesList.reduce((acc, curr) => acc + curr.amount, 0);
    const monthRemaining = monthIncome - monthExpense;

    // Today's total expenses (Africa/Abidjan)
    const todayExpensesList = allExpenses.filter(e => e.transactionDate === today);
    const todayExpense = todayExpensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const isThresholdExceeded = todayExpense > dailyThreshold;

    // Weekly totals (current week starting Monday)
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    const mondayStr = monday.toISOString().split('T')[0];

    const weekExpensesList = allExpenses.filter(e => e.transactionDate >= mondayStr && e.transactionDate <= today);
    const weekIncomesList = allIncomes.filter(i => i.transactionDate >= mondayStr && i.transactionDate <= today);
    const weekExpense = weekExpensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const weekIncome = weekIncomesList.reduce((acc, curr) => acc + curr.amount, 0);

    // Filtered data based on requested range or all
    const filteredExpenses = allExpenses.filter(e => {
      if (filterRange?.startDate && e.transactionDate < filterRange.startDate) return false;
      if (filterRange?.endDate && e.transactionDate > filterRange.endDate) return false;
      return true;
    });

    const filteredIncomes = allIncomes.filter(i => {
      if (filterRange?.startDate && i.transactionDate < filterRange.startDate) return false;
      if (filterRange?.endDate && i.transactionDate > filterRange.endDate) return false;
      return true;
    });

    // Category breakdown
    const categoryMap = new Map<string, { name: string; color: string; amount: number; count: number }>();
    for (const exp of filteredExpenses) {
      const catName = exp.categoryName || 'Non catégorisé';
      const catColor = exp.categoryColor || '#64748b';
      const current = categoryMap.get(catName) || { name: catName, color: catColor, amount: 0, count: 0 };
      current.amount += exp.amount;
      current.count += 1;
      categoryMap.set(catName, current);
    }
    const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

    // Source breakdown
    const sourceMap = new Map<string, { name: string; color: string; amount: number; count: number }>();
    for (const inc of filteredIncomes) {
      const srcName = inc.sourceName || 'Non spécifié';
      const srcColor = inc.sourceColor || '#10b981';
      const current = sourceMap.get(srcName) || { name: srcName, color: srcColor, amount: 0, count: 0 };
      current.amount += inc.amount;
      current.count += 1;
      sourceMap.set(srcName, current);
    }
    const sourceBreakdown = Array.from(sourceMap.values()).sort((a, b) => b.amount - a.amount);

    // Daily totals map for checking any day threshold
    const dailyTotalsMap: Record<string, number> = {};
    for (const exp of allExpenses) {
      dailyTotalsMap[exp.transactionDate] = (dailyTotalsMap[exp.transactionDate] || 0) + exp.amount;
    }

    // Last 7 days history
    const last7Days: { date: string; displayDate: string; expenses: number; incomes: number; threshold: number; isExceeded: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayExp = dailyTotalsMap[dStr] || 0;
      const dayInc = allIncomes.filter(inc => inc.transactionDate === dStr).reduce((acc, curr) => acc + curr.amount, 0);
      const displayDate = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
      last7Days.push({
        date: dStr,
        displayDate,
        expenses: dayExp,
        incomes: dayInc,
        threshold: dailyThreshold,
        isExceeded: dayExp > dailyThreshold,
      });
    }

    // Last 30 days history
    const last30Days: { date: string; displayDate: string; expenses: number; incomes: number; threshold: number; isExceeded: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayExp = dailyTotalsMap[dStr] || 0;
      const dayInc = allIncomes.filter(inc => inc.transactionDate === dStr).reduce((acc, curr) => acc + curr.amount, 0);
      const displayDate = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      last30Days.push({
        date: dStr,
        displayDate,
        expenses: dayExp,
        incomes: dayInc,
        threshold: dailyThreshold,
        isExceeded: dayExp > dailyThreshold,
      });
    }

    // Previous month comparison
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthPrefix = prevDate.toISOString().substring(0, 7);
    const prevMonthExpenses = allExpenses
      .filter(e => e.transactionDate.startsWith(prevMonthPrefix))
      .reduce((acc, curr) => acc + curr.amount, 0);
    const prevMonthIncomes = allIncomes
      .filter(i => i.transactionDate.startsWith(prevMonthPrefix))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const monthOverMonthExpenseGrowth = prevMonthExpenses > 0 
      ? Math.round(((monthExpense - prevMonthExpenses) / prevMonthExpenses) * 100) 
      : 0;

    // Consumption & Savings Rates
    const consumptionRate = monthIncome > 0 ? Math.min(100, Math.round((monthExpense / monthIncome) * 100)) : (monthExpense > 0 ? 100 : 0);
    const savingsRate = monthIncome > 0 ? Math.max(0, Math.round(((monthIncome - monthExpense) / monthIncome) * 100)) : 0;

    // Habit insights:
    // 1. Day of the week where user spends the most
    const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0]; // 0: Dimanche, 1: Lundi, ..., 6: Samedi
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    for (const exp of allExpenses) {
      const dateObj = new Date(exp.transactionDate + 'T12:00:00Z');
      const dow = dateObj.getUTCDay();
      dayOfWeekTotals[dow] += exp.amount;
    }
    let maxDowIndex = 1;
    let maxDowAmount = dayOfWeekTotals[1];
    for (let i = 0; i < 7; i++) {
      if (dayOfWeekTotals[i] > maxDowAmount) {
        maxDowAmount = dayOfWeekTotals[i];
        maxDowIndex = i;
      }
    }
    const highestExpenseDayOfWeek = dayNames[maxDowIndex];

    // 2. Average daily expense across active days
    const activeExpenseDaysCount = Object.keys(dailyTotalsMap).length;
    const dailyAverageExpense = activeExpenseDaysCount > 0 ? Math.round(totalExpense / activeExpenseDaysCount) : 0;

    // 3. Top category
    const topExpenseCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].name : 'Aucune dépense';

    return {
      dailyThreshold,
      totalIncome,
      totalExpense,
      balance,
      monthIncome,
      monthExpense,
      monthRemaining,
      todayExpense,
      isThresholdExceeded,
      weekIncome,
      weekExpense,
      totalTransactions: allExpenses.length + allIncomes.length,
      categoryBreakdown,
      sourceBreakdown,
      last7Days,
      last30Days,
      dailyTotalsMap,
      habitsAnalysis: {
        topExpenseCategory,
        dailyAverageExpense,
        highestExpenseDayOfWeek,
        consumptionRate,
        savingsRate,
        monthOverMonthExpenseGrowth,
        prevMonthExpenses,
        prevMonthIncomes,
      },
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw new Error('Impossible de calculer les statistiques.', { cause: error });
  }
}

// Generate Excel Workbook
export async function generateExcelReport(userId: string, period: string, startDate?: string, endDate?: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Mon Djai by Antoine DANGO';
  workbook.created = new Date();

  // Fetch filtered data
  let start = startDate;
  let end = endDate;
  const today = getAbidjanDate();

  if (period === 'today') {
    start = today;
    end = today;
  } else if (period === 'week') {
    const d = new Date();
    const dayOfWeek = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);
    start = monday.toISOString().split('T')[0];
    end = today;
  } else if (period === 'month') {
    start = today.substring(0, 7) + '-01';
    end = today;
  }

  const [expensesList, incomesList, stats] = await Promise.all([
    getExpenses(userId, { startDate: start, endDate: end }),
    getIncomes(userId, { startDate: start, endDate: end }),
    getDashboardStats(userId, { startDate: start, endDate: end }),
  ]);

  // STYLING HELPERS
  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Dark slate
  };
  const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true };

  // 1. DÉPENSES SHEET
  const wsExpenses = workbook.addWorksheet('Dépenses');
  wsExpenses.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Heure', key: 'time', width: 12 },
    { header: 'Catégorie', key: 'category', width: 20 },
    { header: 'Montant (FCFA)', key: 'amount', width: 18 },
    { header: 'Description / Commentaire', key: 'description', width: 35 },
  ];

  wsExpenses.getRow(1).eachCell(cell => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  expensesList.forEach(e => {
    const row = wsExpenses.addRow({
      id: e.id,
      date: e.transactionDate,
      time: e.transactionTime || '',
      category: e.categoryName || 'Non catégorisé',
      amount: e.amount,
      description: e.description || '',
    });
    row.getCell('amount').numFmt = '#,##0 "FCFA"';
  });

  // Total expenses row
  const expTotalRow = wsExpenses.addRow({
    id: '',
    date: 'TOTAL',
    time: '',
    category: '',
    amount: expensesList.reduce((acc, c) => acc + c.amount, 0),
    description: '',
  });
  expTotalRow.font = { bold: true };
  expTotalRow.getCell('amount').numFmt = '#,##0 "FCFA"';

  // 2. REVENUS SHEET
  const wsIncomes = workbook.addWorksheet('Revenus');
  wsIncomes.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Heure', key: 'time', width: 12 },
    { header: 'Source', key: 'source', width: 22 },
    { header: 'Montant (FCFA)', key: 'amount', width: 18 },
    { header: 'Description / Commentaire', key: 'description', width: 35 },
  ];

  wsIncomes.getRow(1).eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF065F46' }, // Forest green
    };
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  incomesList.forEach(i => {
    const row = wsIncomes.addRow({
      id: i.id,
      date: i.transactionDate,
      time: i.transactionTime || '',
      source: i.sourceName || 'Non spécifié',
      amount: i.amount,
      description: i.description || '',
    });
    row.getCell('amount').numFmt = '#,##0 "FCFA"';
  });

  const incTotalRow = wsIncomes.addRow({
    id: '',
    date: 'TOTAL',
    time: '',
    source: '',
    amount: incomesList.reduce((acc, c) => acc + c.amount, 0),
    description: '',
  });
  incTotalRow.font = { bold: true };
  incTotalRow.getCell('amount').numFmt = '#,##0 "FCFA"';

  // 3. SYNTHÈSE FINANCIÈRE SHEET
  const wsSummary = workbook.addWorksheet('Synthèse financière');
  wsSummary.columns = [
    { header: 'Indicateur', key: 'metric', width: 35 },
    { header: 'Valeur', key: 'value', width: 25 },
    { header: 'Commentaire', key: 'note', width: 35 },
  ];

  wsSummary.getRow(1).eachCell(cell => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  const totalPeriodIncome = incomesList.reduce((acc, c) => acc + c.amount, 0);
  const totalPeriodExpense = expensesList.reduce((acc, c) => acc + c.amount, 0);
  const periodBalance = totalPeriodIncome - totalPeriodExpense;

  const summaryData = [
    { metric: 'Période analysée', value: period.toUpperCase(), note: `${start || 'Début'} au ${end || 'Fin'}` },
    { metric: 'Total des revenus', value: formatFCFA(totalPeriodIncome), note: `${incomesList.length} transaction(s)` },
    { metric: 'Total des dépenses', value: formatFCFA(totalPeriodExpense), note: `${expensesList.length} transaction(s)` },
    { metric: 'Solde net de la période', value: formatFCFA(periodBalance), note: periodBalance >= 0 ? 'Excédent budgétaire' : 'Déficit' },
    { metric: 'Solde global disponible (Tout historique)', value: formatFCFA(stats.balance), note: 'Revenus cumulés - Dépenses cumulées' },
    { metric: 'Seuil journalier de dépenses', value: formatFCFA(stats.dailyThreshold), note: 'Règle de contrôle (2 000 FCFA par défaut)' },
    { metric: 'Dépenses moyennes par jour actif', value: formatFCFA(stats.habitsAnalysis.dailyAverageExpense), note: 'Moyenne quotidienne' },
    { metric: 'Taux de consommation du mois', value: `${stats.habitsAnalysis.consumptionRate}%`, note: 'Part des revenus dépensés' },
    { metric: 'Taux d\'épargne du mois', value: `${stats.habitsAnalysis.savingsRate}%`, note: 'Part des revenus économisés' },
    { metric: 'Jour où les dépenses sont les plus élevées', value: stats.habitsAnalysis.highestExpenseDayOfWeek, note: 'Analyse hebdomadaire' },
    { metric: 'Catégorie principale de dépenses', value: stats.habitsAnalysis.topExpenseCategory, note: 'Premier poste de dépenses' },
  ];

  summaryData.forEach(item => {
    wsSummary.addRow(item);
  });

  // 4. ANALYSE PAR CATÉGORIE SHEET
  const wsCat = workbook.addWorksheet('Analyse par catégorie');
  wsCat.columns = [
    { header: 'Catégorie', key: 'category', width: 25 },
    { header: 'Nombre de transactions', key: 'count', width: 25 },
    { header: 'Montant Total (FCFA)', key: 'amount', width: 22 },
    { header: 'Part (%)', key: 'percentage', width: 15 },
  ];

  wsCat.getRow(1).eachCell(cell => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  stats.categoryBreakdown.forEach(cat => {
    const pct = totalPeriodExpense > 0 ? ((cat.amount / totalPeriodExpense) * 100).toFixed(1) + '%' : '0%';
    const row = wsCat.addRow({
      category: cat.name,
      count: cat.count,
      amount: cat.amount,
      percentage: pct,
    });
    row.getCell('amount').numFmt = '#,##0 "FCFA"';
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
