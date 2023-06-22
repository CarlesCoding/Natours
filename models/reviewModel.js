import mongoose from 'mongoose';
import Tour from './tourModel.js';

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!'],
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tour: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'Tour',
                required: [true, 'Review must belong to a tour.'],
            },
        ],
        user: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, 'Review must have an author.'],
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// User can only review a tour 1 time
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// -------------------- QUERY MIDDLEWARE ('this' is a query object here) -------------------- //

// Populate the user & location fields when querying, not just reference ObjectIds (ADDs another query for each .populate() call. Can get pricy/slow in LARGE applications)
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });

    next();
});

// -------------------- Static Methods -------------------- //
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    // 'this' is the Model. aggregate has to be called ON the model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findById(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findById(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

// ---------- MORE QUERY MIDDLEWARE ---------- //
// Calculate AFTER its saved to the DB
reviewSchema.post('save', function () {
    // 'this' points to current review
    // 'this.constructor' gives us access to the current Model ('Review')
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    // 'this'is current query
    this.r = await this.findOne(); // save variable 'r', to be retrieved in the "post" function below
    console.log('r', this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
    // Get the review from the "pre" method above. THEN, use it here to calculate the rating with the updated review
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;

/**
 * Virtuals are not stored in the db, but instead are calculated from other fields
 * 
 * To Display the virtual properties on these types of outputs, add:
 *  {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
    
*/
