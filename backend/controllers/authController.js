import dotenv from 'dotenv';
import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15d' });
};

const buildAuthResponse = (res, user, token, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please provide email, password and name' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email: normalizedEmail, password, name });

    await UserPreference.upsert(user.id, {
      dietary_restrictions: [],
      allergies: [],
      preferred_cuisines: [],
      default_servings: 4,
      measurement_unit: 'metric',
    });

    const token = generateToken(user);
    return buildAuthResponse(res, user, token, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ message: 'Please use Google sign-in for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return buildAuthResponse(res, user, token, 'Log in successful');
  } catch (err) {
    next(err);
  }
};

// Google OAuth flow: verify the ID token, then issue the same app JWT used by email/password auth.
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: 'Google OAuth is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(400).json({ message: 'Google account email could not be verified' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const googleUser = {
      googleId: payload.sub,
      name: payload.name || payload.email,
      email: normalizedEmail,
      profilePicture: payload.picture || null,
    };

    let user = await User.findByEmail(normalizedEmail);

    if (user) {
      if (!user.google_id || !user.profile_picture) {
        user = await User.linkGoogleAccount(user.id, {
          googleId: googleUser.googleId,
          profilePicture: googleUser.profilePicture,
        });
      }
    } else {
      user = await User.create({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        profilePicture: googleUser.profilePicture,
      });

      await UserPreference.upsert(user.id, {
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric',
      });
    }

    const token = generateToken(user);
    return buildAuthResponse(res, user, token, 'Google sign-in successful');
  } catch (err) {
    console.error('Google sign-in error:', err);
    return res.status(401).json({ message: 'Google authentication failed' });
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: { user },
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
        message: 'Please provide email',
      });
    }

    const user = await User.findByEmail(email);

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
};
