const Comments = require('../model/commentModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError');
const apiFeature = require("../utils/apiFeature");


// THIS IS NOT USED IN THE API. TO BE USED IN FUTURE IF NEEDED
exports.getAllComments = catchAsync (async (req, res, next) => {

    let feature = new apiFeature(Comments.find(), req.query).filter().sort().paginate().field()
    const doc = await feature.query();

    if (!doc) next(new AppError("No Doc Found", 404));

    res.status(200).json({
        status: "SUCCESSFUL",
        body: {
            doc
        }
    })
}) 


exports.deleteComment = catchAsync( async (req, res, next) => {

    // GETTING COMMEND BY FORUSERID USERID AND COMMENTID
    const doc = await Comments.findOneAndDelete({forUser: req.params.id, _id: req.params.commentId, user: req.user.id})
    
    if(!doc || doc.length === 0) return next(new AppError("No Comment Found or You are not allowed to access this path"));

    res.status(201).json({
        status: "SUCCESSFUL",
        body: {
            doc
        }
    })
});


exports.addComment = catchAsync( async (req, res, next) => {

    // SHOULD NOT BE EMPTY
    if (Object.keys(req.body).length === 0) return next(new AppError("Must Enter Comment", 400))

    // SETTING USERID. PROTECT IN AUTHCONTROLLER PUT CURRENT USER IN REQ.USER
    let commentObj = {
        ...req.body,
        user: req.user.id,
        forUser : req.params.id
    }
    const doc = await Comments.create(commentObj);

    res.status(201).json({
        status: "SUCCESSFUL",
        body: {
            doc
        }
    })
})

exports.updateComment = catchAsync( async (req, res, next) => {

    // SHOULD NOT BE EMPTY
    if (Object.keys(req.body).length === 0 ) return next(new AppError("Enter something to update", 400));

    // GETTING COMMENT BASED ON USERID FORUSERID AND COMMENTID
    const query = {_id: req.params.commentId,  forUser: req.params.id, user: req.user.id}
    const doc = await Comments.findOneAndUpdate(query, req.body);
    
    // IF EMPLY OR NULL
    if(!doc || doc.length === 0) return next(new AppError("No Comment Found or You are not allowed to access this path"));

    res.status(200).json({
        status: "successful",
        data: {
            doc
        }
    })
})

exports.getCommentById = catchAsync( async (req, res, next) => {

    // GETTING COMMENT BY COMMENTID AND FORUSERID
    // NOT PRACTICAL FOR NOW
    const doc = await Comments.findOne({forUser: req.params.id, _id: req.params.commentId});

    // NO COMMENT FOUND
    if(!doc || doc.length === 0) return next(new AppError("No Comment Found or You are not allowed to access this path"));

    res.status(200).json({
        status: "successful",
        data: {
            doc
        }
    })
})