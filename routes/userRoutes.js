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
    restrictRolesTo,
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

// Protect all routes in this file, after this point
router.use(catchAsyncErrors(protect));

router.patch(
    '/updateMyPassword',

    catchAsyncErrors(updatePassword)
);

// Current User acct management
router.get('/me', getMe, catchAsyncErrors(getUser));
router.patch(
    '/updateMe',

    catchAsyncErrors(updateMe)
);
router.delete(
    '/deleteMe',

    catchAsyncErrors(deleteMe)
);

// -------------------- User Routes -------------------- //
// Restrict Roles for all routes in this file, after this point
router.use(restrictRolesTo('admin'));

router.route('/').get(catchAsyncErrors(getAllUsers));
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
