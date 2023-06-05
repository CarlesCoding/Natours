import User from '../models/userModel.js';
// import APIFeatures from '../utils/apiFeatures.js';
// import AppError from '../utils/appError.js';

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

export { getAllUsers, createUser, getUser, updateUser, deleteUser };
