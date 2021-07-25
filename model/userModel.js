const mongoose = require('mongoose');
const {isEmail} = require('validator')
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 2,
        maxLength: 15,
        required: [true, "User Must Have A Name"]
    },
    email: {
        type: String,
        required: [true, 'A User Must Have An Email'],
        validate: [ isEmail , "Invalid Email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'A User Must Have Password'],
        select: false
        // select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A User Must Have PasswordConfirm'],
        validate: {
            validator: function(val) {
                return val == this.password
            },
            message: "Pasword Doesnot Match"
        }
    },
    location: {
         // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], /// longitute , latitude
      locality: String,
      city: String,
    },
    averageRating: Number,
    ratingCount: Number,
    description: String,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: "user"
    },
    id: String,
    passwordForgetKey: String,
    passwordForgetKeyValidTime: Number,
    passwordChangedAt: Number,
    active: {
        type: String,
        enum: [true , false],
        default: true,
    },
    photo: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now()
    }

}, {
    toObject: {
    virtuals: true
    },
    toJSON: {
    virtuals: true 
    }
  })


// VIRTUAL GEOJSON
userSchema.index({ location: '2dsphere' });

//VIRTUAL POPULATE
userSchema.virtual("reviews", {
    ref: "Reviews",
    foreignField: "forUser",
    localField: "id"
})

userSchema.virtual("comments", {
    ref: "Comments",
    foreignField: "forUser",
    localField: "id"
})

userSchema.virtual("books", {
    ref: "Books",
    foreignField: "owner",
    localField: "id"
})

// INSTANCE METHODS 
userSchema.methods.checkPassword = async function (userEnteredPassword, documentPassword) {
    const isPasswordValid = await bcrypt.compare(userEnteredPassword, documentPassword)
     return isPasswordValid;
}

userSchema.methods.passwordForgetToken = async function () {
    let token =  await crypto.randomBytes(20).toString('hex');
    this.passwordForgetKey = token;
    this.passwordForgetKeyValidTime =  Date.now() + 180000;
    return token
}

userSchema.methods.checkPasswordToken = function (token) {
    if (this.passwordForgetKey !== token) return false
    if (Date.now() > this.passwordForgetKeyValidTime) return false;
    
    return true
}

 // QUERY VIRTUAL AND DOCUMENT MIDDLEWEAR
 userSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 8);

    this.password = hash;
    this.passwordConfirm = undefined;
    this.id = this._id.toString()
    next()

 })

 userSchema.pre(/^find/, function(next) {
    this.find({ active: {$ne: false}})
    console.log('here i ammmmm')
    next()
    next()
 })


 const Users = mongoose.model('Users', userSchema);


 module.exports = Users;