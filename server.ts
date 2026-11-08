import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getCategories,
  addCategory,
  deleteCategory,
  getSources,
  addSource,
  updateSource,
  deleteSource,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  getDashboardStats,
  generateExcelReport,
  getAbidjanDate,
} from './src/server/financeService.ts';
import { updateUserThreshold } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : null;
const PORT = cliPort || (process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

app.use(express.json());

// 1. User Profile & Settings
app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    res.json(req.user);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

app.patch('/api/user/threshold', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { dailyThreshold } = req.body;
    if (typeof dailyThreshold !== 'number' || dailyThreshold < 0) {
      return res.status(400).json({ error: 'Le seuil doit être un nombre positif.' });
    }
    const updated = await updateUserThreshold(req.user!.uid, Math.round(dailyThreshold));
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating threshold:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// 2. Categories
app.get('/api/categories', requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await getCategories(req.user!.uid);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la catégorie est requis.' });
    }
    const created = await addCategory(req.user!.uid, { name: name.trim(), color, icon });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deleteCategory(req.user!.uid, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Income Sources
app.get('/api/sources', requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await getSources(req.user!.uid);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sources', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la source est requis.' });
    }
    const created = await addSource(req.user!.uid, { name: name.trim(), color });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sources/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Le nom de la source est requis.' });
    }
    const updated = await updateSource(req.user!.uid, id, { name: name.trim(), color });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/sources/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deleteSource(req.user!.uid, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Expenses
app.get('/api/expenses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    const items = await getExpenses(req.user!.uid, {
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      categoryId: categoryId ? parseInt(String(categoryId), 10) : undefined,
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, categoryId, description, transactionDate, transactionTime } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0 FCFA.' });
    }
    const created = await addExpense(req.user!.uid, {
      amount: Number(amount),
      categoryId: categoryId ? Number(categoryId) : undefined,
      description,
      transactionDate,
      transactionTime,
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { amount, categoryId, description, transactionDate, transactionTime } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0 FCFA.' });
    }
    const updated = await updateExpense(req.user!.uid, id, {
      amount: Number(amount),
      categoryId: categoryId ? Number(categoryId) : undefined,
      description,
      transactionDate: transactionDate || getAbidjanDate(),
      transactionTime,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deleteExpense(req.user!.uid, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Incomes
app.get('/api/incomes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, sourceId } = req.query;
    const items = await getIncomes(req.user!.uid, {
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      sourceId: sourceId ? parseInt(String(sourceId), 10) : undefined,
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/incomes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, sourceId, description, transactionDate, transactionTime } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0 FCFA.' });
    }
    const created = await addIncome(req.user!.uid, {
      amount: Number(amount),
      sourceId: sourceId ? Number(sourceId) : undefined,
      description,
      transactionDate,
      transactionTime,
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/incomes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { amount, sourceId, description, transactionDate, transactionTime } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Le montant doit être supérieur à 0 FCFA.' });
    }
    const updated = await updateIncome(req.user!.uid, id, {
      amount: Number(amount),
      sourceId: sourceId ? Number(sourceId) : undefined,
      description,
      transactionDate: transactionDate || getAbidjanDate(),
      transactionTime,
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/incomes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await deleteIncome(req.user!.uid, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Dashboard & Habits Analysis
app.get('/api/dashboard', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await getDashboardStats(req.user!.uid, {
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Excel Export
app.get('/api/export-excel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const period = String(req.query.period || 'all');
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;

    const buffer = await generateExcelReport(req.user!.uid, period, startDate, endDate);

    const filename = `Mon_Djai_Export_${period}_${getAbidjanDate()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ error: 'Échec de la génération du fichier Excel.' });
  }
});

// 8. Seed Sample Data Helper (Useful to pre-populate with realistic transactions for Antoine DANGO)
app.post('/api/seed-sample-data', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const cats = await getCategories(uid);
    const srcs = await getSources(uid);

    const transportCat = cats.find(c => c.name === 'Transport')?.id;
    const foodCat = cats.find(c => c.name === 'Nourriture')?.id;
    const impreveuCat = cats.find(c => c.name === 'Imprévus')?.id;
    const familyCat = cats.find(c => c.name === 'Famille')?.id;
    const otherCat = cats.find(c => c.name === 'Autres')?.id;

    const glmSrc = srcs.find(s => s.name === 'GLM')?.id;
    const solidaritySrc = srcs.find(s => s.name === 'SOLIDARITY PROJECT')?.id;
    const cicSrc = srcs.find(s => s.name === 'CIC (Stage)')?.id;

    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
    };

    // Add Incomes
    if (cicSrc) await addIncome(uid, { amount: 150000, sourceId: cicSrc, description: 'Indemnité stage CIC', transactionDate: daysAgo(20), transactionTime: '09:00' });
    if (glmSrc) await addIncome(uid, { amount: 75000, sourceId: glmSrc, description: 'Mission consultation GLM', transactionDate: daysAgo(10), transactionTime: '14:30' });
    if (solidaritySrc) await addIncome(uid, { amount: 50000, sourceId: solidaritySrc, description: 'Allocation projet solidaire', transactionDate: daysAgo(2), transactionTime: '11:15' });

    // Add Expenses with various dates and categories
    if (transportCat) await addExpense(uid, { amount: 1200, categoryId: transportCat, description: 'Taxi Yango Plateau - Cocody', transactionDate: daysAgo(0), transactionTime: '08:30' });
    if (foodCat) await addExpense(uid, { amount: 1500, categoryId: foodCat, description: 'Déjeuner Garba & Jus frais', transactionDate: daysAgo(0), transactionTime: '12:45' });
    // Total today = 2700 FCFA (> 2000 FCFA, triggers visual red alert!)
    
    if (transportCat) await addExpense(uid, { amount: 1000, categoryId: transportCat, description: 'Bus Sotra + Woro-woro', transactionDate: daysAgo(1), transactionTime: '07:45' });
    if (foodCat) await addExpense(uid, { amount: 900, categoryId: foodCat, description: 'Pain condiments & café', transactionDate: daysAgo(1), transactionTime: '13:00' });
    // Total yesterday = 1900 FCFA (<= 2000 FCFA, green in control!)

    if (familyCat) await addExpense(uid, { amount: 15000, categoryId: familyCat, description: 'Soutien famille', transactionDate: daysAgo(4), transactionTime: '16:00' });
    if (impreveuCat) await addExpense(uid, { amount: 3500, categoryId: impreveuCat, description: 'Pharmacie médicaments', transactionDate: daysAgo(5), transactionTime: '18:20' });
    if (otherCat) await addExpense(uid, { amount: 2000, categoryId: otherCat, description: 'Recharge crédit internet', transactionDate: daysAgo(7), transactionTime: '10:00' });

    res.json({ success: true, message: 'Données de démonstration initialisées avec succès !' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Frontend Vite Middleware / Static Serving
async function startServer() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist/index.html'));
      });
    }

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Mon Djai backend server listening on http://0.0.0.0:${PORT}`);
    });

    server.on('error', (err: any) => {
      console.error('Server listen error:', err);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
  }
}

startServer();
