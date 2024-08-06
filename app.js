
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mangoose = require('mongoose')

const adminRoutes = require('./routes/admin-routes.js')
const shopRoutes = require('./routes/shop-routes.js')
const errorController = require('./controllers/error.js')
const mongoConnect = require('./util/database.js').mongoConnect
const User = require('./models/user-model.js')


const app = express();
app.set('view engine', 'ejs')
app.set('views', 'views')

// db.execute('SELECT * FROM products').then(results => {
//     console.log(results[0])
// }).catch(err => {
//     console.log(err)
// })

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
// app.use((req, res, next) => {
//     console.log('in middle ware')
//     next() // Allows the request to continue to the next moddleware in line
// })
app.use((req, res, next) => {
    User.findById("66b127f55d0e4af6e39b1fac").then(user => {
        req.user = user
        next();
    }).catch(err => {
        console.log(err)
    })
})
app.use('/admin', adminRoutes)

app.use(shopRoutes)

app.use(errorController.get404)


mangoose.connect('mongodb://nisar:aseHQzUOpq2QYJOq@ac-yu89zur-shard-00-00.2kuqfqr.mongodb.net:27017,ac-yu89zur-shard-00-01.2kuqfqr.mongodb.net:27017,ac-yu89zur-shard-00-02.2kuqfqr.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-48caiw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0').then(() => {
    User.findOne().then(user => {
        if (!user) {
            const user = new User({
                name: 'nisar',
                email: 'nisarh039@gmail.com',
                cart: {
                    items: []
                }
            })
            user.save()
        }
    })
    app.listen(3000)
}).catch(err => {
    console.log(err)
})




// sequelize.sync().then(result => {
//     // console.log(result)
//     return User.findByPk(1)
// }).then(user => {
//     if (!user) {
//         return User.create({
//             name: 'Nisar',
//             email: 'nisarh039@gmail.com',
//         })
//     }
//     return user
// }).then(user => {
//     return user.createCart();

// }).then(cart => {
//     app.listen(3000)
// }).catch(err => {
//     console.log(err)
// })
