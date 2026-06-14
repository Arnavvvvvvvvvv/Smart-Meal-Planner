import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);       // All routes below this line require authentication

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateProfile);
router.put('/preferences', userController.updatePreferences);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);

export default router;