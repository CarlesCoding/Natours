import multer from 'multer';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

// -------------------- MULTER (img upload) -------------------- //

// How you want to save the file. cb: callBack
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },
    filename: (req, file, cb) => {
        const extensionType = file.mimetype.split('/')[1]; // image/jpg
        // Save file as: user-userID-Date.jpg
        cb(null, `user-${req.user.id}-${Date.now()}.${extensionType}`);
    },
});

// Filter to make sure ONLY images are uploaded.
const multerFilter = (req, file, cb) => {
    file.mimetype.startsWith('image') // image/jpg
        ? cb(null, true)
        : cb(
              new AppError('Not an image! Please upload only images.', 400),
              false
          );
};

// Multer Image Upload Object
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

// Middleware
const uploadUserPhoto = upload.single('photo');

// -------------------- CONTROLLERS -------------------- //
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
    const filteredBody = filterObj(req.body, 'name', 'email'); // Filter everything BUT name & email
    if (req.file) filteredBody.photo = req.file.filename; // Adding photo object to updated user data. *Save file as file name

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
    uploadUserPhoto,
};
