import { Router } from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middlewares/auth';
import { wrapMiddleware } from '../utils/wrapMiddleware';
import catchAsync from '../utils/catchAsync';

const router = Router();

// Wrap middlewares
const auth = wrapMiddleware(authenticate); 
const permitMaster = authorize(['master']); 
const permitBoth = authorize(['master', 'admin']);

// Wrap controllers
router.get('/', auth, permitBoth, catchAsync(getCategories));
router.post('/', auth, permitMaster, catchAsync(createCategory));
router.put('/:id', auth, permitMaster, catchAsync(updateCategory));
router.delete('/:id', auth, permitMaster, catchAsync(deleteCategory));

export default router;
