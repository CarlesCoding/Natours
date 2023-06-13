import mongoose from 'mongoose';
import slugify from 'slugify';
// import User from './userModel.js';

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxLength: [
                40,
                'A Tour must have less or equal then 40 characters',
            ],
            minLength: [
                10,
                'A Tour must have more or equal then 10 characters',
            ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A Tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A Tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A Tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            // CUSTOM VALIDATOR
            validate: {
                // value: priceDiscount
                validator(value) {
                    // this only points to current doc on NEW document creation
                    return value < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below the regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A Tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A Tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false, // hide when getTour() is called
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        // Embedded Documents: (startLocation & locations)
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'], // It can only be Point
            },
            coordinates: [Number], // We expect a array of numbers
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        // Referencing:
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
// -------------------- Virtuals -------------------- //

// Can NOT use virtual properties in query
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual POPULATE (allows us to keep all child docs on parent docs, WITHOUT persisting to the database)
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});

// -------------------- DOCUMENT MIDDLEWARE -------------------- //
// runs ONLY before .save() and .create(). Has access to 'next()'

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }); // lowercase
    next();
});

// (Embedded data) On save, loop through user IDs & add user documents to the model
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => User.findById(id)); // returns an array of promises
//     console.log('guidesPromises', guidesPromises);
//     this.guides = await Promise.all(guidesPromises); // run with Promise.all()
//     next();
// });

// -------------------- QUERY MIDDLEWARE ('this' is a query object here) -------------------- //

// regex: all strings that start with 'find'
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

// Populate whole document, not just reference ObjectIds (.populate() does ADD another query. Can get pricy in LARGE applications)
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides', // what field you want populated
        select: '-__v -passwordChangedAt', // only get what you want
    });

    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    console.log(docs);
    next();
});

// -------------------- AGGREGATION MIDDLEWARE -------------------- //
tourSchema.pre('aggregate', function (next) {
    // 'this' is a aggregation object here.
    // add '$match' to the beginning of the pipeline array
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // filter out the secretTour
    console.log(this.pipeline());
    next();
});

// mongoose.model(nameOfModel, Schema)
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
