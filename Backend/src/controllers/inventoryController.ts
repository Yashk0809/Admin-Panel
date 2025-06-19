import { Request, Response } from 'express';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import { Types } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

export const getInventories = async (req: AuthRequest, res: Response) => {
  try {
    const { _id, role } = req.user!;
    const filter = role === 'master' ? { createdBy: _id } : {};

    const inventories = await Inventory.find(filter).populate('productId', 'name price');
    return res.status(200).json(inventories);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { available, sold } = req.body;
    const userId = req.user?._id;

    const inventory = await Inventory.findById(id).populate({
      path: 'productId',
      select: 'createdBy',
    });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

    const product = await Product.findById(inventory.productId);
    if (
      !req.user ||
      typeof inventory.productId !== 'object' ||
      !('createdBy' in inventory.productId) ||
      (inventory.productId as any).createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized: Cannot update another user's product inventory" });
    }
    
    if (available !== undefined) inventory.available = available;
    if (sold !== undefined) inventory.sold = sold;

    await inventory.save();
    return res.status(200).json({ message: 'Inventory updated', inventory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const createInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, available, sold } = req.body;
    const userId = req.user?._id;

    if (!productId || available == null || sold == null) {
      return res.status(400).json({ message: 'productId, available, and sold are required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.createdBy?.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: Cannot create inventory for another user\'s product' });
    }

    // Check if inventory already exists for product
    const existing = await Inventory.findOne({ productId });
    if (existing) {
      return res.status(400).json({ message: 'Inventory for this product already exists' });
    }

    const inventory = new Inventory({ productId, available, sold });
    await inventory.save();

    // Link inventory to product if needed
    product.inventory = inventory._id as Types.ObjectId;
    await product.save();

    return res.status(201).json({ message: 'Inventory created', inventory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server Error' });
  }
};