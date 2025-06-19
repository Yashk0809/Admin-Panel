import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  available: number;
  sold: number;
}

const InventorySchema: Schema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    available: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>('Inventory', InventorySchema);