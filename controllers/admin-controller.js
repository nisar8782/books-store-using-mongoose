
const mongodb = require('mongodb')
const Product = require('../models/product-model')


// const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')
exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'))
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        formCss: true,
        productCSS: true,
        activeAddProduct: true,
        editing: false

    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title
    const imageUrl = req.body.imageUrl
    const price = req.body.price
    const description = req.body.description
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    })
    product.save().then(result => {
        console.log('Created Product')
        res.redirect('/admin/products')
    }).catch(err => {
        res.redirect('/500')
    });


}
exports.getEditProduct = (req, res, next) => {
    // res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'))
    const editMode = req.query.edit;

    if (!editMode) {
        return res.redirect('/')
    }
    const propId = req.params.productId
    Product.findById(propId).then(product => {
        if (!product) {
            return res.render('/')
        }
        res.render('admin/edit-product', {
            pageTitle: "Add Product",
            path: '/admin/edit-product',
            editing: editMode,
            product: product,

        })
    }).catch(err => {
        console.log(err)
    })

}
exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedTitle = req.body.title
    const updatedImageUrl = req.body.imageUrl
    const updatedPrice = req.body.price
    const updatedDescription = req.body.description
    Product.findById(productId).then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/')
        }
        product.title = updatedTitle
        product.price = updatedPrice
        product.imageUrl = updatedImageUrl
        product.description = updatedDescription
        return product.save().then(result => {
            console.log('UPDATED PRODUCT!')
            res.redirect('/admin/products')
        });
    }).catch(err => {
        console.log(err)
    })
    // Product.findById(productId).then(product => {
    //     product.title = updatedTitle
    //     product.price = updatedPrice
    //     product.imageUrl = updatedImageUrl
    //     product.description = updatedDescription
    //     return product.save()
    // }).then(result => {
    //     console.log('UPDATED PRODUCT!')
    //     res.redirect('/admin/products')
    // }).catch(err => {
    //     console.log(err)
    // })

    // const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, productId);
    // product.save().then(result => {
    //     console.log('Product Updated')
    //     res.redirect('/admin/products')
    // }).catch(err => {
    //     console.log(err)
    // })
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id }).populate('userId').then((products) => {
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products'
        })
    }).catch(err => {
        console.log(err)
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteOne({ _id: prodId, userId: req.user._id }).then(result => {
        res.redirect('/admin/products')
    }).catch(err => {
        console.log(err)
    })


}
