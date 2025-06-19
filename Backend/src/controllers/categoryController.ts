import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, productIds  } = req.body;
    const userId = req.user?._id;

    const existing = await Category.findOne({ name, createdBy: userId });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category({ name, description, products: productIds || [], createdBy: userId });
    await category.save();

    if (productIds && productIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { categories: category._id } }
      );
    }

    return res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;
    const filter = role === 'master' ? { createdBy: userId } : {};
    const categories = await Category.find(filter).populate('products', 'name');
    return res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this category' });
    }

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();

    return res.status(200).json({ message: 'Category updated', category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this category' });
    }
    // Remove category ref from products
    await Product.updateMany({ categories: id }, { $pull: { categories: id } });

    return res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};