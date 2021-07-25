const mongoose = require('mongoose');
const Users = require('../model/userModel');
const Books = require('../model/bookModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String
    },
    rating: {
        type: Number,
        required: [true, "Rating Is Required"],
        min: 1,
        max: 5
        },
    for : {
        type: String,
        enum: ['book', 'user']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    forBook: {
        type: mongoose.Schema.ObjectId,
        ref: "Books"
    },
    forUser: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

// QUERY MIDDLEWEAR FOR POPULATING USER
reviewSchema.pre(/^find/g, function(next) {
    this.find().populate({path: 'user', select: "photo name _id"});
    next()
})

// DOCUMENT MIDDLEWEAR: PRESAVE  AGGREAGE MIDDLEWEAR FOR CALCULATING AVERAGE RATING
reviewSchema.pre('save', async function(next) {
    let Model; 
    if (this.forBook) {
        Model = Books;

        const [stats ]= await this.constructor.aggregate([
            {
                $match: {  forBook : this.forBook }
            },
            {
                $group: {
                    _id: { forBook: this.forBook },
                    avgRating: { $avg: "$rating"},
                    ratingCount: { $sum: 1 }
                }
            }
        ])
        const updateObj = {
            ratingCount: stats?.ratingCount || 1,
            averageRating: stats?.avgRating || this.rating
        }
        const doc = await Books.findByIdAndUpdate(this.forBook, updateObj);
        
    }

    if (this.forUser) {
        Model = Users

        const [stats ]= await this.constructor.aggregate([
            {
                $match: {  forUser : this.forUser }
            },
            {
                $group: {
                    _id: { forUser: this.forUser },
                    avgRating: { $avg: "$rating"},
                    ratingCount: { $sum: 1 }
                }
            }
        ])

        const updateObj = {
            ratingCount: stats?.ratingCount || 1,
            averageRating: stats?.avgRating || this.rating
        }
        const doc = await Users.findByIdAndUpdate(this.forUser, updateObj);
    }


    next()
})


const Reviews = mongoose.model("Reviews", reviewSchema);

module.exports = Reviews;