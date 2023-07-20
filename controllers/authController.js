/* eslint-disable prefer-destructuring */
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../models/userModel.js';
import AppError from '../utils/appError.js';
import Email from '../utils/email.js';

//* Visual representation of how the login process works with JWT. theory-lectures.pdf page: 91

const signToken = (id) =>
    // jwt.sign(payload, secret, {Options})
    jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const createAndSentToken = (user, statusCode, res, req) => {
    const token = signToken(user._id);
    const cookieOpts = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // (receive  cookie => store cookie => send with every req) helps prevent cross-site-scripting attacks
        // If using heroku add the below code. And, Delete the if statement below.
        // secure: req.secure || req.headers('x-forwarded-proto') === 'https',
    };

    // In production we will be using HTTPS. Local = HTTP.
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;

    // send the jwt as a cookie
    res.cookie('jwt', token, cookieOpts);

    // Remove password from res output
    user.password = undefined;
    user.passwordChangedAt = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

const signup = async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: Date.now(),
        role: req.body.role,
    });

    // const url = `http://localhost:3000/account`;
    const url = `${req.protocol}://${req.get('host')}/account`;
    await new Email(newUser, url).sendWelcome();

    createAndSentToken(newUser, 201, res);
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password'); // add back the password field for the query

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, send token to client
    createAndSentToken(user, 200, res);
};

// Only for rendered pages, there will be NO errors!
const isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1.) Validate the token (Makes sure that no one has altered the JWT payload)
            const verifiedUser = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.TOKEN_SECRET
            );

            // 2.) Check if user still exist
            const currentUser = await User.findById(verifiedUser.id);
            if (!currentUser) {
                return next();
            }

            // 3.) Check if user changed password after the JWT was issued
            if (currentUser.changedPasswordAfter(verifiedUser.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser; // All pug templates have access to res.locals. Add data here to be made accessible
            return next();
        } catch (error) {
            // After clicking logout, the isLoggedIn() will throw an error because the jwt will be invalid,
            // instead of sending the error to global handler, just skip this check with next()
            return next();
        }
    }

    next();
};

// To logout: hit the logout endpoint. Send a new token with dummy text.
// This overrides the existing cookie, rendering the new one invalid, affectively logging out the user.
const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: 'success',
    });
};

// Middleware to protect routes. (Must have valid token to visit route)
const protect = async (req, res, next) => {
    // 1.) Getting the token and check if it exist
    let token;

    // Old way: req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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
    req.user = currentUser; // add the current user to the request. So, it can be used by other middleware AFTER this has been ran.
    res.locals.user = currentUser;
    next();
};

// Creates a closure. Allows multiple values to be passed to the function. THEN the Second function will be the actual middleware
const restrictRolesTo =
    (...roles) =>
    (req, res, next) => {
        // roles is an array ['admin', 'lead-guide']. roles='user' would fail then
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `You do not have permission to perform this action.`,
                    403
                )
            );
        }

        next();
    };

const forgotPassword = async (req, res, next) => {
    // 1.) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError(`There is no user with that email address.`, 404)
        );
    }

    // 2.) Generate the reset token
    const resetToken = user.createPasswordResetToken();
    // validateBeforeSave: skips running the validation again (it would fail since not all required info is provided here, just the resetToken)
    await user.save({ validateBeforeSave: false });

    // (Try catch here, because we need to change back (invalidate) the tokens if their is an error.)
    try {
        // 3.) Send it to users email
        const resetURL = `${req.protocol}://${req.get(
            'host'
        )}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();

        // 4.) Send Res to client
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                `There was an error sending the email. Try again later!`,
                500
            )
        );
    }
};

// forgot password will send a message containing a url to resetPassword route with token
const resetPassword = async (req, res, next) => {
    // 1.) Get user based on the token
    // Grab the token that was supplied as a param in the url (router.patch('/resetPassword/:token', catchAsyncErrors(resetPassword));)
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 2.) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError(`Token is invalid or has expired`, 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3.) Update passwordChangedAt property for the user
    // 4.) Log the user in, send jwt
    createAndSentToken(user, 200, res);
};

// Update password (only for logged in users)
const updatePassword = async (req, res, next) => {
    // 1.) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2.) Check if POSTed current password is correct
    if (!(await user?.correctPassword(req.body.passwordCurrent, user.password)))
        return next(new AppError(`Incorrect password`, 401));

    // User.findByIdAndUpdate() will NOT work as intended! So, set them like below:
    // 3.) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4.)  Log user in, send JWT
    createAndSentToken(user, 200, res);
};

export {
    signup,
    login,
    protect,
    restrictRolesTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn,
    logout,
};
