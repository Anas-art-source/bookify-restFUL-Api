const { findById, findByIdAndRemove, findByIdAndUpdate, update, findOne, findOneAndUpdate } = require('../model/userModel');
const Users = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const apiFeature = require("../utils/apiFeature");
const multer = require('multer');
const sharp = require('sharp');
const { transformedLocation } = require('../utils/helper');

// STORAGE 
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    
    // console.log(file, "FFIIIIIIIIIILEEEE")
    // DEFINING EXTENSION TO BE ACCEPTED
    const extensionAccepted = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.mimetype.split('/')[1]
    
    // CHECKING FOR VALID EXTENSION
    if (file.mimetype.startsWith('image') && extensionAccepted.includes(fileExtension)) { 
        cb(null, true) 
    } else {
        cb(new AppError("Please Enter Image"))
    }
}


const upload = multer({ storage: storage, fileFilter:fileFilter});


exports.uploadOne = upload.single('photo');

exports.resizeFileAndSave = async (req, res, next) => {
    console.log("HEREEE", req.file)
    if (!req.file) return next()
    req.filename = req.file.fieldname + '-' + req.body.email + "-" + Date.now() + '.jpeg'
    
    await sharp(req.file.buffer).resize(500, 500)
    // .composite([{ input: 'photo/logo/logo.jpg', gravity: 'southeast' }])
    .toFormat('jpeg')
    .toFile(`photo/userPhoto/${req.filename}`).catch(err => console.log(err))

    next()
    
}

exports.getAll = catchAsync( async( req, res, next) => {
    console.log(req.query)
    const query = new apiFeature(Users.find(), req.query).filter().sort().field().paginate()
    const doc = await query.query.populate({
        path: 'reviews',
        // options: { limit: 2},
        perDocumentLimit: 2, 
    }).populate({
        path: "books",
        perDocumentLimit: 2, 
        select: "name photos"
    })
    
    res.status(200).json({
        status: "successful",
        length: doc.length,
        data: {
            doc
        }
    })
});


exports.nearMe = catchAsync (async (req, res, next) => {
    const {maxDistance , latlng} = req.params;

    const [lat, lng] = latlng.split(',');

    
    const doc = await Users.find({ 
        location: { 
            $geoWithin: { $centerSphere: [ [ lng, lat ],
                 maxDistance / 3963.2 ]
                }
            }
        })


   if (doc.length === 0) return next(new AppError("No User Found Near You", 404))
    
    // FOR DOC IN THE RADIUS OF 100 MILES FROM THE CENTER SPHERE
    //   { $geoWithin: { $centerSphere: [ [ -74, 40.74 ] ,
    //     100 / 3963.2 ] }

     res.status(200).json({
         status: "successful",
         length: doc.length,
         data: {
             doc
         }
     }) 
})


exports.getUserById = catchAsync( async (req, res, next) => {

    const doc = await Users.findById(req.params.id).populate('reviews').populate('comments').populate("books");

    if (!doc || doc.length === 0) next(new AppError("This user no longer exist", 404))


    res.status(200).json({
        status: "successful",
        data: {
            doc
        }
    })
})

exports.updateUser = catchAsync( async (req, res, next) => {

  
    if (Object.keys(req.body).length === 0) next(new AppError("PLEASE ENTER SOMETHING TO UPDATE"));

    if (req.body.password || req.body.passwordConfirm) next(new AppError("COULD NOT UPDATE PASSWORD FROM HERE"));

    // IF ENTERED LOCATION, MUST PASSED type: "Point"
    const update = {
        ...req.body,
        photo: req.filename,
        location: req.body.location ? transformedLocation(req.body.location) : null
    }

 
    const doc = await Users.findOneAndUpdate({id: req.user.id}, update);

    res.status(201).json({
        status: "successful",
        "message": "doc Updated",
        doc
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {

    const doc = await Users.findOneAndUpdate({email: req.user.email}, {active: false} );

    res.status(200).json({
        status: "User Deleted"
    })

})