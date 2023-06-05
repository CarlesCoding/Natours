import express from 'express';
import {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// Auth Routes
// router.post('/route', catchAsyncErrors(MIDDLEWARE),  catchAsyncErrors(HANDLER));
router.post('/signup', catchAsyncErrors(signup));
router.post('/login', catchAsyncErrors(login));

// User Routes
router.route('/').get(catchAsyncErrors(getAllUsers)).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
