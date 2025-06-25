import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/upload', uploadRoutes);


const PORT = process.env.PORT || 5000;
app.get('/', (_req, res) => {
  res.send('🚀 Admin Panel Backend is running!');
});
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });