import express from 'express';
import {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto,
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
    logout,
} from '../controllers/authController.js';

// -------------------- CREATE ROUTER -------------------- //
const router = express.Router();

// -------------------- Auth Routes -------------------- //
// TEMPLATE: router.HTTP-METHOD('/route', catchAsyncErrors(MIDDLEWARE),  catchAsyncErrors(HANDLER));

// Register & Login Routes
router.post('/signup', catchAsyncErrors(signup));
router.post('/login', catchAsyncErrors(login));
router.get('/logout', logout);

// Password Reset routes
router.post('/forgotPassword', catchAsyncErrors(forgotPassword));
router.patch('/resetPassword/:token', catchAsyncErrors(resetPassword));

// Protect all routes in this file, after this point
router.use(catchAsyncErrors(protect));

// Current User acct management
router.patch('/updateMyPassword', catchAsyncErrors(updatePassword));
router.get('/me', getMe, catchAsyncErrors(getUser));
router.delete('/deleteMe', catchAsyncErrors(deleteMe));
router.patch(
    '/updateMe',
    uploadUserPhoto,
    catchAsyncErrors(resizeUserPhoto),
    catchAsyncErrors(updateMe)
);

// -------------------- User Routes -------------------- //
// Restrict Roles for all routes in this file, after this point
router.use(restrictRolesTo('admin'));

router.route('/').get(catchAsyncErrors(getAllUsers));
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
