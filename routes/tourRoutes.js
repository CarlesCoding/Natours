import express from 'express';
import {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    // checkID,
    // checkBody,
} from '../controllers/tourController.js';

const router = express.Router();

// Can create a 'checkID' function to check id is valid, before hitting the route.
// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours); // use a middleware(aliasTopTours) to change the request before sending it
router.route('/').get(getAllTours).post(createTour); // checkBody: the middle ware that runs before createTour
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
