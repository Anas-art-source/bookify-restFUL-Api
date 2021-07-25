const Users = require('../model/userModel');
const Books = require('../model/bookModel');
const Reviews = require('../model/reviewModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')

exports.addReview = catchAsync ( async (req, res, next) => {

    // CHECKING IF REVIEWS ARE FOR USER OR BOOK. USED MERGEPARAMS IN ROUTER
    let reviewObj;
    if (req.baseUrl.includes('user')) {
        reviewObj = {
            ...req.body,
            user: req.user.id,
            forUser: req.params.id
        }
    }

    if (req.baseUrl.includes('books')) {
        reviewObj = {
            ...req.body,
            user: req.user.id,
            forBook: req.params.id
        }
    }

    
    const doc = await Reviews.create(reviewObj);

    res.status(201).json({
        status: "successful",
        data: {
            doc
        }
    })
})

exports.updateReview = catchAsync( async (req, res, next) => {

    // SHOULD NOT BE EMPTY
    if (Object.keys(req.body).length === 0 ) return next(new AppError("Enter something to update", 400));

    // SETTING QUERY: IF USER REVIEW OR BOOK REVIEW IS UPDATED
    let query;
    if (req.baseUrl.includes('user')) {
        query = { forUser: req.params.id, _id: req.params.reviewId, user: req.user.id}
    }

    if (req.baseUrl.includes('book')) {
        query = { forBook: req.params.id, _id: req.params.reviewId, user: req.user.id}
       
    }

    // const doc = await Reviews.findOneAndUpdate( query, req.body, { runValidators: true});
    let doc = await Reviews.findOne(query);

    // REVIEW NOT FOUND
    if(!doc || doc.length === 0) return next(new AppError("No Review Found or you are not allowed to edit", 400))

    // UPDATING: MAKING SURE DOCUMENT MIDDLEWEAR FOR AVERAGERATING RUNS.
    doc.review = req.body.review || doc.review;
    doc.rating = req.body.rating || doc.rating;

    await doc.save({ validateBeforeSave: true})
    
    res.status(200).json({
        status: "successful",
        data: {
            doc
        }
    })
})

exports.deleteReview = catchAsync( async (req, res, next) => {
    
    // deleting review will have no effect on ratingAverage and ratingCount. This is because document middlewear (presave) middlewear is responsible for it.

    // SETTING UP QUERY BASED ON IF USER REVIEW OR BOOK REVIEW IS REQUESTED
    let query;
    if (req.baseUrl.includes('user')) {
        query = { forUser: req.params.id, _id: req.params.reviewId, user: req.user.id}
    }

    if (req.baseUrl.includes('book')) {
        query = { forBook: req.params.id, _id: req.params.reviewId, user: req.user.id}
    }

    // DELETING REVIEW
    const doc = await Reviews.findOneAndDelete(query);

    if(!doc || doc.length === 0) return next(new AppError("No Review Found or you are not allowed to edit", 400))

    res.status(200).json({
        status: "SUCCESSFULLY"
    })
})