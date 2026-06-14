import User from '../models/User.js';
import UserPreference from '../models/UserPreference.js';
import bcrypt from 'bcryptjs';

export const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const preferences = await UserPreference.findByUserId(userId);
        res.status(200).json({
            success: true,  
            data: {
                user,
                preferences
            }
        });
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const user= await User.update(req.user.id, { name, email });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {user}
        });
    } catch (err) {
        next(err);
    }
};

export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreference.upsert(req.user.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: { preferences }
        });
    }
    catch (err) {   
        next(err);
    }
};

export const changePassword = async (req, res, next) => {
    try {        const { currentPassword, newPassword } = req.body;
    if(!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide current and new password' });
    }

        const user = await User.findByEmail(req.user.email);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if(!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        await User.updatePassword(req.user.id, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (err) {
        next(err);
    }
};


export const deleteAccount = async (req, res, next) => {
    try {
        await User.delete(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};