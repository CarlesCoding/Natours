import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!'],
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
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
