const express = require('express');
const authController = require('../controller/authController')
const bookController = require('../controller/BookController')
const reviewRouter = require('../router/reviewRouter');

const bookRouter = express.Router();

bookRouter.use("/:id/reviews", reviewRouter)

bookRouter.route('/').get(bookController.getAllBook).post(authController.protect, authController.restrictTo('user', 'admin'), bookController.uploadMany, bookController.resizePhotos, bookController.addBook);

bookRouter.route('/:id').get(bookController.getBookById)
// MIDDLEWEAR
console.log("here come i")
bookRouter.use(authController.protect, authController.restrictTo("user", "admin"))
bookRouter.route('/:id').patch(bookController.uploadMany, bookController.resizePhotos, bookController.updateBook);
bookRouter.route('/:id').delete(bookController.uploadMany, bookController.resizePhotos, bookController.deleteBook);
bookRouter.route('/maxDistance/:maxDistance/latlng/:latlng').get(bookController.getBookNearMe)

module.exports = bookRouter;