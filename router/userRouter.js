const express = require('express');
const userController = require('../controller/userController');
const authController = require("../controller/authController");
const reviewRouter = require('./reviewRouter')
const commentRouter = require('./commentRouter')
const userRouter = express.Router();



userRouter.use('/:id/comments', commentRouter)
userRouter.use("/:id/reviews", reviewRouter)

userRouter.route("/maxDistance/:maxDistance/mylocation/:latlng").get(userController.nearMe)
userRouter.route('/').get(userController.getAll) // USED PROTECTED ROUTE HERE
userRouter.route('/signup').post(userController.uploadOne, userController.resizeFileAndSave, authController.signup)
userRouter.route('/login').post(authController.login)
userRouter.route('/forgetPassword').post(authController.forgetPassword)
userRouter.route('/resetPassword/:token').post(authController.resetPassword);
// userRouter.route('/protectedRoute').get() // THIS WILL THROW CAST ERROR BECAUSE NEXT MIDDLEWEAR IS NOT DEFINED
userRouter.route('/:id').get( userController.getUserById);
userRouter.route("/update").post(authController.protect, authController.restrictTo('user'), userController.uploadOne, userController.resizeFileAndSave , userController.updateUser);
userRouter.route('/deleteMe').post(authController.protect, authController.restrictTo("user", "admin"), userController.deleteUser)


module.exports = userRouter;