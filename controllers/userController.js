import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
// import APIFeatures from '../utils/apiFeatures.js';
// import AppError from '../utils/appError.js';

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

// USERS
const getAllUsers = async (req, res, next) => {
    const users = await User.find();

    // ----- Send Response -----
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });

    next();
};

const updateMe = async (req, res, next) => {
    // 1.) Create error if user post password data. (That will be handled in authController)
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                `This route is not for password updates. Please use /updatePassword.`,
                400
            )
        );
    }

    // 2.) Filter out unwanted field names that are not allowed to be updated. Prevents users from changing their role, token, ect.
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3.) Update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser,
        },
    });
};

const deleteMe = async (req, res, next) => {
    // Not actually deleting user. Only setting them as 'inactive' in the database
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(201).json({
        status: 'success',
        data: null,
    });
};

const createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: '❗  This route is not yet defined!',
    });
};

const getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: '❗  This route is not yet defined!',
    });
};

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: '❗ This route is not yet defined!',
    });
};

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: '❗  This route is not yet defined!',
    });
};

export {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
};
