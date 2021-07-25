const dotenv = require('dotenv');
dotenv.config({path: './config.env'})
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError')
const jwt = require('jsonwebtoken');
const {sendEmail} = require('../utils/sendEmail')
const Users = require('../model/userModel');
const {transformedLocation} = require('../utils/helper')

console.log(process.env.WEBURL, "WEBSITE URL")

const signToken = (signId) => {
    const token = jwt.sign({id: signId}, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    return token
}



exports.signup = catchAsync( async (req, res, next) => {


    console.log(req.filename, "FILE NAME")


    // SETTING UP USER CREDENTIAL AND REMOVING ROLE CREDENTIALS
    const userCredential = {
        name: req.body.name.toLowerCase(),
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        description: req.body.description,
        location: req.body.location ? transformedLocation(JSON.parse(req.body.location)) :  {type: "Point", coordinates: [0, 0]},
        photo: `${process.env.WEBURL}/api/v1/photo/userPhoto/${req.filename}`
    }

    console.log(userCredential, "HERE At SIgnup")

    const doc = await Users.create(userCredential);

    // SINGING JWT TOKEN TO SEND AS TOKEN
    const token = signToken(doc.id);

    console.log("TOKEN SENDING", token)

    // SENDING COOKIE AND RESPONSE
    res.status(201).cookie('jwt', token, {
        maxAge: 9000000,
        httpOnly: true
    })
    .json({
        status: "successfull",
        token,
        message: "doc created",
        data : {
            id: doc.id
        }
    })

})

exports.login = catchAsync( async (req, res, next) => {
    console.log(req.body, "LOGIN")
    // CHECK IF EMAIL AND PASSWORD BOTH ARE ENTERED
    if (!req.body || !req.body.password || !req.body.email) return next(new AppError("Please Enter Email and Password")); // MUST DEFINE ERROR HERE

    // CHECK IF EMAIL AND PASSWORD BOTH ARE VALID

    const doc = await Users.findOne({email: req.body.email}).select('+password'); // MUST USE + in order to include the password beside other field. This will make JWT Validation to work.
    if (!doc || !(await doc.checkPassword(req.body.password, doc.password))) return next(new AppError("Invalid Email or Password")); // MUST DEFINE ERROR HERE

    // SIGN JWT TOKEN
    const token = signToken(doc.id);

    // SEND RESPONSE
    res.status(200).cookie('jwt', token, {
        maxAge: 9000000,
        httpOnly: true
    })
    .json({
        status: "successfull",
        token,
        message: "doc fetched",
        data: {
            id: doc.id
        }
    })
})


exports.forgetPassword = catchAsync( async (req, res, next) => {

    // CHECKING IF USER ENTERED EMAIL
    if (!req.body || !req.body.email) return next() // MUST DEFINE ERROR HERE
    
    // CHECKING IF DOC EXIST 
    const doc = await Users.findOne({email: req.body.email});
    if(!doc) return next() // MUST DEFINE ERROR HERE

    // GENERATING RANDOM TOKEN USING CRYPTO LIBRARY 
    const RandomToken = await doc.passwordForgetToken();
    await doc.save({validateBeforeSave: false})

    // SENDING EMAIL WITH RANDOM TOKEN
    sendEmail(RandomToken)

    // SENDING RESPONSE
    res.status(200).json({
        status: "successful",
        message: "check your email"
    })

})

exports.resetPassword = catchAsync( async (req, res, next) => {

    // Extracting Token
    const token = req.params.token;
    const email = req.body.email;

    // Checking if token is correct   // CHECKING IF TOKEN HAS NOT EXPIRED
    const doc = await Users.findOne({email: email})
    if (!doc || !(doc.checkPasswordToken(token))) return next(new AppError("EITHER TOKEN OR EMAIL IS INVALID OR TOKEN IS EXPIRED", 400)) // DEFINE ERROR HERE

   
    // EXTRACTING PASSWORD AND PASSWORD CONFIRM    // UPDATING PASSWORD 
    doc.password = req.body.password;
    doc.passwordConfirm = req.body.passwordConfirm;
    doc.passwordChangedAt = Date.now() / 1000; // TO CONVERT IT INT0 SECONDS
    await doc.save()
    
    // LOGGING USER IN: SENDING JWT
    const JWTtoken = signToken(doc.id);

    // SENDING RESPONSE
    res.status(201).cookie('jwt', JWTtoken, {
        maxAge: 9000000,
        httpOnly: true
    }).json({
        status: "successful",
        message: "Password is updated"
    })
}) 

exports.protect = catchAsync( async (req, res, next) => {

     // CHECKING IF COOKIES EXIST AND IF COOKIES STARTS WITH JWT
     if (!req.cookies || !req.cookies.jwt) next(new AppError("PLEASE LOGIN TO PROCEED", 404));

     // CHECKING IF JWT TOKEN ATTACHED WITH COOKIE IS VALID
     const token = req.cookies.jwt;
     console.log(token)
     const decode =  jwt.verify(token, process.env.JWT_SECRET_KEY);
    //  console.log(decode, "{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}")
     // CHECKING IF USER EXIST WITH ID
     const doc = await Users.findOne({_id: decode.id})
     if (!doc) return next(new AppError("USER NO LONGER EXIST", 404))
     console.log(decode,  doc.passwordChangedAt)
     // CHECKING IF USER CHANGED PASSWORD AFTER 
     if (decode.iat < doc.passwordChangedAt) return next(new AppError("PASSWORD IS RECENTLY CHANGED. PLEASE LOG IN AGAIN", 400));

     // PUTING USER ON REQUEST OBJECT IN ORDER TO USE AT RESTRICT
     req.user = doc;
     
     next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next ) => {
        console.log(req.user)
        if (!roles.includes(req.user.role)) next(new AppError("YOU ARE NOT ALLOWED TO ACCESS THIS ROUTE", 400));
        next()
    }
}

