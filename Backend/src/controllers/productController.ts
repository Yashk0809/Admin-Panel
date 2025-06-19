import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import Inventory from '../models/Inventory';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    // add other user properties if needed
  };
}
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, categoryIds, available, sold } = req.body;
    const userId = req.user?._id;
    // Create Inventory first (one-to-one)
    const product = new Product({
      name,
      description,
      price,
      stock,
      categories: categoryIds,
      createdBy: userId,
    });
    await product.save();

    // 2. Create inventory and attach productId
    const inventory = new Inventory({
      productId: product._id,
      available,
      sold,
    });
    await inventory.save();

    // 3. Update product with inventory reference
    product.inventory = inventory._id as Types.ObjectId;
    await product.save();

    // 4. Update categories to include this product
    if (categoryIds && categoryIds.length > 0) {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: product._id } }
      );
    }
    

    return res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role;
    const filter = role === 'master' ? { createdBy: userId } : {};
    const products = await Product.find(filter) // ✅ only their own
      .populate('categories', 'name description')
      .populate('inventory');

    return res.status(200).json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { name, description, price, stock, categoryIds, available, sold } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this product' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (categoryIds) product.categories = categoryIds;

    await product.save();

    // Update categories product references
    if (categoryIds) {
      // Remove product from all categories that no longer include it
      await Category.updateMany(
        { products: product._id, _id: { $nin: categoryIds } },
        { $pull: { products: product._id } }
      );
      // Add product in new categories
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        { $addToSet: { products: product._id } }
      );
    }

    // Update Inventory
    const inventory = await Inventory.findOne({ productId: product._id });
    if (inventory) {
      if (available !== undefined) inventory.available = available;
      if (sold !== undefined) inventory.sold = sold;
      await inventory.save();
    }

    return res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this product' });
    }
    // Remove product from categories
    await Category.updateMany(
      { products: product._id },
      { $pull: { products: product._id } }
    );

    // Remove inventory
    await Inventory.findOneAndDelete({ productId: product._id });

    return res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};