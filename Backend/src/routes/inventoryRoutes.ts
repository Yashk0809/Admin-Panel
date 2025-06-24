import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getInventories, updateInventory, createInventory } from '../controllers/inventoryController';
import { wrapMiddleware } from '../utils/wrapMiddleware';
import catchAsync from '../utils/catchAsync';


const router = Router();

// wrap async middleware
const auth = wrapMiddleware(authenticate);

// do NOT wrap authorize (it's sync and typed as RequestHandler)
router.get('/', auth, authorize(['master', 'admin']), catchAsync(getInventories));
router.put('/:id', auth, authorize(['master']), catchAsync(updateInventory));
router.post('/', auth, authorize(['master']), catchAsync(createInventory)); // ✅ New create route

export default router;
