const Books = require('../model/bookModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError');
const apiFeature = require('../utils/apiFeature')
const {transformedLocation} = require('../utils/helper');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs')

// STORAGE: BUFFER
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    // DEFINING EXTENSION TO BE ACCEPTED
    const extensionAccepted = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.mimetype.split('/')[1]
    
    // CHECKING FOR VALID EXTENSION
    if (file.mimetype.startsWith('image') && extensionAccepted.includes(fileExtension)) { 
        cb(null, true) 
    } else {
        cb(new AppError("Please Enter Valid Image"))
    }
}


const upload = multer({ storage: storage, fileFilter: fileFilter});

exports.uploadMany = upload.array("photos", 4);

exports.resizePhotos = (req, res, next) => {
    if(!req.files) return next()

    // ARRAY OF FILENAME
    req.filename = req.files.map( file => `${file.originalname.split(".")[0]}-${req.user.id}-${Date.now()}.jpeg`);
    console.log(req.filename, "REQ FILE")
    // RESIZING FILE AND STORING IT
    req.files.forEach(  async (file, index) => {
        await sharp(file.buffer).resize(540, 540)
        .toFormat('jpeg')
        .toFile(`photo/bookPhoto/${req.filename[index]}`)
        .catch(err => next(new AppError("Error in processing file", 500)))
    })

    next()
}

exports.getAllBook = catchAsync (async (req, res, next) => {

    const query = new apiFeature(Books.find(), req.query).filter().sort().field().paginate()  // COULD ALSO IMPLEMENT PAGINATION
    // console.log(query.query, ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;")
    const doc = await query.query.populate('owner', 'name location _id photo' ).populate({ path: 'reviews', select: "rating review user _id date",  options: {  perDocumentLimit: 1, sort: {date: -1} }})

    if(doc.length === 0) return next(new AppError("No book found", 404))


    // res.download('./photo/logo/logo.JPG')
    res.status(200).json({
        message: "successful",
        length: doc.length,
        data: [
            doc
        ]
    })
}) 

exports.addBook = catchAsync( async (req, res, next) => {

    const imagesArray = req.filename.map(file => `${process.env.WEBURL}/api/v1/photo/bookPhoto/${file}`)
    const owner = req.user.id;
    console.log(req.body)
    const bookObj = {
        ...req.body,
        owner,
        photos: imagesArray,
        location: req.body.location ? transformedLocation(req.body.location) : req.user.location
    }

    console.log(bookObj, "BOOK OBJ")

    const doc = await Books.create(bookObj);

    res.status(200).json({
        status: "SUCCESSFUL",
        body: {
            doc
        }
    })
});

exports.updateBook = catchAsync( async (req, res, next) => {

    if (Object.keys(req.body).length === 0) return next(new AppError("PLEASE ENTER SOMETHING TO EDIT", 400))

    const update = {
        ...req.body,
        location: req.body.location ? transformedLocation(req.body.location) : req.user.location
    }

    const doc = await Books.findOneAndUpdate({_id: req.params.id, owner: req.user.id}, update);

    if(!doc || doc.length === 0 ) return next(new AppError("No book found or You have No Access to this route", 404))


    res.status(201).json({
        status: "SUCCESSFUL",
        body: {
            doc
        }
    })
});

exports.deleteBook = catchAsync( async (req, res, next) => {

    const doc = await Books.findOneAndDelete({_id: req.params.id, owner: req.user.id})

    if(!doc || doc.length === 0) return next(new AppError("No book found to delete or You are not allow to delete", 404))

    res.status(201).json({
        status: "SUCCESSFULLY DELETED",
        body: {
            doc
        }
    })
});

exports.getBookById = catchAsync( async (req, res, next) => {

    const doc = await Books.findById(req.params.id).populate('owner', 'name location _id' ).populate("reviews");

    if(!doc) return next(new AppError("No Doc Found with this id", 404));

    res.status(200).json({
        status: "successful",
        data: {
            doc
        }
    })
})

exports.getBookNearMe = catchAsync( async (req, res, next) => {


    const { maxDistance, latlng} = req.params;

    const [lat, lng] = latlng.split(',');

    
    const doc = await Books.find({ 
        location: { 
            $geoWithin: { $centerSphere: [ [ lng, lat ],
                 maxDistance / 3963.2 ]
                }
            }
        })

     if (doc.length === 0) return next(new AppError("No book found in this area", 404))
     console.log(doc.length, "lkeeeeeeeeeeeeeeeeeeeeee")
     
     res.status(200).json({
         status: "successful",
         length: doc.length,
         data: {
             doc
         }
     })
})