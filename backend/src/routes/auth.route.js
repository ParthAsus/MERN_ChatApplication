import expres from 'express';
import { addContactInUser, checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = expres.Router();

router.post('/signup', signup);


router.post('/login', login);

router.post('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.post('/add-contact', protectRoute, addContactInUser);


router.get('/check', protectRoute, checkAuth);


export default router;