import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: mongoose.Types.ObjectId[];
  inventory: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);