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

const allowedOrigins = [
  'https://admin-panel-frontend-git-main-yashk0809s-projects.vercel.app',
  'http://localhost:3000',
  'https://admin-panel-frontend-navy.vercel.app', // ← include production clean URL too
];

const corsOptions = {
  origin: function (origin:any, callback:any) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked CORS origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
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