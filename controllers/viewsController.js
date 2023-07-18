import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import AppError from '../utils/appError.js';

const getOverview = async (req, res, next) => {
    // 1.) Get tour data from collection
    const tours = await Tour.find();

    // 2.) Build Template

    // 3.) Render that template using tour data from step 1.
    res.status(200).render('overview', {
        title: 'All Tours',
        tours,
    });
};

const getTour = async (req, res, next) => {
    // 1.) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    // 2.) Build template

    // 3.) Render the template using data from step
    // Pass in the variables you want to be displayed on the pug template as options: .render('file', {opts}).
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
};

const getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account',
    });
};

const signUpForm = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign up for an account',
    });
};

const getAccountPage = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
    });
};

const updateUserData = async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    });
};

// CAN ALSO DO THE FOLLOWING WITH VIRTUAL POPULATE
const getMyBookings = async (req, res, next) => {
    // 1.) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2.) Find tours with the returned ids
    const tourIDs = bookings.map((el) => el.tour); // Create a new array with tour IDs
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My Bookings',
        tours,
    });
};

export {
    getOverview,
    getTour,
    getLoginForm,
    getAccountPage,
    signUpForm,
    updateUserData,
    getMyBookings,
};
