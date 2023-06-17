import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
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

// Middleware to add user id to params. For getUser() to use.
const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// USERS
const getAllUsers = getAll(User);

const getUser = getOne(User);

const updateUser = updateOne(User); // DO NOT UPDATE PASSWORDS WITH THIS!

const deleteUser = deleteOne(User);

export {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
};
