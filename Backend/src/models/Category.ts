import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  products: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

CategorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', CategorySchema);