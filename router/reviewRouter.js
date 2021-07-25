const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController')

const reviewRouter = express.Router({ mergeParams: true});

reviewRouter
.use(authController.protect, authController.restrictTo('user', "admin") )
.route('/')
.post(reviewController.addReview)

reviewRouter
.use(authController.protect, authController.restrictTo('user', "admin") )
.route('/:reviewId')
.patch(reviewController.updateReview).delete(reviewController.deleteReview);

module.exports = reviewRouter;