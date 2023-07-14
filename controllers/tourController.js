import multer from 'multer';
import sharp from 'sharp'; // For img resizing
import Tour from '../models/tourModel.js';
import AppError from '../utils/appError.js';
import {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAll,
} from './handlerFactory.js';

// -------------------- MULTER: TOUR IMGS (img upload ) -------------------- //
const multerStorage = multer.memoryStorage();

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

// -------------------- Multer Middleware -------------------- //
// upload.single('images'); // If there is only 1 img
// upload.array('images', 5); // If there is multiple images with same name, max 5.
// If theres a mix of imgs, use fields.
const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

const resizeTourImages = async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();

    // 1.) COVER IMAGE
    // Add the cover image to the req body
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    // Save to memory NOT disk.
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2.) IMAGES
    // Create new array that holds all the images
    req.body.images = [];

    // Async/await will NOT work in the loop. Use Promise.all() to await for the whole process to complete before calling next().
    // .map() allows to save an array of promises. The array allows to use promise.all()
    await Promise.all(
        // Loop through images array, sizing all and pushing to the newly created array
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                i + 1
            }.jpeg`;

            // Resize the image
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            // Add the images to the req body
            req.body.images.push(filename);
        })
    );

    next();
};

// -------------------- TOURS -------------------- //
const getAllTours = getAll(Tour);

const getTour = getOne(Tour, { path: 'reviews' }); // "{ path: 'reviews' }" is the field we want populated

const createTour = createOne(Tour);

const updateTour = updateOne(Tour);

const deleteTour = deleteOne(Tour);

const aliasTopTours = (req, res, next) => {
    // prefilling the query string for top 5 tours.
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
    next();
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

// '/tours-within/:distance/center/:latlng/unit/:unit',
const getToursWithin = async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Miles: Distance / Earth radius in miles. || Distance / Earth radius in Kilometers.
    // Radiance
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6368.1;

    if (!lat || !lng) {
        next(
            new AppError(
                `Please provide latitude and longitude in the format: lat,lng,`,
                400
            )
        );
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
};

const getDistances = async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // Convert units miles:Kilometers
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                `Please provide latitude and longitude in the format: lat,lng,`,
                400
            )
        );
    }

    // $geoNear: ALWAYS needs to be the first stage of the pipeline
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            // Show only the data we want
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
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
    getToursWithin,
    getDistances,
    uploadTourImages,
    resizeTourImages,
};
