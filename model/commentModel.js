const mongoose = require('mongoose');


const commentModel = new mongoose.Schema({
    comment: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    forUser: {
        type: mongoose.Schema.ObjectId,
        ref: "Users",
        required: [true, "Must Provide the Id of user for whom the comment is intended"]
    }
})

commentModel.pre(/^find/g, function(next) {
    this.find().populate({ path: 'user', select: "name _id photo" })

    next()
})

const Comments = mongoose.model("Comments", commentModel);

module.exports = Comments