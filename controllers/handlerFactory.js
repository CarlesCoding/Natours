import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

/**
 * Function that spits out another function.
 *
 * THESE FUNCTIONS will work on all documents. Just need to pass in the model.
 *
 * This makes it so we only have to worry about the functions in one main place.
 */

const deleteOne = (Model) => async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }
    console.log('here');
    // Send no data back when deleting something
    res.status(204).json({
        status: 'Success',
        data: null,
    });
    console.log('hereAGAIN');
};

const updateOne = (Model) => async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // new updated object will be returned
        runValidators: true,
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'Success',
        data: {
            doc,
        },
    });
};

const createOne = (Model) => async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
};

const getOne = (Model, populateOpts) => async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOpts) query = query.populate(populateOpts);

    // when the query is ready THEN, we await it.
    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
};

const getAll = (Model) => async (req, res, next) => {
    // To allow for nested GET reviews on tour. (hack to make this work for getAllReviews())
    // Get all reviews of a specified tour. If no tourId supplied, then get ALL reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Pass the model & query string into the APIFeatures class. To do any query modifications before being called
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query; // add ".explain()" to see explanation of query process in command line.

    // ----- Send Response -----
    // "status" & "results" are Optional. But, nice to have
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc,
        },
    });
};

export { deleteOne, updateOne, createOne, getOne, getAll };
