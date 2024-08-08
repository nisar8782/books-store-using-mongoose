
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");
const crypto = require('crypto')

const User = require('../models/user-model');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: "nisarh039@gmail.com",
        pass: "eoeo ubgs gtex waic",
    },
});

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
            return transporter.sendMail({
                to: email,
                from: 'nisarh039@gmail.com', // sender address
                subject: "Hello ✔", // Subject line
                text: "Signup successfully",
            })

        }).catch(err => {
            console.log(err)
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

exports.getReset = (req, res, next) => {
    let errorMessage = req.flash('error')
    if (errorMessage.length > 0) {
        errorMessage = errorMessage[0]
    } else {
        errorMessage = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: errorMessage
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                req.flash('error', 'No account found with that email')
                return res.redirect('/reset')
            }
            user.resetToken = token
            user.resetTokenExpiration = Date.now() + 3600000
            return user.save()
        }).then(result => {
            res.redirect('/')
            transporter.sendMail({
                to: req.body.email,
                from: 'nisarh039@gmail.com', // sender address
                subject: "Password Reset", // Subject line
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                    <p></p>
                `,
            })
        }).catch(err => {
            console.log(err)
        })
    })
}
exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        let errorMessage = req.flash('error')
        if (errorMessage.length > 0) {
            errorMessage = errorMessage[0]
        } else {
            errorMessage = null
        }
        res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMessage: errorMessage,
            userId: user._id.toString(),
            passwordToken: token
        })
    }).catch(err => {
        console.log(err)
    })

}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser;
    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId }).then(user => {
        resetUser = user
        return bcrypt.hash(newPassword, 12)
    }).then(hashedPassword => {
        resetUser.password = hashedPassword
        resetUser.resetToken = null
        resetUser.resetTokenExpiration = null
        return resetUser.save()
    }).then(result => {
        res.redirect('/login')
    })
}