const Product = require('../models/product-model')
const Order = require('../models/order_model')
// const Cart = require('../models/cart');
// const { where } = require('sequelize');
// const CartItem = require('../models/cart-item');
const mongoose = require('mongoose')


exports.getProducts = (req, res, next) => {
    // console.log('shop', adminData.products)
    // res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
    Product.find().then(products => {
        res.render('shop/product-list', {
            prods: products,
            pageTitle: 'All Products',
            path: '/products',
        })
    }).catch(err => {
        console.log(err)
    });

}
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId.trim();
    if (!mongoose.Types.ObjectId.isValid(prodId)) {
        return res.status(400).render('404', {
            message: 'Invalid product ID',
            pageTitle: 'Error',
            path: '/error'
        });
    }
    Product.findById(prodId).then((product) => {
        res.render('shop/product-detail', {
            product: product,
            pageTitle: product.title,
            path: '/product'
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.getIndex = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
        })
    }).catch(err => {
        console.log(err)
    });

}

exports.getCart = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
        })
    }).catch(err => {
        console.log(err)
    }).catch(err => {
        console.log(err)
    })
}
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then(product => {
        return req.user.addToCart(product)
    }).then(result => {
        res.redirect('/cart')
    }).catch(err => {
        console.log(err)
    })
}

exports.postCartDelete = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    req.user.deleteItemFromCart(prodId).then(() => {
        res.redirect('/cart')
    }).catch(err => {
        console.log(err)
    })
}

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }

exports.postOrder = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } }
        })
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user
            },
            products: products
        })
        return order.save()
    }).then(() => {
        return req.user.clearCart()
    }).then(() => {
        res.redirect('/orders')
    }).catch(err => {
        console.log(err)
    })
}


// req.user.addOrder().then(() => {
//     res.redirect('/orders')
// }).catch(err => {
//     console.log(err)
// })
// }
exports.getOrders = (req, res, next) => {
    Order.find({ "user.userId": req.user._id }).then(orders => {
        res.render('shop/orders', {
            path: '/orders',
            pageTitle: 'Orders',
            orders: orders
        })
    }).catch(err => {
        console.log(err)
    })
}