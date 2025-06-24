import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout } from '../controllers/authController';
import catchAsync from '../utils/catchAsync';
import { validate } from '../middlewares/validate';

const router = Router();

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min length is 6'),
    body('role').isIn(['master', 'admin']).withMessage('Role must be master or admin'),
    validate
  ],
  catchAsync(register)
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  catchAsync(login)
);

router.post('/logout', catchAsync(logout));

export default router;
