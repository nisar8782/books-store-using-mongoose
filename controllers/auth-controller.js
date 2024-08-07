
const bcrypt = require('bcryptjs')

const User = require('../models/user-model')

exports.getLogin = (req, res, next) => {
    let errorMessage = req.flash('error')
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0]
    } else {
        errorMessage = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: errorMessage
    })
}
exports.getSignup = (req, res, next) => {
    let errorMessage = req.flash('error')
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0]
    } else {
        errorMessage = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: errorMessage
    })
}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email }).then(user => {
        if (!user) {
            req.flash('error', 'Invaid email or password')
            return res.redirect('/login')
        }
        bcrypt.compare(password, user.password).then(isMatched => {
            if (isMatched) {
                req.session.isLoggedIn = true
                req.session.user = user
                return req.session.save(() => {
                    return res.redirect('/')
                })
            }
            req.flash('error', 'Invaid email or password')
            res.redirect('/login')

        }).catch(err => {
            res.redirect('/login')
        })
    })
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    User.findOne({ email: email }).then(userDoc => {
        if (userDoc) {
            req.flash('error', 'E-Mail already exist')
            return res.redirect('/signup')
        }
        return bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            })
            return user.save()
        }).then(result => {
            res.redirect('/login')
        });

    }).catch(err => {
        console.log(err)
    })
}

exports.postLogOut = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}