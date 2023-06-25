// Pass in the variables you want to be displayed on the pug template as options: .render('file', {opts}).

import Tour from '../models/tourModel.js';

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

const getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour',
    });
};

export { getOverview, getTour };
