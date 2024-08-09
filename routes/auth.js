
const express = require('express')
const { check, body } = require('express-validator')

const authController = require('../controllers/auth-controller')
const User = require('../models/user-model')

const router = express.Router()

router.get('/login', authController.getLogin)
router.get('/signup', authController.getSignup)
router.get('/reset', authController.getReset)
router.get('/reset/:token', authController.getNewPassword)
router.post('/login', authController.postLogin)
router.post(
    '/signup',
    check('email').isEmail().withMessage('Please enter a valid email').custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-Mail already exist')
            }
        })
    }),
    body('password').isLength({ min: 5 }).withMessage('Password must be greater than 5 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password does not match')
        }
        return true
    }),
    authController.postSignup
)
router.post('/logout', authController.postLogOut)
router.post('/reset', authController.postReset)
router.post('/new-password', authController.postNewPassword)


module.exports = router