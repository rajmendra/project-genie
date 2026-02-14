import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import walletRoutes from './routes/wallet.js';
import expenseRoutes from './routes/expenses.js';
import notificationRoutes from './routes/notifications.js';
import messageRoutes from './routes/messages.js';
import remittanceRoutes from './routes/remittances.js';
import freezeAlertRoutes from './routes/freezeAlerts.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/remittances', remittanceRoutes);
app.use('/api/freeze-alerts', freezeAlertRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
