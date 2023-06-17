import Review from '../models/reviewModel.js';
import {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAll,
} from './handlerFactory.js';

const setTourUserIds = (req, res, next) => {
    // ALlow nested routes (makes it optional to supply them in the req)
    // If no tour in the body, set the tour to the one supplied in the url
    if (!req.body.tour) req.body.tour = req.params.tourId;

    // If no user supplied in the body, get it from the user object that was added when going through the "protect" middleware.
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

const getAllReviews = getAll(Review);

const getReview = getOne(Review);

const createReview = createOne(Review);

const deleteReview = deleteOne(Review);

const updateReview = updateOne(Review);

export {
    getAllReviews,
    createReview,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview,
};
