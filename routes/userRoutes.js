import express from 'express';
import {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
} from '../controllers/userController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    protect,
    updatePassword,
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
router.patch(
    '/updateMyPassword',
    catchAsyncErrors(protect),
    catchAsyncErrors(updatePassword)
);

// Current User acct management
router.get('/me', catchAsyncErrors(protect), getMe, catchAsyncErrors(getUser));
router.patch(
    '/updateMe',
    catchAsyncErrors(protect),
    catchAsyncErrors(updateMe)
);
router.delete(
    '/deleteMe',
    catchAsyncErrors(protect),
    catchAsyncErrors(deleteMe)
);

// -------------------- User Routes -------------------- //
router.route('/').get(catchAsyncErrors(getAllUsers));
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
