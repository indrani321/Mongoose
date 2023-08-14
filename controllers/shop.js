const Product = require('../models/product');
const Order = require('../models/order');


exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {

  const productIds = req.user.cart.items.map(item => item.productId);

  Product.find({ _id: { $in: productIds } })
    .then(products => {
      //console.log('After populate:', products); 
      const cartItems = req.user.cart.items.map(item => {
        const product = products.find(prod => prod._id.toString() === item.productId.toString());
        return {
          product: product,
          quantity: item.quantity
        };
      });

      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartItems
      });
    })
    .catch(err => console.log(err));
};


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product=>{
    return req.user.addToCart(product);
  }).then(result=>{
    console.log(result);
    res.redirect('/cart');
  })
  
};

exports.postCartDeleteProduct = (req, res, next) => {
  console.log('Received POST request to delete item from cart:', req.body);
  const productIds = req.user.cart.items.map(item => item.productId);
  const productIdToDelete = req.body.productId;

  Product.find({ _id: { $in: productIds } })
    .then(products => {
      const updatedCartItems = req.user.cart.items.filter(item => {
        return item.productId.toString() !== productIdToDelete.toString();
      });

      req.user.cart.items = updatedCartItems;

      return req.user.save();
    })
    .then(result => {
      console.log('Item deleted from cart:', result);
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};


exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user._id
        },
        products: products,
      });
      return order.save();
    })
    .then(result => {
      req.user.clearCart()
      
    })
    .then(()=>{
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId':req.user._id})
  .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
