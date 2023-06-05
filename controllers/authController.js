/* eslint-disable prefer-destructuring */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';

//* Visual representation of how the login process works with JWT. theory-lectures.pdf page: 91

const signtoken = (id) =>
    jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const signup = async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: Date.now(),
    });

    // jwt.sign(payload, secret, {Options})
    const token = signtoken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    // 1.) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2.) Check if user exist and if password is correct
    const user = await User.findOne({ email }).select('+password'); // add back the password field for the query

    if (!user || !user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3.) If Everything is ok, send token to client
    const token = signtoken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
};

const protect = async (req, res, next) => {
    // 1.) Getting the token and check if it exist
    let token;

    // Old way: req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                `You are not logged in! Please login to get access.`,
                401
            )
        );
    }

    // 2.) Validate the token (Makes sure that no one has altered the JWT payload)
    const verifiedUser = await promisify(jwt.verify)(
        token,
        process.env.TOKEN_SECRET
    );

    // 3.) Check if user still exist
    const currentUser = await User.findById(verifiedUser.id);
    if (!currentUser) {
        return next(
            new AppError(
                `The user belonging to this token no longer exist.`,
                401
            )
        );
    }

    // 4.) Check if user changed password after the JWT was issued
    if (currentUser.changedPasswordAfter(verifiedUser.iat)) {
        return next(
            new AppError(
                `User recently changed password! Please login again.`,
                401
            )
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
};

export { signup, login, protect };
