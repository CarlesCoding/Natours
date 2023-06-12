import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';

// ----- TOURS -----
const aliasTopTours = (req, res, next) => {
    // prefilling the query string for top 5 tours.
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
    next();
};

const getAllTours = async (req, res, next) => {
    // Pass the model & query string into the APIFeatures class. To do any query modifications before being called
    const features = new APIFeatures(Tour, req.query) // lecture says use Tour.find() but I think thats wrong. So i use the model (Tour)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;

    // ----- Send Response -----
    // "status" & "results" are Optional. But, nice to have
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours, // tours: tours
        },
    });
};

const getTour = async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour, // tour: tour
        },
    });
};

const createTour = async (req, res, next) => {
    const newTour = await Tour.create(req.body); // OR: const newTour = new Tour({}); newTour.save();

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
};

const updateTour = async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // new updated object will be returned
        runValidators: true,
    });

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'Success',
        data: {
            tour,
        },
    });
};

const deleteTour = async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    // Send no data back when deleting something
    res.status(204).json({
        status: 'Success',
        data: null,
    });
};

const getTourStats = async (req, res, next) => {
    // https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
    const stats = await Tour.aggregate([
        // Define the stages. Will go through each one, one at a time. Step by step
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' }, // _id: what we want to use to group the documents
                numTours: { $sum: 1 }, // add 1 for each document that goes through the pipeline
                numRating: { $sum: '$ratingsQuantity' },
                averageRating: { $avg: '$ratingsAverage' },
                averagePrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { averagePrice: 1 },
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY' },
        //     },
        // },
    ]);

    res.status(200).json({
        status: 'Success',
        data: stats,
    });
};

const getMonthlyPlan = async (req, res, next) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
        {
            // loop through all start dates in array
            $unwind: '$startDates',
        },
        {
            // get all start dates between the time specified
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            // where the magic happens
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            // Add month field
            $addFields: {
                month: '$_id',
            },
        },
        {
            // remove the id field
            $project: {
                _id: 0,
            },
        },
        {
            // sort numTourStarts in descending order
            $sort: { numTourStarts: -1 },
        },
        {
            // limit amount of results returned
            $limit: 12,
        },
    ]);

    res.status(200).json({
        status: 'Success',
        data: plan,
    });
};

export {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
};
