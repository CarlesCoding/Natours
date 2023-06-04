import express from 'express';
import {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    // checkID,
    // checkBody,
} from '../controllers/tourController.js';
import catchAsyncErrors from '../utils/catchAsyncErrors.js';

const router = express.Router();

// Can create a 'checkID' function to check id is valid, before hitting the route.
// router.param('id', checkID);

/* 
 We used a global error handler instead of having try/catch in every function.
 to use the error handler, just wrap the function with the  "catchAsyncErrors()" function
*/

router.route('/tour-stats').get(catchAsyncErrors(getTourStats));
router.route('/monthly-plan/:year').get(catchAsyncErrors(getMonthlyPlan));
router.route('/top-5-cheap').get(aliasTopTours, catchAsyncErrors(getAllTours)); // use a middleware(aliasTopTours) to change the request before sending it

router
    .route('/')
    .get(catchAsyncErrors(getAllTours))
    .post(catchAsyncErrors(createTour));
router
    .route('/:id')
    .get(catchAsyncErrors(getTour))
    .patch(catchAsyncErrors(updateTour))
    .delete(catchAsyncErrors(deleteTour));

export default router;
