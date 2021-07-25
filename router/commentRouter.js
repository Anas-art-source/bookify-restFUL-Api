const express = require('express');
const authController = require('../controller/authController')
const commentController = require('../controller/commentController')

const commentRouter = express.Router({ mergeParams: true});

// commentRouter.use((req, res, next) => {
//     console.log(req.baseUrl.includes())
// })

// commentRouter.route('/')
// .delete(authController.protect, authController.restrictTo('user', "admin"), commentController.deleteComment)


commentRouter.use(authController.protect, authController.restrictTo('user', 'admin'))

commentRouter.route('/').post(commentController.addComment)

commentRouter.route('/:commentId').get(commentController.getCommentById).patch(commentController.updateComment).delete(commentController.deleteComment)



// commentRouter.router('/:id').post(authController.protect, authController.restrictTo('user'), commentController.addComment)
// .patch(authController.protect, authController.restrictTo('user'), commentController.updateComment)
// .delete(authController.protect, authController.restrictTo('user'), commentController.deleteComment);


module.exports = commentRouter