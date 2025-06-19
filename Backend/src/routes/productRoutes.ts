import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { wrapMiddleware } from '../utils/wrapMiddleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// ✅ Wrap async middleware
const auth = wrapMiddleware(authenticate);

// ✅ Use authorize as-is (already typed correctly)
const permitMaster = authorize(['master']);
const permitBoth = authorize(['master', 'admin']);

// ✅ Wrap controllers with catchAsync
router.get('/', auth, permitBoth, catchAsync(getProducts));
router.post('/', auth, permitMaster, catchAsync(createProduct));
router.put('/:id', auth, permitMaster, catchAsync(updateProduct));
router.delete('/:id', auth, permitMaster, catchAsync(deleteProduct));

export default router;
