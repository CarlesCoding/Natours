import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
// import AppError from '../utils/appError.js';
// import {} from './handlerFactory.js';

// The package needs to be configured with your account's secret key.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getCheckoutSession = async (req, res, next) => {
    // 1.) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourID);

    // 2.) Create checkout session
    const session = await stripe.checkout.sessions.create({
        // Session info
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        // Product being purchased info
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`,
                        ],
                    },
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
    });

    // 3.) Send session as response
    res.status(200).json({
        status: 'success',
        session,
    });
};

export { getCheckoutSession };
