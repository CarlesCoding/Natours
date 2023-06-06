import express from 'express';
import {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
} from '../controllers/userController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// -------------------- Auth Routes -------------------- //
// TEMPLATE: router.HTTP-METHOD('/route', catchAsyncErrors(MIDDLEWARE),  catchAsyncErrors(HANDLER));

// Register & Login Routes
router.post('/signup', catchAsyncErrors(signup));
router.post('/login', catchAsyncErrors(login));

// Password Reset routes
router.post('/forgotPassword', catchAsyncErrors(forgotPassword));
router.patch('/resetPassword/:token', catchAsyncErrors(resetPassword));

// -------------------- User Routes -------------------- //
router.route('/').get(catchAsyncErrors(getAllUsers)).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
