import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const register = async (req: Request, res: Response) => {
  const { username, email, password, role } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    if (await User.findOne({ username })) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    // Only allow 'master' role if created by a master user: for simplicity we allow once here (can be improved)
    const user = new User({ username, email, password, role });
    await user.save();
    return res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '8h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.yash-admin-0823842.fwh.is',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });
    return res.status(200).json({role: user.role, username: user.username });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',        
    sameSite: 'none',
    domain: '.yash-admin-0823842.fwh.is',
    path: '/',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};