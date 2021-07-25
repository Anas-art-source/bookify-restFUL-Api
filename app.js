const express = require('express');
const userRouter = require('./router/userRouter');
const AppError = require('./utils/AppError');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const bookRouter = require('./router/bookRouter');
const commentRouter = require('./router/commentRouter');
const cors = require('cors')



const bodyParser= require('body-parser')
const multer = require('multer');


exports.upload = multer({ dest: 'uploads/' });
// INITIALIZING APP
const app = express();

// BODY PARSER
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
    max: 10000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
  });
  app.use('/api', limiter);


  // Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// MORGAN 

if (process.env.ENVIRONMENT === "development") {
    app.use(morgan())
}

app.use(cors({
    origin: "http://localhost:3000",
    credentials:  true
}))

app.use('/api/v1/users', userRouter)
app.use('/api/v1/books', bookRouter)

app.get('/api/v1/photo/:imgFolder/:imgName', (req, res, next) => {
    res.sendFile(`/photo/${req.params.imgFolder}/${req.params.imgName}`, {root: "."})
})

app.use('*', (req, res, next) => {
    next(new AppError("PAGE NOT FOUND", 400))
})

// GLOBAL ERROR MIDDLEWEAR 
app.use((err , req, res, next) => {
    console.log(err, "GLOBAL ERROR MIDDLEWEAR")
    err.statusCode = err.statusCode || 500;

    res.status(err.statusCode).json({
        status: err.status,
        err,
        message: err.message,
        isOperational: err.isOperational
    })

    next()
})


module.exports = app;