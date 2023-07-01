// Pass in the variables you want to be displayed on the pug template as options: .render('file', {opts}).

import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';

const getOverview = async (req, res, next) => {
    // 1.) Get tour data from collection
    const tours = await Tour.find();

    // 2.) Build Template

    // 3.) Render that template using tour data from step 1.
    res.status(200).render('overview', {
        title: ' All Tours',
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
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour,
    });
};

// const getTour = getOne(Tour, { path: 'reviews' });

export { getOverview, getTour };
