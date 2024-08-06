
const User = require('../models/user-model')

exports.getLogin = (req, res, next) => {
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: req.isLoggedIn
    })
}
exports.postLogin = (req, res, next) => {
    User.findById('66b127f55d0e4af6e39b1fac').then(user => {
        req.session.isLoggedIn = true
        req.session.user = user
        req.session.save(() => {
            res.redirect('/')
        })

    })

}
exports.postLogOut = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/')
    })

}