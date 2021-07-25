const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Book should have a title']
    },
    author: {
        type: String,
    },
    category: {
        type: String,
        enum: ["fiction", 'non-fiction', 'medical', 'commerce', 'engineering'],
        required: [true, 'Book Should Have A Category']
    },
    price: {
        type: Number,
        min: 0,
        required: [true, "Book Must have price. If free, enter 0 as price"]
    },
    date: {
        type: Date,
        default: Date.now()
    },
    publishBook: {
        type: Date,
    },
    condition: {
        type: String,
        enum: ['new', 'used'],
        default: 'used'
    },
    //COMMENTS: VIRTUAL POPULATE
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    ratingCount: Number,
    // REVIEWS
    averageRating: {
        type: Number
    },
    postedAt: {
        type: Date,
        default: Date.now()
    },
    photos: [String],
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            default: "Point",
            enum: ['Point'], 
             },
        coordinates: [Number]


    }
},  {
    toObject: {
    virtuals: true
    },
    toJSON: {
    virtuals: true 
    }
  })


// VIRTUAL POPULATE 
bookSchema.virtual("reviews", {
    ref: "Reviews",
    foreignField: "forBook",
    localField: "_id"
})
  
bookSchema.index({ location: '2dsphere' });

// VIRTUAL PROPERTY // CANT DO VIRTUAL PROPERTY BECAUSE AT THIS POINT THE LOCATION OF USER IS NOT OWN WE ONLY KNOW THE ID OF USER
// bookSchema.virtual("location").get(function() {
//     if (this.location) return null
//     return this.user.location
// })

// bookSchema.pre( /^find/ , function(next) {
//     if (this.location) return next()
    
// })






const Books = mongoose.model("Books", bookSchema)

module.exports = Books;