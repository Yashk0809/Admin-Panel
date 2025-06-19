import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { Types } from 'mongoose';
import stream from 'stream';
import { promisify } from 'util';
import { Request } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import Inventory from '../models/Inventory';
import { authenticate, authorize } from '../middlewares/auth';
import { wrapMiddleware } from '../utils/wrapMiddleware';
import catchAsync from '../utils/catchAsync';


const router = Router();
const upload = multer({ dest: 'uploads/' });
const finished = promisify(stream.finished);

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    // add other user properties if needed
  };
}
type CsvRow = {
  Category: string;
  'Category Description': string;
  'Product Name': string;
  'Product Description': string;
  'Product Price': string;
  'Available Units': string;
};

const auth = wrapMiddleware(authenticate);

router.post(
  '/csv',
  auth,
  authorize(['master']),
  upload.single('file'),
  catchAsync(async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ message: 'CSV file is required' });
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: userId missing' });
    const results: CsvRow[] = [];

    const readStream = fs.createReadStream(req.file.path).pipe(csv());
    readStream.on('data', (data) => results.push(data));
    await finished(readStream); // ✅ Wait for stream to finish

    try {
      for (const row of results) {
        const categoryName = row.Category?.trim();
        const productName = row['Product Name']?.trim();
        const price = parseFloat(row['Product Price']);
        const available = parseInt(row['Available Units']);

        if (!categoryName || !productName || isNaN(price) || isNaN(available)) {
          console.warn('⚠️ Skipping invalid row:', row);
          continue;
        }

        // Check or create category
        let category = await Category.findOne({ name: categoryName, createdBy: userId });
        if (!category) {
          category = new Category({
            name: categoryName,
            description: row['Category Description']?.trim() || '',
            products: [],
            createdBy: userId
          });
          await category.save();
        }

        // Check if product exists
        let product = await Product.findOne({ name: productName, createdBy: userId });
        if (!product) {
          // Create product without inventory ref yet
          product = new Product({
            name: productName,
            description: row['Product Description']?.trim() || '',
            price,
            stock: available,
            categories: [category._id],
            createdBy: userId,
          });
          await product.save();

          // Create inventory with product ID
         
          const inventory = new Inventory({
            productId: product._id,
            available,
            sold: 0,
          });
          await inventory.save();

          // Update product with inventory ref
          product.inventory = inventory._id as Types.ObjectId;
          await product.save();

          // Link product to category
          category.products.push(product._id as Types.ObjectId);
          await category.save();
        }
      }

      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(200).json({ message: 'CSV uploaded and processed successfully' });

    } catch (err) {
      console.error('❌ CSV processing error:', err);
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(500).json({ message: 'Failed to process CSV' });
    }
  })
);

export default router;
