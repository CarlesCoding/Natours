import express from 'express';
import {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    // checkID,
    // checkBody,
} from '../controllers/tourController.js';

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(getAllTours).post(createTour); // checkBody: the middle ware that runs before createTour
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
