import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15d' });
}

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if(!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide email, password and name' });
    }

    const existingUser = await User.findByEmail(email);
    if(existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password, name });

    await UserPreference.upsert( user.id, {
        dietary_restrictions: [],
        allergies:[],
        preferred_cuisines :[],
        default_servings: 4,
        measurement_unit: 'metric'
    });

    const token = generateToken(user);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data:{
            user: {
                id: user.id,
                email: user.email,
                name: user.name 
            },
            token
        }
    });
  } catch (err) {
    next(err);
  }
};  

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findByEmail(email);
    if(!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.status(201).json({
        success: true,
        message: 'Log in successful',
        data:{
            user: {
                id: user.id,
                email: user.email,
                name: user.name 
            },
            token
        }
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if(!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
        success: true,
        data: {user}
    });
    } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findByEmail(email);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    next(error);
  }
};
